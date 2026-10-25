---
title: "Investigate an alert that repeatedly closes and reopens"
description: "Investigate why an Azure Monitor alert instance appears to close and reopen by distinguishing between manual status changes, automatic resolution settings, and repeated firings."
pubDate: 2025-06-15
category: governance
tags: ["azure-monitor", "alerts", "troubleshooting", "log-alerts", "incident-management"]
translationKey: investigate-an-alert-that-repeatedly-closes-and-reopens
draft: false
---

An alert that seems to close and reopen is a common source of confusion. It often looks like a system bug, but it is usually a result of how Azure Monitor handles alert state, manual user responses, or specific configuration settings. The first thing to do is determine whether you are looking at a single alert instance changing status, or multiple distinct alert instances firing in sequence.

## Distinguish between instance status changes and repeated firings

Navigate to **Monitor** > **Alerts** in the Azure portal. The **Alerts** page summarises all alert instances generated in the last 30 days [Manage your alert instances](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-manage-alert-instances). Filter the list by the specific alert rule and the relevant time range.

If the list shows multiple rows with different timestamps and alert instance IDs, the alert rule is firing repeatedly. Each row represents a distinct firing event. This is often the result of the underlying condition fluctuating around the threshold, or latency causing the same event to be evaluated multiple times.

If the list shows a single row that changes status, the issue lies in how the alert instance is being managed. Select the alert to open the **Alert details** page. Here, you can see the **User response** history. The status can be **New**, **Acknowledged**, or **Closed** [Manage your alert instances](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-manage-alert-instances). If the status flips between these states without new firings, someone or something is manually changing the response. Azure Monitor does not automatically close alert instances when the underlying condition resolves; stateful alerts persist until manually closed or until the 30-day retention period expires [Manage your alert instances](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-manage-alert-instances).

## Check for automatic resolution settings

A frequent cause of perceived "closing and reopening" is the interaction between the **Automatically resolve alerts** setting and data volatility. This setting is available for log search alerts [Troubleshoot log alerts in Azure Monitor | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-troubleshoot-log).

When **Automatically resolve alerts** is enabled, the alert instance is resolved after a specified period of inactivity where the condition is not met. If the underlying data fluctuates around the threshold, the alert may resolve, and then fire again as the condition reoccurs. This is not a bug but a reflection of the data's volatility and the configuration choice. Review the advanced options of the log search alert rule to confirm whether this setting is active [Troubleshoot log alerts in Azure Monitor | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-troubleshoot-log).

## Investigate suppression rules

Alert processing rules can suppress actions for specific time windows. If an alert processing rule is configured to suppress actions, the alert may fire, get suppressed, and then fire again once the suppression window expires. Check the **History** tab on the alert details page to see if any action groups were suppressed [Troubleshooting Azure Monitor alerts and notifications](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-troubleshoot). If the suppression was unintentional, you can modify, disable, or delete the alert processing rule.

## Verify query stability and latency

If the alert rule is firing repeatedly, the query itself may be unstable. Log search alerts evaluate resources logs every set frequency. If the query fails intermittently, Azure Monitor may disable the rule after a week of consistent failures, but before that, it might produce erratic results [Troubleshoot log alerts in Azure Monitor | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-troubleshoot-log). Check the **Resource health** of the alert rule to see if it is in a degraded or unavailable state [Troubleshoot log alerts in Azure Monitor | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-troubleshoot-log).

Ingestion latency can also cause alerts to fire out of order or repeatedly. Azure Monitor processes logs globally, and latency can exceed 4 minutes. If your alert condition is sensitive to time windows, latency can cause the same event to be evaluated multiple times as late-arriving logs shift the data points. If you are experiencing many misfires, consider using metric alerts instead, which are less susceptible to log latency [Troubleshoot log alerts in Azure Monitor | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-troubleshoot-log).

## Verify permissions and rule health

Ensure the alert rule has the necessary permissions to read the target logs. If the rule uses a system-assigned managed identity, it is created without permissions. You must assign the appropriate roles, such as Reader for Log Analytics workspaces, for the identity to access the data [Troubleshoot log alerts in Azure Monitor | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-troubleshoot-log). If permissions are missing, the query may fail intermittently, leading to inconsistent alert firing.

Finally, check if the alert rule was disabled by the system. If a query fails consistently for a week, Azure Monitor disables it automatically. Review the Activity log for events with the operation name `Microsoft.Insights/ScheduledQueryRules/disable/action` to confirm if the rule was disabled and when it was re-enabled [Troubleshoot log alerts in Azure Monitor | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-troubleshoot-log).

By systematically checking the alert instance history, suppression rules, query health, and permissions, you can identify whether the repeated closing and reopening is a result of data volatility, configuration settings, or system-level issues. Start with the **Alerts** page to confirm the pattern, then drill down into the rule configuration and resource health for deeper insights.
