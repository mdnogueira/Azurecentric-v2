---
title: "Apply Azure Policy to Arc-enabled servers"
description: "Assign Azure Policy to Arc servers to audit or install the Azure Monitor Agent, using a Data Collection Rule and guest configuration."
pubDate: 2025-04-12
category: cloud
tags: ["azure-arc", "azure-policy", "azure-monitor", "ama", "security", "tier0"]
translationKey: apply-azure-policy-to-arc-enabled-servers
draft: false
---

You have an Azure Arc-enabled server and you need to ensure it is monitored. The most direct way to enforce this at scale is to use Azure Policy. This approach lets you audit compliance or automatically install the Azure Monitor Agent (AMA) on servers that are missing it.

The process splits into two distinct parts: preparing the monitoring infrastructure (the Data Collection Rule) and defining the policy that checks for, or installs, the agent. You cannot skip the first part; the policy needs a Data Collection Rule (DCR) resource ID to associate with the agent once installed.

## Prepare the Data Collection Rule

Azure Monitor requires a DCR to define what data is collected and where it goes. Before creating the policy, you must have a DCR ready.

1. Navigate to **Monitor** in the Azure portal, then select **Data Collection Rules** under Settings.
2. If you do not have a suitable DCR, create one. If you already have one, select it.
3. Open the DCR overview and switch to **JSON View**.
4. Copy the **Resource ID** of the DCR. You will need this string for the policy parameter.

This ID is the link between the policy assignment and the actual monitoring configuration. Without it, the policy cannot complete the association step during remediation.

## Create the Policy Definition

Azure Policy provides built-in initiative definitions for configuring machines to run the Azure Monitor Agent. These initiatives handle both the evaluation (is the agent installed?) and the remediation (install it if it is not).

You can assign one of the following pre-built initiatives:
*   **Configure Windows machines to run Azure Monitor Agent** (Definition ID: `9575b8b7-78ab-4281-b53b-d3c1ace2260b`)
*   **Configure Linux machines to run Azure Monitor Agent** (Definition ID: `118f04da-0375-44d1-84e3-0fd9e1849403`)

When you select **Assign** for one of these initiatives, you will be prompted for parameters. The critical parameter is the **Data Collection Rule Resource ID**. Paste the ID you copied in the previous step here. This ensures that any machine brought into compliance by the policy is automatically linked to your specific data collection configuration.

## Assign the Policy

1. Go to **Policy** in the Azure portal and select **Assignments**.
2. Click **Assign Policy**.
3. **Scope**: Select the management group, subscription, or resource group that contains your Arc-enabled servers. The policy will evaluate all resources in this scope that match the Arc-enabled server resource type.
4. **Policy Definition**: Search for the initiative ID mentioned above or select it from the list of built-in definitions.
5. **Parameters**: Enter the DCR Resource ID.
6. **Remediation**: Enable the **Create remediation task** option. This is essential if you want the policy to automatically install the agent on non-compliant servers. Without this, the policy will only report non-compliance.
7. Review and create the assignment.

## Verify Compliance

Once the assignment is active, the policy evaluator will begin checking your Arc-enabled servers.

1. In the Azure Policy blade, select **Compliance**.
2. Locate your new assignment. It may take some time for the initial evaluation to complete, especially if you have many servers.
3. Check the **Non-compliant resources** list. These are servers that do not have the AMA installed or are not associated with the specified DCR.
4. If you enabled the remediation task, the policy will trigger a background task to install the agent on these servers. You can monitor the progress of this task in the **Remediation tasks** blade.

## Security Considerations

Azure Arc-enabled servers rely on the Azure Connected Machine agent. This agent runs several services, including the extension manager and guest configuration service. By default, these services run with high privileges (Local System on Windows, root on Linux) to allow them to install software and modify system settings.

If you are managing Tier 0 assets, such as domain controllers, you should restrict the agent's capabilities. You can disable unused features locally on the server using the `azcmagent` command-line interface. For example, to disable remote access and guest configuration while allowing only the Azure Monitor Agent and Microsoft Defender for Servers extensions, you would run:

```
azcmagent config set incomingconnections.enabled false
azcmagent config set guestconfiguration.enabled false
azcmagent config set extensions.allowlist "Microsoft.Azure.Monitor/AzureMonitorWindowsAgent,Microsoft.Azure.AzureDefenderForServers/MDE.Windows"
```

This local lockdown prevents any cloud-based policy or user from installing unauthorized extensions, even if they have permissions in Azure. It is a defense-in-depth measure that complements the Azure Policy assignment.

## Cleanup

To remove the policy assignment, go to **Policy** > **Assignments**, locate the assignment, and select **Delete**. If you created a remediation task, you may also need to manually remove the remediation task from the **Remediation tasks** blade if it is still running or has completed. Remember that deleting the policy assignment does not uninstall the Azure Monitor Agent from the servers; it only stops the enforcement of the policy.

To verify that the agent is installed, you can check the **Extensions** blade on the Arc-enabled server resource in the Azure portal. The presence of the `AzureMonitorWindowsAgent` or `AzureMonitorLinuxAgent` extension indicates successful installation.

diagram:
  title: Azure Policy Assignment Flow for Arc Servers
  nodes:
    - "1. Define DCR in Azure Monitor"
    - "2. Create Policy Assignment (Scope + DCR ID)"
    - "3. Policy Evaluates Arc Servers"
    - "4. Non-Compliant? Trigger Remediation"
    - "5. Agent Installed & Linked to DCR"
    - "6. Server Becomes Compliant"
claims:
  - claim: "Azure Policy can audit or automatically install the Azure Monitor Agent on Arc-enabled servers."
    source_id: "S2"
    evidence_span: "Using Azure Policy ensures that Azure Monitor is running on your selected Arc-enabled servers, and automatically install the Azure Monitor Agent on newly added Arc resources."
  - claim: "A Data Collection Rule (DCR) resource ID is required for the policy to associate with the agent."
    source_id: "S2"
    evidence_span: "In order for Azure Monitor to work on a machine, it needs to be associated with a Data Collection Rule. Therefore, you'll need to include the resource ID of the DCR when you create your Policy definition."
  - claim: "Built-in policy initiatives exist for configuring Windows and Linux machines to run the Azure Monitor Agent."
    source_id: "S2"
    evidence_span: "Select one of the following policy definition templates... These templates are used to create a policy to configure machines to run Azure Monitor Agent and associate those machines to a DCR."
  - claim: "Local agent security controls can restrict extensions and services on Tier 0 assets."
    source_id: "S3"
    evidence_span: "To account for this, the Azure Connected Machine agent also has security controls of its own that take precedence over any restrictions set in the cloud."
  - claim: "The Azure Connected Machine agent runs as Local System on Windows and root on Linux."
    source_id: "S3"
    evidence_span: "The extension manager runs as Local System on Windows and root on Linux because the software it installs may require full system access."
review_questions:
  - "How does the policy evaluation frequency impact the time to remediation for new Arc-enabled servers?"
  - "What are the specific RBAC permissions required for the remediation task to install extensions on Arc-enabled servers?"
  - "Can a single DCR be associated with multiple policy assignments for different scopes?"


References for Apply Azure Policy to Arc-enabled servers: [Tutorial - New policy assignment with Azure portal](https://learn.microsoft.com/en-us/azure/azure-arc/servers/learn/tutorial-assign-policy-portal), [How to deploy and configure Azure Monitor Agent using Azure Policy](https://learn.microsoft.com/en-us/azure/azure-arc/servers/deploy-ama-policy), [Security overview](https://learn.microsoft.com/en-us/azure/azure-arc/servers/security-overview).
