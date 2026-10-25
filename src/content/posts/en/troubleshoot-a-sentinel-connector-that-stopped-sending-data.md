---
title: "Troubleshoot a Sentinel connector that stopped sending data"
description: "Troubleshoot a Microsoft Sentinel data connector that has stopped sending data using health monitoring."
pubDate: 2024-08-11
category: governance
tags: []
translationKey: troubleshoot-a-sentinel-connector-that-stopped-sending-data
draft: false
---

A data connector has stopped sending data. The first thing to check is not the connector's configuration, but whether Microsoft Sentinel has recorded the failure. If the health monitoring feature is enabled, the service logs these events explicitly; if it is not, you are relying on missing log volume, which is less precise.

## Verify that health monitoring is enabled

Microsoft Sentinel stores connector health events in the *SentinelHealth* data table. This table is only populated if you have turned on the health monitoring feature for your workspace [Auditing and health monitoring in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/health-audit).

If you have not enabled this feature, the *SentinelHealth* table will not exist or will not contain the relevant events. You must enable health monitoring before you can query it [Auditing and health monitoring in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/health-audit).

## Check the SentinelHealth table for failure events

Once health monitoring is confirmed as enabled, query the *SentinelHealth* table to see if the connector has reported a status change. The table records events when a connector's status changes from success to failure, or vice versa [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

Run the following query in the Microsoft Sentinel **Logs** blade to find the most recent failure events for all connectors in the workspace:

```kusto
SentinelHealth
| where TimeGenerated > ago(3d)
| where OperationName == 'Data fetch status change'
| where Status == 'Failure'
| summarize TimeGenerated = arg_max(TimeGenerated, *) by SentinelResourceName, SentinelResourceId
| project TimeGenerated, SentinelResourceName, SentinelResourceId, ExtendedProperties
```

This query returns the time of the last failure, the connector name, and the *ExtendedProperties* column, which often contains the specific error message or reason for the failure [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

If the query returns no results, the connector may not be supported by the *SentinelHealth* table. At the time of writing, the table supports only specific connectors: Amazon Web Services (CloudTrail and S3), Dynamics 365, Office 365, Microsoft Defender for Endpoint, Threat Intelligence - TAXII, and Threat Intelligence Platforms [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health). If your connector is not in this list, you must use alternative methods to diagnose the issue.

## Use the Data collection health monitoring workbook

For a visual overview, or if your connector is not supported by the *SentinelHealth* table, use the **Data collection health monitoring** workbook. This workbook provides a dashboard of ingestion status, anomalies, and agent health [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

1. In the Microsoft Sentinel portal, go to **Content hub** and search for **health** [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).
2. Select **Data collection health monitoring** and click **Install** [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).
3. Navigate to **Workbooks** under **Threat management**, select the **Templates** tab, and open the **Data collection health monitoring** workbook [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).
4. Select your subscription and workspace, and choose a **TimeRange** to view recent data [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

The **Overview** tab shows general ingestion volume and the last time logs were received [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health). The **Data collection anomalies** tab uses the `series_decompose_anomalies()` function to detect unusual drops in data volume [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health). If you see a significant drop in volume for the table associated with your connector, it confirms that data ingestion has stopped or slowed.

## Investigate the failure reason

If the *SentinelHealth* table shows a failure, the *ExtendedProperties* column usually contains the error details [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health). For example, an Office 365 connector might report a permission issue, while an AWS connector might report a bucket access error.

If the workbook shows a volume anomaly but no specific error, check the connector's configuration in the Microsoft Sentinel portal. Ensure that the connection details (such as subscription IDs, tenant IDs, or API keys) are still valid and have not expired.

For connectors that rely on agents (such as some on-premises sources), check the **Agent info** tab in the workbook. This tab shows the heartbeat status and latency of Log Analytics agents on your machines [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health). If the agent is offline or reporting high latency, the connector may fail to send data even if its configuration is correct.

## Set up alerts for future failures

To avoid manual checks in the future, configure an Azure Monitor alert rule based on the *SentinelHealth* table. This allows you to be notified immediately when a connector fails [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

1. Create a new **Azure Monitor alert rule** with the Microsoft Sentinel workspace as the scope [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).
2. Use a **Custom log search** condition [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).
3. Use a query similar to the one above to detect status changes to 'Failure' [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).
4. Configure an action group to send notifications via email, SMS, or trigger a Logic App [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

This proactive approach ensures that you are aware of data ingestion issues as soon as they occur, rather than discovering them during an incident investigation.

## Verify the fix

After correcting the configuration or resolving the underlying issue, verify that the connector has resumed sending data. Run the *SentinelHealth* query again and look for a new event with `Status == 'Success'` [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health). Alternatively, check the **Data collection health monitoring** workbook to confirm that the volume anomaly has resolved and data is flowing normally [Monitor the health of your Microsoft Sentinel data connectors](https://learn.microsoft.com/en-us/azure/sentinel/monitor-data-connector-health).

If the connector is still not sending data after your changes, check the *ExtendedProperties* column again for new error messages. Persistent failures may indicate a deeper issue with the source service or a change in the connector's API requirements.

tags: [microsoft-sentinel, data-connectors, troubleshooting, health-monitoring, azure-monitor]
diagram: {title:
