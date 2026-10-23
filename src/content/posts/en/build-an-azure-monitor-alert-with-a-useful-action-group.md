---
title: "Build an Azure Monitor alert with a useful action group"
description: "Create an actionable Azure Monitor metric alert, test its notification route, and verify the alert condition separately from the action group."
pubDate: 2024-01-30
category: governance
tags: [azure-monitor, action-groups, metric-alerts, monitoring]
translationKey: build-an-azure-monitor-alert-with-a-useful-action-group
draft: true
---

An alert needs an owner, a condition that means something and a working route to the person who should respond. Creating a rule without those decisions can produce a notification that reaches a mailbox but leaves everyone unsure what to do.

For an illustrative example, use an Azure VM metric alert that notifies an operations email address when average CPU remains above an agreed threshold. The values below are examples, not a recommendation to alert on every busy VM.

Microsoft documents [action groups](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/action-groups) separately from [metric alert rules](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-create-metric-alert-rule). That is a useful distinction: one defines the response route, while the other evaluates a signal.

## Decide what the recipient should do

Before opening the portal, write a short response expectation. Which VM is in scope? Why would sustained CPU use require attention? Where should the operator look next?

A batch-processing server may be expected to use its CPU fully during a job. An application server showing the same metric might need investigation if request latency also rises. A metric threshold without that context is a weak basis for waking someone.

Record the owner, the notification destination and a link to the relevant operational procedure. Confirm the permissions needed to create the alert rule and action group at their intended scopes. Access to view the VM alone does not establish those permissions.

## Create and test the action group

In the Azure portal, open **Monitor → Alerts → Action groups** and create an action group in the chosen subscription and resource group.

Give it a name that describes its purpose, such as `ag-azc-lab-operations`, and a recognisable display name. Add an email notification addressed to the agreed operations destination. For a pilot, choose recipients who expect the test messages.

Keep the first version simple. Automated remediation and custom webhooks introduce further authentication, payload and failure-handling decisions. Establish the basic notification route before adding those dependencies.

Use **Test action group** to send a sample notification. Confirm that it arrives, that the sender is not being filtered and that the recipient recognises the resource context. This checks notification delivery; it does not prove that your metric rule evaluates the right VM or threshold.

Check the applicable alert and notification pricing when choosing the signal and channels. A lab configuration should not become an unexplained operational cost.

## Create the metric rule

Open the VM's metric or alert experience and create a metric alert rule. Check that the scope identifies the intended resource.

Select **Percentage CPU** as the example signal. An illustrative starting configuration is an average above 80% over a 15-minute window, evaluated every five minutes. Choose settings that fit the actual response requirement rather than copying these values into production unchanged.

| Setting | What to confirm |
|---|---|
| Scope | The correct VM or supported resource scope |
| Signal | The metric that answers the operational question |
| Aggregation and window | Whether a sustained condition or a short spike matters |
| Evaluation frequency | How often the rule should check |
| Action group | The tested notification destination |
| Severity | The priority expected by the response process |

Attach the action group and give the rule a useful name and description. Include the reason for the condition and what the recipient should check. Review whether the rule should resolve automatically when its condition clears, using the supported stateful alert settings.

## Verify the rule and the notification together

Inspect the metric chart over the intended time range to confirm that the selected aggregation and threshold describe the behaviour you meant to detect. Then inspect the rule's scope, condition and action-group association.

If a controlled test is appropriate, perform it in a lab or approved test window. Verify both the alert instance in Azure Monitor and the resulting notification. Do not generate disruptive load on a production VM solely to prove that an email can arrive.

If an alert instance appears without a notification, investigate the action-group association and delivery route. If no instance appears, return to the signal, scope, evaluation settings and observed metric. Those are different failure paths.

Remove the lab rule and action group when they are no longer required, after checking that no other rule uses the group. For an ongoing alert, record the owner and review its usefulness after the team has seen representative activity.
