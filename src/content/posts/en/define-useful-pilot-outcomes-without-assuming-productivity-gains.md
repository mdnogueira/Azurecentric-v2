---
title: "Define useful pilot outcomes without assuming productivity gains"
description: "Define measurable pilot outcomes for Microsoft Security Copilot using operational baselines and supported integrations."
pubDate: 2025-09-07
category: security-copilot
tags: ["microsoft-security-copilot", "pilot", "ai-assistant", "measurable-outcomes", "plugins"]
translationKey: define-useful-pilot-outcomes-without-assuming-productivity-gains
draft: false
---

You are planning a pilot for Microsoft Security Copilot. The temptation is to measure success by how much faster analysts feel they are working. That is a subjective metric that is difficult to verify and easy to misinterpret. A more reliable approach is to define outcomes that can be observed in the system and the workflow, grounded in the capabilities the product actually provides.

Microsoft Security Copilot is described as a generative AI-powered assistant for daily operations in security and IT 1. It empowers teams to protect at the speed and scale of AI. However, "speed" and "scale" are not metrics you can capture in a pilot without a clear baseline. The product documentation outlines specific capabilities, such as threat hunting and incident response assistance, which should form the basis of your pilot scope 2.

## Start with a specific operational question

Instead of asking "Is Security Copilot faster?", ask "Can Security Copilot help us resolve a specific type of alert faster?" or "Does it reduce the time to investigate a common incident?"

Choose one or two high-volume, low-complexity scenarios. For example, phishing email analysis or initial triage of a suspicious login. These scenarios have clear inputs and outputs. You can measure the time taken to complete the task with and without the tool. The key is to select scenarios where the assistant's capabilities, such as summarising logs or generating KQL queries, are directly applicable.

## Define measurable outcomes

For each scenario, define what success looks like. This might be:

- **Time to triage:** The time from alert creation to initial classification.
- **Reduction in manual steps:** The number of manual actions required to complete the investigation.
- **Context gathering speed:** The time taken to assemble relevant threat intelligence.

These metrics are concrete and can be tracked. They provide evidence of whether the tool is adding value. Avoid measuring "accuracy of classification" as a primary metric, as Security Copilot is an assistant that generates text and recommendations, not an autonomous classifier. Measuring its "accuracy" requires defining ground truth and evaluation methodology, which is complex and often outside the scope of a pilot.

## Leverage supported connectors and plugins

The Security Copilot product documentation highlights the importance of connectors and plugins in extending its capabilities 2. These integrations allow the assistant to interact with your existing security tools, such as Microsoft Sentinel or Microsoft Defender for Cloud.

Consider which connectors are relevant to your pilot scenarios. For example, a connector for Microsoft Sentinel might reduce the time to query logs and generate incident reports. The documentation provides guidance on configuring these connectors 3. This suggests that the tool is designed to be integrated into existing workflows, rather than operating in isolation.

It is important to distinguish between supported product connectors and community-contributed code. The Security Copilot community repository on GitHub offers examples of plugins and connectors for contribution [4](https://github.com/Azure/Security-Copilot/blob/546fc8520e9443e311cc9df30ab5e0ac79301a9f/README.md). However, these are experimental code contributions and not supported product features. Do not rely on them for critical pilot integrations. Instead, focus on the officially supported connectors listed in the product documentation.

## Verify the outcomes

After the pilot, compare the metrics you defined with the baseline. Did the tool improve the time to triage? Did it reduce the number of manual steps? Did it help analysts gather context faster?

If the metrics show improvement, you have evidence that the tool is adding value. If not, you can adjust your approach or decide not to proceed with a full rollout. It is also important to gather qualitative feedback from the analysts using the tool. Did they find it helpful? Did it reduce their cognitive load? These insights can complement the quantitative metrics.

## Consider the limitations

Security Copilot is a generative AI tool. It is not a replacement for human analysts. It is an assistant that can help with routine tasks. It is important to set realistic expectations and to monitor the tool's performance over time. Be aware of potential limitations, such as the accuracy of generated KQL queries or the relevance of threat intelligence summaries. Always have a human in the loop to review and validate the assistant's outputs.

The community repository is a resource for exploring the tool's extensibility [4](https://github.com/Azure/Security-Copilot/blob/546fc8520e9443e311cc9df30ab5e0ac79301a9f/README.md). However, it is important to evaluate the quality and reliability of any community-contributed code before considering it for production use. For pilot purposes, stick to the officially supported features and connectors.

## Next steps

If the pilot is successful, consider expanding the scope to include more scenarios. If not, review the metrics and adjust your approach. The goal is to use evidence to guide your decision, not assumptions.

The official documentation provides a starting point for exploring the tool's capabilities 1. Use it to identify supported connectors and plugins that might be relevant to your pilot. But remember, the ultimate measure of success is whether the tool helps you protect your environment more effectively.

[1] https://learn.microsoft.com/en-us/security-copilot/get-started-security-copilot
[2] https://learn.microsoft.com/en-us/security-copilot/plugin_overview
[3] https://learn.microsoft.com/en-us/security-copilot/connectors-overview
[4] https://github.com/Azure/Security-Copilot/blob/546fc8520e9443e311cc9df30ab5e0ac79301a9f/README.md
