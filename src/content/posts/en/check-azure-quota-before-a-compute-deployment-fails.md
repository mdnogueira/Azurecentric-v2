---
title: "Check Azure quota before a compute deployment fails"
description: "Check regional vCPU quotas before deploying VMs or scale sets to prevent deployment failures."
pubDate: 2024-08-16
category: compute
tags: ["azure-virtual-machines", "quotas", "troubleshooting", "autoscale", "reserved-instances"]
translationKey: check-azure-quota-before-a-compute-deployment-fails
draft: false
---

A deployment fails with a quota error, or a scale set refuses to add instances despite high load. The first thing to check is not the application code or the autoscale rules, but the subscription's regional vCPU limits. Azure enforces these quotas at the subscription and region level, and they apply to both virtual machines and virtual machine scale sets.

## Understand the quota structure

vCPU quotas for virtual machines and scale sets are arranged in two tiers for each subscription and region. The first tier is the **Total Regional vCPUs**, which covers all VM sizes in that region. The second tier consists of specific VM size family cores, such as the D-series or E-series vCPUs. 

When you deploy a new VM, the system checks both limits. The vCPUs required for the new VM must not exceed the available quota for the specific VM size family, nor must they exceed the remaining Total Regional vCPUs. If you exceed either of these quotas, the deployment is rejected. There is also a separate quota for the overall number of virtual machines in the region, but the vCPU limits are the most common bottleneck for compute-heavy workloads.

Quota is calculated based on the total number of cores in use, including both allocated and deallocated instances. This means that stopping a VM does not free up quota. If you have stopped VMs that are no longer needed, they continue to count against your limit. To get more cores, you must either delete unused VMs or request a quota increase.

## Check your current usage

Before attempting a deployment, verify your current consumption. You can use the Azure CLI to list usage for a specific region. This command shows the current value and the limit for each quota category.

```azurecli-interactive
az vm list-usage --location "East US" -o table
```

The output will resemble the following:

```
Name                                CurrentValue    Limit
--------------------------------  --------------  -------
Total Regional vCPUs                          29      100
Standard D Family vCPUs                        8      100
Virtual Machines                               7    10000
```

If you are using PowerShell, the equivalent command is:

```azurepowershell-interactive
Get-AzVMUsage -Location "East US"
```

Look for the **Total Regional vCPUs** and the specific **VM size family** you intend to use. If the `CurrentValue` is close to the `Limit`, you are at risk of deployment failure. For example, if you are trying to deploy a Standard_D2s_v3 VM, which requires 2 vCPUs, and the Standard D Family vCPUs limit is 100 with 99 already in use, the deployment will fail.

## Consider Reserved VM Instances

If you have Reserved VM Instances (RIs) scoped to a single subscription, these affect your quotas. RIs act as a placeholder in the quota system to ensure that reserved capacity is always available. For example, if a subscription has 10 Standard_D1 reservations, the quota system ensures that at least 10 vCPUs are available in the Total Regional vCPUs and Standard D Family quotas for Standard_D1 instances.

This reservation can make it harder to deploy other VM sizes if the regional limit is tight. If your subscription has RIs, you may need a higher Total Regional vCPU quota to accommodate both the reserved instances and any additional workloads. If a quota increase is required to either purchase a Single Subscription RI or to deploy additional VMs, you can request a quota increase on your subscription.

## Requesting a quota increase

If your usage exceeds the default limits, you can request a quota increase. This is done through the Azure portal or by contacting support. The process requires you to specify the region, the VM size family, and the desired new limit.

Before requesting an increase, ensure that you have reviewed your current usage and confirmed that no unnecessary VMs are consuming quota. A quota increase is not instantaneous; it may take time to process. Plan your deployments accordingly to avoid unexpected failures.

## Verification

After requesting a quota increase or deleting unnecessary VMs, verify the change by running the `az vm list-usage` command again. Ensure that the `Limit` for your target VM size family has been updated. Once the quota is sufficient, proceed with your deployment or autoscale configuration.

If the deployment still fails, check for other potential issues such as permissions, network configuration, or resource provider limits. The Azure portal's **Usage + quotas** section on the Subscription page provides a comprehensive view of all limits for your subscription.

For more information about billing and quotas, see Azure subscription and service limits, quotas, and constraints.

References for Check Azure quota before a compute deployment fails: [vCPU quotas](https://learn.microsoft.com/en-us/azure/virtual-machines/quotas), [Troubleshoot autoscale with Virtual Machine Scale Sets](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-troubleshoot), [Troubleshoot Azure VM Image Builder](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-troubleshoot).
