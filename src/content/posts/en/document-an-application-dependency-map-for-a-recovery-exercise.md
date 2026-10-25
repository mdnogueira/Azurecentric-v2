---
title: "Document an application dependency map for a recovery exercise"
description: "Document application dependencies to define recovery scope and validate RTO/RPO targets for Azure workloads."
pubDate: 2025-01-03
category: governance
tags: ["business-continuity", "disaster-recovery", "high-availability", "azure-reliability", "recovery-planning"]
translationKey: document-an-application-dependency-map-for-a-recovery-exercise
draft: false
---

You are planning a recovery exercise and need to know exactly which components must be restored, in what order, and within what time limits. The first step is not to configure failover, but to document the dependency map of the application. A recovery exercise without a clear dependency map is a guesswork exercise, and guesswork is where recovery plans fail.

Business continuity is about maintaining operational capability during failures. It relies on proactive planning to identify risks and design high availability or disaster recovery strategies accordingly [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery). A dependency map is the technical record that links your application components to the business processes they support, allowing you to define Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) with evidence rather than assumption [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program).

## Define the scope of the application

Start by identifying the application as a logical unit. In Azure, services are statically identified through tooling and serve as the unit of measure for business continuity management [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program). An application is rarely a single resource; it is a collection of services that interact to deliver a business function.

List the resources that constitute the application. This includes compute, storage, networking, and identity components. For example, a web application might consist of App Service plans, SQL Database instances, Storage Accounts, and Key Vault references. Do not include resources that are shared across unrelated applications unless they are critical to this specific workflow.

The shared responsibility model for resiliency dictates that while Microsoft provides core platform reliability and resilience-enhancing capabilities, you are responsible for selecting and using the appropriate components for your needs [Shared responsibility for resiliency](https://learn.microsoft.com/en-us/azure/reliability/concept-shared-responsibility). Your dependency map must reflect the resources you have deployed and configured, not the underlying infrastructure Microsoft manages.

## Map dependencies and classify risks

A dependency map shows how components interact. It distinguishes between dependencies required for runtime operation and those needed only for recovery. Azure services map their dependencies to runtime, recovery, or both [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program).

For each component, identify:
1. **Upstream dependencies**: Services that must be available for this component to function. For example, an App Service instance depends on its associated App Service Plan and potentially a Key Vault for secrets.
2. **Downstream dependencies**: Services that rely on this component. For example, a SQL Database is depended upon by the App Service and any reporting tools.
3. **External dependencies**: Third-party APIs, on-premises systems, or other cloud subscriptions.

Classify the risks associated with each dependency. Business continuity planning requires identifying risks such as transient network issues, hardware failures, or region outages [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery). Determine whether a failure in a specific dependency is a day-to-day risk (handled by high availability) or a catastrophic risk (handled by disaster recovery) [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery).

| Component | Dependency | Type | Risk Classification | Impact | RTO Target | RPO Target |
|---|---|---|---|---|---|---|
| App Service | App Service Plan | Runtime | Day-to-day (HA) | Application unavailable | 15 mins | 0 |
| SQL Database | Azure SQL Server | Runtime | Day-to-day (HA) | Data inaccessible | 30 mins | 5 mins |
| Storage Account | Blob Container | Runtime | Catastrophic (DR) | Data loss | 4 hours | 1 hour |
| Key Vault | Managed Identity | Runtime | Day-to-day (HA) | Authentication failure | 15 mins | 0 |

This table is a hypothetical example of business requirements. You must populate it with the actual components of your application. The RTO and RPO targets should be derived from the business impact analysis, which considers operational, legal, regulatory, brand image, and financial impacts [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program). Microsoft does not publish RTO or RPOs for services because this data is for internal measures only; all customer promises are SLA-based [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program). Therefore, your targets must be based on your business requirements, not just the platform capabilities.

## Validate the map against recovery capabilities

Once the dependency map is drafted, verify that the required recovery capabilities are available and configured. Azure provides resilience-enhancing capabilities such as availability zones, multi-region deployment, and backups [Shared responsibility for resiliency](https://learn.microsoft.com/en-us/azure/reliability/concept-shared-responsibility). You are responsible for evaluating and configuring these to align with your RTO and RPO targets [Shared responsibility for resiliency](https://learn.microsoft.com/en-us/azure/reliability/concept-shared-responsibility).

Check each dependency in your map against the available capabilities:
- **High Availability**: For day-to-day risks, ensure redundancy is in place. For example, use availability zones or zone-redundant deployments for critical components [Shared responsibility for resiliency](https://learn.microsoft.com/en-us/azure/reliability/concept-shared-responsibility). Review the service level agreements (SLAs) for each service to understand the expected uptime and conditions [Shared responsibility for resiliency](https://learn.microsoft.com/en-us/azure/reliability/concept-shared-responsibility).
- **Disaster Recovery**: For catastrophic risks, ensure cross-region replication or backups are configured. For example, if your RPO for a storage account is one hour, verify that geo-redundant storage or frequent backups are enabled [Shared responsibility for resiliency](https://learn.microsoft.com/en-us/azure/reliability/concept-shared-responsibility).
- **Recovery Order**: Identify the sequence in which dependencies must be restored. A database must typically be available before the application can start. The dependency map should define this order.

The shared responsibility model means that while Microsoft ensures baseline infrastructure availability, you must configure recovery for multi-region scenarios [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program). For example, if you want cross-region replication for virtual machines, you must deploy a duplicate set in an alternate region and configure failover [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program).

## Test the dependency map

A dependency map is only useful if it has been tested. Azure requires every service to have a detailed recovery plan and to test that plan as if the service has failed [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program). For your application, this means conducting a recovery exercise that simulates a failure scenario.

1. **Select a scenario**: Choose a realistic failure, such as a region outage or a database corruption.
2. **Execute the recovery plan**: Follow the steps defined in your dependency map, restoring components in the correct order.
3. **Measure outcomes**: Record the actual time taken to restore each component and the amount of data lost. Compare these against your RTO and RPO targets.
4. **Review and update**: If the actual outcomes do not meet the targets, update the dependency map and recovery plan. This might involve adding more redundancy, changing the recovery order, or adjusting business expectations.

Testing is considered integrated because all services are affected simultaneously [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program). Use canary environments that match production to simulate total region failure without affecting live services [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program).

## Next steps

With the dependency map documented and validated, you have a clear view of what needs to be recovered and within what constraints. The next step is to formalise the recovery plan, ensuring it is written so that someone with similar skills and access can complete the tasks [Business continuity management program in Azure](https://learn.microsoft.com/en-us/azure/reliability/business-continuity-management-program). This avoids relying on subject matter experts being available during an actual event.

Use the [Azure Well-Architected Framework](/azure/well-architected/) to drive architectural excellence and ensure your reliability targets are met [Shared responsibility for resiliency](https://learn.microsoft.com/en-us/azure/reliability/concept-shared-responsibility). For detailed guidance on designing workloads for business continuity, refer to the reliability pillar of the framework [Shared responsibility for resiliency](https://learn.microsoft.com/en-us/azure/reliability/concept-shared-responsibility).
