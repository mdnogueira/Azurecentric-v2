---
title: "Build a route table for a controlled outbound path"
description: "Create a user-defined route table to force outbound traffic through a network virtual appliance in Azure."
pubDate: 2025-06-12
category: networking
tags: ["azure-virtual-network", "user-defined-routes", "network-virtual-appliance", "networking", "azure-cli"]
translationKey: build-a-route-table-for-a-controlled-outbound-path
draft: false
---

Azure routes traffic between subnets within a virtual network by default. If you need to inspect or filter that traffic before it leaves the virtual network, you must override the default system routes. The standard way to do this is to create a user-defined route (UDR) that directs traffic to a network virtual appliance (NVA). This guide shows you how to build that route table and associate it with a subnet.

## Understand the default routing behaviour

[![Traffic flow through NVA with UDR](/images/posts/2025/azc-189-checkpoints.svg)](/images/posts/2025/azc-189-checkpoints.svg)

When you create a subnet, Azure automatically adds system routes to its route table. These include a route for the virtual network's address space, routes for private address ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 100.64.0.0/10) with a next hop type of **None**, and a default route for all other traffic (0.0.0.0/0) with a next hop type of **Internet** [Azure virtual network traffic routing](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview).

If you want traffic to pass through a firewall or NVA, you must create a custom route that overrides the 0.0.0.0/0 system route. You cannot modify the system routes directly; you must create new UDRs [Azure virtual network traffic routing](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview).

## Plan your subnet layout

A common pattern is to separate the NVA from the workloads it protects. Deploy the NVA in its own subnet (often called a DMZ or appliance subnet) and place the workloads in a separate private subnet [Tutorial: Route network traffic with a route table](https://learn.microsoft.com/en-us/azure/virtual-network/tutorial-create-route-table).

If you associate a route table that sends traffic to the NVA with the NVA's own subnet, you risk creating a routing loop. The NVA will try to send traffic to itself, which it cannot do [Azure virtual network traffic routing](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview). Therefore, the route table must be associated with the source subnet (the private subnet), not the appliance subnet.

## Create the route table and route

You can create the route table and the specific route using the Azure portal, PowerShell, or the Azure CLI. The following example uses the Azure CLI to create a route table named `rt-private` and add a route named `route-to-nva` that directs all outbound traffic (0.0.0.0/0) to the private IP address of the NVA.

```azurecli-interactive
# Create the route table
az network route-table create \
    --resource-group test-rg \
    --name rt-private \
    --location eastus2

# Create the route
# Replace 10.0.3.4 with the actual private IP of your NVA
az network route-table route create \
    --resource-group test-rg \
    --route-table-name rt-private \
    --name route-to-nva \
    --address-prefix 0.0.0.0/0 \
    --next-hop-type VirtualAppliance \
    --next-hop-ip-address 10.0.3.4
```

The next hop type **VirtualAppliance** tells Azure that the destination is a virtual machine acting as a network device. You must specify the private IP address of that VM [Azure virtual network traffic routing](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview).

## Associate the route table to the subnet

Once the route table exists, you must associate it with the subnet containing the workloads that need to use the NVA. In this example, that is the `subnet-private` subnet.

```azurecli-interactive
az network vnet subnet update \
    --resource-group test-rg \
    --vnet-name vnet-1 \
    --name subnet-private \
    --route-table rt-private
```

After association, the subnet's effective routes will include the new UDR. Because UDRs override system routes for matching prefixes, the 0.0.0.0/0 route in `rt-private` will take precedence over the system default route to the Internet [Azure virtual network traffic routing](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview).

## Verify the configuration

To confirm the route is active, you can check the effective routes for the subnet. This shows the final routing decision Azure makes for traffic leaving that subnet.

```azurecli-interactive
az network vnet subnet show-effective-routes \
    --resource-group test-rg \
    --vnet-name vnet-1 \
    --name subnet-private
```

Look for the 0.0.0.0/0 route in the output. It should show `VirtualAppliance` as the next hop type and the NVA's IP address as the next hop IP address. If it still shows `Internet`, the association may not have propagated, or the route table is not correctly linked to the subnet.

## Considerations for NVA configuration

The NVA itself must be configured to forward traffic. This often involves enabling IP forwarding on the network interface attached to the NVA. Without IP forwarding, Azure drops packets that are not destined for the VM itself [Azure virtual network traffic routing](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview). You must also ensure the NVA's operating system is configured to route traffic between its network interfaces.

Finally, remember that the NVA needs its own connectivity. If the NVA needs to reach the internet for updates or licensing, you may need to add a specific route for that traffic or ensure the NVA has a public IP address and a separate route table that allows direct internet access. If the NVA is in a DMZ subnet, it might not have a default route to the internet unless explicitly configured.
