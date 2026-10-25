---
title: "Build a security review into a new Azure workload"
description: "Structure a security review for a new Azure workload by separating posture management from workload protection and verifying permissions."
pubDate: 2026-07-22
category: cloud-security
tags: ["defender-for-cloud", "cloud-security", "cspm", "security-posture", "workload-protection"]
translationKey: build-a-security-review-into-a-new-azure-workload
draft: false
---

You are deploying a new workload. The immediate question is not whether to enable security, but how to structure the review so the findings are actionable rather than just a list of alerts. A useful security review separates the configuration of the resource from the protection of the workload, and it distinguishes between the free posture checks and the paid protections that require specific permissions.

Microsoft Defender for Cloud provides the framework for this review. It combines cloud security posture management (CSPM) with cloud workload protection (CWP). The CSPM layer assesses your resources against security standards, while the CWP layer provides runtime protection for specific workloads like servers, databases, and containers [What is Microsoft Defender for Cloud?](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction).

## Establish the scope and permissions

The first step is to ensure you have the correct view. Defender for Cloud is enabled at the subscription level. When you enable it, you automatically get the **Foundational CSPM** capabilities, which are free and include security recommendations, asset inventory, and secure score [Cloud Security Posture Management (CSPM)](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management).

However, if you need the advanced features such as attack path analysis, agentless vulnerability scanning, or permissions management, you must enable the **Defender CSPM** plan. This is a paid plan. Crucially, enabling this plan requires **Subscription Owner** permissions. If you enable it with a lower level of authorization, the agentless scanner will not be enabled by default, and features like attack path analysis will not populate with vulnerabilities [Protect your resources with Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan).

Before you begin the review, confirm:
1. The subscription ID where the workload resides.
2. That you have Owner permissions if you intend to enable the paid Defender CSPM plan for advanced posture features.
3. That Defender for Cloud is already enabled on the subscription.

## Review the configuration posture

Once the scope is set, open Microsoft Defender for Cloud in the Azure portal. Navigate to **Environment settings** and select the relevant subscription. Here, you can toggle the Defender CSPM plan to **On** if you require the advanced features [Protect your resources with Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan).

The foundational posture review starts immediately. Defender for Cloud continually assesses your resources against the **Microsoft Cloud Security Benchmark (MCSB)**. This standard provides recommendations for Azure, AWS, and GCP resources [Cloud Security Posture Management (CSPM)](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management).

For your new workload, check the **Security recommendations** blade. These recommendations are generated based on the resource type and its configuration. For example, if you are deploying a virtual machine, you will see recommendations related to network security groups, disk encryption, and identity management. If you are deploying a storage account, you will see recommendations related to access keys and private endpoints.

The **Secure score** provides an aggregated view of these recommendations. A higher score indicates a lower identified risk level [Cloud Security Posture Management (CSPM)](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management). However, do not treat the score as a binary pass/fail. Use it to track progress. If the score is low, it is likely because the workload is new and has not yet been hardened against the benchmark standards.

## Enable workload protection

Posture management tells you how your resource is configured. Workload protection tells you if it is being attacked. These are separate decisions.

If your workload is a virtual machine, you need to enable **Defender for Servers**. This plan provides extended protection with just-in-time network access, file integrity monitoring, and vulnerability assessment [What is Microsoft Defender for Cloud?](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction). Note that agentless vulnerability scanning is available only with the Defender CSPM plan, not the foundational tier [Cloud Security Posture Management (CSPM)](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management).

If your workload is a database, you need to enable the specific Defender plan for that database type, such as **Defender for Azure SQL Databases** or **Defender for Open-source relational databases** [What is Microsoft Defender for Cloud?](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction).

If your workload is a container, you need to enable **Defender for Containers**. This plan provides environment hardening, vulnerability assessments for images, and runtime protection [What is Microsoft Defender for Cloud?](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction).

These protections are not automatic. You must explicitly enable them in the **Defender plans** page within Environment settings. Each plan has its own prerequisites and billing model. Review the [pricing page](https://azure.microsoft.com/pricing/details/defender-for-cloud/) for the specific costs associated with the workloads you are protecting [Cloud Security Posture Management (CSPM)](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management).

## Verify the review

A security review is not complete until you have verified that the findings are visible and the protections are active.

1. **Check the Asset Inventory**: Ensure your new workload appears in the inventory. If it does not, the subscription filter may be incorrect, or the resource may not have been fully provisioned [Cloud Security Posture Management (CSPM)](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management).
2. **Review Security Recommendations**: Confirm that the recommendations relevant to your workload type are present. If you have enabled the Defender CSPM plan, check for advanced recommendations such as attack paths or permissions issues [Protect your resources with Defender CSPM](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan).
3. **Verify Protection Status**: For each workload protection plan you enabled, check the status in the respective blade (e.g., Servers, Databases, Containers). Ensure that the protection status is **On** and that there are no errors reported.
4. **Test Alert Delivery**: If you have configured action groups for alert notifications, send a test alert to verify that the notifications are being delivered correctly. Note that this test verifies notification delivery, not the alert's actual signal, scope, and condition [What is Microsoft Defender for Cloud?](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction).

## Next steps

Use the findings from this review to prioritize remediation. Focus on high-severity recommendations first. Assign owners to each finding and track progress through the secure score. If you are using the Defender CSPM plan, leverage the **Governance** features to drive remediation at scale by assigning tasks to resource owners [What is Microsoft Defender for Cloud?](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction).

For a new workload, the goal is not to achieve a perfect score immediately, but to establish a baseline and a process for continuous improvement. The security posture of your workload will evolve as you add features and integrate with other services. Regular reviews will ensure that the security configuration keeps pace with the workload's complexity.
