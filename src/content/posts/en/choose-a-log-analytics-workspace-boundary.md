---
title: "Choose a Log Analytics workspace boundary"
description: "Decide on Log Analytics workspace boundaries using retention, access, and billing criteria to balance cost and operational simplicity."
pubDate: 2024-05-19
category: governance
tags: ["log-analytics", "azure-monitor", "workspace-design", "data-retention", "access-control"]
translationKey: choose-a-log-analytics-workspace-boundary
draft: false
---

How many Log Analytics workspaces do you actually need? The practical answer is to start with a single workspace and only introduce additional ones when a specific constraint makes consolidation impossible or significantly more expensive. Complexity in querying, managing data collection rules, and tracking costs rises quickly with each extra workspace, so the default should be consolidation unless a clear requirement forces a split.

A Log Analytics workspace is a unique environment for log data from Azure Monitor and other Azure services, such as Microsoft Sentinel and Microsoft Defender for Cloud. Each workspace has its own data repository and configuration, but it can combine data from multiple sources. The decision to create multiple workspaces usually comes down to a few concrete criteria: data retention requirements, access control boundaries, billing separation, and regulatory location constraints.

[![Log Analytics Workspace Decision Flow](/images/posts/2024/azc-050-checkpoints.svg)](/images/posts/2024/azc-050-checkpoints.svg)

## Start with a single workspace

Your design should always start with a single workspace to reduce the complexity of managing multiple workspaces and querying data from them. Multiple services and data sources can send data to the same workspace. As you identify criteria to create more workspaces, your design should use the fewest number that will match your requirements.

This approach simplifies initial setup. You can use a single workspace for all your data collection. You can also create multiple workspaces based on requirements such as the geographic location of the data, access rights that define which users can access data, or configuration settings like pricing tiers and data retention. To create a new workspace, you can use the Azure portal, CLI, or Resource Manager templates. For example, using Azure CLI:

```azurecli
az monitor log-analytics-workspace create --name <workspace-name> --resource-group <resource-group-name> --location <location>
```

This command creates a workspace in the specified resource group and location. The workspace is a unique environment for log data from Azure Monitor and other Azure services. Each workspace has its own data repository and configuration but might combine data from multiple services.

## When to split: retention and access

The most common reason to create a second workspace is a conflict in data retention settings. You can set the retention time to balance your requirement for having data available with reducing your cost for data retention. If you require different retention settings for different resources that send data to the same tables, you need a separate workspace. For example, if one team needs 30 days of retention and another needs 365 days for the same type of log data, you cannot achieve this in a single workspace without table-level archiving, which adds complexity.

Access control is another driver. Permission to access data in a Log Analytics workspace is defined by the access control mode, which is a setting on each workspace. You can give users explicit access to the workspace by using a built-in or custom role, or you can allow access to data collected for Azure resources to users with access to those resources. If you need to block certain users from specific tables or limit users to accessing the workspace using resource-context, you might choose to separate data into different workspaces to enforce stricter boundaries.

## Billing and ownership

Split billing is another consideration. By placing workspaces in separate subscriptions, they can be billed to different parties. You can use Azure Cost Management + Billing to view charges by workspace. You can also use a log query to view billable data volume by Azure resource, resource group, or subscription. If you need to split billing or perform charge back, consider whether Azure Cost Management + Billing or a log query provides cost reporting that's granular enough for your requirements. If not, use a separate workspace for each cost owner.

Data ownership is similar. You might have a requirement to segregate data or define boundaries based on ownership. For example, you might have different subsidiaries or affiliated companies that require delineation of their monitoring data. If you require data segregation, use a separate workspace for each data owner. If you don't require data segregation, use a single workspace for all data owners.

## Geographic and regulatory constraints

Each Log Analytics workspace resides in a particular Azure region. You might have regulatory or compliance purposes for keeping data in a particular region. For example, an international company might locate a workspace in each major geographical region, such as the United States and Europe. If you have requirements for keeping data in a particular geography, create a separate workspace for each region with such requirements. If you don't have requirements for keeping data in a particular geography, use a single workspace for all regions.

Also consider potential bandwidth charges that might apply when you're sending data to a workspace from a resource in another region. These charges are usually minor relative to data ingestion costs for most customers. These charges typically result from sending data to the workspace from a virtual machine. Monitoring data from other Azure resources by using diagnostic settings doesn't incur egress charges. Use the Azure pricing calculator to estimate the cost and determine which regions you need. Consider workspaces in multiple regions if bandwidth charges are significant.

## Commitment tiers and legacy agents

Commitment tiers allow you to reduce your ingestion cost by committing to a minimum amount of daily data in a single workspace. If you can commit to daily ingestion of at least 100 GB per day, you should implement a dedicated cluster that provides extra functionality and performance. Dedicated clusters also allow you to combine the data from multiple workspaces in the cluster to reach the level of a commitment tier. If you'll ingest at least 100 GB per day across resources, consider combining them into a single workspace to take advantage of a commitment tier.

Legacy agent limitations are another factor. The Log Analytics agent for Linux can only connect to a single workspace. If you use the Log Analytics agent for Linux, migrate to Azure Monitor Agent or ensure that your Linux machines only require access to a single workspace. This limitation can force a decision to keep all Linux monitoring data in one workspace.

## Verification

To verify your workspace design, check the following:

1. **Retention Settings**: Ensure that all resources sending data to the workspace have compatible retention requirements. If not, split the workspace.
2. **Access Control**: Confirm that the access control mode meets your security requirements. If you need granular access control by table, consider using table-level RBAC or splitting the workspace.
3. **Billing**: Verify that the billing structure meets your financial requirements. If you need to split billing, consider using separate workspaces.
4. **Geographic Constraints**: Ensure that data residency requirements are met. If you have regulatory constraints, create separate workspaces for each region.
5. **Commitment Tiers**: Check if consolidating data into a single workspace helps you reach a commitment tier. If so, consider combining workspaces.

By following these steps, you can ensure that your Log Analytics workspace design meets your operational, security, and financial requirements. Remember, the goal is to minimize complexity while maximizing visibility and control. Start with one workspace, and only add more when necessary.


References for Choose a Log Analytics workspace boundary: [Log Analytics workspace overview](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview), [Manage an Azure Monitor workspace](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/azure-monitor-workspace-manage), [Design a Log Analytics workspace architecture](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/workspace-design).
