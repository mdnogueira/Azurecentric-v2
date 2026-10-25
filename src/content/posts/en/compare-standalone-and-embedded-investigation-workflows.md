---
title: "Compare standalone and embedded investigation workflows"
description: "Compare standalone and embedded Security Copilot workflows, focusing on context anchoring and connector requirements."
pubDate: 2026-07-29
category: security-copilot
tags: ["microsoft-security-copilot", "investigation-workflows"]
translationKey: compare-standalone-and-embedded-investigation-workflows
draft: false
---

You are faced with a security question. The answer is not always in the same place. Microsoft Security Copilot is a generative AI-powered assistant for daily operations in security and IT 1. It empowers teams to protect at the speed and scale of AI by connecting to various data sources through plugins and connectors 1. The first decision you make is how to anchor your investigation: do you start a standalone session with broad context, or do you embed the assistant into an existing workflow with specific data? The choice depends on whether you are exploring a threat landscape or responding to a specific alert in a tool like Microsoft Sentinel.

## Standalone investigations: broad exploration

A standalone session is the default entry point. You open the Copilot interface, type a query, and let the assistant retrieve information from its connected data sources. This approach is best when you do not have a specific starting point, or when you need to synthesise information across multiple disparate sources that are not currently linked in your primary tool.

Consider a scenario where you are researching a new threat actor. You might ask Copilot to summarise recent tactics, techniques, and procedures (TTPs) based on connected intelligence feeds. Because the session is standalone, it is not constrained by the scope of a single alert or a specific resource group. You can pivot freely between topics, ask follow-up questions, and let the AI build a narrative from the available data.

The primary advantage here is flexibility. You are not bound by the structure of an existing ticket or alert. However, this freedom comes with a trade-off: you must manually provide the context. If you are investigating a specific incident, you need to copy and paste relevant details, such as IP addresses, file hashes, or user IDs, into the prompt. The standalone session does not automatically inherit the metadata from your security tools.

## Embedded investigations: contextual precision

Embedded workflows involve using Microsoft Security Copilot within the context of another application, such as Microsoft Sentinel. Instead of starting with a blank slate, you invoke Copilot from within an alert or incident view. This approach is designed for rapid triage and response.

In Sentinel, you might select a specific alert and ask Copilot to explain the underlying activity. Because the assistant is embedded, it can access the specific data associated with that alert, such as the KQL query that generated it, the involved entities, and the timeline of events. This reduces the need for manual context injection and allows for more precise, targeted analysis.

The key benefit of embedding is efficiency. You are working within the workflow you already use, reducing context switching. The assistant can leverage the structured data already present in the alert, leading to faster and more accurate responses. For example, instead of manually describing an alert, you can ask Copilot to "analyse the entities in this alert and suggest next steps."

However, embedded workflows are limited by the scope of the host application. You are investigating the specific alert or incident you are viewing. If you need to broaden your investigation to include external threat intelligence or cross-reference with other systems, you may need to switch to a standalone session or use plugins to bridge the gap.

## Choosing the right approach

The decision between standalone and embedded workflows is not about which is superior, but about which fits the current operational need. Use standalone sessions for broad research, threat hunting, and synthesising information from multiple sources where no single alert provides the full picture. Use embedded workflows for rapid triage, detailed analysis of specific incidents, and when you need to act within the context of your existing security tools.

Many investigations will require both. You might start with an embedded analysis in Sentinel to understand the immediate scope of an alert, then switch to a standalone session to research the threat actor's broader TTPs and check for indicators of compromise across your estate. The ability to move between these modes is a strength of the platform.

## Practical considerations

Regardless of the workflow you choose, ensure you have the necessary connectors and plugins configured. Microsoft Security Copilot relies on these integrations to retrieve relevant data 1. Without the correct connectors, your queries may return limited or irrelevant results.

Also, be mindful of the data privacy and security implications. When using standalone sessions, you are manually inputting data, which means you are responsible for ensuring that sensitive information is handled appropriately. In embedded workflows, the data is already within your security tool, but you should still verify that the assistant is accessing the correct data sources and that the results are interpreted correctly.

Finally, treat the output of both workflows as a starting point, not a final answer. Generative AI can hallucinate or misinterpret context. Always verify critical findings against your primary data sources and use your own security expertise to validate the assistant's recommendations.

By understanding the strengths and limitations of both standalone and embedded workflows, you can choose the right tool for the job and improve the speed and accuracy of your security investigations.


References for Compare standalone and embedded investigation workflows: [README](https://github.com/Azure/Security-Copilot/blob/546fc8520e9443e311cc9df30ab5e0ac79301a9f/README.md).
