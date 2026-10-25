---
title: "Build a recovery runbook with an explicit validation step"
description: "Construct a recovery runbook that defines scope, justifies action, and validates outcomes using service-specific reliability guides."
pubDate: 2025-04-28
category: well-architected
tags: ["azure-automation", "well-architected-framework"]
translationKey: build-a-recovery-runbook-with-an-explicit-validation-step
draft: false
---

A runbook that simply says "fail over to the secondary region" is not a plan. It is a wish. When an incident occurs, cognitive load spikes, and vague instructions lead to rushed decisions that often make things worse. The first thing to check is not the code, but the clarity of the steps you have written.

Azure reliability guidance explicitly warns against taking actions without thinking them through. Rushed decisions can result in data loss or extended downtime, especially if recent changes were not replicated. A useful runbook must therefore include explicit validation steps. You must verify that the system is healthy before you declare the incident resolved. Without verification, you are operating on hope, not evidence.

## Define the scope and the trigger

Before writing a single step, you must define the scope of the failure and the trigger for the runbook. Azure distinguishes between availability zone incidents, regional incidents, and service-specific issues. Your runbook should not attempt to address every possible failure. It should address the specific scenario it was designed for.

Start by identifying the scope. Is the issue limited to a single availability zone, or does it affect the entire region? If the issue is zonal, and you are using zone-redundant resources, you might not need to do anything. The guidance notes that zone-redundant services are unlikely to be affected, and you shouldn't need to take remediation action. In this case, your runbook might simply be: "Monitor the situation. If performance degrades, scale out."

If the issue is regional, or if you are using zonal services pinned to the affected zone, you will need to fail over. Define the trigger clearly. Is it an automated alert from Azure Service Health? A manual decision based on the estimated resolution time? The guidance suggests considering the estimated resolution time. If your recovery procedures take a significant period to operate, consider whether the issue is expected to be resolved by the time they are completed. Do not trigger a failover if the service will be back online in ten minutes, but your failover will take an hour.

## Write the steps with explicit validation

A runbook is a sequence of actions. Each action must have a clear outcome. But more importantly, each major phase must have a validation step. Validation is not an afterthought. It is the core of the runbook.

Consider a scenario where you are failing over a database from a primary region to a secondary region. Your runbook might look like this:

1. **Verify the incident scope.** Check Azure Service Health for the incident status. Confirm the affected region and the impacted services. Record the incident ID.
2. **Assess business impact.** Determine the estimated resolution time from Microsoft. Compare this with your recovery time objective (RTO). Decide whether to proceed with failover.
3. **Initiate failover.** Execute the failover procedure. This might involve promoting a secondary database replica or triggering a site recovery job. Record the start time.
4. **Validate data consistency.** This is the critical step. Do not assume the failover was successful. Verify that the secondary database is accepting writes. Check that the application can connect to the new primary. Run a small set of test queries to confirm data integrity.
5. **Redirect traffic.** Update DNS records or load balancer configurations to point to the new primary. Verify that traffic is flowing to the new region.
6. **Monitor the new primary.** Watch for errors, latency, or performance degradation. Ensure the new primary is handling the load.

Notice the validation steps. Step 4 is not just "check the database." It is "verify that the secondary database is accepting writes" and "run a small set of test queries." This is evidence that the system is healthy. Without this step, you might redirect traffic to a database that is still in read-only mode, causing immediate failure.

## Handle the failback with the same rigour

Failback is often more complex than failover. The previous primary instance might be in an unknown state. Data synchronization issues might require manual intervention. Your runbook must address these risks.

Include a validation step for failback as well. Before you redirect traffic back to the original region, verify that the original primary has been remediated and is in a known good state. Check that data has been synchronized from the secondary to the primary. Run the same set of test queries you used during the failover. Only then should you consider redirecting traffic back.

The guidance notes that failback can involve extra downtime because of reconfigurations required to restore data consistency. Plan for this. Communicate with your users. Negotiate a suitable time to make the changes. Do not assume that the system will automatically return to normal.

## Test the runbook

A runbook that has never been tested is not a runbook. It is a document. Azure requires every service to have a detailed recovery plan and to test that plan as if the service has failed. You should do the same.

Test your runbook in a non-production environment. Simulate the failure. Execute the steps. Validate the outcomes. Identify any gaps or ambiguities. Update the runbook based on your findings. Test it again.

This process ensures that when a real incident occurs, you are not reading the runbook for the first time. You are executing a plan you have already validated. This reduces cognitive load, minimizes errors, and increases the likelihood of a successful recovery.

## Verify the runbook's effectiveness

After an incident, review the runbook. Did it work? Were the validation steps clear? Did you have all the information you needed? Use the Post Incident Review from Azure Service Health to understand what happened. Compare it with your runbook. Identify any improvements.

This is not about blaming individuals. It is about improving the process. A runbook is a living document. It should evolve with your system. Keep it simple. Keep it clear. And always, always include a validation step.

tags: [reliability, disaster-recovery, runbooks, business-continuity, azure-service-health]
diagram:
  title: Runbook Validation Flow
  nodes:
    - Incident Detected
    - Scope Verified
    - Failover Executed
    - Data Validated
    - Traffic Redirected
    - System Confirmed Healthy
claims:
  - claim: Vague runbooks lead to rushed decisions that can worsen incidents.
    source_id: S1
    evidence_span: "Don't take any actions without thinking them through. Rushed decisions can sometimes make things worse."
  - claim: Zone-redundant services may not require remediation during a zonal outage.
    source_id: S1
    evidence_span: "Zone-redundant services are unlikely to be affected. You shouldn't need to take any remediation action for zone-redundant resources."
  - claim: Validation steps are essential to confirm system health after failover.
    source_id: S3
    evidence_span: "Failback can also be more complex than failover... Data synchronization issues... require manual intervention."
  - claim: Runbooks must be tested to ensure they work as expected.
    source_id: S2
    evidence_span: "Azure requires every service to have a detailed recovery plan and to test that plan as if the service has failed."
  - claim: Estimated resolution time should influence the decision to fail over.
    source_id: S1
    evidence_span: "If your recovery procedures take a significant period of time to operate, consider whether the issue is expected to be resolved by the time they're completed."
review_questions:
  - How do you validate data consistency across different Azure services during a failover?
  - What specific metrics should be used to confirm system health in a validation step?
  - How do you handle failback when the original primary instance is in an unknown state?
  - What is the specific RTO/RPO for the service being protected?
  - How do you justify the cost and risk of a failover against the estimated resolution time?

References for Build a recovery runbook with an explicit validation step: [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response), [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program), [Failover and failback](https://learn.microsoft.com/en-us/azure/reliability/concept-failover-failback).
