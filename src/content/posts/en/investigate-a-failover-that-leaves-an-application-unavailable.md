---
title: "Investigate a failover that leaves an application unavailable"
description: "Troubleshoot post-failover unavailability by verifying service scope, traffic routing, and data readiness."
pubDate: 2025-06-20
category: governance
tags: ["disaster-recovery", "failover", "azure-service-health", "dns", "data-replication"]
translationKey: investigate-a-failover-that-leaves-an-application-unavailable
draft: true
---

The application is unavailable after a failover. It is tempting to assume the new primary is broken, but the outage is usually a mismatch between the traffic routing and the new service state. Before you start redeploying resources or blaming the network, you need to verify three things: whether the underlying service is healthy, whether traffic is actually reaching the new primary, and whether the data replication is keeping pace with your Recovery Point Objective (RPO).

A failover is not an instantaneous switch. It is a process involving detection, selection of a new primary, and redirection of requests. If any part of that chain is broken, the application remains unavailable. The first step is to understand the scope of the failure. Is this a zone outage, a region outage, or a service-specific issue? The response differs significantly depending on the scope.

[![Post-Failover Troubleshooting Flow](/images/posts/2025/azc-192-checkpoints.svg)](/images/posts/2025/azc-192-checkpoints.svg)

## Check the service health and scope

The first thing to verify is whether the underlying Azure service is experiencing a disruption. If the service is healthy, the issue is likely in your configuration or data state. If the service is down, the issue is external to your application logic.

Go to Azure Service Health and check the status of the affected resource. This page provides information on issues or events that might be impacting your services. If you have configured automatic incident update alerts, you should already have received a notification. If not, this is the place to find out if Microsoft is aware of the problem.

If you cannot access the Azure portal, check [Azure status](https://azure.status.microsoft/). Note that this page only shows widespread issues that meet certain criteria. It does not provide an accurate view of smaller issues that may be impacting your specific services. For those, you must rely on Azure Service Health or open a support case.

If the service health page indicates an incident, understand the scope. Is it limited to a single availability zone, or is it region-wide? Many issues are limited to a single availability zone. If you are using zone-redundant services, you might not be affected at all. If you are using zonal services pinned to the affected zone, you might need to initiate your business continuity and disaster recovery plans.

## Verify traffic routing and health probes

If the service is healthy, the next most common cause of post-failover unavailability is traffic routing. Failover generally requires you to update DNS records or load balancer configurations so that requests are routed to the new primary instance. DNS has the concept of a time-to-live (TTL), which instructs clients on how often they should check for updated DNS records. If your TTL is set to a long value, it can take time for clients to receive information about the failover, and they might continue to send requests to the old primary.

Check your DNS configuration. Have the records been updated to point to the new primary? If you are using Azure Front Door or Azure Traffic Manager, verify that the health probes are passing for the new region. These services monitor the health of each regional instance of your application and can automatically reroute traffic to the healthy instance. If the health probe is failing, the traffic will not be redirected.

Also, consider the propagation delay. Even if the DNS record is correct, clients with cached DNS entries might still be trying to connect to the old primary. This is a protocol behavior, not a bug. You can mitigate this by lowering the TTL before planned failovers, but for unplanned ones, you have to wait for the cache to expire or force a refresh on the client side.

## Check data replication and consistency

If traffic is reaching the new primary, but the application is still failing, the issue is likely data-related. During a failover, the previous primary instance might have still performed some work or written some data to a data store. Part of the failback process is to ensure data consistency and integrity across your solution, including managing any conflicts or duplications between the primary and secondary instances.

Check the replication status of your data store. Is the secondary replica fully caught up? If the replication is lagging, the new primary might be missing recent data, causing application errors. Different replication designs place different priorities on data consistency, performance, and cost. Active replication requires updates to take place on multiple replicas simultaneously, guaranteeing consistency at the cost of throughput. Passive replication does synchronization in the background, removing replication as a constraint on application performance, but increasing the Recovery Point Objective (RPO).

If you are using a database, check the replication lag. If the lag is significant, the application might be failing because it is trying to read data that has not yet been replicated. In some situations, data synchronization issues require manual intervention. If you don't need the conflicting data, you might choose to reset the database or other state. However, this should be a last resort, as it can result in data loss.

## Review the failover plan and execution

If the service is healthy, DNS is correct, and data is consistent, the issue might be in the failover plan itself. A disaster recovery plan explains what you expect to do in the event of a major incident. It should include actions like scaling out resources, deploying into another availability zone, or failing over to another region.

Review the steps you took during the failover. Did you follow the plan? If you deviated from the plan, why? Rushed decisions can sometimes make things worse. If you have already developed a disaster recovery plan that covers the scenario, it is usually better to use that instead of creating a plan in the moment.

Also, consider the cost and risk of the failover. Failover can be a complex process. You should only trigger a failover when you can justify the costs and risks. In some situations it might result in data loss, such as if recent changes weren't replicated between regions before any downtime started. You also might experience downtime, especially if you need to redirect traffic to a deployment in a different region.

## Next steps

Once the application is back online, review the incident. Read the Post Incident Review (PIR) from the Health history pane of Azure Service Health, or through customer-configured Service Health alerts. Different incidents might get different types of PIRs. Preliminary PIRs are typically published a few days after an incident, and more comprehensive PIRs follow a few weeks later.

Consider what you can learn from the incident to improve your own resiliency and processes. Ask yourself: How well did your disaster recovery plan work? Are there any improvements you could make? Was your response to the incident appropriate for its severity? Are there Azure service reliability guides for the services you use? Is there a design tradeoff you can make to improve your resiliency in the future for this type of issue?

If you think you may be eligible for an SLA credit, create a new support request with a problem type of "Refund Request" and include the incident Tracking ID. Finally, if you have feedback on how Microsoft can improve incident response, let them know through your assigned Microsoft representative or through the Azure feedback site.


References for Investigate a failover that leaves an application unavailable: [Failover and failback](https://learn.microsoft.com/en-us/azure/reliability/concept-failover-failback), [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response), [Disaster recovery overview for Microsoft Azure products and services](https://learn.microsoft.com/en-us/azure/reliability/disaster-recovery-overview).
