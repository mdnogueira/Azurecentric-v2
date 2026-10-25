---
title: "Create virtual network peering and verify the routing path"
description: "Create virtual network peerings with Azure CLI and verify the routing path using effective route tables."
pubDate: 2024-05-16
category: networking
tags: ["virtual-network", "peering", "azure-cli", "networking", "routing"]
translationKey: create-virtual-network-peering-and-verify-the-routing-path
draft: false
---

You need to connect two virtual networks so resources can communicate as if they were in the same network. Virtual network peering achieves this by routing traffic through the Microsoft backbone infrastructure, avoiding the public internet and gateways. The key decision is ensuring the address spaces do not overlap and that you have the correct permissions in both subscriptions before attempting the connection.

## Prerequisites and permissions

Before creating a peering, confirm the virtual networks have non-overlapping IP address ranges. If the address spaces overlap, the peering will fail. You also need the Network Contributor role on both virtual networks. If the virtual networks are in different subscriptions or tenants, you must assign permissions in each subscription. For example, if UserA owns the first virtual network and UserB owns the second, UserA needs Network Contributor rights on UserB's network, and vice versa.

The account you use to create the peering must have these permissions. The Azure portal, Azure CLI, and Azure PowerShell all require the same underlying permissions. If you are using the Azure CLI, ensure you are logged in with an account that has access to both subscriptions.

## Create the peering

Virtual network peering is a bidirectional connection, but you must create each direction separately. This means you create a peering from Virtual Network A to Virtual Network B, and then a separate peering from Virtual Network B to Virtual Network A. The Azure CLI commands below illustrate this process. This code is an illustrative example and has not been run in a live environment.

```azurecli-interactive
# Create peering from vnet-1 to vnet-2
az network vnet peering create \
    --name vnet-1-to-vnet-2 \
    --vnet-name vnet-1 \
    --resource-group test-rg \
    --remote-vnet vnet-2 \
    --allow-vnet-access

# Create peering from vnet-2 to vnet-1
az network vnet peering create \
    --name vnet-2-to-vnet-1 \
    --vnet-name vnet-2 \
    --resource-group test-rg-2 \
    --remote-vnet vnet-1 \
    --allow-vnet-access
```

The `--allow-vnet-access` flag enables communication between the two virtual networks. By default, this option is selected, but explicitly setting it makes the intent clear. If you need to allow forwarded traffic from a network virtual appliance in the peered network, you would also include the `--allow-forwarded-traffic` flag. However, this does not create user-defined routes; you must configure those separately if you intend to use service chaining.

After running the commands, the peering status will initially show as `Updating`. Wait a few seconds and then check the status. Once the status changes to `Connected`, the peering is established. You can verify this by listing the peerings for the virtual network.

## Verify the routing path

Creating the peering does not automatically guarantee that traffic will flow as expected. You must verify that the routing table on the virtual machines reflects the peering. The most direct way to check this is by examining the effective routes on a network interface in one of the virtual networks.

If the peering is successful, you should see routes with the next hop type `VNet peering` for each address space in the peered virtual network. This confirms that traffic destined for the peered network will be routed correctly through the Microsoft backbone.

You can also use Azure Network Watcher to perform a connectivity check. This tool simulates traffic from a source virtual machine to a destination virtual machine and shows how the traffic is routed. It provides a clear view of whether the peering is functioning and if any network security group rules are blocking the traffic.

## Common pitfalls

Do not assume that enabling a peering provides all the features of a single virtual network. For example, global virtual network peering has constraints related to basic load balancers. Resources in one virtual network cannot communicate with the front-end IP address of a basic load balancer in a globally peered virtual network. If you need load balancing across regions, you must use a standard load balancer or a different architecture.

Also, remember that peering does not replicate DNS settings. If you are using default Azure name resolution, resources in peered virtual networks will not be able to resolve names across the peering. You must configure your own DNS server or use Azure Private DNS zones to handle name resolution across virtual networks.

Finally, be aware that there is a nominal charge for ingress and egress traffic that uses a virtual network peering connection. While this is often negligible, it is a factor to consider when designing large-scale architectures with many peerings.

## Cleanup

If you no longer need the peering, you can delete it using the Azure CLI. Deleting a peering is a unilateral action; you only need to delete the peering from one side, and the connection is removed.

```azurecli-interactive
# Delete peering from vnet-1 to vnet-2
az network vnet peering delete \
    --name vnet-1-to-vnet-2 \
    --vnet-name vnet-1 \
    --resource-group test-rg
```

After deleting the peering, verify that the effective routes no longer show the `VNet peering` next hop for the remote address space. This confirms that the routing path has been removed and traffic will no longer flow through the peering.

For more detailed information on peering requirements and constraints, refer to the [Azure virtual network peering overview](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview) and the [how-to guide for creating peerings](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-manage-peering).
