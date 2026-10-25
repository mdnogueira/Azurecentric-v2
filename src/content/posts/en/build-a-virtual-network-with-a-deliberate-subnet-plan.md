---
title: "Build a virtual network with a deliberate subnet plan"
description: "Plan a non-overlapping Azure virtual network address space, create subnets with clear purposes, and distinguish address boundaries from enforced traffic controls."
pubDate: 2024-01-28
category: networking
tags: ["azure-virtual-network", "subnets", "network-security-groups"]
translationKey: build-a-virtual-network-with-a-deliberate-subnet-plan
draft: false
---

A virtual network address range is easy to enter and awkward to revisit after other networks depend on it. Before creating the VNet, compare the proposed range with the networks it may eventually need to reach.

That includes existing Azure VNets, on-premises networks and any address ranges reserved for connected platforms. Two independent environments using the same private range can appear harmless until a peering or hybrid connection is required.

Microsoft's [virtual network portal quickstart](https://learn.microsoft.com/en-us/azure/virtual-network/quick-create-portal) shows the creation process. The useful preparation is deciding what the addresses and subnets mean in your environment.

## Record an example address plan

For this illustrative lab, use `10.42.0.0/16` only if it does not overlap with your environment. The following subnets are examples, not a recommended universal sizing standard:

| Subnet | Prefix | Intended purpose |
|---|---|---|
| `snet-app` | `10.42.10.0/24` | Application resources |
| `snet-data` | `10.42.20.0/24` | Resources supporting the data tier |
| `snet-private-endpoints` | `10.42.30.0/24` | A deliberately separate allocation for private endpoints |

The remaining address space is unallocated. Keeping room for additional subnets makes future changes easier, but it does not remove the need for an organisation-wide address plan.

Azure reserves addresses within each subnet, so do not equate the full address count with the number available for resources. Check the expected resource count and the service's own subnet requirements. Some services require dedicated subnets, particular names or delegation; an ordinary application subnet is not automatically suitable for all of them.

## Create the VNet and its subnets

Confirm that you have permission to create the network resources in the intended resource group. In the Azure portal, open **Virtual networks** and create a virtual network.

Choose the subscription, resource group, region and a descriptive name such as `vnet-azc-lab`. On the IP address configuration page, enter the agreed IPv4 address space. Review any initial subnet created by the form and replace or edit it deliberately rather than leaving an unexplained default alongside the planned subnets.

Add the three subnets with their names and prefixes. Check that each prefix fits within the VNet range and that none overlaps another subnet. Review the configuration before creating the network.

After deployment, open the VNet's address-space and subnet pages. Compare the actual values with the plan. A successful deployment confirms that Azure accepted the configuration; it does not prove that the address space fits a future network connection.

## Decide where traffic controls belong

Separate subnets provide address and configuration boundaries. They do not automatically isolate application traffic from the data tier. Azure's default virtual-network connectivity and the configured security rules still determine what can communicate.

Use [network security groups](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview) where you need filtering. Describe the expected source, destination, protocol and port for a flow before writing its rule. For example, an application-to-database connection should follow the actual database endpoint and required service port, rather than a broad allowance between two entire tiers.

Inspect the default rules as well as the custom ones. An allow rule in one place does not prove a connection will work if another applicable rule, guest firewall or application setting blocks it. Equally, creating an NSG without the intended restrictions does not establish tier isolation.

If the design uses a network appliance or controlled outbound path, record the routing requirements separately. An NSG filters traffic; a route table determines where traffic is sent. They solve related but different parts of the path.

## Verify the plan before adding dependencies

For this exercise, the configuration checks are straightforward: the deployed address space matches the agreed range, the subnet prefixes are correct, and each subnet has a recorded purpose and owner.

When resources are added, extend verification to effective routes, effective security rules and an actual connection to the intended destination. Use the expected path as the reference, including DNS and any appliance in the route.

Keep the address plan with the deployment record. Before connecting another VNet or on-premises network, compare its ranges again. That is a much better time to discover an overlap than during a production cutover.
