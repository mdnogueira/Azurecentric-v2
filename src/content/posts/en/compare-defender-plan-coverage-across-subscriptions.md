---
title: "Compare Defender plan coverage across subscriptions"
description: "Audit Defender plan coverage across subscriptions by verifying scope, permissions, and workspace linkage."
pubDate: 2024-04-18
category: governance
tags: ["defender-for-cloud", "cspm", "defender-for-servers", "azure-subscriptions", "log-analytics", "security-posture"]
translationKey: compare-defender-plan-coverage-across-subscriptions
draft: false
---

You have two subscriptions with Microsoft Defender for Cloud enabled. One shows a secure score populated with vulnerability findings; the other lists only basic recommendations. The difference is rarely the service itself, but a combination of which Defender plans are enabled, who enabled them, and how those plans interact with Log Analytics workspaces.

Defender for Cloud separates foundational posture management from paid workload protection. Foundational Cloud Security Posture Management (CSPM) is always active when you enable the service. Paid plans, such as Defender CSPM and Defender for Servers, add specific capabilities. Comparing coverage requires checking the plan status at the correct scope, confirming the permissions of the account that enabled them, and verifying how those plans interact with Log Analytics workspaces.

## Check the plan status at the subscription level

The first step is to identify which plans are active for each subscription. You do this through the Environment settings page.

1. Sign in to the Azure portal and open **Microsoft Defender for Cloud**.
2. Select **Environment settings** from the menu.
3. Select the subscription you want to audit.
4. Review the **Defender plans** page.

Here you will see the status of the Defender CSPM plan and the Defender for Servers plan. If Defender CSPM is toggled **On**, the subscription has access to features like agentless scanning, attack path analysis, and cloud security explorer. If it is **Off**, only the foundational capabilities are active.

Similarly, the Defender for Servers switch indicates whether threat detection and advanced defenses for Windows and Linux machines are enabled. If you toggle this **On**, you are prompted to select either Plan 1 or Plan 2. The source documentation notes that these plans offer different levels of protection, with Plan 2 including integrated Microsoft Defender for Endpoint, vulnerability assessment, and file integrity monitoring [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan).

## Verify who enabled the plans

A plan being enabled does not guarantee full functionality. The permissions of the account that enabled the plan matter, particularly for Defender CSPM.

To gain access to all features of the Defender CSPM plan, the plan must be enabled by a **Subscription Owner**. If a user with a lower level of authorization enables the plan, the agentless scanner will not be enabled by default due to a lack of required permissions. Consequently, attack path analysis and the cloud security explorer will not populate with vulnerability data because the agentless scanner is disabled [Protect your resources with Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan).

For Defender for Servers, the plan enables automatic provisioning of the data collection agent on supported virtual machines. However, enabling the plan at the subscription level does not extend that coverage to an attached Log Analytics workspace. You must enable Defender for Servers on the workspace level separately [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan).

## Check Log Analytics workspace linkage

Defender for Servers behaves differently at the workspace level compared to the subscription level. When you enable Defender for Servers on a subscription, it does not automatically cover machines connected to a Log Analytics workspace. You need to enable the plan on each workspace individually [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan).

This distinction is critical when comparing coverage. A subscription might show Defender for Servers as **On**, but if the associated workspace has it **Off**, the machines connected to that workspace will not have the advanced protections enabled. Furthermore, Defender for Servers on workspaces only supports Plan 2. When you enable it on a workspace, all connected machines will automatically have Plan 2 enabled, regardless of the subscription's settings [Deploy Defender for Servers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-servers-plan).

To verify this:

1. In **Environment settings**, select the Log Analytics workspace.
2. Check the **Defender plans** page for that workspace.
3. Ensure Defender for Servers is toggled **On**.

If the workspace is missing this plan, the machines connected to it will not benefit from the subscription-level configuration. This is a common source of confusion when auditing multiple subscriptions with shared workspaces or complex resource group structures.

## Compare the specific capabilities

Once you have confirmed the plan status and permissions, you can compare the actual capabilities available in each subscription.

**Defender CSPM** adds:
*   Agentless scanning for machines.
*   Agentless discovery for Kubernetes.
*   Agentless container vulnerability assessments.
*   Sensitive data discovery.
*   Permissions Management (CIEM).

**Defender for Servers** adds:
*   Threat detection and advanced defenses.
*   Integrated Microsoft Defender for Endpoint license.
*   Security baselines and OS-level assessments.
*   Vulnerability assessment scanning.
*   Adaptive application controls.
*   File integrity monitoring.

If one subscription has Defender CSPM enabled by a Subscription Owner and the other has it enabled by a Contributor, the first will show vulnerability data in the cloud security explorer, while the second will not. Similarly, if one subscription has Defender for Servers enabled at the workspace level and the other does not, the machines in the first subscription will have Plan 2 protections, while those in the second will only have foundational posture management.

## Verify the secure score

The secure score reflects the aggregated findings from the enabled plans. A higher score indicates lower identified risk, but it is only meaningful if the relevant plans are active and fully configured.

If you see a low secure score in a subscription where Defender CSPM is enabled, check whether the agentless scanner is actually running. If it is not, the score will not reflect the full set of vulnerabilities. Similarly, if Defender for Servers is enabled but not linked to the workspace, the score will not include the advanced threat protections.

Review the **Recommendations** page to see which findings are being generated. If you expect agentless scanning results but see none, the agentless scanner is likely disabled due to permission issues. If you expect Defender for Servers findings but see none, check the workspace linkage.

## Decision criteria for coverage comparison

When comparing coverage across subscriptions, use this checklist:

1.  **Subscription Plan Status**: Is Defender CSPM or Defender for Servers toggled **On**?
2.  **Enabler Permissions**: Was Defender CSPM enabled by a Subscription Owner? If not, agentless features are disabled.
3.  **Workspace Linkage**: Is Defender for Servers enabled on the Log Analytics workspace? If not, machines connected to that workspace are not protected by the plan.
4.  **Plan Version**: For Defender for Servers, is Plan 1 or Plan 2 selected? Plan 2 includes Defender for Endpoint integration.
5.  **Secure Score Validation**: Do the recommendations match the enabled plans? If not, investigate permission or linkage issues.

This approach ensures you are not just comparing the presence of a plan, but the actual functional coverage available to your workloads. It highlights where gaps exist due to permission constraints or configuration oversights, allowing you to take targeted action rather than assuming that enabling a plan is sufficient.

If you find a subscription where Defender CSPM is enabled but agentless scanning is not working, the next step is to verify the account permissions or re-enable the plan with a Subscription Owner account. If Defender for Servers is missing from a workspace, enable it there specifically.
