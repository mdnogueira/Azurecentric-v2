---
title: "Review a workload against the Well-Architected reliability pillar"
description: "Review a workload against the Well-Architected reliability pillar by defining RTO/RPO and consulting service-specific guides."
pubDate: 2024-09-10
category: governance
tags: ["well-architected-framework", "reliability", "disaster-recovery", "availability-zones", "rto-rpo"]
translationKey: review-a-workload-against-the-well-architected-reliability-pillar
draft: false
---

You have a workload in Azure and need to verify its reliability posture against the Well-Architected Framework. The first step is not to open a dashboard, but to define the business requirements that the architecture must satisfy. Reliability is not a single setting; it is the result of aligning your application design with specific availability and recovery targets.

The Azure reliability documentation states that "the required level of reliability for any Azure solution depends on several considerations. Availability and latency SLA and other business requirements drive the architectural choices." Before you can judge whether your workload is reliable, you must establish what "reliable" means for that specific workload in terms of downtime and data loss.

## Define your reliability targets

Start by determining two key metrics: the Recovery Time Objective (RTO) and the Recovery Point Objective (RPO). These are non-functional requirements dictated by your business needs, not technical defaults.

*   **Recovery Time Objective (RTO):** The maximum acceptable time that an application can be unavailable after an incident.
*   **Recovery Point Objective (RPO):** The maximum duration of data loss that is acceptable during a disaster.

For example, if your business can tolerate 15 minutes of downtime and up to 5 minutes of data loss, your architecture must be designed to meet those specific constraints. This definition drives every subsequent decision, from the choice of redundancy options to the selection of disaster recovery strategies. As the guidance notes, "building reliability systems on Azure is a shared responsibility." Microsoft provides the platform reliability, but you are responsible for the resilience of your application using architectural best practices.

## Identify the service-specific reliability guides

Azure provides service-specific reliability guides that cover intra-regional resiliency (such as availability zones) and cross-region resiliency (disaster recovery). These guides are the primary evidence for how a service handles failures.

To review your workload, you need to locate the relevant guides for each component. The [Reliability guidance overview](https://learn.microsoft.com/en-us/azure/reliability/overview-reliability-guidance) lists these resources by service category. For instance, if your workload uses Azure App Service, you would consult the [Azure App Service reliability guide](https://learn.microsoft.com/en-us/azure/reliability/reliability-app-service) for intra-region high availability and the [cross-region disaster recovery](https://learn.microsoft.com/en-us/azure/reliability/reliability-app-service#cross-region-disaster-recovery-and-business-continuity) section for recovery strategies.

If your workload relies on Azure SQL, the Azure SQL high availability and recovery using backup and restore guides provide the necessary details. Each guide explains the service's built-in redundancy options, such as zone redundancy or geo-redundant backups, and the configurations required for disaster recovery.

For Azure SQL Managed Instance, the reliability overview tables do not list a separate availability zone guide. Instead, you should consult the disaster recovery and failover group documentation to understand how the service handles high availability and recovery.

## Evaluate your architecture against the guides

With your RTO and RPO defined and the relevant service guides in hand, you can now evaluate your workload. This is a structured review, not a general inspection. Focus on the following areas:

1.  **Availability Zones:** Check if your services are deployed across availability zones if your RTO requires protection against datacenter failures. Availability zones are "physically separate availability zones... connected by a high-performance network featuring less than 2ms latency to help keep data synchronized." Using them strategically can improve reliability and optimize costs. Note that while availability zones protect against datacenter failures, they do not automatically guarantee application availability. Application-level resilience patterns are still required.
2.  **Disaster Recovery Strategy:** Verify that your cross-region replication or backup strategy aligns with your RPO. For example, asynchronous cross-region replication does not guarantee an RPO of zero. If your RPO is stricter than what asynchronous replication offers, you may need to consider synchronous replication or more frequent backups.
3.  **Dependency Failures:** Identify possible failure points in your system. The reliability checklist advises to "identify possible failure points in the system; application design should tolerate dependency failures by deploying circuit breaking." Ensure that your application can operate in the absence of its dependencies, at least temporarily.
4.  **SLA Alignment:** Compare your workload's architecture against the supported SLAs for each Azure service. An uptime of 99.99 percent translates to about five minutes of total downtime per month. Ask yourself if the complexity and cost to reach that percentage are justified by your business requirements.

## Verify and document

Once you have evaluated your workload, document your findings. Record the RTO and RPO targets, the service-specific reliability features you have enabled, and any gaps identified. If a gap exists, such as a service that does not support availability zones in your chosen region, you must decide how to mitigate that risk.

The reliability planning checklist includes a step to "perform testing of the end-to-end application environment to measure application reliability and recovery against unexpected failure." Consider scheduling a failover test to validate your disaster recovery plan. This test should confirm that your RTO and RPO targets are achievable in practice, not just on paper.
