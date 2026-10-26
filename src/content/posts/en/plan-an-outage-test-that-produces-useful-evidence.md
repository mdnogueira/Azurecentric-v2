---
title: "Plan an outage test that produces useful evidence"
description: "Plan controlled outage tests using Chaos Studio to verify recovery logic, distinguishing control plane resilience from workload configuration."
pubDate: 2025-02-28
category: well-architected
tags: ["well-architected-framework", "business-continuity", "chaos-studio", "disaster-recovery", "availability-zones"]
translationKey: plan-an-outage-test-that-produces-useful-evidence
draft: false
---

When an Azure service disruption occurs, the immediate question is rarely "what happened?" It is "does this affect my workload?" and "do I need to act?" If you have not tested your recovery procedures before the incident, you are likely to make rushed decisions that can worsen the situation. A practical way to build confidence is to run controlled outage tests that produce evidence your team can review.

The goal is not to prove that Azure is always available, but to verify that your specific deployment behaves as expected when a component fails. This requires separating Microsoft's infrastructure resilience from your application's recovery logic.

## Distinguish infrastructure resilience from recovery plans

Azure manages the baseline infrastructure. According to the business continuity management documentation, Microsoft ensures that platform services are available and tests them in "canary environments" that simulate total region failures by literally turning off clusters and power units [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program). However, this does not mean your workload is automatically protected.

The shared responsibility model dictates that you are responsible for configuring recovery and replication for many offerings [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program). Azure does not automatically replicate virtual machines or fall back from a failed region to a cross-replicated region [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program). Therefore, an outage test must focus on your side of that boundary.

Chaos Studio is the primary tool for injecting faults into Azure resources. It is important to note that Chaos Studio's *control plane* is zone-redundant. In supported regions such as Central US, East US, UK South, and Sweden Central, Chaos Studio resources are automatically duplicated or distributed across different zones [Reliability in Azure Chaos Studio](https://learn.microsoft.com/en-us/azure/reliability/reliability-chaos-studio). This means the tool itself remains available even if a zone fails, allowing you to monitor and manage experiments. However, this resilience does not extend to your target workloads. You must configure your resources (e.g., Virtual Machines, App Services) for zone redundancy or multi-region replication yourself.

Chaos Studio operates within a single region and does not support service-enabled cross-region failover [Reliability in Azure Chaos Studio](https://learn.microsoft.com/en-us/azure/reliability/reliability-chaos-studio). This is not a limitation of the tool's design, but a reflection of the fact that it does not manage cross-region replication or failover logic for services. Such actions require service-specific configurations and often manual or scripted intervention.

## Define the scope and hypothesis

Before running any experiment, define what you are testing. A common mistake is to run a broad test without a clear hypothesis. Instead, structure the test around a specific recovery action.

For example, if you have a zone-redundant virtual machine scale set, you might hypothesise that the application remains available if one zone fails. Chaos Studio can simulate this by stopping instances in a specific availability zone. The expected evidence is that the remaining instances in other zones continue to serve traffic.

If you are testing cross-region disaster recovery, Chaos Studio cannot simulate the region failure for you. In this case, the test becomes a manual or scripted verification of your failover process. You would verify that your traffic manager or DNS records correctly redirect traffic to the secondary region, and that the secondary region has the necessary data. The evidence here is the successful completion of the failover steps and the validation of data consistency.

## Configure the experiment

Chaos Studio experiments are defined by their scope, actions, and duration. When creating an experiment, you must specify the *resources* to target, not the availability zone directly. Ensure you have the necessary permissions, typically Contributor or Owner on the target resources, to allow Chaos Studio to inject faults.

For a zone-level test, you would select specific resources (e.g., Virtual Machines) that reside in the target availability zone. Chaos Studio will then inject faults into those resources. The experiment runs for a defined duration, after which the faults are removed. This controlled environment allows you to observe the impact without the risk of a prolonged outage.

It is important to note that Chaos Studio resources are duplicated across zones. In the event of a zone-wide outage, you should anticipate a brief degradation in performance as the service transitions to a functioning zone [Reliability in Azure Chaos Studio](https://learn.microsoft.com/en-us/azure/reliability/reliability-chaos-studio). However, experiment metadata and historical data should remain accessible, and the service should not experience a complete outage [Reliability in Azure Chaos Studio](https://learn.microsoft.com/en-us/azure/reliability/reliability-chaos-studio). This ensures that you can still monitor the experiment and collect evidence even if the control plane is affected.

## Verify the evidence

The value of an outage test lies in the evidence it produces. You should use Azure Monitor or Application Insights to monitor your workload's telemetry during the experiment. Service Health reports Microsoft-initiated incidents or status changes, not real-time telemetry of user workloads. It is not a monitoring tool for experiment verification.

During the experiment, observe the following:
1. **Availability:** Does the application remain accessible? If not, what is the duration of the outage?
2. **Data Integrity:** Is any data lost or corrupted during the transition?
3. **Recovery Time:** How long does it take for the application to return to normal operation?

If the test fails, document the failure and the steps taken to recover. This documentation becomes part of your disaster recovery plan. If the test succeeds, update your plan to reflect the verified recovery time and any improvements made.

## Learn from the incident

After the experiment, review the results. If you encountered issues, consider what you can learn to improve your resiliency. Review your disaster recovery plan and ask if it needs updates. Consider whether your service level objectives (SLOs) are still appropriate [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).

If you experience a real incident, use the same process. Check Azure Service Health for the scope of the incident [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). If the issue is limited to a single availability zone, and you are using zone-redundant resources, you might not need to take any action [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). However, if the issue affects your zonal resources, initiate your disaster recovery plan.

Do not take actions without thinking them through. Rushed decisions can sometimes make things worse [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). If you have a disaster recovery plan that covers the scenario, it is usually better to use that instead of creating a plan in the moment [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).

By running controlled outage tests and verifying your recovery plans, you can reduce the risk of rushed decisions during a real incident. The evidence you collect helps you refine your procedures and build confidence in your ability to recover.
