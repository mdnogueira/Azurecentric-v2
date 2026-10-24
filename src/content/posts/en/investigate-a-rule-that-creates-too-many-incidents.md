---
title: "Investigate a rule that creates too many incidents"
description: "Reduce Sentinel incident volume by checking rule insights, applying tuning exclusions, and verifying with simulation and reruns."
pubDate: 2025-09-09
category: governance
tags: ["microsoft-sentinel", "analytics-rules", "incident-management", "troubleshooting", "tuning"]
translationKey: investigate-a-rule-that-creates-too-many-incidents
draft: true
---

You have an analytics rule generating too many incidents. The immediate problem is alert fatigue; the underlying problem is usually a query that is too broad, a grouping strategy that creates one incident per event, or entities that are consistently triggering false positives. Microsoft Sentinel provides specific tools to diagnose the volume and apply targeted fixes without guessing. The first step is to look at the rule's built-in insights to understand the pattern, then use the tuning recommendations to narrow the scope, and finally verify the change using the rule's simulation feature. It is important to distinguish between the execution insights that show historical performance and the tuning insights that suggest logical changes. You cannot replay a modified rule to test its new logic; you must save it and observe the live results or rely on the simulation. The first thing to check is whether the rule is consuming excessive resources, as Sentinel may disable it automatically if the query is poorly built. If the rule is still running, you can proceed with the tuning steps. The second thing to check is the event grouping setting. If your rule is set to trigger an alert for each event, every single matching log entry creates a new incident. This can quickly overwhelm your workspace and your team. Changing the grouping to group events into a single incident or group events by a specific entity can significantly reduce the number of incidents. This setting aggregates related alerts into a single incident, making it easier to investigate and manage. When you change the grouping setting, you should also review the results simulation in the rule wizard. This simulation shows you how many alerts the rule would generate with the new settings. Use this to estimate the impact before saving the rule. The third thing to check is the entities driving the false positives. Microsoft Sentinel can recommend exclusions based on your incident responses. To access these recommendations, select the rule from the Analytics page and click Edit to open the rule wizard. Navigate to the Set rule logic tab and scroll below the Results simulation display to the Tuning insights section. The tuning insights display consists of several panes. The first pane shows statistical information, such as the average number of alerts per incident. If this number is high, it suggests that the event grouping settings need adjustment. The second pane lists recommended entities to exclude. These are entities that frequently appear in false positive incidents. To apply a recommendation, select the plus sign next to the entity you want to exclude. This adds a condition to your query to filter out that entity in future executions. For example, if a specific internal IP address is consistently triggering alerts but is known to be benign, excluding it reduces noise without changing the core detection logic. The third pane shows the four most frequently appearing mapped entities across all alerts. This helps you identify entities that are hogging the spotlight. You might decide to handle these entities separately in a different rule or exclude them if they are noise. After you have applied exclusions or adjusted grouping, you need to verify that the changes reduce the incident volume without missing real threats. Microsoft Sentinel allows you to manually rerun analytics rules on specific time windows. This capability lets you replay previous executions on historical data. To rerun a rule, select Rule runs from the toolbar, choose the rule runs you want to replay based on the time window, and click Replay run. The system will queue the rerun and display the progress. You can refresh the view to see the status. Once the rerun is complete, you can review the new alerts and incidents to ensure the volume has decreased and the remaining alerts are relevant. This verification step is crucial. It allows you to test rule modifications in a controlled manner before they affect live monitoring. If the rerun shows that the rule is still generating too many incidents, you may need to refine the query further or adjust the time range. The next action is to monitor the rule's performance over the next few days to ensure the tuning has held and no new false positives have emerged. If the rule is still generating too many incidents, you may need to refine the query further or adjust the time range.

## Check the rule insights to understand the volume

[![Sentinel Rule Tuning Flow](/images/posts/2025/azc-221-checkpoints.svg)](/images/posts/2025/azc-221-checkpoints.svg)

Before changing the query, you need to know why the rule is firing so often. Microsoft Sentinel includes an **Insights** tab on the **Analytics** page that shows execution history and classification data. This feature is in preview and requires health and audit monitoring to be enabled for your workspace.

1. Open **Microsoft Sentinel** in the Azure portal.
2. Select **Analytics** from the navigation menu.
3. Click on the rule that is generating excessive incidents.
4. Select the **Insights** tab in the details pane.

The insights panel displays several key metrics. The **Alert graph** shows the number of alerts generated over time, helping you spot spikes. The **Incident classification** summary shows how many closed incidents were marked as true or false positives. If you see a high number of false positives, the rule is likely matching benign activity.

The **Failed executions** and **Top health issues** sections help you determine if the volume is a result of query errors or resource drains. If the rule is consuming excessive computing resources, Sentinel may eventually disable it automatically, but that is a failure state, not a tuning strategy. You want to fix the query before it hits that threshold.

## Use tuning insights to exclude false positive entities

If the insights show that specific entities are driving the false positives, Microsoft Sentinel can recommend exclusions. This feature uses machine learning to analyse your incident responses and suggests entities that are highly correlated with incidents you have closed as false positives.

To access these recommendations:

1. From the **Analytics** page, select the rule.
2. Click **Edit** to open the rule wizard.
3. Navigate to the **Set rule logic** tab.
4. Scroll below the **Results simulation** display to the **Tuning insights** section.

The tuning insights display consists of several panes. The first pane shows statistical information, such as the average number of alerts per incident. If this number is high, it suggests that the event grouping settings need adjustment. The second pane lists recommended entities to exclude. These are entities that frequently appear in false positive incidents.

To apply a recommendation, select the plus sign next to the entity you want to exclude. This adds a condition to your query to filter out that entity in future executions. For example, if a specific internal IP address is consistently triggering alerts but is known to be benign, excluding it reduces noise without changing the core detection logic.

The third pane shows the four most frequently appearing mapped entities across all alerts. This helps you identify entities that are "hogging the spotlight." You might decide to handle these entities separately in a different rule or exclude them if they are noise.

## Adjust event grouping to reduce incident count

A common cause of high incident volume is the event grouping setting. If your rule is set to **Trigger an alert for each event**, every single matching log entry creates a new incident. This can quickly overwhelm your workspace and your team.

Changing the grouping to **Group events into a single incident** or **Group events by a specific entity** can significantly reduce the number of incidents. This setting aggregates related alerts into a single incident, making it easier to investigate and manage.

When you change the grouping setting, you should also review the **Results simulation** in the rule wizard. This simulation shows you how many alerts the rule would generate with the new settings. Use this to estimate the impact before saving the rule.

## Verify changes with manual reruns

After you have applied exclusions or adjusted grouping, you need to verify that the changes reduce the incident volume without missing real threats. Microsoft Sentinel allows you to manually rerun analytics rules on specific time windows. This capability is in preview and lets you replay previous executions on historical data.

To rerun a rule:

1. From the **Analytics** page, select **Rule runs (Preview)** from the toolbar.
2. Select the rule runs you want to replay, based on the time window in which they originally ran.
3. Click **Replay run**.

The system will queue the rerun and display the progress. You can refresh the view to see the status. Once the rerun is complete, you can review the new alerts and incidents to ensure the volume has decreased and the remaining alerts are relevant.

This verification step is crucial. It allows you to test rule modifications in a controlled manner before they affect live monitoring. If the rerun shows that the rule is still generating too many incidents, you may need to refine the query further or adjust the time range.


Reference: [Get fine-tuning recommendations for your analytics rules in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/detection-tuning).
