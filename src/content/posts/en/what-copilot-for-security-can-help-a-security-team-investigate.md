---
title: "What Copilot for Security can help a security team investigate"
description: "How Copilot for Security uses plugins to assist investigation, focusing on the distinction between generating queries and executing them."
pubDate: 2024-04-23
category: governance
tags: ["copilot-for-security", "microsoft-sentinel", "kql", "security-operations", "ai"]
translationKey: what-copilot-for-security-can-help-a-security-team-investigate
draft: false
---

You are looking at an alert in Microsoft Sentinel and need to understand the scope of a potential compromise. The traditional approach involves writing or copying KQL queries, switching contexts, and manually correlating data. Microsoft Copilot for Security offers a different path by acting as a generative AI assistant that can interact with your security data through plugins.

The core capability relevant to this scenario is the ability to ask natural language questions and have the system retrieve and summarise information from connected data sources. This is not a magic button that solves every investigation, but it does reduce the friction of data retrieval and initial analysis. The key to making this work is understanding the architecture: Copilot for Security does not read your data directly. It uses connectors to link to your data sources and plugins to define how it interacts with them.

[![Copilot for Security Investigation Flow](/images/posts/2024/azc-041-checkpoints.svg)](/images/posts/2024/azc-041-checkpoints.svg)

## The role of connectors and plugins

Before you can ask Copilot for Security to investigate an alert, you must ensure the relevant data sources are connected. The connectors overview explains that you need to establish these links for Copilot to access your data. For Microsoft Sentinel, this typically involves ensuring the workspace is connected and that the necessary permissions are in place for the Copilot service principal to query the data.

However, connecting the data source is only half the equation. You also need plugins. Plugins are the components that tell Copilot for Security how to interpret your data and what actions it can take. The plugin overview details the available plugins, including those for Microsoft Sentinel. These plugins enable Copilot to execute KQL queries, retrieve incident details, and summarise findings.

## Investigating an alert with the Sentinel plugin

Let us consider a concrete example. You have an alert in Microsoft Sentinel indicating suspicious sign-in activity. You want to know if this activity is part of a broader pattern. Instead of writing a complex KQL query to find all sign-ins from the same IP address in the last 24 hours, you can use Copilot for Security.

1.  **Open the incident**: Navigate to the alert in Microsoft Sentinel and open the incident details.
2.  **Use the Copilot pane**: Open the Copilot for Security pane within the Sentinel interface.
3.  **Ask a natural language question**: Type a question such as, "Show me all sign-ins from this IP address in the last 24 hours."
4.  **Review the response**: Copilot for Security will use the Sentinel plugin to generate and execute the appropriate KQL query. It will then present the results in a summarised format, often including a table or a chart.

This process is supported by the community-driven [KQL plugin samples](https://github.com/Azure/Security-Copilot/blob/a6f3ba73e1ad766d5279b63bd333414e3a59b89a/README.md) available in the Copilot for Security repository. These samples provide a starting point for understanding how plugins are structured and how they can be customised. For instance, you might find a sample plugin that helps you correlate IP addresses with threat intelligence feeds.

## Customising the investigation

The community repository also allows you to contribute your own plugins. If you have a specific investigation workflow that is not covered by the default plugins, you can create a custom plugin. The [README](https://github.com/Azure/Security-Copilot/blob/a6f3ba73e1ad766d5279b63bd333414e3a59b89a/README.md) outlines the steps for forking the repository, creating a branch, and developing a new plugin. This is particularly useful for teams with unique data sources or specific analytical requirements.

For example, you might create a plugin that automatically enriches an alert with data from an internal vulnerability management system. This would involve defining the plugin's schema, writing the logic to fetch the data, and testing it in a non-production environment before deploying it to your production Copilot for Security instance.

## Limitations and considerations

While Copilot for Security can significantly speed up initial triage, it is important to understand its limitations. The quality of the response depends on the quality of the data in your connected sources and the effectiveness of the plugins. If your data is incomplete or your plugins are poorly configured, the insights you receive may be misleading.

Additionally, always verify the results provided by Copilot for Security, especially before taking any remediation actions. The assistant is designed to help you investigate, not to make decisions for you. It is a tool to augment your expertise, not replace it.

## Next steps

To get started, ensure your Microsoft Sentinel workspace is connected to Copilot for Security and that the relevant plugins are enabled. Then, try asking a simple question about a recent alert. Observe how the system responds and whether it provides the information you need. If you find gaps in the default plugins, consider exploring the community repository for samples or developing your own.

The get started guide provides more detailed instructions on setting up your environment and configuring your plugins. Use it as a reference as you begin to integrate Copilot for Security into your daily operations.
