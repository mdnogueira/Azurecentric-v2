---
title: "Record a recovery decision before an infrastructure change"
description: "Establish a pre-defined recovery decision record to prevent rushed actions during infrastructure changes or incidents."
pubDate: 2026-01-22
category: well-architected
tags: ["well-architected-framework", "azure-service-health", "reliability", "disaster-recovery"]
translationKey: record-a-recovery-decision-before-an-infrastructure-change
draft: false
---

You are planning an infrastructure change. The maintenance window is open. The risk register is signed off. The deployment pipeline is green. Then a notification appears in Azure Service Health: a regional outage is affecting a dependency you didn't expect, or a zone failure is impacting a resource you assumed was zone-redundant.

In that moment, you face a choice: proceed with the change, or initiate a recovery plan. The most critical step is not the technical execution of either option, but having a pre-defined decision record ready. Microsoft's reliability guidance warns that "Rushed decisions can sometimes make things worse" [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). A pre-recorded decision removes the cognitive load of choosing a path while an incident is unfolding.

## Why pre-record the decision?

A recovery decision is a commitment to a specific course of action under uncertainty. It serves to prevent the kind of rushed actions that Microsoft explicitly advises against. When an incident occurs, the "actual impact" on your production resources is often unclear initially [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). Without a pre-defined plan, you might be tempted to scale out, fail over, or rollback simultaneously. These actions can conflict or exacerbate the issue.

The reliability guidance distinguishes between business continuity (keeping operations running) and disaster recovery (restoring the solution) [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). Your pre-recorded decision should explicitly state which one you are prioritising. If the incident is limited to a single availability zone and your resources are zone-redundant, the decision might be "No action required." If the incident is region-wide, the decision might be "Initiate failover to Region B."

## How to pre-record the decision

You do not need a complex tool to record this. A simple, structured note in your incident management system or change request log is sufficient. The note should include:

1. **The Trigger:** What event prompts this decision? (e.g., "Azure Service Health alert for Region X")
2. **The Scope:** Which resources are affected? (e.g., "Primary database in Zone 1")
3. **The Decision:** What are you doing? (e.g., "Proceed with planned maintenance" or "Failover to secondary region")
4. **The Justification:** Why this decision? (e.g., "Secondary is warm standby; Customer-defined RTO is 15 minutes")
5. **The Owner:** Who is authorised to make this call?

This structure forces you to articulate the trade-offs. For instance, if you choose to proceed with maintenance during an incident, you must acknowledge the risk. If you choose to failover, you must acknowledge the potential for data loss if replication is asynchronous [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).

## Example: Pre-recording a Failover Decision

Consider a scenario where you are deploying a new version of an application that depends on Azure SQL Database. You have pre-defined a decision record for a regional outage in the primary region. Your database is configured with geo-replication to a secondary region.

Your pre-recorded decision might look like this:

| Field | Value |
|---|---|
| Trigger | Regional outage in Primary Region (Azure Service Health) |
| Scope | Application Tier, Primary SQL Database |
| Decision | Initiate manual failover to Secondary Region |
| Justification | Primary region is unavailable; Secondary is warm standby; Customer-defined RTO is 30 minutes |
| Owner | Platform Engineering Lead |

This note is not a guarantee of success. It is a record of your intent. It ensures that if the failover fails, you can quickly revert to the original plan or escalate, rather than making ad-hoc decisions in the heat of the moment.

## Verification and Next Steps

Once the decision is pre-recorded, execute it when the trigger occurs. If you are failing over, verify that the secondary region is healthy and that DNS records are updated. If you are proceeding with maintenance, monitor the impact closely.

After the incident is resolved, review the decision. Did the pre-recorded plan match the outcome? Were there unexpected dependencies? This review is part of the post-incident process described in Azure's reliability guidance [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). It helps you refine your disaster recovery plan for future incidents.

The goal is not to predict every incident, but to be prepared to respond decisively. By pre-recording your recovery decision, you reduce the cognitive load during a crisis and increase the likelihood of a successful outcome.
