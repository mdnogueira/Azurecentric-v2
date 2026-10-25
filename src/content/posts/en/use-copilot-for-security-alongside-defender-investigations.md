---
title: "Use Copilot for Security alongside Defender investigations"
description: "Use Security Copilot sample prompts to query Defender and Sentinel incidents, with clear boundaries on their illustrative nature."
pubDate: 2025-10-30
category: governance
tags: []
translationKey: use-copilot-for-security-alongside-defender-investigations
draft: false
---

You have an incident in Microsoft Defender for Cloud or a hunt in Microsoft Sentinel. The raw data is there, but synthesising it into a coherent narrative takes time. Security Copilot offers a way to query that data using natural language, provided you understand how to structure your questions. The [Security Copilot sample prompts repository](https://github.com/Azure/Security-Copilot/blob/5d29a8a755ba427a87dbc0dd0ec6b6a11b151f55/Sample Prompts/Microsoft Defender and Microsoft Sentinel/Readme.md) provides a structured set of examples for interacting with these services. These are not guaranteed API calls; they are prompt patterns designed to extract structured information from security posture and incident data.

## Start with Incident Summaries

The most immediate use case is getting a high-level overview without navigating multiple blades. If you have an incident ID from Defender for Cloud, you can request a summary directly. The sample repository suggests the following pattern:

> Provide me a summary of Defender incident `<Incident ID>`?

Similarly, for Sentinel, you can ask for details on a specific hunt result:

> Tell me more about Sentinel incident `<Incident ID>`

This approach saves time when you need to triage quickly. It gives you the context before you decide whether to dive deeper into the raw logs or entities. Remember that the accuracy of the summary depends on the data available in your environment and the current capabilities of the Copilot model.

## Extract Entities and User Context

Once you have the summary, you often need to understand the scope. Who or what is involved? The Copilot can attempt to extract the entities associated with the incident.

> Extract the entities associated with the incident.

If a user is involved, you can go further. You might ask for their recent device usage and compliance status, which is critical for determining the risk level. The sample prompt suggests:

> If a user is listed in the incident details, show which devices they have used recently and indicate whether they are compliant with policies.

This connects the identity layer with the device posture, giving you a more complete picture of the potential attack surface. However, note that the output depends on available data connections. The system does not automatically perform the compliance check; it relies on the data sources linked to your Copilot instance. If the Intune data is not connected or the user is not found, the response will reflect that absence.

## Investigate Trends and Critical Incidents

For broader situational awareness, you can ask about trends over a specific period. This is useful for reporting or for understanding if an incident is part of a larger campaign.

> Show defender incidents detected over the last 14 days and summarize the trends.

You can also filter by severity or specific users. For example, to check for incidents involving a particular account on a specific date, you can use a placeholder for the date:

> Are there any defender incidents involving `<Username>` on `<Date>`? List the title, severity, timestamp, Attack Techniques, and Categories for any incidents containing his account name or alias. Search account name containing `<User full name>` or `<User first name>`

This level of detail helps in correlating events across different timeframes and identifying patterns that might not be obvious in a single incident view. The prompt structure allows for temporal filtering, rather than presenting a fixed historical query as a standard example.

## Generate Reports and Summaries

Finally, you can use Copilot to draft reports. This is particularly useful for executive summaries or for documenting the investigation steps. The sample repository suggests a structured approach:

> Write a report summarising the investigation. Lead with a non-technical executive summary. Next provide the breakdown of the Defender incident report, the takeaways from the Sentinel Hunt, the Intune device state, and finally the threat intel summary.

This prompt structure ensures that the output is organised and covers all the necessary aspects of the investigation, from technical details to high-level takeaways. It is important to verify the generated report against the source data, especially for critical decisions. The Copilot is a tool to assist in synthesis, not a replacement for manual verification.

## Verification and Next Steps

When using these prompts, ensure you have the correct incident IDs and user names. The accuracy of the response depends on the data available in your Defender and Sentinel environments. Always verify the extracted entities and summaries against the source data.

The sample prompts are a starting point. You can adapt them to your specific needs, but the structure provided by the [Security Copilot samples](https://github.com/Azure/Security-Copilot/blob/5d29a8a755ba427a87dbc0dd0ec6b6a11b151f55/Sample Prompts/Microsoft Defender and Microsoft Sentinel/Readme.md) offers a reliable foundation for effective querying. Treat them as examples of how to frame your questions, not as fixed commands. The underlying model may evolve, and the data sources may change, so flexibility in your approach is key.

References for Use Copilot for Security alongside Defender investigations: [Readme](https://github.com/Azure/Security-Copilot/blob/5d29a8a755ba427a87dbc0dd0ec6b6a11b151f55/Sample Prompts/Microsoft Defender and Microsoft Sentinel/Readme.md).
