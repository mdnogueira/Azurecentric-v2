---
title: "Use resource health information during an incident"
description: "Configure high-signal Resource Health alerts via portal or ARM template to detect platform incidents and verify resolution in the activity log."
pubDate: 2025-10-02
category: governance
tags: ["resource-health", "azure-monitor", "activity-log", "arm-templates", "incident-response"]
translationKey: use-resource-health-information-during-an-incident
draft: false
---

When a resource becomes unavailable, the first question is whether the issue lies in your configuration or in the Azure platform. Resource Health provides the platform-side context, but relying on manual checks during an incident is slow and error-prone. You need automated alerts that distinguish between a platform-initiated outage and a user-caused change, and that confirm when the issue is resolved.

Resource Health notifications are stored in the Azure activity log. This means you can use the same alerting infrastructure you already have for other subscription-level events. The key is to configure the alert conditions carefully. A broad alert on the `ResourceHealth` category will fire for every status change, including transient states or informational updates, which creates noise. You need to filter for the specific statuses and causes that matter during an incident.

## Set up a high-signal Resource Health alert

The most effective way to use Resource Health during an incident is to set up an alert that triggers on `Active` or `In Progress` statuses for `Unavailable` or `Degraded` events. Filtering for `PlatformInitiated` causes helps distinguish platform outages from user changes, though other causes exist and may require investigation.

You can create this alert using the Azure portal or an Azure Resource Manager (ARM) template. The portal approach is straightforward for a single subscription.

1. Open the Azure portal and navigate to **Service Health**.
2. Select **Resource Health** from the left-hand menu.
3. Click **Add resource health alert**.
4. In the **Conditions** tab, configure the following:
   - **Category**: `ResourceHealth`
   - **Status**: `Active` or `In Progress`
   - **Health Status**: `Unavailable` or `Degraded`
   - **Cause**: `PlatformInitiated` (optional, but recommended to reduce noise)
5. Select an **Action Group** to receive the notification (email, SMS, or webhook).

For a more robust, scalable approach, or to deploy across multiple subscriptions, use an ARM template. The template below creates an activity log alert that maximizes the signal-to-noise ratio by explicitly checking the `currentHealthStatus`, `previousHealthStatus`, and `cause` properties. It also handles the `Resolved` status if you want to know when the platform has fixed the issue.

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "activityLogAlertName": {
      "type": "string",
      "metadata": {
        "description": "Unique name (within the Resource Group) for the Activity log alert."
      }
    },
    "actionGroupResourceId": {
      "type": "string",
      "metadata": {
        "description": "Resource Id for the Action group."
      }
    }
  },
  "resources": [
    {
      "type": "Microsoft.Insights/activityLogAlerts",
      "apiVersion": "2017-04-01",
      "name": "[parameters('activityLogAlertName')]",
      "location": "Global",
      "properties": {
        "enabled": true,
        "scopes": [
          "[subscription().id]"
        ],
        "condition": {
          "allOf": [
            {
              "field": "category",
              "equals": "ResourceHealth"
            },
            {
              "anyOf": [
                {
                  "field": "properties.currentHealthStatus",
                  "equals": "Unavailable"
                },
                {
                  "field": "properties.currentHealthStatus",
                  "equals": "Degraded"
                }
              ]
            },
            {
              "field": "properties.cause",
              "equals": "PlatformInitiated"
            },
            {
              "anyOf": [
                {
                  "field": "status",
                  "equals": "Active"
                },
                {
                  "field": "status",
                  "equals": "In Progress"
                }
              ]
            }
          ]
        },
        "actions": {
          "actionsGroups": [
            {
              "actionGroupId": "[parameters('actionGroupResourceId')]"
            }
          ]
        }
      }
    }
  ]
}
```

This template is an illustrative example. It targets the subscription scope and requires an existing action group. Adjust the `scopes` array if you need to limit the alert to specific resource groups or resources. Note that the `cause` field can be `null` in some events, so if you want to catch all platform-related issues regardless of the cause field's value, you may need to adjust the condition. However, filtering for `PlatformInitiated` is a reliable way to avoid false positives from user actions.

## Verify the alert and check the activity log

Once the alert is deployed, you can verify its configuration by checking the activity log. Resource Health events are stored in the activity log, which retains entries for 90 days. You can view these events directly in the portal or export them to a Log Analytics workspace for deeper analysis.

To view recent Resource Health events:

1. Navigate to **Monitor** > **Activity log** in the Azure portal.
2. Filter by **Category** `ResourceHealth`.
3. Look for events with `Status` `Active` or `In Progress` and `Health Status` `Unavailable` or `Degraded`.

The activity log provides detailed information about each event, including the `currentHealthStatus`, `previousHealthStatus`, and `cause`. This information is crucial for triaging the incident. If the `cause` is `PlatformInitiated`, you can be confident that the issue is on Azure's side. If it is `UserInitiated`, you need to investigate your own changes.

You can also use the **Change history** feature for some events to see what changes happened to the resource around the time of the event. This can help you determine if a recent deployment or configuration change triggered the health status change.

:::image type="content" source="/images/posts/2025/azc-229-learn-1.png" lightbox="/images/posts/2025/azc-229-learn-1.png" alt-text="Screenshot that shows the activity log." border="false":::

## Handle the resolution

When the platform resolves the issue, Resource Health will generate a `Resolved` event. You can configure a separate alert for this status to notify your team that the incident is over. This helps close the loop and confirms that the platform has restored service.

To add a resolution alert, you can modify the ARM template or create a new alert in the portal with the following conditions:
- **Category**: `ResourceHealth`
- **Status**: `Resolved`
- **Health Status**: `Unavailable` or `Degraded`
- **Cause**: `PlatformInitiated`

This ensures you are notified when the platform has fixed the issue, allowing you to stop investigating and return to normal operations.

## Limitations and considerations

Resource Health alerts can be configured at the subscription, resource group, or resource level. They provide status notifications, not real-time telemetry. If you need detailed diagnostic information, you should also configure diagnostic settings for your resources to send logs to a Log Analytics workspace or storage account. Resource Health complements these logs by providing the platform context.

Additionally, Resource Health events are not guaranteed to be instantaneous. There may be a delay between the platform incident and the alert firing. Use this information as a starting point for your investigation, but also correlate with other monitoring data to get a complete picture.

Finally, remember that Resource Health covers a wide range of Azure services. Not all resources or services are covered by every health check. Refer to the [Resource types and health checks available through Azure Resource Health](https://learn.microsoft.com/en-us/azure/service-health/resource-health-checks-resource-types) documentation to see which services and checks are supported.

References for Use resource health information during an incident: [Resource Manager template samples for resource health alerts](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/resource-manager-alerts-resource-health), [Create Resource Health Alerts using Azure portal](https://learn.microsoft.com/en-us/azure/service-health/resource-health-alert-monitor-guide), [Azure activity log and activity log insights](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/activity-log-insights).
