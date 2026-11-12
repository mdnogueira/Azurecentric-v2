---
title: "Foundational CSPM or Defender CSPM: make the plan decision"
description: "Match CSPM capabilities to resources, permissions and billing. Build an evidence-led pilot while separating Azure plan settings from the Defender portal preview."
pubDate: "2026-11-18T11:00:00-05:00"
language: "en-CA"
category: "cloud-security"
tags: ["defender-for-cloud", "cloud-security", "cspm", "security-posture"]
translationKey: "defender-for-cloud-series-03-foundational-or-defender-cspm"
draft: false
---

*Episode 3 of the series Cloud Security – Microsoft Defender*

[View the series](/series/cloud-security-microsoft-defender)

Choose a posture-management plan by the decisions your team needs to make and the resources it needs to assess. A paid plan can add useful context, but a licence does not establish that the required component is collecting data, that the resource is supported or that someone will act on the finding.

In Episode 2, we turned a recommendation into a task with an owner and verification evidence. This week, **Orders Demo**, our hypothetical application, needs a plan decision. Its Azure subscription contains a web application, a database, storage and virtual machines. These are illustrative requirements, not an inventory inspected in a tenant.

![A suggested CSPM plan decision: establish current coverage, match required capabilities, check resource support and permissions, then agree scope, cost and evidence for a pilot.](/images/series/defender-for-cloud/episode-03-plan-decision.svg)

## Start with the question the team cannot yet answer

The team can already discuss configuration recommendations. Its unresolved question is which combination of exposure, permissions and vulnerabilities deserves investigation first. That is a more useful starting point than asking whether the paid plan has more features.

Microsoft's [CSPM plan comparison](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-cloud-security-posture-management) distinguishes free Foundational CSPM from paid Defender CSPM. For Azure, the shared capabilities include inventory, security recommendations and secure score. The paid column adds capabilities such as attack path analysis, security explorer and risk prioritization. The published tables differ by cloud and feature; an Azure entry is not evidence of identical AWS or GCP support.

Write down the missing decision, the assets it concerns and the evidence that would help. For Orders Demo, the proposed requirement is a supported path from an externally exposed asset towards sensitive application data. The team still has to determine whether the relevant resources and relationships are represented. A plan name cannot answer that for them.

| Requirement to assess | Candidate capability | Evidence needed before choosing |
| --- | --- | --- |
| Review known configuration concerns | Foundational recommendations | Relevant resources appear and findings have accountable owners. |
| Investigate connected exposure | [Defender CSPM attack path analysis](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-attack-path) | Supported assets and required context are actually collected. |
| Ask questions across the environment | Defender CSPM security explorer | The intended inventory and relationships are available to the reviewer. |
| Prioritize work using contextual risk | [Defender CSPM risk prioritization](https://learn.microsoft.com/en-us/azure/defender-for-cloud/risk-prioritization) | The context helps explain a specific remediation decision. |

This worksheet is a suggested decision aid. It is not a claim that the example has produced an attack path or demonstrated a reduction in risk.

## Inspect coverage, components and access separately

Use the current [cloud support matrix](https://learn.microsoft.com/en-us/azure/defender-for-cloud/support-matrix-defender-for-cloud) alongside each capability's own requirements. Commercial, government and other cloud environments can differ. Record the actual cloud, region, resource type and integration. An unsupported row is a gap to resolve, rather than a reason to label the whole application covered.

Microsoft's [enablement guidance](https://learn.microsoft.com/en-us/azure/defender-for-cloud/tutorial-enable-cspm-plan) separates the plan from its components. Agentless scanning, for example, needs the Subscription Owner to enable the plan for full functionality; otherwise vulnerability context can be absent from attack paths and security explorer. Inventory visibility and an enabled plan therefore answer different questions from successful collection.

For an Azure-managed subscription, the documented configuration route is Microsoft Defender for Cloud → **Environment settings** → the relevant subscription → **Defender plans**. Review the plan's settings and the coverage workbook before proposing a change. Selecting **On** and saving enables a paid plan; it is not a read-only inspection step. This article does not instruct you to enable it in production simply to complete the worksheet.

The [permissions reference](https://learn.microsoft.com/en-us/azure/defender-for-cloud/permissions) distinguishes viewing from changing plans and remediating resources. Security Reader provides read-only security visibility. Subscription-level Security Admin, Contributor or Owner can enable plans, while Owner is needed for all capabilities. A reviewer and a change implementer need not be the same person. Request the permission needed for the actual task, not broad access for everyone attending the review.

## Treat the portal and billing model as part of the decision

The [Defender portal plan-management experience](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-portal/manage-plans-defender-portal) is **preview** at preparation time. It supports Azure commercial environments and has its own role requirements. Transition can move plan enablement to Defender workload unit (DWU) billing, and resource-level plan configurations are not preserved. Global enablement also affects connected and future environments. Do not treat that transfer as a cosmetic navigation change or combine it with a small pilot without reviewing its scope.

For Orders Demo, the proposed pilot stays within a deliberately selected Azure-managed subscription. Moving plan management is a separate decision. If the environment already uses the preview experience, record that fact and evaluate its current permissions, coverage and billing rules instead of applying the Azure-managed procedure blindly.

Use the [Defender for Cloud pricing page](https://azure.microsoft.com/en-us/pricing/details/defender-for-cloud/) and the applicable estimate for the selected offer, currency and billing model. Record which resources and optional components are chargeable, existing plan overlap, the trial conditions if relevant and the expected position after a trial ends. A small application does not necessarily mean a small billable subscription. Infrastructure used for a pilot may also have its own charges. This comparison supplies no fixed price or promised saving.

## Make the pilot produce a decision record

Before any authorised enablement, agree an owner, scope, cost boundary and stopping condition. Retain the previous configuration and the proposed return procedure. If an automatic policy or broader configuration can re-enable a plan, account for that in the return procedure rather than assuming one toggle ends the change.

Then define observable questions. Can the reviewer find the selected assets? Are the expected components enabled and their prerequisites satisfied? Does the context explain why one recommendation should take priority? Can the application owner identify a realistic change and the evidence needed to verify it? If no path appears, investigate collection, support and scope before interpreting the result as an absence of exposure.

Keep a compact record:

| Decision field | Suggested entry for the team to complete |
| --- | --- |
| Scope and baseline | Subscription, cloud, resource inventory, current plans, components and capture date. |
| Requirement and gap | Operational question, supported capability and any missing integration or permission. |
| Commercial boundary | Estimate, billing model, trial/end conditions and the person reviewing charges. |
| Outcome | Evidence collected, unresolved gaps, owner and conditional expand/hold decision. |

No pilot, tenant configuration or cost measurement was performed for this article. The proposed exercise is to prepare this record with the application and platform owners before authorising changes. Recheck the [release notes](https://learn.microsoft.com/en-us/azure/defender-for-cloud/release-notes) and feature documentation at implementation time; a table checked for this article is not a guarantee of future availability.

Foundational CSPM may meet the team's present requirement. Defender CSPM may justify a controlled pilot where a supported advanced capability answers a real operational question. Either decision is stronger when it names the gap, the owner and the evidence, rather than relying on a larger feature list.

Cheers,  
**Marcos Nogueira**  
[Connect with me on LinkedIn](https://www.linkedin.com/in/mdnoga/)
