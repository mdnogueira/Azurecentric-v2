---
title: "Review connector health and ingestion changes together"
description: "Monitor Microsoft Sentinel data connectors by combining the SentinelHealth table with the Data collection health workbook to detect ingestion drifts and configure alerts."
pubDate: 2026-08-01
category: governance
tags: ["microsoft-sentinel", "data-connectors", "health-monitoring", "kql", "workbooks"]
translationKey: review-connector-health-and-ingestion-changes-together
draft: false
---

You notice a gap in your security telemetry and the first question is not whether the connector is broken, but whether the ingestion has drifted from its expected baseline. Microsoft Sentinel provides two complementary ways to answer that question: the *SentinelHealth* data table for automated detection and the **Data collection health monitoring** workbook for visual context.

Using both together prevents you from reacting to transient errors while ensuring you do not miss sustained failures. The health table records status changes and hourly summaries, while the workbook aggregates volume, EPS rates and anomalies. You need to enable the health feature, install the workbook, and then build a query that distinguishes between a temporary blip and a connector that needs intervention.

[![Sentinel Health Monitoring Flow](/images/posts/2026/azc-337-checkpoints.svg)](/images/posts/2026/azc-337-checkpoints.svg)

## Enable health monitoring and understand the data

Health monitoring for Microsoft Sentinel is not enabled by default. You must turn it on in the Microsoft Sentinel settings to start collecting events in the *SentinelHealth* table [Auditing and health monitoring in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/health-audit). Once enabled, the table captures events for specific connectors, including AWS CloudTrail and S3, Dynamics 365, Office 365, Microsoft Defender for Endpoint, and TAXII or TIP threat intelligence connectors [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

The table logs two primary event types: **Data fetch status change** and **Failure summary** [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health). A status change event is logged immediately when a connector moves from success to failure or vice versa. If the status remains stable, the system logs an event once per hour to prevent redundant auditing. Transient errors, such as source service throttling, are logged only after they persist for more than 60 minutes, allowing the backend to catch up without immediate user action [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

The *SentinelHealth* table is not billable, so you can query it without worrying about ingestion costs [Auditing and health monitoring in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/health-audit). However, you should use the pre-built functions `_SentinelHealth()` and `_SentinelAudit()` rather than querying the table directly, as these functions ensure backward compatibility if the schema changes [Auditing and health monitoring in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/health-audit).

## Install the health monitoring workbook

The workbook provides a visual layer that complements the raw data in the health table. It helps you understand the general ingestion status, detect anomalies in data collection, and monitor agent health on your machines [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

1. In Microsoft Sentinel, navigate to **Threat management** > **Workbooks**.
2. Select the **Templates** tab and search for **Data collection health monitoring**.
3. Select the template and choose **Save** to create an editable copy, or **View template** to inspect it without modifying it [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

The workbook contains three main sections:

- **Overview**: Shows general ingestion volume, EPS rates, and the time of the last log received for the selected workspace [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).
- **Data collection anomalies**: Uses the `series_decompose_anomalies()` function to detect deviations in data collection per table or data source. You can adjust the `PositiveAlertThreshold` and `NegativeAlertThreshold` to tune sensitivity [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).
- **Agent info**: Displays health metrics for Azure Arc-managed and non-Azure machines, including heartbeat status, latency, and resource usage [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

When you save the workbook, it is stored as an Azure resource in the Microsoft Sentinel workspace's resource group. You can assign RBAC permissions to control who can view or edit it [Visualize your data using workbooks in Microsoft Sentinel | Microsoft Docs](https://learn.microsoft.com/en-us/azure/sentinel/monitor-your-data).

## Detect health drifts with KQL

While the workbook gives you a quick visual check, automated detection requires queries on the *SentinelHealth* table. You can use these queries to identify the latest failure events or detect state transitions, such as a connector recovering from a failure.

To find the most recent failure for each connector, you can use the following illustrative example:

```kusto
_SentinelHealth()
| where TimeGenerated > ago(3d)
| where OperationName == 'Data fetch status change'
| where Status == 'Failure'
| summarize TimeGenerated = arg_max(TimeGenerated, *) by SentinelResourceName, SentinelResourceId
```

This query filters for failure events in the last three days and returns the latest status for each connector. If you need to detect a transition from failure to success, you can join the latest status with the previous status:

```kusto
let latestStatus = _SentinelHealth()
| where TimeGenerated > ago(12h)
| where OperationName == 'Data fetch status change'
| where Status in ('Success', 'Failure')
| project TimeGenerated, SentinelResourceName, SentinelResourceId, LastStatus = Status
| summarize TimeGenerated = arg_max(TimeGenerated, *) by SentinelResourceName, SentinelResourceId;

let nextToLatestStatus = _SentinelHealth()
| where TimeGenerated > ago(12h)
| where OperationName == 'Data fetch status change'
| where Status in ('Success', 'Failure')
| join kind = leftanti (latestStatus) on SentinelResourceName, SentinelResourceId, TimeGenerated
| project TimeGenerated, SentinelResourceName, SentinelResourceId, NextToLastStatus = Status
| summarize TimeGenerated = arg_max(TimeGenerated, *) by SentinelResourceName, SentinelResourceId;

latestStatus
| join kind=inner (nextToLatestStatus) on SentinelResourceName, SentinelResourceId
| where NextToLastStatus == 'Failure' and LastStatus == 'Success'
```

This example identifies connectors that were failing and have now recovered. You can adapt the logic to detect the opposite transition (success to failure) by swapping the status conditions [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

## Configure alerts for immediate action

The workbook and manual queries are useful for investigation, but you need automated alerts for immediate response. Microsoft Sentinel analytics rules are not the recommended tool for this; instead, use Azure Monitor alert rules with custom log search [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

1. Create an Azure Monitor alert rule scoped to your Microsoft Sentinel workspace.
2. Set the condition to **Custom log search** and paste your health drift query.
3. Configure the frequency and lookback duration to match your tolerance for transient errors. For example, if you want to avoid alerts on 60-minute transient throttling, set the lookback to at least 61 minutes [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).
4. Add an action group to send notifications or trigger automated remediation, such as a Logic App [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

By combining the workbook's visual anomaly detection with the health table's precise status logging, you can distinguish between temporary issues and genuine ingestion failures. Verify your setup by checking the workbook's anomaly tab and confirming that your alert rule triggers on a simulated failure event.

## Review questions

- Which connectors are supported by the *SentinelHealth* table, and how does that limit the scope of your monitoring? [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health)
- How does the 60-minute threshold for transient errors affect the timing of your alert rules? [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health)
- What are the RBAC requirements for managing workbook resources in the Sentinel workspace? [Visualize your data using workbooks in Microsoft Sentinel | Microsoft Docs](https://learn.microsoft.com/en-us/azure/sentinel/monitor-your-data)
- Why is it recommended to use Azure Monitor alert rules rather than Sentinel analytics rules for health monitoring? [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health)
