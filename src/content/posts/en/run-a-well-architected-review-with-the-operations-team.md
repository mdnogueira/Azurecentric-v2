---
title: "Run a Well-Architected review with the operations team"
description: "Run a Well-Architected review by mapping service-specific reliability guides to operational responsibilities and verifying RPO/RTO assumptions."
pubDate: 2026-07-06
category: well-architected
tags: ["well-architected-framework", "rpo-rto", "backup"]
translationKey: run-a-well-architected-review-with-the-operations-team
draft: false
---

A reliability review is not a checklist exercise; it is a conversation between the architecture you designed and the operations team that must keep it running. The first thing to establish is which service-specific reliability guides apply to your workload, because those documents define the boundary between what Microsoft manages and what you must configure.

The [Reliability guides overview](https://learn.microsoft.com/en-us/azure/reliability/overview-reliability-guidance) provides a structured list of these guides. Each guide typically covers production deployment recommendations, resilience to transient faults, availability zone support, region-wide failure handling, maintenance resilience, service-level agreements (SLAs), and backup and recovery procedures. Your review should focus on the sections that directly impact your operational runbooks.

## Identify the relevant reliability guides

Start by listing every Azure service in your workload. For each service, locate its dedicated reliability guide. The [Reliability guides by service](https://learn.microsoft.com/en-us/azure/reliability/overview-reliability-guidance) table is the primary reference for this. If a service does not have a dedicated guide, check the "Other reliability documentation" column for relevant articles.

For example, if your workload uses Azure App Service, you would consult the [Reliability in App Service](https://learn.microsoft.com/en-us/azure/reliability/reliability-app-service) guide. If it uses Azure SQL Database, you would look at the [Reliability in Azure SQL Database](https://learn.microsoft.com/en-us/azure/reliability/reliability-sql-database) guide. Do not assume that reliability guidance is uniform across similar services; each guide contains specific prerequisites and configuration steps.

## Map responsibilities to the operations team

Once you have the guides, extract the operational responsibilities. The reliability guides explicitly state which components Microsoft manages and which components you manage. This distinction is critical for defining who owns the response to specific failure scenarios.

Consider the case of a zone-redundant deployment. The guide will explain how traffic is routed and data is replicated between zones. It will also describe the zone down experience. For instance, in a zone outage, clients might receive specific error codes, and retry logic may be required. The operations team needs to know this to configure application-level resilience and to understand when to escalate to Microsoft support.

Another key area is disaster recovery. The reliability guides outline whether a service provides multi-region capabilities and how to deploy custom multi-region solutions. For services that rely on backups, the guide specifies who controls and manages backups, where they are stored, and how they can be recovered. The operations team must verify that these backup and recovery procedures are documented and tested.

## Review SLAs and maintenance windows

Service-level agreements (SLAs) are not just marketing figures; they are contractual definitions of expected uptime based on your configuration. The reliability guides describe how expected uptime changes based on the configuration you use. For example, deploying a resource in a single zone might result in a lower SLA than deploying it across multiple zones.

The operations team should review the SLA for each service in the context of the actual deployment configuration. If the deployment does not meet the SLA requirements, the team needs to understand the risk and whether additional measures are needed.

Maintenance events are another area where the reliability guides provide valuable information. They describe how the service handles planned maintenance and how to minimize downtime and data loss during these events. The operations team should be aware of these maintenance patterns to schedule their own activities accordingly.

## Validate backup and recovery procedures

Backup and recovery are often the most critical aspects of a reliability review. The reliability guides specify whether backups are accessible only within a region or across regions. They also describe the recovery point objective (RPO) and recovery time objective (RTO) for the service.

The operations team should verify that the backup configuration matches the business requirements. If the service relies on geo-restore, the team should confirm that the geo-restore capability is enabled and that the target region is available. They should also test the recovery procedure to ensure that it works as expected.

For example, if you are using Azure SQL Database, the [Reliability in Azure SQL Database](https://learn.microsoft.com/en-us/azure/reliability/reliability-sql-database) guide provides details on backup and recovery. The team should ensure that the backup retention period is sufficient and that the geo-restore feature is enabled if required.

## Document findings and action items

The output of the reliability review should be a clear list of findings and action items. Each finding should be linked to the specific reliability guide and the relevant section. The action items should be assigned to specific team members with clear deadlines.

For instance, if the review reveals that a service is not deployed in a zone-redundant configuration, the action item might be to update the deployment template to include zone redundancy. If the backup configuration is insufficient, the action item might be to adjust the backup retention period or enable geo-restore.

By focusing on the service-specific reliability guides and mapping the responsibilities to the operations team, you can ensure that the reliability review is practical and actionable. This approach helps to identify gaps in the current configuration and provides a clear path to improving the reliability of the workload.

The next step is to schedule a follow-up meeting to review the progress on the action items and to ensure that the changes are implemented correctly. Regular reviews help to maintain a high level of reliability and to adapt to changes in the workload or the Azure platform.

tags: [reliability, well-architected, operations, disaster-recovery, availability-zones]
diagram: {title:
