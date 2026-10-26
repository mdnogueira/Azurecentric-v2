---
title: "Assign owners to cloud security recommendations"
description: "Assign owners to security recommendations using Defender for Cloud governance rules to drive accountability and track remediation SLAs."
pubDate: 2025-12-17
category: cloud-security
tags: ["defender-for-cloud", "governance", "remediation"]
translationKey: assign-owners-to-cloud-security-recommendations
draft: false
---

Security recommendations pile up quickly. A dashboard showing a high secure score is useful for reporting, but it does not guarantee that the underlying misconfigurations are resolved. To move from visibility to action, you need to assign owners and deadlines to specific findings.

Microsoft Defender for Cloud provides governance rules for this purpose. These rules allow you to define who is responsible for remediating specific security findings and set a timeframe for that remediation. This creates accountability and ensures that critical issues do not sit in a backlog indefinitely.

## Prerequisites and permissions

Before defining governance rules, ensure you have the necessary permissions. The documentation specifies that you require **Contributor**, **Security Admin**, or **Owner** permissions on the Azure subscriptions where the rules will apply [Drive remediation of recommendations with governance rules](https://learn.microsoft.com/en-us/azure/defender-for-cloud/governance-rules). 

Note that having a role at the control plane does not automatically grant data-plane rights, but for the purpose of assigning governance rules and viewing recommendations, these roles are sufficient. You do not need to enable the Defender Cloud Security Posture Management (CSPM) plan to use governance rules, although that plan provides the underlying security posture assessments that generate the recommendations.

## How governance rules work

Governance rules operate on a priority system. You can define multiple rules for the same subscription, but the rule with the lowest priority value (highest priority) takes precedence. This is important when you have overlapping conditions, such as one rule for all high-severity recommendations and another for specific critical findings.

The rule assigns an owner and a due date based on when the recommendation is first identified by the rule. The due date is calculated as a fixed timeframe from that identification date. The available timeframes are 7, 14, 30, or 90 days [Drive remediation of recommendations with governance rules](https://learn.microsoft.com/en-us/azure/defender-for-cloud/governance-rules). For example, if a rule identifies a resource on March 1 with a 14-day timeframe, the due date is March 15.

You can assign owners in two ways:
1. **By email address**: You specify a direct email address for the owner.
2. **By resource tag**: You specify a tag key, and the rule reads the owner's name from the tag value on the resource, resource group, or subscription [Drive remediation of recommendations with governance rules](https://learn.microsoft.com/en-us/azure/defender-for-cloud/governance-rules). If the tag is not found, the owner is shown as unspecified.

## Defining a governance rule

To assign owners, navigate to **Microsoft Defender for Cloud** > **Environment settings** > **Governance rules** in the Azure portal. Select **Create governance rule** to start the configuration [Drive remediation of recommendations with governance rules](https://learn.microsoft.com/en-us/azure/defender-for-cloud/governance-rules).

### 1. Scope and Priority

Specify the scope for the rule, such as a specific subscription or management group. Rules at a management group scope take effect before rules at the subscription scope [Drive remediation of recommendations with governance rules](https://learn.microsoft.com/en-us/azure/defender-for-cloud/governance-rules). Set a priority level between 1 and 1000, where 1 is the highest priority.

### 2. Conditions

Define which recommendations the rule applies to. You can filter by:
- **Severity**: Apply the rule to all recommendations of a certain severity level (e.g., High, Critical).
- **Specific recommendations**: Select individual built-in or custom recommendations. This is useful for targeting specific issues, such as "Storage accounts should restrict network access" [Security policies in Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/security-policy-concept).

### 3. Owner Assignment

Choose how to assign the owner. If you use resource tags, ensure the tag key is consistent across your environment. If you use email addresses, enter the recipient directly. This step is crucial for ensuring that the right person receives the notification and is held accountable.

### 4. Remediation Timeframe

Set the remediation timeframe (7, 14, 30, or 90 days) [Drive remediation of recommendations with governance rules](https://learn.microsoft.com/en-us/azure/defender-for-cloud/governance-rules). You can also choose to apply a grace period for recommendations derived from the Microsoft Cloud Security Benchmark (MCSB). This grace period prevents the resources from affecting your secure score until the due date is passed, giving you time to remediate without penalising your score immediately.

### 5. Notifications

By default, weekly email notifications are sent to the resource owners and their managers (if found in Microsoft Entra ID) listing on-time and overdue tasks [Drive remediation of recommendations with governance rules](https://learn.microsoft.com/en-us/azure/defender-for-cloud/governance-rules). You can disable these notifications if you prefer to use other channels, such as Microsoft Teams or ServiceNow, for tracking.

## Verification and next steps

After creating the rule, verify its effectiveness by reviewing the **Governance report**. Navigate to **Environment settings** > **Governance rules** > **Governance report** to see the status of recommendations by rule and owner [Drive remediation of recommendations with governance rules](https://learn.microsoft.com/en-us/azure/defender-for-cloud/governance-rules). The report shows how many recommendations are completed, on time, overdue, or unassigned.

If you find that recommendations are still unassigned, check the rule priority and scope. Ensure that the rule conditions match the recommendations you expect to see. Also, verify that the owner assignment method (tag or email) is correctly configured.

Governance rules are a powerful tool for driving remediation, but they are not a substitute for fixing the underlying issues. Use the report to identify trends and address systemic problems, such as a lack of training or outdated policies. By assigning owners and tracking progress, you transform security recommendations from a list of tasks into a managed workflow.

For more detailed information on creating custom recommendations or managing security standards, refer to the Defender for Cloud documentation [Security policies in Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/security-policy-concept).
