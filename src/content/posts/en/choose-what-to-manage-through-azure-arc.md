---
title: "Choose what to manage through Azure Arc"
description: "Decide whether Azure Arc-enabled servers fits your hybrid estate by defining scope, establishing governance foundations, and planning phased deployment."
pubDate: 2025-02-08
category: cloud
tags: ["azure-arc", "hybrid-cloud", "server-management", "azure-policies", "rbac"]
translationKey: choose-what-to-manage-through-azure-arc
draft: false
---

The decision to introduce Azure Arc-enabled servers usually begins with a practical observation: you have servers outside Azure that you want to manage using the same governance, security, and monitoring tools you apply to your native cloud resources. This includes physical machines in your own data centres, virtual machines on VMware vSphere, or instances running on other public clouds like AWS or GCP. The service allows you to project these non-Azure machines into the Azure management plane, treating them as connected machines with Resource IDs, resource groups, and tags.

However, the first step is to confirm that the resource actually needs Arc. Azure Arc-enabled servers is explicitly designed for machines hosted outside of Azure. It is not designed or supported to enable the management of virtual machines running in Azure. If your servers are already native Azure VMs, they are managed through the Azure Compute plane. While you can technically onboard an Azure VM to Arc, doing so adds management overhead without providing a distinct advantage for the compute layer itself. The value of Arc lies in extending Azure-native capabilities—such as Azure Policy, Microsoft Defender for Cloud, and Azure Monitor—to environments where those capabilities do not natively exist.

## Define the boundary and prerequisites

Before planning deployment, you must establish the scope and prerequisites. The Connected Machine agent is the component that connects the hybrid machine to Azure. It does not replace the Azure Monitor Agent (AMA). The AMA is required separately if you need to proactively monitor the OS and workloads, manage the machine using Automation runbooks, or use Microsoft Defender for Cloud. You need both agents installed for full functionality, but they serve different purposes.

To onboard machines, you need specific Azure permissions. The **Azure Connected Machine Onboarding** built-in role is required to initiate the connection. To read, modify, or delete a machine after onboarding, you need the **Azure Connected Machine Resource Administrator** role. These are Azure RBAC roles and do not grant local operating system privileges. You still need an account with elevated privileges (administrator or root) on the machines themselves to install the agents.

Network connectivity is another critical prerequisite. Your machines must have connectivity to Azure resources, either directly or through a proxy. The region you select when creating the installation script determines where the instance metadata—such as OS name, computer name, and agent version—is stored. For data residency requirements, ensure the chosen region complies with your policies, as customer data stays within the region you deploy the service instance in.

## Establish the management foundation

A successful deployment relies on a solid Azure-side foundation. Start by creating a dedicated resource group to centralise the management and monitoring of these resources. This keeps your Azure portal view organised and simplifies permission management.

Develop a tagging strategy aligned with your IT structure. Tags are key-value pairs that help identify resources based on settings relevant to your organization, such as environment (Production/Testing), ownership, or physical datacentre location. You can define tags during onboarding or apply them later. Tags can be used to filter operations, such as the deployment of extensions or service attachments, providing operational flexibility.

You also need to decide on your monitoring and governance architecture. Evaluate whether to use an existing Log Analytics workspace or implement a new one. Consider integration with Azure Automation for Update Management and Change Tracking, as well as Microsoft Defender for Cloud and Microsoft Sentinel. If your organization already has an Automation account and enabled its management features linked with a Log Analytics workspace, evaluate whether you can centralise and streamline management operations by using those existing resources versus creating duplicates.

For governance, develop an Azure Policy plan. Azure Policy allows you to assign policy definitions that install required agents, such as the VM Insights agent, or audit settings inside the machine. Policies can be assigned at the subscription or resource group scope, and they propagate down to lower levels, helping to improve your governance posture.

## Plan the deployment lifecycle

Deployment should follow a phased approach. Start with a pilot of representative, non-critical machines for at least 30 days. This allows you to assess the impact, refine your process, and train system engineers who may be new to Azure services. Establish a formal plan that includes objectives, selection criteria, scope, success metrics, and a rollback strategy.

For at-scale deployment, use the pre-defined installation scripts. You can customise these scripts for your automation tools, such as PowerShell, Ansible, or VMware vSphere. You may also need to create a service principal to connect machines non-interactively. Once the scripts are ready, deploy the Connected Machine agent to your target servers.

After onboarding, you can enable management capabilities. These include:
*   **Governance:** Assigning Azure machine configurations to audit internal settings.
*   **Protection:** Using Microsoft Defender for Cloud for threat detection and vulnerability management.
*   **Configuration:** Using Azure Automation for runbooks and Update Management for OS updates. Note that enabling Update Management directly from an Arc-enabled server is not supported; it must be enabled from the Automation account.
*   **Monitoring:** Collecting log data with the Azure Monitor Agent and storing it in a Log Analytics workspace.

You can organise these resources using Azure Resource Graph (ARG) to query attributes like operating system, presence of SQL Server, or cloud provider details. ARG provides efficient and performant resource exploration, allowing you to query at scale across subscriptions.

## Verify and maintain

After deployment, verify the agent status. The Connected Machine agent sends a heartbeat every five minutes. If heartbeats stop, the machine status changes to **Disconnected** within 15–30 minutes. If a machine remains disconnected for 45 days, it may become **Expired**, requiring reconnection. Set up Resource Health alerts for when a server becomes unavailable, and monitor Azure Advisor for recommendations to upgrade the Connected Machine agent to the latest version.

Keep the agent updated to ensure you receive the latest security and bug fixes. Out-of-date agents will be identified with an Azure Advisor alert. Regularly review your tagging strategy and policy assignments to ensure they remain aligned with your organizational changes.

The decision to use Azure Arc-enabled servers rests on a clear boundary: is the resource outside Azure? If yes, Arc provides a consistent management plane. If no, use native Azure VM management. Define your scope, establish your RBAC and tagging strategy, and deploy in phases with a pilot. Verify connectivity and agent health, and use Azure Resource Graph to maintain visibility across your hybrid estate.

References for Choose what to manage through Azure Arc: [Azure Arc-enabled servers Overview](https://learn.microsoft.com/en-us/azure/azure-arc/servers/overview), [Plan and deploy Azure Arc-enabled servers](https://learn.microsoft.com/en-us/azure/azure-arc/servers/plan-at-scale-deployment), [How to organize and inventory servers using hierarchies, tagging, and reporting](https://learn.microsoft.com/en-us/azure/azure-arc/servers/organize-inventory-servers).
