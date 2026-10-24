---
title: "Turn an application availability target into design decisions"
description: "Define what availability means to the business, set recovery objectives, and test the complete application path before choosing redundancy and recovery mechanisms."
pubDate: 2024-02-05
category: governance
tags: [reliability, availability, disaster-recovery, rto-rpo]
translationKey: turn-an-application-availability-target-into-design-decisions
draft: false
---

An availability percentage is not an architecture. It becomes useful when the team can explain which user operation must work, how failure will be measured and what recovery must achieve.

Start with the business service rather than a VM uptime target. A server can be running while an application cannot authenticate, reach its database or complete a transaction. Microsoft's [reliability guidance](https://learn.microsoft.com/en-us/azure/reliability/overview) provides the platform context; the workload design still needs its own requirements and evidence.

## Describe an available service

For an illustrative order-processing application, an available service might mean that a user can sign in, submit an order and retrieve its confirmation within an agreed response time. That definition is more useful than saying that the application has two instances.

Choose the measurement period and the indicator used to assess the target. Record how planned maintenance, partial failure and a dependency outage are treated. Otherwise, two teams can report different availability figures while both believe they are following the same requirement.

An internal service-level objective also differs from a contractual SLA. Azure service SLAs describe particular platform commitments and conditions. They do not automatically become an end-to-end promise for an application assembled from those services.

## Set recovery time and data-loss objectives

The recovery time objective, or RTO, describes the acceptable time to restore the required service after an incident. The recovery point objective, or RPO, expresses the acceptable data-loss window.

Establish those objectives with the business owner. Then test whether the proposed recovery method can meet them. Recovery includes detection, decision-making, restoration, dependency recovery and validation; it is not limited to the time taken to start another VM.

For example, an RTO of one hour and an RPO of 15 minutes are requirements for an exercise, not evidence that a particular storage or backup configuration meets them. The team still needs to establish usable recovery points and measure the full recovery procedure.

An RPO of zero needs particularly careful analysis. Asynchronous replication does not establish zero data loss simply because it copies data to another region.

## Match mechanisms to failure scenarios

| Scenario | Design question |
|---|---|
| One application instance fails | Can another instance serve requests, and does the health check recognise the failure? |
| A zone becomes unavailable | Are the required components distributed appropriately, and can the application use the survivors? |
| A region becomes unavailable | Which services, data and dependencies must be recovered elsewhere? |
| Data is accidentally changed or deleted | Can a usable earlier state be recovered without relying on an already-corrupted replica? |
| An identity or DNS dependency fails | Can the recovery procedure restore the user's actual access path? |

Availability zones provide a useful failure boundary for supported services and configurations. They do not automatically make a workload resilient. Its capacity, application state, routing and dependencies must support the intended behaviour when a zone is lost.

A region pair also does not automatically replicate every application's data. Use each service's documented replication and recovery features, and check the actual regional configuration. Keep data residency and the availability of the required services in the decision.

## Review the dependency path

Draw the path of the business operation, including ingress, authentication, application processing, data storage and any external integration. Ask what happens when each dependency is slow, unreachable or returning errors.

Retries need limits and a purpose. Repeating a request indefinitely can increase pressure on a failing dependency. Where an operation can be duplicated, the application also needs a way to avoid processing the same business action twice.

Include operational dependencies in the recovery plan. A secondary environment is less useful if the team cannot access its administration tools, obtain the necessary credentials or make the required DNS change during an incident.

## Use a recovery exercise to test the requirement

Choose a specific failure scenario and agree its success criteria before the exercise. Record the starting conditions, the recovery point used, the actions taken and the elapsed time until the business operation works again.

Validate the data as well as the application's response. A successful sign-in or healthy landing page does not establish that the required orders, files or records are present.

Compare the measured result with the objectives and record the gaps. That may change the design, the operating procedure or an assumption about the acceptable service level. Keep the evidence with the architecture so that the next infrastructure change can be assessed against an actual recovery result.
