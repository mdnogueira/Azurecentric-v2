---
title: "Review network boundaries before connecting another environment"
description: "Review address spaces and peering constraints before connecting virtual networks to avoid routing conflicts and connectivity failures."
pubDate: 2026-10-12
category: networking
tags: ["azure-virtual-network", "peering", "networking", "security", "architecture"]
translationKey: review-network-boundaries-before-connecting-another-environment
draft: false
---

You are about to peer a virtual network in one subscription with another in a different subscription, or perhaps across tenants. The first thing to check is not the peering configuration itself, but the address spaces. If the CIDR blocks overlap, the peering will fail immediately. If they do not overlap, you still need to verify that the routing and security controls are deliberate, because peering creates a direct, non-transitive connection that bypasses most of the isolation you might expect.

Virtual network peering makes two networks appear as one for connectivity purposes. Traffic stays on the Microsoft backbone, which offers low latency and high bandwidth. However, this convenience comes with strict constraints. You must understand these boundaries before you click 'Create'.

[![Virtual Network Peering Decision Flow](/images/posts/2026/azc-363-checkpoints.svg)](/images/posts/2026/azc-363-checkpoints.svg)

## Check for address space overlap

A virtual network requires a custom private IP address space. When you peer two networks, their address spaces must not overlap. This is the most common reason for peering failures. You need to confirm the exact CIDR blocks for both the local and remote virtual networks.

If you are planning to scale workloads, ensure you have reserved address space. The documentation advises against covering the entire address space of a virtual network with subnets. Plan ahead. If you need to resize an address space later, you can do so without downtime on the currently peered address space, but peers must sync with the new address space changes. Resizing works for both IPv4 and IPv6, but you must run a sync operation after every resize. Do not perform multiple resizing operations and then sync; run sync after each change to ensure peers update correctly.

## Understand the scope and constraints of the connection

Peering is a direct connection between two virtual networks. It is not transitive. If Virtual Network A is peered with B, and B is peered with C, A cannot communicate with C via B. You must create explicit peerings for every required path. This is critical in hub-and-spoke designs. The hub peers with each spoke, but spokes do not peer with each other. Traffic between spokes must flow through the hub.

There are specific constraints for global virtual network peering (across regions). Resources in one virtual network cannot communicate with the front-end IP address of a basic load balancer in a globally peered virtual network. Some services using a basic load balancer do not work over global peering. If your design relies on load balancing across regions, you must use Standard load balancers or configure your architecture differently.

Also, consider the gateway configuration. A virtual network can have only one gateway. In a peered setup, you can configure gateway transit, allowing a spoke to use the hub's gateway for on-premises connectivity. In this case, the spoke cannot have its own gateway. If you need on-premises connectivity from both networks, you must configure local gateways in each virtual network, or use a shared gateway with transit. Be aware that when you use gateway transit, Azure VPN Gateway and ExpressRoute Gateway advertise the address space of the hub and the address spaces of peered virtual networks by default. This can lead to a large number of advertised prefixes to your on-premises network. You can use `summarizedGatewayPrefixes` to reduce this, but this property only affects virtual networks with a gateway subnet.

## Apply security controls deliberately

Peering does not imply security. By default, full connectivity is open between peered virtual networks. You must apply Network Security Groups (NSGs) to subnets and network interfaces to control traffic. Use a deny-by-default, permit-by-exception approach. You can use security admin rules in Azure Virtual Network Manager to centrally apply allow, always allow, and deny rules across managed virtual networks, which helps prevent workload-level NSG misconfiguration from bypassing organization-wide policy.

Do not assume that peering provides isolation. Treat it as a direct connection. Create explicit peerings for every required path. Scope NSG and route rules for the peered address spaces. Enable gateway transit or remote gateways only where the hub-and-spoke design requires shared on-premises connectivity. If you need to inspect traffic, you can use service chaining with User-Defined Routes (UDRs) to direct traffic to a virtual appliance in the peered network. However, you cannot route between virtual networks with a UDR that specifies an Azure ExpressRoute gateway as the next hop type.

## Verify connectivity and routing

Once the peering is established, verify that the routing is correct. Check the effective routes for a network interface in any subnet. If the peering exists, all subnets within the virtual network should have routes with the next hop type 'Virtual network peering' for each address space in each peered virtual network. You can use Azure Network Watcher to perform a connectivity check, which shows how traffic is routed from a source VM to a destination VM. This is a practical way to confirm that your NSG rules and UDRs are working as intended.

Remember that peering charges apply for ingress and egress traffic. While the traffic stays on the Microsoft backbone, you pay for the data transfer. Gateway transit also incurs virtual network peering charges on the spoke virtual network. Factor this into your cost model.

Before you finalize the peering, ensure you have reviewed the address spaces, confirmed the constraints, applied the necessary security controls, and verified the routing. This proactive approach prevents connectivity failures and ensures your network architecture is secure and scalable.


References for Review network boundaries before connecting another environment: [Azure Virtual Network Concepts and Best Practices](https://learn.microsoft.com/en-us/azure/virtual-network/concepts-and-best-practices), [Azure Virtual Network Peering](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview), [Secure your Azure Virtual Network deployment](https://learn.microsoft.com/en-us/azure/virtual-network/secure-virtual-network).
