---
title: "Choose NAT Gateway when stable outbound connectivity matters"
description: "Why NAT Gateway is the preferred explicit outbound method for stable egress, and how to configure it with private subnets."
pubDate: 2026-06-27
category: networking
tags: ["nat-gateway", "azure-virtual-network", "outbound-connectivity", "private-subnets", "snat"]
translationKey: choose-nat-gateway-when-stable-outbound-connectivity-matters
draft: false
---

You need your virtual machines to reach the internet with a predictable source IP. Azure NAT Gateway is the right tool for this. It replaces the implicit, platform-managed default outbound access with an explicit configuration that offers deterministic SNAT port allocation and a stable public IP address. This stability matters for firewalls, allow-lists, and compliance checks that rely on a fixed egress identity.

Default outbound access assigns a public IP address automatically when no explicit method is defined. That IP is owned by Microsoft and can change without notice. It also lacks support for fragmented packets and ICMP pings, and it yields inconsistent results across scaled sets or multi-NIC VMs. For scenarios requiring deterministic outbound behaviour, Microsoft recommends using an explicit configuration such as a NAT Gateway. This is particularly true as new virtual networks default to private subnets from April 2026 onwards, meaning explicit outbound methods are mandatory for internet access.

## Why NAT Gateway over other explicit methods?

You have several options for explicit outbound connectivity: a standard load balancer with outbound rules, a basic load balancer, or a public IP address directly on the VM. Each has trade-offs.

A standard load balancer with outbound rules allows fine-grained control over SNAT port allocation, idle timeouts, and protocol selection. However, it requires careful management of backend pools and load-balancing rules. If you configure a backend pool by IP address instead of NIC, it behaves like a Basic Load Balancer with default outbound enabled, which undermines the security intent. Furthermore, load balancers do not support ICMP for outbound NAT, limiting your ability to troubleshoot connectivity.

A basic load balancer is simpler but offers less control and relies on implicit behaviour that can change. Direct public IP addresses on VMs are not scalable for large fleets and do not provide the shared SNAT port pool that NAT Gateway offers.

NAT Gateway simplifies this by associating directly with a subnet. All VMs in that subnet share the NAT Gateway's public IP(s) for outbound traffic. It dynamically allocates SNAT ports, providing up to 64,512 ports per public IP address, and supports up to 16 IPv4 public IP addresses. This effectively provides up to 1,032,192 outbound SNAT ports. The dynamic allocation means you do not need to manually distribute ports among VMs, reducing the risk of SNAT exhaustion in large scale sets.

## Configuring NAT Gateway with private subnets

To use NAT Gateway effectively, you should pair it with a private subnet. Private subnets disable default outbound access, ensuring that VMs cannot reach the internet unless an explicit method like NAT Gateway is configured. This aligns with Zero Trust principles and provides clarity in your network architecture.

### Prerequisites

* A virtual network with a subnet for your VMs.
* A Standard SKU public IP address or prefix for the NAT Gateway.
* Contributor or Owner permissions on the resource group containing the virtual network and NAT Gateway.

### Steps

1. **Create the public IP address.**
   Use the Standard SKU and static allocation method. This IP will be the egress identity for your subnet.

   ```azurecli
   az network public-ip create \
     --name nat-ip \
     --resource-group my-rg \
     --sku Standard \
     --allocation-method Static \
     --location eastus
   ```

2. **Create the NAT Gateway.**
   Associate the public IP with the NAT Gateway. The SKU must be Standard to support zone redundancy if needed, though note that Standard NAT Gateway does not support zone-redundant deployments. For general VM workloads, Standard is sufficient.

   ```azurecli
   az network nat gateway create \
     --name my-nat-gw \
     --resource-group my-rg \
     --public-ip-addresses nat-ip \
     --location eastus \
     --sku Standard
   ```

3. **Associate the NAT Gateway with the subnet.**
   Update the subnet to reference the NAT Gateway. This step enables outbound connectivity for all VMs in the subnet.

   ```azurecli
   az network vnet subnet update \
     --name my-subnet \
     --vnet-name my-vnet \
     --resource-group my-rg \
     --nat-gateway my-nat-gw
   ```

4. **Disable default outbound access.**
   Set the subnet to private to prevent any VM from using the implicit default outbound IP. This ensures that all outbound traffic is routed through the NAT Gateway.

   ```azurecli
   az network vnet subnet update \
     --name my-subnet \
     --vnet-name my-vnet \
     --resource-group my-rg \
     --default-outbound false
   ```

   Existing VMs in the subnet must be stopped and deallocated for this change to take effect. The NIC-level parameter `defaultOutboundConnectivityEnabled` will be cleared, and the Azure Advisor alert for default outbound IP will disappear.

## Verification and troubleshooting

After configuration, verify that VMs can reach the internet and that the egress IP matches the NAT Gateway's public IP. Use a tool like `curl ifconfig.me` from within a VM to check the source IP. If the IP does not match, ensure that the subnet is correctly associated with the NAT Gateway and that default outbound access is disabled.

If you encounter connectivity issues, check the following:

* **NSG rules:** Ensure that outbound rules in the Network Security Group allow the required traffic. NSGs are evaluated before NAT, so deny rules will block traffic even if NAT Gateway is configured.
* **UDRs:** If you have User Defined Routes, ensure they do not conflict with the NAT Gateway. NAT Gateway traffic is handled by the platform and does not require a UDR for the default route.
* **SNAT exhaustion:** Monitor the number of connections per VM. If you see timeouts or dropped connections, consider adding more public IP addresses to the NAT Gateway or scaling out the VMs.

NAT Gateway provides a robust, scalable solution for outbound connectivity. By combining it with private subnets, you ensure that your VMs have a stable, predictable egress identity while adhering to security best practices.

Cheers,

Marcos

References for Choose NAT Gateway when stable outbound connectivity matters: [Default Outbound Access in Azure](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/default-outbound-access), [Scale SNAT ports with Azure NAT Gateway](https://learn.microsoft.com/en-us/azure/firewall/integrate-with-nat-gateway), [Outbound rules Azure Load Balancer](https://learn.microsoft.com/en-us/azure/load-balancer/outbound-rules).
