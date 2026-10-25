---
title: "Connect Windows security events using Azure Monitor Agent"
description: "Use the Windows Security Events via AMA connector to scope collection rules, select events and verify recent SecurityEvent records in Microsoft Sentinel."
pubDate: 2024-02-27
category: governance
tags: [microsoft-sentinel, azure-monitor-agent, windows-security, data-collection-rules]
translationKey: connect-windows-security-events-using-azure-monitor-agent
draft: false
---

Windows security event collection needs three things to agree: the server must produce the events, the agent must collect them, and the intended Sentinel workspace must receive them. An installed agent alone does not establish that a detection has the records it needs.

For this walkthrough, use the **Windows Security Events via AMA** connector in Microsoft Sentinel. Its documented destination is the `SecurityEvent` table. Start with a small group of Windows servers whose audit configuration and owners are known, then expand after verifying the collection path.

[![Windows security event collection checkpoints](/images/posts/2024/azc-021-checkpoints.svg)](/images/posts/2024/azc-021-checkpoints.svg)

## Confirm the workspace and server prerequisites

Use a Log Analytics workspace with Microsoft Sentinel enabled. Microsoft's [Windows agent-based connector guidance](https://learn.microsoft.com/en-us/azure/sentinel/connect-services-windows-based) requires read and write permissions on the Sentinel workspace and directs you to the connector's additional prerequisites.

Check those requirements for the resources you intend to change, including agent deployment and data collection rule creation. Do not assume that permission to query logs also permits installing an extension on a VM.

For servers outside Azure, complete Azure Arc onboarding before enabling this agent-based connector. Verify that the machine is visible as the intended Arc-enabled server and that the collection path can use the required Azure Monitor connectivity.

The Windows audit configuration also matters. Collection cannot recover an event that Windows never generated. Agree the relevant audit settings and required event IDs with the detection owner before choosing a filter.

## Open the connector and scope the rule

Install the related Windows security events solution from Sentinel's **Content hub** if it is not already available. Open **Data connectors**, select **Windows Security Events via AMA**, then select **Open connector page**.

Review the connector's instructions and prerequisites. Under its configuration area, choose the action to add a data collection rule. In the wizard:

1. Give the rule a meaningful name that identifies its purpose and scope.
2. Select the subscription and resource group where the DCR will be created.
3. On **Resources**, add the intended Azure VMs or Arc-enabled servers.
4. Review the selected machines before applying the scope.
5. On **Collect**, choose the event set or supported custom filters.
6. Review the configuration and create the rule after validation succeeds.

The documented workflow installs AMA on selected machines that do not already have it. Follow that connector workflow rather than inventing a separate portal page or granting the machine broad workspace administration rights.

The DCR does not have to share a subscription or resource group with the monitored machines, but the documented setup requires the resources to be in the same tenant. Record where the rule is owned so it can be found during troubleshooting.

## Choose events against detection requirements

The connector offers **All events**, **Common**, **Minimal** and custom selection. These choices have different coverage and ingestion implications. A smaller set is useful only if it retains the records needed by the intended detections and investigations.

For a custom selection, validate the XPath expression against the Windows log and check it against the agent's supported XPath syntax. An expression that returns no records is not necessarily invalid; the machine may have no matching events.

Keep collection changes under review. A new detection may need event IDs excluded by an earlier filter. Similarly, collecting every event indefinitely without checking volume can create unnecessary ingestion costs.

Use the [connector reference](https://learn.microsoft.com/en-us/azure/sentinel/data-connectors/windows-security-events-via-ama) to confirm the destination table. A general Windows event collection rule and the Sentinel security connector should not be treated as interchangeable setup instructions.

## Verify recent records from the intended machines

After allowing time for collection and ingestion, open **Logs** in the target workspace. This illustrative query summarises recent security events:

```kusto
SecurityEvent
| where TimeGenerated > ago(30m)
| summarize Events = count(), LatestEvent = max(TimeGenerated)
    by Computer, EventID
| order by LatestEvent desc
```

The query has not been executed against a workspace for this article. Check the computer names, event IDs and timestamps against the pilot machines. Seeing an old record from a different server is not a successful test of the new rule.

Arrange an authorised, ordinary activity that should produce a required event, then verify the Windows event locally and its arrival in Sentinel. Retain the evidence with the collection change.

## Investigate gaps in order

If expected records are missing, first confirm that the server generated them. Next check its effective collection rule, event selection, agent deployment and connectivity, then confirm the destination workspace.

Review overlapping rules and any existing collection route before expanding the pilot. Account for duplicate collection and its effect on ingestion volume.

Close the task when the required events arrive from the expected machines and the detection owner can use them. That establishes the collection path; the next step is validating the analytics that depend on it.

