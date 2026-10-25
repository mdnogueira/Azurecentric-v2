---
title: "Use network security groups with clear traffic ownership"
description: "Define traffic ownership in Azure NSGs by understanding rule evaluation order, association scope, and effective rules."
pubDate: 2024-07-08
category: networking
tags: ["network-security-groups", "azure-virtual-network", "networking", "security", "azure"]
translationKey: use-network-security-groups-with-clear-traffic-ownership
draft: false
---

Inbound traffic evaluation order determines whether a network security group (NSG) protects a workload or blocks it unexpectedly. If you do not account for where the NSG is associated, you might assume a rule is blocking traffic when it is actually being allowed by a higher-priority rule elsewhere, or vice versa.

An NSG contains security rules that allow or deny inbound and outbound traffic. Each rule has a priority number between 100 and 4096. Lower numbers have higher priority and are processed first. Once traffic matches a rule, processing stops. This means a rule with priority 100 will always take precedence over a rule with priority 200, regardless of the source or destination. Azure default security rules are assigned the lowest priority (highest numbers, 65000 and above) to ensure that custom rules are always processed first [Azure network security groups overview](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview).

## Understand the evaluation order

The order in which rules are evaluated depends on the direction of the traffic and the association of the NSG. You can associate an NSG to a subnet, a network interface, or both. The same NSG can be associated with multiple subnets and network interfaces [Network security group - how it works](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works).

For **inbound traffic**, Azure processes the rules in the NSG associated to the subnet first, and then the rules in the NSG associated to the network interface. If the subnet NSG allows the traffic, the network interface NSG is then evaluated. If the subnet NSG denies the traffic, the network interface NSG is not evaluated, and the traffic is blocked [Network security group - how it works](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works). This means that for inbound traffic to reach a virtual machine, both the subnet NSG and the network interface NSG must allow the traffic. If either denies it, the connection fails.

For **outbound traffic**, the order is reversed. Azure processes the rules in the NSG associated to the network interface first, and then the rules in the NSG associated to the subnet. If the network interface NSG denies the traffic, the subnet NSG is not evaluated. If the network interface NSG allows the traffic, the subnet NSG is then evaluated. For outbound traffic to leave the virtual machine, both NSGs must allow it [Network security group - how it works](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works).

This evaluation order is critical. If you associate an NSG to both a subnet and a network interface, you must ensure that the rules in both NSGs are consistent. If they conflict, you may experience unexpected connectivity issues. For example, if the subnet NSG allows inbound traffic on port 80, but the network interface NSG denies it, the traffic will be blocked. Conversely, if the subnet NSG denies the traffic, the network interface NSG is never consulted, and the traffic is blocked regardless of its rules [Network security group - how it works](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works).

## Account for default security rules

Every NSG comes with a set of default security rules that cannot be deleted. These rules ensure basic connectivity and platform functionality. The default rules include:

- **AllowVNetInBound**: Allows traffic within the virtual network.
- **AllowAzureLoadBalancerInBound**: Allows traffic from the Azure Load Balancer.
- **DenyAllInbound**: Denies all other inbound traffic.
- **AllowVnetOutBound**: Allows traffic within the virtual network.
- **AllowInternetOutBound**: Allows traffic to the internet.
- **DenyAllOutBound**: Denies all other outbound traffic [Azure network security groups overview](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview).

These default rules have the lowest priority (highest numbers). You can override them by creating custom rules with higher priorities (lower numbers). For example, if you want to deny all inbound traffic from a specific IP address, you can create a custom rule with a priority of 100 that denies traffic from that IP address. This rule will be processed before the default **DenyAllInbound** rule [Azure network security groups overview](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview).

It is important to note that the default rules are not a substitute for custom security rules. They provide a baseline level of connectivity, but they do not provide granular control over traffic. You should create custom rules to define the specific traffic patterns that your workload requires.

## Define traffic ownership with association scope

To maintain clear traffic ownership, you should associate NSGs to the appropriate scope. Associating an NSG to a subnet applies the rules to all resources in that subnet. Associating an NSG to a network interface applies the rules to a specific resource. 

Microsoft recommends associating an NSG to a subnet or a network interface, but not both, unless you have a specific reason to do so. This reduces the complexity of rule evaluation and minimises the risk of conflicts [Network security group - how it works](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works). If you must associate an NSG to both, ensure that the rules in both NSGs are consistent and that you understand the evaluation order.

When defining traffic ownership, consider the following:

- **Subnet-level NSGs**: Use these to enforce security policies for a group of resources. This is useful for enforcing baseline security for all resources in a subnet, such as allowing only specific ports for management traffic.
- **Network interface-level NSGs**: Use these to enforce security policies for a specific resource. This is useful for enforcing granular security policies for a single virtual machine, such as allowing only specific IP addresses to access a database server.

## Verify effective security rules

To verify which rules are applied to a resource, you can view the effective security rules for a network interface. This shows the aggregate rules from both the subnet and network interface NSGs. You can also use the IP flow verify capability in Azure Network Watcher to determine whether a specific communication is allowed or denied [Network security group - how it works](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works).

IP flow verify allows you to test a specific communication by specifying the source IP, destination IP, source port, destination port, and protocol. It returns the result of the evaluation and the identity of the rule that allowed or denied the traffic. This is a useful tool for troubleshooting connectivity issues and verifying that your security rules are working as expected [Network security group - how it works](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works).

## Create and manage security rules

You can create, change, or delete security rules in an NSG using the Azure portal, PowerShell, or Azure CLI. When creating a rule, you must specify the priority, source, destination, protocol, port, and action (allow or deny) [Create, change, or delete an Azure network security group](https://learn.microsoft.com/en-us/azure/virtual-network/manage-network-security-group).

For example, to create a rule that allows inbound traffic from a specific IP address on port 80, you would specify:

- **Priority**: 100
- **Source**: IP Addresses (specific IP address)
- **Destination**: Any
- **Protocol**: TCP
- **Port**: 80
- **Action**: Allow

You can also use service tags and application security groups to simplify rule management. Service tags represent groups of IP address prefixes from a given Azure service, while application security groups allow you to group virtual machines and define security policies based on application structure [Azure network security groups overview](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview).

When managing NSGs, remember that modifying rules only affects new connections. Existing connections are not reevaluated when a rule is changed or removed [Azure network security groups overview](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview). This is important to consider when making changes to production workloads.

### Prerequisites

- An Azure subscription.
- Network Contributor role or a custom role with appropriate permissions to manage NSGs [Create, change, or delete an Azure network security group](https://learn.microsoft.com/en-us/azure/virtual-network/manage-network-security-group).
- An existing virtual network and subnet.

### Steps to associate an NSG to a subnet

1. In the Azure portal, search for **Network security groups** and select the NSG you want to associate.
2. Select **Subnets** and then **+ Associate**.
3. Select the virtual network and subnet you want to associate the NSG to, and then select **OK** [Create, change, or delete an Azure network security group](https://learn.microsoft.com/en-us/azure/virtual-network/manage-network-security-group).

### Steps to verify effective security rules

1. In the Azure portal, search for **Network security groups** and select the NSG associated with the network interface.
2. Select the network interface and then **Effective security rules** [Network security group - how it works](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works).
3. Review the rules to ensure they match your expected traffic patterns.

### Cleanup

If you no longer need an NSG, dissociate it from all subnets and network interfaces before deleting it. You can delete an NSG using the Azure portal, PowerShell, or Azure CLI [Create, change, or delete an Azure network security group](https://learn.microsoft.com/en-us/azure/virtual-network/manage-network-security-group).
