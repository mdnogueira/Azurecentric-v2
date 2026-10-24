---
title: "Keep Azure Firewall rules consistent with Firewall Policy"
description: "Align Azure Firewall rule priorities with the policy hierarchy to ensure predictable traffic filtering and avoid performance degradation."
pubDate: 2024-06-10
category: governance
tags: ["azure-firewall", "firewall-policy", "network-security", "rule-configuration", "performance"]
translationKey: keep-azure-firewall-rules-consistent-with-firewall-policy
draft: true
---

You have a firewall policy with dozens of rule collections, and traffic is behaving unexpectedly. The most likely culprit is not a missing rule, but a mismatch between the priority values in your policy and the order in which Azure Firewall actually processes them. When rule collection groups and collections are not aligned with the processing hierarchy, you risk allowing traffic that should be denied, or incurring unnecessary latency as the firewall scans through irrelevant rules.

Azure Firewall uses a strict hierarchy to evaluate traffic: rule collection groups, then rule collections within those groups, and finally individual rules. Understanding this structure is essential for maintaining consistency and performance.

[![Azure Firewall Rule Processing Hierarchy](/images/posts/2024/azc-058-checkpoints.svg)](/images/posts/2024/azc-058-checkpoints.svg)

## Understand the processing hierarchy

Firewall Policy is the top-level resource that contains your security settings. It organises rules into a hierarchy that the firewall processes in a specific order. The first unit processed is the rule collection group. These groups have priority values that determine their processing order. There are three default rule collection groups with preset priorities: Default DNAT (priority 100), Default Network (priority 200), and Default Application (priority 300). You cannot delete these default groups or change their priority values, but you can create custom rule collection groups with different priority values to override the default processing order.

Within each rule collection group, you define rule collections. These collections also have priority values that determine the order in which they are processed. Each collection must have a defined action, either allow or deny, which applies to all rules within it. The priority value of a rule collection determines its order relative to other collections in the same group.

Finally, individual rules are evaluated within each collection. Rules do not have priority values; they are processed in a top-down approach within their collection. The firewall evaluates all traffic against the rules in order, and if no rule allows the traffic, it is denied by default.

## Align rules with the hierarchy

To ensure consistency, you must map your business requirements to this hierarchy. Start by identifying the type of traffic you need to control. DNAT rules handle inbound traffic translation, network rules filter traffic based on IP addresses and ports, and application rules filter traffic based on FQDNs and URLs.

When creating rule collections, group related rules together. For example, if you have multiple application rules for the same workload, place them in the same application rule collection. This reduces the number of collections and simplifies management. Assign priority values to your rule collections based on their importance. High-priority rules, such as those blocking known malicious traffic, should have lower priority values so they are processed first.

Be cautious with the default rule collection groups. If you need a different processing order, create custom rule collection groups and assign them priority values that reflect your needs. For instance, if you want to process application rules before network rules, create a custom application rule collection group with a priority value lower than 200.

## Optimise for performance

Rule configuration directly impacts firewall performance. Exceeding rule limitations, such as using over 20,000 unique source/destination combinations, can cause latency. To mitigate this, use IP Groups or IP prefixes to reduce the number of IP table rules. Prioritise rules with the highest number of hits to ensure they are processed first.

Monitor your firewall metrics to identify performance issues. Use the latency probe metric to measure the average latency introduced by the firewall. Correlate rule hit timestamps with performance spikes to determine if rule processing is a significant factor. If you notice high latency, review your rule collections and ensure they are optimised for performance.

## Verify your configuration

After updating your firewall policy, verify that the rules are processed as expected. Test traffic flow through the firewall and compare the results with your policy configuration. Use Azure Firewall logs to confirm that the correct rules are being hit. If traffic is not behaving as expected, review the priority values of your rule collection groups and collections to ensure they align with your intended processing order.

Consistent rule configuration is not just about security; it is about performance and predictability. By aligning your rules with the firewall policy hierarchy, you ensure that traffic is processed efficiently and securely.

### Prerequisites

*   Azure Firewall Policy with existing rule collections.
*   Understanding of rule collection group priorities and rule collection priorities.
*   Access to Azure Firewall logs for verification.

### Steps

1.  Review existing rule collection groups and their priority values.
2.  Identify rule collections that need reordering based on business requirements.
3.  Create custom rule collection groups if necessary to override default processing order.
4.  Update rule collection priorities to reflect the importance of rules.
5.  Test traffic flow and verify rule hits using Azure Firewall logs.

### Verification

*   Confirm that high-priority rules are processed first.
*   Check Azure Firewall logs to ensure correct rules are being hit.
*   Monitor latency metrics to ensure performance is not degraded.

### Cleanup

*   Remove any unused rule collections or groups.
*   Document the final rule collection group and collection priorities for future reference.

By following these steps, you can ensure that your Azure Firewall rules are consistent with the policy hierarchy, leading to better performance and more predictable traffic filtering.


References for Keep Azure Firewall rules consistent with Firewall Policy: [Azure Firewall policy rule sets](https://learn.microsoft.com/en-us/azure/firewall/policy-rule-sets), [Azure Firewall best practices for performance](https://learn.microsoft.com/en-us/azure/firewall/firewall-best-practices), [What is Azure Firewall?](https://learn.microsoft.com/en-us/azure/firewall-manager/overview).
