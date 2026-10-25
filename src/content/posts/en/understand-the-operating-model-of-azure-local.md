---
title: "Understand the operating model of Azure Local"
description: "Clarify the Azure Connected Machine agent's role in Azure Local by distinguishing it from the Azure Arc infrastructure and the Azure Monitor Agent."
pubDate: 2025-11-12
category: hybrid-migration
tags: ["azure-local", "hybrid-cloud", "azure-monitor-agent", "azure-monitor", "azure-arc", "connected-machine-agent"]
translationKey: understand-the-operating-model-of-azure-local
draft: false
---

Azure Local brings Azure services to the edge, but the management layer can be confusing. A common point of confusion is the role of the Azure Connected Machine agent in that environment. It is easy to assume that because Azure Local machines are managed via Azure Arc, the Connected Machine agent is the primary tool for monitoring or security. It is not. Understanding the operating model requires separating the infrastructure management layer from the workload management layer.

The Azure Connected Machine agent is the bridge that allows Azure Arc-enabled servers to manage your local machines. It does not replace the Azure Monitor Agent (AMA). The AMA is required for proactive monitoring, security protection via Microsoft Defender for Cloud, and update management. The Connected Machine agent handles identity, policy assignment, and extension management. Confusing these roles leads to incomplete visibility and gaps in security posture.

## The Connected Machine agent is for identity and policy

The Azure Connected Machine agent enables you to manage Windows and Linux machines hosted outside of Azure, including those in Azure Local, on your corporate network, or in other cloud providers [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview). When you connect a machine to Azure Arc, it becomes a connected machine and is treated as a resource in Azure [Azure Arc-enabled servers Overview](https://learn.microsoft.com/en-us/azure/azure-arc/servers/overview). The agent is responsible for:

*   **Identity:** It manages the connection to Azure and the machine's Azure identity via the Hybrid Instance Metadata Service (HIMDS) [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview).
*   **Policy:** It provides functionality to assess whether the machine complies with required policies through the guest configuration agent [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview).
*   **Extensions:** It manages VM extensions, including installation, uninstallation, and upgrades [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview).

The agent does not collect monitoring data. That is the specific role of the Azure Monitor Agent. The documentation explicitly states that the Azure Monitor Agent is a separate agent that collects monitoring data and does not replace the Connected Machine agent [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview). The Connected Machine agent only replaces the legacy Log Analytics agent, Diagnostics extension, and Telegraf agent for both Windows and Linux machines [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview).

## Azure Local machines require the Azure Monitor Agent

Azure Local provides a consistent Azure experience at the edge. To achieve this, you must enable the same management capabilities you use in Azure. This means installing the Azure Monitor Agent on your Azure Local machines. The AMA is required to:

*   Proactively monitor the OS and workloads running on the machine [Azure Arc-enabled servers Overview](https://learn.microsoft.com/en-us/azure/azure-arc/servers/overview).
*   Manage it using Automation runbooks or solutions like Update Management [Azure Arc-enabled servers Overview](https://learn.microsoft.com/en-us/azure/azure-arc/servers/overview).
*   Use other Azure services like Microsoft Defender for Cloud [Azure Arc-enabled servers Overview](https://learn.microsoft.com/en-us/azure/azure-arc/servers/overview).

Without the AMA, your Azure Local machines will appear in Azure Arc as connected resources, but they will not have the depth of monitoring, security, or update management that defines the Azure experience. The Connected Machine agent alone is insufficient for workload protection.

## Operational considerations for Azure Local

When planning the deployment of Azure Local, consider the following operational aspects of the Connected Machine agent:

1.  **Resource Consumption:** The Connected Machine agent is designed to manage resource consumption. Under normal operations, it consumes minimal CPU and memory. On Windows, it uses approximately 0.07% CPU and 57 MB of memory. On Linux, it uses 0.02% CPU and 42 MB of memory [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview). However, during policy evaluation or extension management, it can use up to 5% of CPU for guest configuration and up to 5% (Windows) or 30% (Linux) for extensions [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview).
2.  **Disaster Recovery:** There are no customer-enabled disaster recovery options for Arc-enabled servers. In the event of an outage in an Azure region, the system will failover to another region in the same Azure geography [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview). The Connected Machine agent will be disconnected during this period and will show a status of **Disconnected** until the failover is complete [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview). An outage of Azure Arc won't affect the customer workload itself; only management of the applicable servers via Arc will be impaired [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview).
3.  **Agent Versioning:** Only Connected Machine agent versions within the last 1 year are officially supported by the product group. Customers should update to an agent version within this window [Overview of the Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-overview).

## Verification steps

To verify that your Azure Local machines are correctly configured for the Azure operating model, check the following:

1.  **Connected Machine Agent:** Ensure the agent is installed and connected. You can verify this in the Azure portal under **Azure Arc > Servers**. The status should be **Connected** [Azure Arc-enabled servers Overview](https://learn.microsoft.com/en-us/azure/azure-arc/servers/overview). The agent sends a regular heartbeat message to the service every five minutes [Azure Arc-enabled servers Overview](https://learn.microsoft.com/en-us/azure/azure-arc/servers/overview).
2.  **Azure Monitor Agent:** Ensure the AMA is installed and collecting data. You can verify this by checking the **VM Insights** or **Log Analytics** workspace for data from the machine [Azure Arc-enabled servers Overview](https://learn.microsoft.com/en-us/azure/azure-arc/servers/overview).
3.  **Security Posture:** Ensure Microsoft Defender for Cloud is enabled and showing a security posture for the machine [Azure Arc-enabled servers Overview](https://learn.microsoft.com/en-us/azure/azure-arc/servers/overview). This requires the AMA to be installed and reporting data.

By clearly separating the roles of the Connected Machine agent and the Azure Monitor Agent, you can ensure that your Azure Local deployment provides the full suite of Azure management capabilities. The Connected Machine agent handles the "Arc
