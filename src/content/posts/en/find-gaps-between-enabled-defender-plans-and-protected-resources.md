---
title: "Find gaps between enabled Defender plans and protected resources"
description: "Troubleshoot gaps between enabled Defender plans and protected resources by checking subscription, workspace, and resource-level scopes."
pubDate: 2026-09-14
category: governance
tags: ["defender-for-cloud", "troubleshooting", "security-posture", "workspaces", "permissions"]
translationKey: find-gaps-between-enabled-defender-plans-and-protected-resources
draft: false
---

You have enabled Defender for Cloud plans, but the resources you expect to see protected are missing from the inventory or showing as unprotected. This is rarely a service outage; it is usually a scope mismatch. Defender for Cloud operates on distinct layers: subscription-level toggles, workspace-level agent data collection, and resource-level assignments. If any layer is misaligned, the plan appears enabled but the workload remains uncovered.

The first thing to check is whether the plan is enabled at the correct scope for the workload type. Defender for Cloud does not automatically extend all plan coverage across every hierarchy level. A subscription-level toggle for Defender for Servers, for example, does not automatically extend that coverage to an attached Log Analytics workspace [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan). Similarly, enabling the Defender CSPM plan at the subscription level requires specific permissions to activate agentless scanning components [Protect your resources with Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan).

## Check subscription-level plan enablement

Start by confirming that the relevant Defender plan is toggled on for the subscription containing the resource. Open **Microsoft Defender for Cloud** in the Azure portal and navigate to **Environment settings** [Protect your resources with Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan). Select the subscription in question and review the **Defender plans** page.

For servers, ensure the **Servers** switch is set to **On** [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan). If you are using Defender CSPM, verify that the **Defender CSPM** plan is enabled [Protect your resources with Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan). Note that enabling the plan at the subscription level is the primary entry point for Azure VMs, but it is not the only place where protection is defined.

If the plan is disabled here, enable it and save. However, if it is already enabled, the gap likely lies in how the plan interacts with data collection or resource-specific assignments.

## Verify workspace-level coverage for servers

This is the most common source of confusion for Defender for Servers. When you enable the Defender for Servers plan on a subscription, it does not automatically extend that coverage to a Log Analytics workspace [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan). If your VMs are sending data to a workspace that has Defender for Servers disabled, those machines will not receive the threat detection or advanced defenses associated with the plan.

To verify this:

1. In **Environment settings**, select the **Log Analytics workspace** associated with your VMs.
2. Check the **Defender plans** page for that workspace.
3. Ensure the **Servers** plan is toggled to **On** [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan).

Remember that enabling Defender for Servers on a workspace automatically enables Plan 2 for all connected machines, regardless of the subscription-level setting [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan). If you require Plan 1, you must manage coverage at the resource level or ensure the workspace configuration aligns with your licensing strategy. If the workspace plan is disabled, enable it and save. The agent provisioning will then align with the workspace-level policy.

## Inspect resource-level assignments

For resources that are not Azure VMs, or for specific VMs where you need granular control, protection may be defined at the resource level. Defender for Servers can be enabled at the resource level for Azure VMs, Azure Arc-enabled servers, and Virtual Machine Scale Sets (Flex) [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan). This is typically done via REST API or PowerShell scripts for scale [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan).

If a resource is missing from the protected inventory, check whether it has an explicit pricing tier assignment at the resource level. A resource-level assignment overrides subscription-level settings. If the resource has a pricing tier set to `Free` or is missing the assignment entirely, it will not be protected by the paid plan, even if the subscription has Defender for Servers enabled.

To resolve this:

- Use the REST API or the provided PowerShell script to assign the correct pricing tier to the specific resource [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan).
- Ensure the resource type is supported for resource-level assignment (Azure VMs, Arc-enabled servers, VMSS Flex) [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan).

## Confirm agent and data collection status

Even with plans enabled at the correct scopes, protection requires data. Defender for Cloud relies on agents (Log Analytics Agent or Azure Monitor Agent) to collect security data from VMs [Defender for Cloud Planning and Operations Guide](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-planning-and-operations-guide). If the agent is not installed, or if it is reporting to a workspace that lacks the corresponding Defender plan, the resource will appear unprotected.

Check the **Inventory** or **Overview** page in Defender for Cloud to see if the VM is listed. If the VM is not listed, the agent may not be installed or the VM may not be connected to a monitored workspace. If the VM is listed but shows as "Unprotected," verify that the agent is healthy and that the workspace it reports to has the relevant Defender plan enabled [Defender for Cloud Planning and Operations Guide](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-planning-and-operations-guide).

For non-Azure resources, ensure they have been onboarded correctly [Defender for Cloud Planning and Operations Guide](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-planning-and-operations-guide). Defender for Cloud can monitor non-Azure computers, but they must be explicitly onboarded [Defender for Cloud Planning and Operations Guide](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-planning-and-operations-guide).

## Review permissions for advanced features

If you have enabled the Defender CSPM plan but features like agentless scanning, attack path analysis, or security explorer are not populating, check the permissions of the user who enabled the plan. Agentless scanning is enabled by default only if the Defender CSPM plan is enabled by a user with the **Subscription Owner** role [Protect your resources with Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan). If a user with lower privileges enabled the plan, the agentless scanner may not be active, leading to gaps in vulnerability detection and inventory [Protect your resources with Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan).

To fix this:

- Ensure the plan is enabled by a user with the **Subscription Owner** role [Protect your resources with Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan).
- Verify that the individual components of the Defender CSPM plan (e.g., agentless scanning, agentless discovery for Kubernetes) are toggled on in the **Settings** menu of the Defender plans page [Protect your resources with Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan).

## Verify the result

After making changes, allow a few minutes for the system to process. Refresh the **Overview** page in Defender for Cloud [Defender for Cloud Planning and Operations Guide](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-planning-and-operations-guide). Check the **Inventory** to confirm the resource is now listed. Review the **Recommendations** blade to see if security posture assessments are being generated for the resource. If the resource appears in the inventory and recommendations are being generated, the gap has been closed.

If the resource remains unprotected, re-check the workspace-level configuration for servers, as this is the most frequent point of failure [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan). For CSPM, verify the owner permissions and component settings [Protect your resources with Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan). For resource-level assignments, confirm the API or script execution was successful [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan).
