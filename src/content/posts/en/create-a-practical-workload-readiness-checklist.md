---
title: "Create a practical workload readiness checklist"
description: "A practical checklist for verifying workload readiness before an incident, based on Azure's shared responsibility model and service health."
pubDate: 2026-10-21
category: well-architected
tags: ["well-architected-framework", "azure-service-health", "business-continuity", "disaster-recovery", "incident-response"]
translationKey: create-a-practical-workload-readiness-checklist
draft: false
---

When an Azure service disruption occurs, the first question is rarely "how do I fix the platform?" It is "is my workload affected, and what do I do next?" The answer depends on how you have configured your resources and whether you have a plan that matches the scope of the incident. A practical workload readiness checklist starts with understanding the shared responsibility model and verifying your visibility into Azure Service Health.

## Understand the scope of the disruption

The first step during any incident is to determine whether the issue is local to a single availability zone, regional, or service-wide. Azure Service Health is the primary source for this information. It provides details on issues affecting your specific subscriptions and resources, unlike the public Azure Status page, which only shows widespread issues meeting specific criteria [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).

1.  **Check Azure Service Health**: Access [Azure Service Health](https://learn.microsoft.com/en-us/azure/reliability/incident-response) and look for active incidents in your regions. Configure automatic incident update alerts to send these notifications to an action group, ensuring your team is notified even if the portal is slow to load.
2.  **Map Logical to Physical Zones**: If the incident is limited to an availability zone, check whether your resources are zonal or zone-redundant. Azure uses logical zones that may map to different physical datacenters. If your service is zonal and pinned to the affected logical zone, you may be impacted. If it is zone-redundant, you likely are not [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). To confirm the physical mapping, consult the [physical and logical availability zones](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-service-support) documentation for your specific service and region.
3.  **Verify Regional Impact**: For region-wide incidents, check if your service supports cross-region replication or if you have a secondary deployment. Many Azure services do not automatically replicate data or fail over to another region; this is your responsibility [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program).

## Verify your business continuity and disaster recovery (BC/DR) plan

A readiness checklist is not just about current visibility; it is about having a documented plan for the scenarios you identified. Azure’s business continuity management program requires service owners to define recovery time objectives (RTO) and recovery point objectives (RPO), but these are internal measures. Your commitments to users are based on Service Level Agreements (SLAs) and your own design [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program).

### Check your shared responsibility boundaries

Review the shared responsibility model for your workload. For example, if you are using Azure Virtual Machines, you are responsible for deploying duplicate VMs in an alternate region and configuring traffic manager or manual failover processes. Azure provides the baseline infrastructure, but it does not automatically replicate your customer-enabled services [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program).

### Confirm your recovery actions

Your plan should specify actions for different scopes:
*   **Availability Zone Outage**: If using zonal services, the plan might involve deploying to another zone. If using zone-redundant services, the plan might be to monitor and scale out if performance degrades [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).
*   **Regional Outage**: The plan should detail how to fail over to another region. This often involves updating DNS records and ensuring data is replicated [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).
*   **Service-Specific Guidance**: Consult the [Azure services reliability guides](https://learn.microsoft.com/en-us/azure/reliability/reliability-guidance-overview) for your specific services. These guides provide intra-regional and cross-region resiliency instructions. For instance, Azure Storage has specific guidance on choosing the right redundancy option for availability zones, while disaster recovery planning is covered in a separate guide. For customer-initiated failover, refer to the specific service documentation, such as initiating account failover for Azure Storage [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).

## Test your incident response process

A plan is only as good as its execution. Azure Service teams test their own recovery plans in canary environments that simulate total region failures [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program). You should do the same for your workload.

1.  **Simulate the Incident**: Use a non-production environment to test your failover process. This helps identify gaps in your documentation or access permissions.
2.  **Verify Communication Channels**: Ensure that your action groups and contact lists are up to date. Test that alerts are reaching the right people.
3.  **Review Post-Incident Reviews (PIRs)**: After any incident, read the PIRs available in Azure Service Health. These provide insights into what Microsoft learned and can help you refine your own resilience strategies [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).

## Decide when to act

Not every incident requires immediate action. Prioritize business continuity by assessing the actual impact on your production resources and users. If the issue is outside standard business hours or expected to be resolved quickly, it might be better to wait [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). However, if your SLAs are at risk, initiate your BC/DR plan. Remember, rushed decisions can sometimes make things worse. Use your documented plan rather than creating one in the moment [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).

If you need assistance from Microsoft, open a support case. You can raise a free support ticket for up to 72 hours after an issue is mitigated to assist with recovery steps [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). Clearly explain the resources affected and the impact, and set the severity based on business impact.
