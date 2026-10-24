---
title: "Choose availability zones during the initial VM design"
description: "Why availability zones must be chosen during initial VMSS design and how to configure them correctly."
pubDate: 2026-02-22
category: compute
tags: ["azure-virtual-machines", "availability-zones", "virtual-machine-scale-sets", "high-availability", "azure-cli", "arm-templates"]
translationKey: choose-availability-zones-during-the-initial-vm-design
draft: true
---

You are designing a Virtual Machine Scale Set (VMSS) and need to decide between availability zones and availability sets. The decision is not just about redundancy; it is about whether you can change your mind later. If you choose a regional (non-zonal) deployment first, you cannot simply add zones later to fix the architecture. You must plan for zones from the start. This article explains the differences, the constraints of changing scope, and how to configure a zone-redundant scale set.

## Why initial design matters

[![VMSS Zonal Deployment Decision Flow](/images/posts/2026/azc-280-checkpoints.svg)](/images/posts/2026/azc-280-checkpoints.svg)

Availability zones are fault-isolated locations within an Azure region that provide redundant power, cooling, and networking. They allow you to run applications with high availability and fault tolerance to data center failures. Azure regions that support availability zones have a minimum of three separate zones. Each availability zone consists of one or more data centers equipped with independent infrastructure power, network, and cooling. Availability zones are connected by a high-performance network with a round-trip latency of less than 2 milliseconds [Create an Azure scale set that uses Availability Zones](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-use-availability-zones).

When you create a VMSS, you have three zonal deployment models:

1. **Zone redundant or zone spanning (recommended)**: Spreads instances across all selected zones. By default, the scale set performs a best effort approach to evenly spread instances across selected zones. However, you can specify that you want strict zone balance by setting `"zoneBalance": "true"` in your deployment. Each VM and its disks are zonal, so they are pinned to a specific zone. Instances between zones are connected by high-performance network with low latency. In the event of a zonal outage or connectivity issue, connectivity to instances within the affected zone may be compromised, while instances in other availability zones should be unaffected. You may add capacity to the scale set during a zonal outage, and the scale set adds more instances to the unaffected zones. When the zone is restored, you may need to scale down your scale set to the original capacity. A best practice would be to configure autoscale rules based on CPU or memory usage. The autoscale rules would allow the scale set to respond to a loss of the VM instances in that one zone by scaling out new instances in the remaining operational zones.

2. **Zonal or zone aligned (single zone)**: Places instances in a single availability zone. Each VM and its disks are zonal, so they are pinned to a specific zone. This configuration is primarily used when you need lower latency between instances.

3. **Regional**: The zone assignment isn't explicitly set. In this configuration, the scale set creates Regional (not-zone pinned) instances and implicitly places instances throughout the region. There is no guarantee for balance or spread across zones, or that instances land in the same availability zone. Disk colocation is guaranteed for Ultra and Premium v2 disks, best effort for Premium V1 disks, and not guaranteed for Standard SKU (SSD or HDD) disks. In the rare case of a full zonal outage, any or all instances within the scale set may be impacted.

If you start with a regional scale set, you might think you can add zones later. However, updating a scale set to add availability zones is currently in preview and has significant limitations. The feature is intended for stateless workloads on Virtual Machine Scale Sets. Scale sets with stateful workloads or used with Service Fabric or Azure Kubernetes Services are not supported for zonal expansion. You can't go back to a regional scale set or remove zones once they have been added. When you expand the scale set to additional zones, the original instances are not migrated or changed. New instances will be created and spread evenly across the selected availability zones. When you scale in the scale set, any regional instances will be prioritized for removal first. After that, instances will be removed based on the scale in policy.

This means that if you start with a regional scale set, you are stuck with regional instances until you manually scale out new zonal instances and scale in the old ones. This is a complex and risky process. It is much better to design for zones from the start.

## Availability sets vs. availability zones

Availability sets are logical groupings of VMs that reduce the chance of correlated failures bringing down related VMs at the same time. Availability sets place VMs in different fault domains for better reliability, especially beneficial if a region doesn't support availability zones. When using availability sets, create two or more VMs within an availability set. Using two or more VMs in an availability set helps highly available applications and meets the 99.95% Azure SLA. There's no extra cost for using availability sets, you only pay for each VM instance you create.

Availability sets offer improved VM to VM latencies compared to availability zones, since VMs in an availability set are allocated in closer proximity. Availability sets have fault isolation for many possible failures, minimizing single points of failure, and offering high availability. Availability sets are still susceptible to certain shared infrastructure failures, like datacenter network failures, which can affect multiple fault domains.

For more reliability than availability sets offer, use availability zones. Availability zones offer the highest reliability since each VM is deployed in multiple datacenters, protecting you from loss of either power, networking, or cooling in an individual datacenter. If your highest priority is the best reliability for your workload, replicate your VMs across multiple availability zones.

## How to configure a zone-redundant scale set

To create a zone-redundant scale set, you must specify the zones during creation. You can use the Azure portal, Azure CLI, Azure PowerShell, or Azure Resource Manager templates.

### Azure CLI

Add the `--zones` parameter to the `az vmss create` command and specify which zone to use (such as zone 1, 2, or 3).

```azurecli
az vmss create \
    --resource-group myResourceGroup \
    --name myScaleSet \
    --image <SKU Image> \
    --upgrade-policy-mode automatic \
    --admin-username azureuser \
    --generate-ssh-keys \
    --zones 1 2 3
```

### Azure PowerShell

Add the `-Zone` parameter to the `New-AzVmssConfig` command and specify which zone or zones to use (such as zone 1, 2, or 3).

```powershell
New-AzVmss `
  -ResourceGroupName "myResourceGroup" `
  -Location "EastUS2" `
  -VMScaleSetName "myScaleSet" `
  -VirtualNetworkName "myVnet" `
  -SubnetName "mySubnet" `
  -PublicIpAddressName "myPublicIPAddress" `
  -LoadBalancerName "myLoadBalancer" `
  -UpgradePolicy "Automatic" `
  -Zone "1", "2", "3"
```

### Azure Resource Manager templates

In your ARM template, specify the `zones` property in the `Microsoft.Compute/virtualMachineScaleSets` resource.

```json
{
  "type": "Microsoft.Compute/virtualMachineScaleSets",
  "name": "myScaleSet",
  "location": "East US 2",
  "apiVersion": "2017-12-01",
  "zones": [
        "1",
        "2",
        "3"
      ]
}
```

If you create a public IP address or a load balancer, specify the `"sku": {"name":"Standard"}` property to create zone-redundant network resources. You also need to create a Network Security Group and rules to permit any traffic.

## Verification

After creating the scale set, verify that the instances are distributed across the zones. You can check the zone assignment of each instance in the Azure portal or by using the Azure CLI.

```azurecli
az vmss list-instances --resource-group myResourceGroup --name myScaleSet --query '[].{Instance:instanceId, Zone:zone}'
```

This will show you the zone assignment for each instance. Ensure that the instances are spread across the zones as expected.

If you are using strict zone balance, ensure that the number of instances in each zone is as equal as possible. If you are using best effort zone balance, the scale set will attempt to maintain balance, but temporary imbalance may occur during scaling operations.

Remember that updating a scale set to add availability zones is currently in preview and has significant limitations. It is much better to design for zones from the start. If you are unsure about the zone availability in your region, check the [Azure regions that support availability zones](https://learn.microsoft.com/en-us/azure/availability-zones/az-region) documentation.
