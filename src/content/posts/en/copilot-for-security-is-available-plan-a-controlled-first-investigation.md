---
title: "Copilot for Security is available: plan a controlled first investigation"
description: "Plan a controlled first investigation with Microsoft Security Copilot, covering licensing, scope, and initial promptbook creation."
pubDate: 2024-04-03
category: governance
tags: ["microsoft-security-copilot", "security-operations", "ai-in-security", "incident-response", "licensing"]
translationKey: copilot-for-security-is-available-plan-a-controlled-first-investigation
draft: false
---

Microsoft Security Copilot became generally available on 1 April 2024. It offers a generative AI assistant for security and IT operations, informed by large-scale threat intelligence. The first step is not to enable every feature, but to establish a controlled environment where you can verify the tool’s output, understand its data sources, and define how your team will use it.

The service is available as a standalone portal or embedded within existing Microsoft Security products such as Microsoft Defender, Microsoft Entra, and Microsoft Purview. Before you start investigating, you need to decide which experience fits your immediate needs and ensure you have the correct licensing.

[![Security Copilot Investigation Flow](/images/posts/2024/azc-034-checkpoints.svg)](/images/posts/2024/azc-034-checkpoints.svg)

## Clarify the licensing model

Microsoft Security Copilot uses a provisioned pay-as-you-go licensing model. This consumption-based approach allows you to scale usage and costs according to your needs. You can purchase the service starting from 1 April 2024. Contact your account representative to arrange access. The licensing is separate from other Microsoft 365 or Defender licenses, so do not assume inclusion.

## Choose the initial scope

You can use the standalone portal or the embedded experiences. The standalone portal is useful for general queries, promptbook creation, and multi-language support. The embedded experiences integrate Copilot into specific workflows:

*   **Microsoft Defender:** Provides an embedded experience for security information and event management (SIEM) and extended detection and response (XDR). It surfaces relevant details, drives guided response, and offers natural language to Kusto Query Language (KQL) conversion.
*   **Microsoft Entra:** Offers user risk investigation in preview. It summarises user risk indicators in natural language and recommends automated prevention methods, such as Conditional Access policies.
*   **Microsoft Purview:** Provides concise alert summaries and integrated insights for data security and compliance administrators.
*   **Microsoft Intune:** Offers root cause determination and device context analysis in preview.

For a first investigation, the standalone portal is often the safest starting point. It allows you to test the AI’s reasoning without immediately impacting production security controls. If you choose an embedded experience, ensure you understand the specific preview status and limitations of that integration.

## Prepare for the first investigation

Before you begin, define the scope of your first investigation. Select a specific security event or a general threat intelligence query. Avoid starting with a broad, open-ended question. A focused query allows you to verify the accuracy and relevance of the Copilot’s response.

### Create a custom promptbook

One of the new capabilities available at general availability is custom promptbooks. These allow you to create and save a series of natural language prompts for common security workstreams. For your first investigation, consider creating a simple promptbook that outlines the steps you want Copilot to follow.

An illustrative example of a promptbook structure might look like this:

```json
{
  "name": "Initial Threat Triage",
  "prompts": [
    "Summarise the threat intelligence for [Indicator Type]: [Indicator Value]",
    "What are the recommended mitigation steps for this threat?",
    "Are there any known affected products or services?"
  ]
}
```

This is an unrun example. You must create the promptbook within the Copilot interface. The structure above is for illustration only. Ensure you replace the placeholders with actual indicators relevant to your environment.

### Verify data sources

Copilot is informed by Microsoft’s threat intelligence, including over 78 trillion security signals processed daily. When you receive a response, check the cited sources. Copilot should provide references to the underlying data. If a response lacks citations, treat it with caution. Do not assume that all information is verified. The tool is an assistant, not an autonomous decision-maker.

## Conduct the investigation

1.  **Access the portal:** Sign in to the Microsoft Security Copilot standalone portal.
2.  **Select your language:** The interface supports 25 languages, and Copilot can process prompts and respond in eight languages. Choose the language that best suits your team.
3.  **Enter your prompt:** Use the promptbook you created or enter a specific query. For example, "Investigate the threat level of IP address [X]."
4.  **Review the response:** Analyze the summary, recommended actions, and cited sources. Check if the information aligns with your existing security logs.
5.  **Document the outcome:** Record the query, the response, and your assessment. This helps you evaluate the tool’s effectiveness and identify areas for improvement.

## Evaluate and iterate

After the first investigation, review the results. Did Copilot provide accurate and actionable insights? Were there any false positives or misleading information? Use this feedback to refine your promptbooks and adjust your investigation workflows.

Consider integrating Copilot with your existing security tools gradually. Start with read-only capabilities, such as summarising alerts or converting KQL queries. Avoid using Copilot for automated remediation until you have thoroughly tested its reliability and understand the potential risks.

The goal of this first investigation is not to achieve perfection, but to establish a baseline. You are learning how Copilot thinks, what data it uses, and how it can support your team. By starting small and controlled, you can build confidence in the tool and integrate it effectively into your security operations.

References for Copilot for Security is available: plan a controlled first investigation: [Copilot for Security is available: plan a controlled first investigation](https://www.microsoft.com/en-us/security/blog/2024/03/13/microsoft-copilot-for-security-is-generally-available-on-april-1-2024-with-new-capabilities/), [README](https://github.com/Azure/Security-Copilot/blob/053892bb4c3acfa28429ee055d0c291a7d96123f/README.md).
