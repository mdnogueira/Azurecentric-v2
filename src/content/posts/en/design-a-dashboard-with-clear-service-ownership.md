---
title: "Design a dashboard with clear service ownership"
description: "Use Azure Workbooks to clarify service ownership with dynamic parameters and scoped queries."
pubDate: 2026-07-01
category: governance
tags: ["azure-workbooks", "azure-monitor", "kusto", "ownership", "dashboards"]
translationKey: design-a-dashboard-with-clear-service-ownership
draft: false
---

A dashboard displaying metrics across dozens of subscriptions often fails the most basic operational test: it does not tell the reader who is responsible for the data they are seeing. When an alert fires or a performance anomaly appears, the first question is rarely "what is the metric value?" but "whose service is this?" If the answer is buried in a generic title or requires clicking through to resource properties, the dashboard has not reduced cognitive load.

Azure Workbooks provide the structural elements to enforce ownership visibility without hard-coding resource lists. By combining parameters, text blocks, and scoped queries, you can create a template that adapts to the user's context while keeping the ownership narrative clear. This approach works because it separates the *who* (ownership metadata) from the *what* (performance data).

## Define ownership as a parameter, not a static label

The most common mistake is to write a query that assumes a single owner or to hard-code a resource group name into the text. Instead, treat ownership as a dynamic filter. Azure Workbooks support parameters that can pull values from Azure Resource Graph, allowing you to list owners or resource groups dynamically.

Start by adding a parameter that defines the scope of the view. If your organisation structures ownership by resource group, a dropdown parameter is effective. If ownership is tied to specific resource types, a resource-type parameter is more appropriate.

```kusto
// Example parameter query to list resource groups
Resources
| where type == 'microsoft.resources/resourcegroups'
| project value = id, label = name, selected = false
```

This query feeds into a dropdown parameter named `ResourceGroup`. When a user selects a group, the rest of the workbook can filter its data accordingly. This ensures that the dashboard always reflects the scope the user is currently investigating, rather than a static snapshot.

## Use text blocks to anchor the narrative

Text blocks in Workbooks are not just for decoration; they are the primary vehicle for explaining context. Unlike static dashboards, Workbooks allow you to embed markdown that can reference parameter values. This means you can dynamically state who owns the current view.

Add a text block at the top of the workbook. Use the `info` or `warning` style to draw attention to critical ownership details. For example:

```markdown
## Current Scope: {ResourceGroup}

**Owner**: Link to Team Wiki

This view displays performance metrics for the selected resource group. If you are seeing unexpected latency, check the dependency logs first.
```

The `{ResourceGroup}` placeholder updates automatically when the user changes the dropdown. This keeps the ownership statement accurate without requiring manual edits. The text block also provides space for links to runbooks or escalation paths, which is crucial for operational clarity.

## Scope queries to the selected ownership

Once the scope is defined, your queries must respect it. A query that ignores the parameter will display data from all resources, defeating the purpose of the filter. Use the parameter in your Kusto queries to limit the data returned.

For example, to show CPU utilisation for the selected resource group:

```kusto
Resources
| where id in~({ResourceGroup})
| join kind=inner (Perf)
    on $left.ResourceId == $right.ResourceId
| where CounterName == '% Processor Time'
| summarize AggregatedValue = avg(CounterValue) by bin(TimeGenerated, 1h), Computer
| render timechart
```

This query is simple, but it ensures that the visualisation only reflects the resources in the selected group. If the user switches to a different group, the chart updates immediately. This dynamic behaviour is what makes Workbooks superior to static dashboards for multi-tenant or multi-team environments.

## Verify the ownership flow

To confirm that your workbook correctly enforces ownership visibility, perform the following checks:

1. **Parameter Update**: Change the `ResourceGroup` parameter and verify that the text block updates to reflect the new selection.
2. **Query Scope**: Ensure that the query results only include resources from the selected group. If you see data from other groups, check your Kusto filter syntax.
3. **Link Accuracy**: Click any links in the text block to ensure they point to the correct resources or documentation.

If these checks pass, your workbook is ready for sharing. Remember that sharing a workbook does not automatically grant access to the underlying data. Users must have the appropriate permissions to view the resources included in the workbook. The [Monitoring Reader](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-overview) role is sufficient for viewing, while [Monitoring Contributor](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-overview) is needed for editing.

By treating ownership as a dynamic parameter and anchoring it with text, you create a dashboard that is both flexible and clear. This approach reduces ambiguity and helps operators focus on the right resources, right away.
