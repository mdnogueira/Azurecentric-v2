---
title: "Define health checks across application and infrastructure layers"
description: "Define health checks to distinguish transient faults from outages, supporting business continuity decisions during service disruptions."
pubDate: 2025-10-07
category: governance
tags: ["health-checks", "business-continuity", "high-availability", "disaster-recovery", "azure-monitor", "incident-response"]
translationKey: define-health-checks-across-application-and-infrastructure-layers
draft: false
---

When a service disruption occurs, the first question is not whether the platform is down, but whether your workload is still serving its users. Defining health checks across application and infrastructure layers provides the visibility needed to distinguish between a transient fault, a degraded state, and a full outage. This distinction determines whether you initiate a disaster recovery plan or simply wait for the platform to recover.

Health checks provide the telemetry data used to measure compliance with your Service Level Objectives (SLOs). They tell you if the business flow is functional, not just if the underlying components are powered on. Without this layered visibility, incident response becomes reactive guessing rather than informed decision-making.

## Distinguish business continuity from platform status

The starting point is understanding that Azure Service Health and the Azure Status page provide information about Microsoft's infrastructure, not your workload's ability to serve customers. Azure Service Health alerts you to issues impacting your subscriptions, but it does not know your application's logic or data state [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). Conversely, the public Azure Status page only shows widespread issues meeting specific criteria, meaning smaller, subscription-specific incidents may not appear there [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).

Therefore, your health checks must operate independently of Microsoft's incident communications. They serve two primary purposes:

1.  **High Availability (HA) Validation:** Confirming that the system can handle day-to-day transient faults, such as network blips or component restarts, without breaking business continuity [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery).
2.  **Disaster Recovery (DR) Triggering:** Providing evidence that a failure has exceeded the tolerance of the HA design, necessitating a failover or manual intervention [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery).

A health check that only verifies the web server is responding does not confirm that the database is accessible or that the authentication service is functional. A comprehensive health strategy must cover the entire critical path of the user journey.

## Define infrastructure health checks

Infrastructure health checks verify the availability and connectivity of the foundational components. These checks should be zone-aware if your architecture uses availability zones, as an issue in one zone may not affect zone-redundant services but could impact zonal ones [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).

For infrastructure, focus on:

*   **Connectivity:** Can the application tier reach the data tier? Can the load balancer reach the backend instances?
*   **Resource Status:** Are the virtual machines or containers in a running state?
*   **Network Reachability:** Can external traffic reach the public endpoint? Can internal traffic traverse the virtual network?

If you are using zone-redundant services, you should not need to take remediation action during a single availability zone outage [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). However, if you observe performance problems due to traffic shifting to remaining zones, scaling out may be necessary [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response). Infrastructure health checks help identify these performance degradations before they become full outages.

## Define application health checks

Application health checks verify that the business logic is functioning correctly. This is where you validate the critical flows identified in your risk assessment [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery). A common mistake is to assume that a 200 OK response from the main endpoint means the application is healthy. It may be serving cached data, failing to write to the database, or returning stale information.

Effective application health checks should:

*   **Validate Critical Dependencies:** Attempt a read or write operation to the database, cache, or storage account. If the database is unreachable, the application is unhealthy, even if the web server is up.
*   **Test Business Flows:** Execute a simplified version of the core user journey. For an e-commerce site, this might mean verifying that a product can be added to a cart. For a financial app, it might mean verifying that a balance can be retrieved.
*   **Check External Integrations:** Verify connectivity to critical third-party APIs or internal services that the application depends on.

These checks should be frequent enough to detect failures quickly but not so frequent that they cause load issues. The frequency and thresholds should be aligned with your SLOs [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).

## Integrate health checks with incident response

Health checks are only useful if they trigger the right response. Integrate your health check results with Azure Monitor and Azure Service Health to create a unified view of system health.

1.  **Configure Alerts:** Set up alerts for health check failures. Use Azure Monitor action groups to notify your incident management system or email distribution lists [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).
2.  **Correlate with Service Health:** When an alert fires, cross-reference it with Azure Service Health. If Microsoft has reported an issue in the relevant region or zone, the alert may be a symptom of a platform disruption rather than an application bug [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).
3.  **Decision Matrix:** Use the correlation to decide on the next step:
    *   **Platform Issue:** If the issue is widespread and Microsoft is working on it, focus on business continuity measures, such as switching to manual operations or degraded modes, if defined in your SLOs [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).
    *   **Application Issue:** If the issue is isolated to your subscription or tenant, initiate your application-specific troubleshooting or failover procedures.

## Verify and refine your health checks

Defining health checks is an iterative process. Regularly review and test them to ensure they accurately reflect the state of your workload.

*   **Regular Review and Testing:** Periodically test your health checks by simulating failures or reviewing past incidents to ensure they detect issues correctly. This aligns with the guidance to regularly review and update your business continuity plan [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery).
*   **Review SLOs:** Periodically revisit your Service Level Objectives and Service Level Agreements (SLAs) to ensure your health checks are aligned with current business requirements [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).
*   **Update Criticality Tiers:** As your workload evolves, re-evaluate its criticality tier. Mission-critical systems may require more frequent and granular health checks than administrative tools [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery).

By defining health checks across both application and infrastructure layers, you gain the visibility needed to make informed decisions during service disruptions. This approach ensures that your business continuity and disaster recovery plans are triggered only when necessary, minimizing downtime and protecting your business operations.

End your incident response review by checking if your health checks have been updated to reflect any changes in your workload's architecture or business criticality. This ensures that your monitoring strategy remains effective as your system evolves.
