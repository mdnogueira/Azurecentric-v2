---
title: "Decide which response steps belong in a playbook"
description: "Decide which response steps belong in a playbook by distinguishing enrichment, orchestration, and response actions."
pubDate: 2025-05-23
category: governance
tags: ["microsoft-sentinel", "playbooks", "automation", "soar", "logic-apps"]
translationKey: decide-which-response-steps-belong-in-a-playbook
draft: false
---

When you design a Microsoft Sentinel playbook, the first decision is not which connector to use, but which category of action the step belongs to. Playbooks handle enrichment, bi-directional sync, orchestration, and response. Mixing these categories in a single workflow often creates fragile automation that is hard to audit or reuse.

The documentation groups these into four recommended use cases: enrichment, bi-directional sync, orchestration, and response [Automate threat response with playbooks in Microsoft Sentinel | Microsoft Docs](https://learn.microsoft.com/en-us/azure/sentinel/automation/automate-responses-with-playbooks). Each has a different purpose, a different trigger pattern, and different failure modes. Understanding these boundaries helps you decide whether a step should be part of an automated response or a manual investigation aid.

## Enrichment: Gathering data for investigation

Enrichment playbooks collect data and attach it to an incident to help your team make smarter decisions [Automate threat response with playbooks in Microsoft Sentinel | Microsoft Docs](https://learn.microsoft.com/en-us/azure/sentinel/automation/automate-responses-with-playbooks). They are typically triggered by an incident creation or an alert, and they run in the background without requiring immediate human intervention.

For example, if an incident contains IP address entities, you can configure a playbook to query an external Threat Intelligence provider, such as VirusTotal, to retrieve more data [Recommended Microsoft Sentinel playbook use cases, templates, and examples](https://learn.microsoft.com/en-us/azure/sentinel/automation/playbook-recommendations). The playbook then adds the returned data and insights as comments on the incident [Recommended Microsoft Sentinel playbook use cases, templates, and examples](https://learn.microsoft.com/en-us/azure/sentinel/automation/playbook-recommendations). This is a read-only operation that enhances the context available to the analyst.

Enrichment steps are safe to automate because they do not change the state of your environment. They are useful for gathering context before a human decides on a course of action. If the enrichment step fails, the incident remains intact, and the analyst can proceed with the available data.

## Bi-directional sync: Connecting to ticketing systems

Bi-directional sync playbooks synchronize Microsoft Sentinel incidents with other ticketing systems, such as ServiceNow [Automate threat response with playbooks in Microsoft Sentinel | Microsoft Docs](https://learn.microsoft.com/en-us/azure/sentinel/automation/automate-responses-with-playbooks). They are triggered when an incident is created or updated, and they ensure that the ticketing system reflects the current state of the incident.

To implement this, you create an automation rule for all incident creations and attach a playbook that opens a ticket in ServiceNow [Recommended Microsoft Sentinel playbook use cases, templates, and examples](https://learn.microsoft.com/en-us/azure/sentinel/automation/playbook-recommendations). The playbook should include the incident name, important fields, and a URL to the Microsoft Sentinel incident in the ServiceNow ticket [Recommended Microsoft Sentinel playbook use cases, templates, and examples](https://learn.microsoft.com/en-us/azure/sentinel/automation/playbook-recommendations). This allows teams to jump from the ServiceNow ticket back to the Microsoft Sentinel incident.

Sync steps are critical for maintaining consistency between systems. Implementers should design sync logic to prevent duplicate records, such as by checking for existing tickets before creation. If the sync step fails, the incident remains in Sentinel, but the ticketing system may become out of sync. This is a risk that needs to be monitored.

## Orchestration: Controlling the queue from chat platforms

Orchestration playbooks use your SOC team's chat platform to better control the incidents queue [Automate threat response with playbooks in Microsoft Sentinel | Microsoft Docs](https://learn.microsoft.com/en-us/azure/sentinel/automation/automate-responses-with-playbooks). They are triggered by an incident creation and send a message to a security operations channel in Microsoft Teams or Slack [Recommended Microsoft Sentinel playbook use cases, templates, and examples](https://learn.microsoft.com/en-us/azure/sentinel/automation/playbook-recommendations).

A common pattern is to send a message to the channel and then wait for a response from the admins [Recommended Microsoft Sentinel playbook use cases, templates, and examples](https://learn.microsoft.com/en-us/azure/sentinel/automation/playbook-recommendations). The message includes **Block** and **Ignore** user option buttons. If the admins select **Block**, the playbook sends a command to the firewall to block the IP address and another to Microsoft Entra ID to disable the user [Recommended Microsoft Sentinel playbook use cases, templates, and examples](https://learn.microsoft.com/en-us/azure/sentinel/automation/playbook-recommendations).

Orchestration steps are interactive. They require human input to proceed. This makes them different from pure automation, which runs without human intervention. If the human response is delayed, the workflow remains in a waiting state until the timeout expires or the action is completed. This is a trade-off that needs to be considered when designing the workflow.

## Response: Immediate action with minimal human dependency

Response playbooks immediately respond to threats, with minimal human dependencies, such as when a compromised user or machine is indicated [Automate threat response with playbooks in Microsoft Sentinel | Microsoft Docs](https://learn.microsoft.com/en-us/azure/sentinel/automation/automate-responses-with-playbooks). They are triggered by an incident creation and take direct action to mitigate the threat.

For a compromised user, such as discovered by Microsoft Entra ID Protection, the playbook can send a Teams message to the user, requesting confirmation that the user took the suspicious action [Recommended Microsoft Sentinel playbook use cases, templates, and examples](https://learn.microsoft.com/en-us/azure/sentinel/automation/playbook-recommendations). It then checks with Microsoft Entra ID Protection to confirm the user's status as compromised [Recommended Microsoft Sentinel playbook use cases, templates, and examples](https://learn.microsoft.com/en-us/azure/sentinel/automation/playbook-recommendations). This action does not initiate any enforcement activity on the user, nor does it initiate any configuration of enforcement policy. It only tells Microsoft Entra ID Protection to apply any already defined policies as appropriate [Recommended Microsoft Sentinel playbook use cases, templates, and examples](https://learn.microsoft.com/en-us/azure/sentinel/automation/playbook-recommendations).

For a compromised machine, such as discovered by Microsoft Defender for Endpoint, the playbook can issue a command to Microsoft Defender for Endpoint to isolate the machines in the alert [Recommended Microsoft Sentinel playbook use cases, templates, and examples](https://learn.microsoft.com/en-us/azure/sentinel/automation/playbook-recommendations). This is a high-impact action that should be used with caution.

Response steps are high-risk. They change the state of your environment. If the playbook is triggered incorrectly, it can cause significant disruption. This is why it is important to have clear conditions and approvals before taking response actions.

## Decision criteria for step placement

When deciding where a step belongs, consider the following criteria:

1. **Impact**: Does the step change the state of your environment? If yes, it is likely a response action.
2. **Human Input**: Does the step require human input to proceed? If yes, it is likely an orchestration action.
3. **Data Gathering**: Does the step gather data for investigation? If yes, it is likely an enrichment action.
4. **System Sync**: Does the step synchronize data between systems? If yes, it is likely a sync action.

By categorizing your steps, you can design playbooks that are easier to understand, audit, and maintain. You can also reuse steps across different playbooks, reducing duplication and increasing consistency.

## Verification

To verify that your playbook steps are correctly categorized, review the run history in Logic Apps. Check the inputs and outputs of each step to ensure they match the expected behavior for its category. If a response step is failing, check the permissions and connectivity of the connectors. If an orchestration step is hanging, check the human response time and adjust the timeout settings.

By keeping these categories distinct, you can build a more robust and reliable automation framework for your security operations.
