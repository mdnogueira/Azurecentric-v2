---
title: "Build a prompt that produces a useful incident summary"
description: "Construct precise prompts for Microsoft Security Copilot to generate structured incident summaries with specific audience and data requirements."
pubDate: 2024-12-03
category: governance
tags: ["security-copilot", "incident-response", "prompting", "microsoft-defender", "threat-intelligence"]
translationKey: build-a-prompt-that-produces-a-useful-incident-summary
draft: false
---

You need to summarise an incident for a non-technical executive, but the default output is too technical or lacks the specific entity context required for decision-making. The first step is to stop asking for a generic summary and start defining the goal, the audience, the source data, and the output format explicitly.

Microsoft Security Copilot responds significantly better to structured instructions that constrain its reasoning. The [prompting tips documentation](https://github.com/Azure/Security-Copilot/blob/17b5582f31b37a2d641aec0d480ddcaaa85170a0/Customer Guides/Prompting Tips for Copilot For Security/readme.md) outlines that vague prompts yield vague results. A prompt that simply asks for "an incident summary" relies entirely on the model's internal defaults for tone and depth. A prompt that specifies the incident ID, the source system, the target audience, and the required data fields forces the model to select the correct plugins and structure the response accordingly.

## Define the Goal and Audience Early

The most common failure in incident summarisation is a mismatch between the technical detail provided and the decision-making capability of the reader. An executive needs to know the impact, the scope, and the immediate next steps, not the raw log entries or the specific malware hash, unless that hash is critical to a broader infrastructure decision.

Start your prompt by stating the goal and the audience. This sets the expectation for the language and depth of the response. For example, instead of asking for a summary of incident 19247, specify that the summary is for a non-technical executive audience. This instruction alone shifts the model away from listing raw alerts and towards explaining the business context.

## Specify the Source and Data Requirements

Security Copilot can access multiple data sources, including Microsoft Defender for Endpoint, Microsoft Defender Threat Intelligence (MDTI), and Microsoft Sentinel. If you do not specify the source, the model may pull from the wrong context or provide a generic response that lacks your organisation's specific telemetry.

In the case of an incident from Microsoft Defender, explicitly name the source. Then, define exactly what data points you need. If you require a list of entities involved in the incident, do not just ask for "entities." Specify the format and the enrichment required. The documentation provides a clear progression from a basic request to a precise one:

*   **Basic:** "Provide a summary for incident 19247 from Defender catered to a non-technical executive audience."
*   **Precise:** "Provide a summary for incident 19247 from Defender catered to a non-technical executive audience. List the entities of the incident in a table providing context from MDTI."

The precise version forces the model to use the MDTI Copilot reputation skill to enrich the entities. This is a critical distinction. Without this instruction, the table might list IP addresses or domain names without context. With it, the table includes the MDTI reputation, which helps the executive understand the reputation status of the entities.

## Structure the Output for Clarity

A summary is only useful if it is readable. Use explicit formatting instructions to guide the model. Requesting a table with specific headers ensures consistency. For the incident summary example, the headers should be "Entity", "Entity Type", and "MDTI reputation". 

Define what goes into each column. For "Entity", specify that it should list the entity associated with the incident or its alerts. For "Entity Type", specify the categories such as domain name, IP address, URL, or hash. This prevents the model from mixing data types or omitting critical identifiers. For "MDTI reputation", instruct the model to enrich the entity against MDTI’s Copilot reputation skill. This ensures that the reputation data is pulled from the correct plugin and is relevant to the specific entity.

## Iterate and Refine

If the initial response does not meet your needs, do not accept it. The documentation encourages iteration. If the summary is still too technical, refine the audience instruction. If the table is missing entities, check if the incident ID is correct or if the source specification needs to be more explicit. You can also use the process log to understand which plugins were selected and executed. This transparency helps you adjust your prompt to bypass the orchestrator if necessary, by selecting a specific plugin in the prompt bar.

## Example Prompt

The following prompt is an illustrative example of a well-structured request. It is not tested, but it follows the best practices outlined in the official guidance.

```text
Provide a summary for incident 19247 from Defender catered to a non-technical executive audience. List the entities of the incident in a table which includes the following headers: “Entity”, “Entity Type”, “MDTI reputation”. Within entity, list the entity associated with the incident or incident’s alerts. Within Entity Type, list what type of entity it is. For example, domain name, IP address, URL, hash. Within the MDTI reputation, enrich the entity against MDTI’s Copilot reputation skill.
```

This prompt achieves three things: it defines the audience, it specifies the source, and it structures the output. It also leverages the MDTI reputation skill to add context, which is often the missing piece in executive summaries.

## Verification

After generating the summary, verify the output against the source data. Check that the entities listed are actually associated with the incident. Ensure that the MDTI reputation data is accurate and up-to-date. If the summary lacks critical context, refine the prompt by adding more specific instructions or by using a custom promptbook to automate the process for future incidents.

The key to effective incident summarisation with Security Copilot is precision. By defining the goal, audience, source, and format, you transform the model from a generic text generator into a targeted analytical tool. This approach reduces the time spent editing and increases the value of the output for decision-makers.
