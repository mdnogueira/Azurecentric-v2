---
title: "Diagnose a route that sends traffic to the wrong next hop"
description: "Diagnose why VM traffic takes the wrong path using effective routes and Network Watcher next hop."
pubDate: 2024-09-02
category: networking
tags: ["azure-network-watcher", "virtual-network", "routing", "troubleshooting", "azure-cli"]
translationKey: diagnose-a-route-that-sends-traffic-to-the-wrong-next-hop
draft: false
---

You are trying to connect to a resource, but the traffic from your virtual machine is going to the wrong next hop. This usually happens when a custom route overrides an Azure system route, or when a route table is associated with the wrong subnet. The first thing to check is not the application logs, but the network path itself.

Azure creates default routes for every subnet. You can override these with User Defined Routes (UDRs) in a route table. If a route table is associated with a subnet, every network interface in that subnet inherits those routes. If the traffic is misbehaving, you need to see exactly which routes are effective for the specific network interface sending the traffic.

[![Routing Diagnosis Flow](/images/posts/2024/azc-088-checkpoints.svg)](/images/posts/2024/azc-088-checkpoints.svg)

## Check the effective route table

The most direct way to see what the VM sees is to view the effective route table for its network interface. This combines system routes, custom routes from associated route tables, and BGP-propagated routes from on-premises connections.

You need the Azure CLI version 2.0.32 or later. If you are running locally, ensure you are logged in with an account that has permissions to view the network interface. The VM must be in a running state for this command to return output.

```azurecli-interactive
az network nic show-effective-route-table \
  --name myVMNic1 \
  --resource-group myResourceGroup
```

The output lists all routes that match the traffic from this interface. Look for the route that matches your destination IP address. If you see a custom route with a next hop type of `VirtualAppliance` or `VPN Gateway` where you expected `Internet` or `VirtualNetwork`, that is your culprit. If you see `None` as the next hop type for a route that should have a destination, it means the route exists but has no next hop configured. This can be a valid system state for prefixes not yet active in the VNet address space, or it can indicate a misconfiguration in a custom route.

If you do not know the name of the network interface, you can find it using the VM name:

```azurecli-interactive
az vm show \
  --name myVM \
  --resource-group myResourceGroup
```

This returns the network interface IDs. Use the name from the output in the previous command.

## Verify the specific next hop

If the effective route table shows a route but you are unsure if it is the one being used for a specific destination, use the Next Hop capability in Network Watcher. This tests the routing decision for a specific source IP and destination IP.

First, ensure Network Watcher is enabled in the region where your VM resides. If it is not, enable it. The resource group name is typically `NetworkWatcherRG` by default, but check your subscription for the actual group name.

```azurecli-interactive
az network watcher configure \
  --resource-group NetworkWatcherRG \
  --locations eastus \
  --enabled
```

Then, run the next hop check:

```azurecli-interactive
az network watcher show-next-hop \
  --dest-ip 10.0.0.5 \
  --resource-group myResourceGroup \
  --source-ip 10.0.0.4 \
  --vm myVM \
  --nic myVMNic1 \
  --out table
```

The output will show the `nextHopType` and the `routeTableId` that was used. If the `nextHopType` is `Internet` but you expected it to go to a firewall, check your route tables. If it is `None`, the route exists but has no next hop. This might be a valid system route for a prefix not yet in the VNet address space, or it could indicate a misconfiguration in a custom route.

## Resolve the routing issue

Once you have identified the incorrect route, you have three main options to fix it:

1. **Modify the custom route**: If the route table has a route that is too broad or points to the wrong appliance, change the address prefix or the next hop type.
2. **Change the route table association**: If the route table is correct but associated with the wrong subnet, disassociate it from the current subnet and associate it with the correct one. Remember that a subnet can have only one route table associated with it. If a network interface is in a subnet without a route table, it only uses system routes.
3. **Remove the custom route**: If the custom route is unnecessary and was causing the issue, delete it from the route table. This allows Azure's system routes to take over.

If you are using a network virtual appliance (NVA) as a next hop, ensure that IP forwarding is enabled on the NVA's network interface. Without IP forwarding, the NVA will drop the traffic even if the routing is correct. Also, verify that the NVA's operating system is configured to forward traffic between its interfaces.

## Considerations for complex scenarios

If you have multiple network interfaces attached to the VM, only the primary network interface is assigned a default route (0.0.0.0/0) within the guest OS. Secondary interfaces may not have a default route configured in the OS, which can cause connectivity issues if not handled correctly. You may need to configure the guest OS to use the correct default gateway for secondary interfaces.

If you are using virtual network peering, ensure that a system route with a next hop type of `VNet Peering` exists for the peered virtual network's prefix. If the peering link is connected but the route is missing, wait a few seconds and retry, as route propagation can take time. If the route still does not appear, check for Network Security Group (NSG) rules that might be blocking the traffic.

If you are force tunneling traffic to an on-premises device, be aware that remote connections using RDP or SSH from the internet to your VM may not work unless the next hop device is configured to route that traffic back to the VM. Confirm that the routing on the next hop device is correct.

If the effective route table and next hop check both show the correct routes, but connectivity still fails, the issue may be within the VM's operating system firewall or application configuration. Use the Connection Troubleshoot capability in Network Watcher to check for filtering or in-OS causes of the problem.

### Verification

After making changes, re-run the `az network nic show-effective-route-table` command to confirm the new routes are effective. Then, test the connectivity from the VM to the destination. If the issue persists, check the NSG rules associated with the network interface or subnet to ensure they are not blocking the traffic.

If you are using BGP to propagate routes from an on-premises network, ensure that the BGP session is established and that the routes are being advertised correctly. Use the VPN diagnostics capability in Network Watcher to check the status of the VPN gateway or ExpressRoute circuit.

References for Diagnose a route that sends traffic to the wrong next hop: [Diagnose a VM network routing problem - Azure CLI](https://learn.microsoft.com/en-us/azure/network-watcher/diagnose-vm-network-routing-problem-cli), [Diagnose an Azure virtual machine routing problem](https://learn.microsoft.com/en-us/azure/virtual-network/diagnose-network-routing-problem).
