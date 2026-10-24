---
title: "Choose a deployment approach that limits the impact of failure"
description: "Decide between zone-redundant and zonal deployments to limit failure impact, balancing latency needs against operational complexity."
pubDate: 2025-11-30
category: governance
tags: []
translationKey: choose-a-deployment-approach-that-limits-the-impact-of-failure
draft: true
---

When a single availability zone fails, the impact on your application depends entirely on how you deployed it. If you pinned resources to one zone, you face downtime. If you spread them across zones, you likely see minimal disruption. The decision between a zone-redundant and a zonal deployment is not just a technical preference; it is a risk management choice that defines who handles the recovery: Microsoft or you.

Most workloads should aim for zone redundancy. It removes the burden of manual failover and data replication from your team. However, specific latency requirements or hardware constraints sometimes force a zonal deployment. In those cases, you must build the resilience that the platform would otherwise provide automatically.

## Understand the deployment types

Azure offers three ways to place resources in a region that supports availability zones. The distinction determines your exposure to zone-level outages.

**Zone-redundant resources** are distributed across multiple availability zones. Microsoft manages the replication and traffic distribution. If one zone fails, the service continues operating. Some services, like Azure Container Registry, are always zone redundant. Others, like Azure Blob Storage, require you to enable zone redundancy during configuration. This is the default recommendation for production workloads.

**Zonal resources** are pinned to a single availability zone. They are isolated from faults in other zones, but a failure in their specific zone causes downtime. You are responsible for designing the solution to handle that failure. This might involve deploying multiple instances in different zones and managing the traffic routing and data replication between them.

**Nonzonal (regional) resources** do not have zone configuration options. Azure may place them in any zone within the region. These offer no protection against zone outages and should be avoided for production workloads in regions that support availability zones.

The key difference is responsibility. With zone redundancy, Microsoft handles the failover. With zonal deployments, you must design, implement, and test the high-availability architecture yourself.

## When to choose zone redundancy

Zone redundancy is the standard approach for most Azure services. It provides automatic resilience to zone failures with minimal configuration effort. The Well-Architected Framework recommends designing for redundancy across multiple levels, with a focus on critical workflows.

Services like Azure Application Gateway v2 are always zone redundant in regions that support availability zones. It is important to note that this applies only to the v2 SKU; the legacy v1 SKU is not zone redundant and requires migration to achieve zone resilience. For other services, such as Azure App Service or Azure SQL Database, you enable zone redundancy through specific settings or deployment parameters. The process typically involves minimal configuration changes and does not require downtime.

However, enabling zone redundancy can have cost implications. Some services require a minimum tier or instance count to support zone redundancy. For example, Azure App Service requires a Premium tier and a minimum number of instances. Azure Blob Storage incurs a cost increase for zone-redundant storage (ZRS) compared to locally redundant storage (LRS). The exact pricing varies by region and tier, so you must assess these costs against the benefit of automatic zone resilience. Refer to the specific reliability guide for each service for precise cost details.

## When zonal deployment is necessary

There are specific scenarios where a zonal deployment is the only viable option. These are not common, and you should only choose them when there is a clear need.

**Hardware constraints.** Some Azure services, like Virtual Machines, are inherently zonal. You can use Virtual Machine Scale Sets to create zone-redundant compute, but if you need a specific VM SKU that is only available in one zone, you must deploy zonally. Similarly, services like Azure NetApp Files support volume deployment into a single zone, requiring you to replicate between zones for resilience.

**Latency sensitivity.** Availability zones within a region are connected by a high-performance network with round-trip latency typically under two milliseconds. For most workloads, this is negligible. However, some legacy applications or high-frequency trading systems assume components are colocated. If your application is highly sensitive to inter-zone latency, a zonal deployment might be necessary.

If you suspect latency is an issue, do not assume it will be a problem. Test your workload in a realistic environment. Run performance tests within a single zone, then enable inter-zone replication and rerun the tests. Compare the results against your acceptable performance requirements. If the latency is unacceptably high, consider redesigning the application to minimize cross-zone communication or consolidating operations.

## Building resilience for zonal deployments

If you must use a zonal deployment, you are responsible for making the workload resilient to zone failures. This involves several key activities.

**Multiple resource deployment.** Deploy separate instances of your zonal resources into different availability zones. Use infrastructure as code to ensure configuration consistency. For example, if you are using VMs, deploy them in Zone 1 and Zone 2.

**Traffic routing.** Configure a zone-resilient load balancer to distribute traffic between your zonal instances. It is critical to distinguish between load balancer types: the standard Azure Load Balancer is zonal by default, meaning it is pinned to a single zone. Using a zonal load balancer in a zonal deployment creates a single point of failure if the load balancer's zone fails. To achieve zone resilience, you must use a zone-redundant load balancer (such as Application Gateway v2) or configure the standard load balancer with specific redundancy settings if supported. You must decide on the routing policy (active-active or active-passive) and configure automated health checks.

**Data replication.** For stateful resources, you must protect the data. Configure synchronous replication to another instance in a different zone to achieve a Recovery Point Objective (RPO) of zero. If synchronous replication is not possible due to latency, you might use asynchronous replication or backups. Note that backups result in a higher RPO and RTO, requiring a longer recovery time.

**Monitoring and response.** Implement monitoring to detect zone failures. Define conditions that mark resources as unhealthy and trigger automated recovery actions. You must also plan for the recovery process once the failed zone is restored, including any failback procedures.

## Making the decision

The choice between zone redundancy and zonal deployment comes down to your requirements for latency, hardware, and operational complexity.

Start by checking if your Azure region supports availability zones. If it does, prioritize zone redundancy for all services that support it. This includes networking services like Azure Firewall and Application Gateway, operational data stores like Azure SQL Database and Azure Storage, and compute services like Azure App Service and Azure Functions.

Only consider zonal deployments if you have a specific constraint, such as a VM SKU available only in one zone, or a latency requirement that cannot be met with cross-zone communication. If you choose zonal, ensure you have a plan for traffic routing, data replication, and failure detection.

Review the reliability guide for each service you use. It will specify the zone configuration approach, the level of effort, and any cost impact. Use this information to prioritize your workloads. Start with the most critical flows and ensure they are zone resilient before expanding to less critical components.

If you are migrating an existing non-resilient workload, assess the impact of each change. Some services require redeployment to enable zone support, which may involve downtime. Plan these changes carefully, testing for latency and verifying that your recovery processes work as expected.

The goal is to limit the impact of failure. Zone redundancy does this automatically. Zonal deployments require you to build that resilience yourself. Choose the approach that aligns with your business requirements and operational capabilities.


References for Choose a deployment approach that limits the impact of failure: [Enable Zone Resiliency for Azure Workloads](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-enable-zone-resiliency), [Zonal Resources and Zone Resiliency](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-zonal-resource-resiliency), [Azure availability zone migration baseline](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-baseline).
