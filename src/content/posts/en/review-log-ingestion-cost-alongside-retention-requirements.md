---
title: "Review log ingestion cost alongside retention requirements"
description: "Control Azure Monitor Logs costs by aligning table plans, retention, and commitment tiers with actual ingestion and query patterns."
pubDate: 2025-08-10
category: governance
tags: ["azure-monitor", "log-analytics", "cost-management", "data-retention", "table-plans"]
translationKey: review-log-ingestion-cost-alongside-retention-requirements
draft: true
---

The monthly invoice for Azure Monitor Logs rarely comes from the workspace itself. It comes from the data you keep and how you keep it. When the bill rises, the first thing to check is not the number of resources sending logs, but the interaction between ingestion volume, retention periods, and table plans.

You can reduce costs without losing visibility by adjusting these settings deliberately. This requires understanding how data is billed, choosing the right retention strategy, and applying table plans where appropriate. The following guidance focuses on the mechanics of billing and the configuration options available in Azure Monitor Logs as of August 2025.

[![Log Analytics Cost Decision Flow](/images/posts/2025/azc-210-checkpoints.svg)](/images/posts/2025/azc-210-checkpoints.svg)

## Understand how data is billed

Azure Monitor Logs charges for two primary factors: data ingestion and data retention. There is no direct cost for creating or maintaining a Log Analytics workspace, but every byte stored contributes to the bill [Log Analytics workspace overview](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview).

Data volume is measured in gigabytes (10^9 bytes). The size of a single record is calculated from the string representation of the columns stored in the workspace [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). This calculation includes any custom columns added during ingestion or by transformations [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). However, certain standard columns are excluded from this calculation: `_ResourceId`, `_SubscriptionId`, `_ItemId`, `_IsBillable`, `_BilledSize`, and `Type` [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). Additionally, some tables are free from ingestion charges altogether, such as `AzureActivity`, `Heartbeat`, `Usage`, and `Operation` [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). You can verify if a record is billable by checking the `_IsBillable` column [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs).

The billable data size is typically smaller than the incoming JSON payload. On average, the billed size is around 25 percent less than the incoming data size, and up to 50 percent for small events [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). This reduction comes from the excluded standard columns and compression. When estimating costs, use the billed size, not the raw payload size.

## Align retention with business needs

Retention is the second major cost driver. You can set the retention period for the entire workspace or for individual tables [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). Data is retained in two states: interactive and long-term [Log Analytics workspace overview](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview).

During the interactive retention period, data is available for queries, visualizations, and alerts [Log Analytics workspace overview](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview). This is the "hot" data. After the interactive period expires, data moves to long-term retention if configured [Log Analytics workspace overview](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview). Long-term retention offers a reduced charge for storage, but retrieving data requires a search job, which incurs a query cost based on the GB scanned [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs).

To control costs, review the retention period for each table. If a table contains data that is rarely queried but must be kept for compliance, consider reducing its interactive retention and enabling long-term retention [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). Deleting a custom table does not remove data associated with it, so retention charges continue to apply until the retention period expires [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). To stop retention charges, you must explicitly reduce the retention period to zero or purge the data, not just delete the table object.

## Apply table plans to reduce ingestion costs

Table plans allow you to configure specific tables to use Basic or Auxiliary pricing [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). Basic and Auxiliary tables have a significantly reduced ingestion charge [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). However, there is a charge to query data in these tables, based on the GB of data scanned [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs).

This model is suitable for tables with high ingestion volume but low query frequency. For example, detailed diagnostic logs or telemetry data that is primarily used for occasional audits rather than real-time monitoring [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs).

To apply a table plan at scale, use Azure Policy or ARM/Bicep templates to enforce table plan settings across your workspaces. The `manage-logs-tables` documentation provides the specific API and CLI commands for managing table plans programmatically [Log Analytics workspace overview](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview). Avoid relying solely on manual portal changes, as these are prone to inconsistency across large estates.

Be cautious when applying Basic or Auxiliary plans to tables that are frequently queried. The query costs can outweigh the ingestion savings if the data is scanned often [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs).

## Use commitment tiers for predictable volume

If your ingestion volume is consistent and exceeds 100 GB per day, a commitment tier can offer lower per-GB rates compared to pay-as-you-go pricing [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). Commitment tiers have a 31-day commitment period [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs).

During the commitment period, you can increase the tier level, but you cannot decrease it or return to pay-as-you-go until the period ends [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). If you move to a higher tier, the 31-day period restarts [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). Overages are billed at the same commitment tier rate, and unused capacity is paid for, making commitment tiers unsuitable for highly variable loads [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs).

Use the **Usage and estimated costs** view to compare your current usage against available commitment tiers [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). If your usage fluctuates significantly, pay-as-you-go might be more appropriate to avoid paying for unused commitment capacity [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs).

## Verify your cost optimisation

After making changes, verify the impact. Use the **Usage and estimated costs** view to monitor ingestion trends [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). Check the `_IsBillable` column in your queries to confirm which data is being charged [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs).

Review the retention settings for each table to ensure they align with your business requirements [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs). If you have enabled long-term retention, test a search job to understand the retrieval cost [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs).

Cost management is an ongoing process. Regularly review your ingestion patterns, retention periods, and table plans to ensure they remain optimal as your monitoring needs evolve [Azure Monitor Logs cost calculations and options](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs).
