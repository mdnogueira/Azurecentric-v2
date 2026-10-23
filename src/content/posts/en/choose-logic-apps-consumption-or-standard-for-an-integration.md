---
title: "Choose Logic Apps Consumption or Standard for an integration"
description: "Compare Logic Apps Consumption and Standard using workflow boundaries, connectivity, deployment and operating costs rather than the size of a first workflow."
pubDate: 2024-01-25
category: apps
tags: [logic-apps, integration, workflow-design, paas]
translationKey: choose-logic-apps-consumption-or-standard-for-an-integration
draft: true
---

A short workflow can still have demanding networking or deployment requirements. Before choosing a Logic Apps hosting model, describe where the workflow must connect, how the team will release it and what its normal workload looks like.

Consumption and Standard package and run workflows differently. They also have different cost models. The number of actions on the designer is useful information, but it does not settle the choice. Microsoft's [comparison of Logic Apps environments](https://learn.microsoft.com/en-us/azure/logic-apps/single-tenant-overview-compare) provides the starting point for the supported capabilities.

## Start with the integration boundary

Consider an illustrative workflow that receives a business event, checks information in another system and sends a message to a downstream application. Record each dependency, its authentication method and whether it is reachable through a public or private network path.

Then establish how the workflow should behave when a dependency is unavailable. Does it retry safely? Can the receiving application identify a duplicate? Where does an operator find a failed run? These questions apply to either hosting model and should survive the platform decision.

For the hosting choice, pay particular attention to the connector operations the design needs. A familiar connector name is not enough: check the specific operation, authentication method and network behaviour in the proposed model.

## Compare the resource and deployment model

| Decision | Consumption | Standard |
|---|---|---|
| Workflow boundary | A logic app resource contains one workflow | A logic app resource can contain multiple workflows |
| Runtime model | The usual multitenant Consumption service | The single-tenant Logic Apps runtime |
| Development approach | Commonly developed and managed through the service and its designer | Supports a project-based local development approach as well as portal tooling |
| Cost starting point | Usage-based workflow execution and connector charges | Provisioned hosting capacity, with relevant connector and associated-service charges |
| Isolation and networking | Check the supported options for the workflow and each connection | Evaluate its network integration and isolation options against the actual dependencies |

The table is a comparison of the models, not a promise that every connector behaves identically between them. Connector availability and configuration deserve their own check.

Standard also provides stateful and stateless workflow options. That is another design decision: establish whether the workflow needs the durability, history and execution behaviour of a stateful workflow. Do not choose stateless simply because the name sounds faster.

## Give networking its own assessment

Draw the path from the workflow to each backend. If a service must be reached privately, confirm that the selected hosting and connector configuration supports that path. A workflow that runs correctly against a public test endpoint has not demonstrated private production connectivity.

Include name resolution, authentication and any inbound trigger requirements in that assessment. A platform's support for virtual-network integration does not make every managed connection or trigger private automatically.

This is often where a seemingly simple workflow becomes a more substantial platform decision. Resolve the requirement before building a large collection of workflows around an unsuitable connection model.

## Compare costs with a workload profile

Estimate the expected trigger frequency, actions per run, connector usage and periods of inactivity. Use that profile to compare the hosting arrangements, including their associated services.

An infrequent integration can make a usage-based model attractive. A steady workload or a requirement for the Standard runtime's operating model can lead to a different decision. Neither observation is a universal price comparison: run volume, hosting capacity, connector charges and the surrounding design all matter.

Include failure behaviour in the estimate. Retries and repeated processing can change execution volume, and a workflow with a faulty trigger can generate activity quite unlike the business forecast. Use an initial deployment to check assumptions against observed runs and billing information.

## Make the operational choice explicit

Choose a representative workflow and check its full lifecycle: configuration, deployment, authentication, a successful run and a controlled failure. Record how the team diagnoses and resumes the work.

If the team needs a project-based release process, multiple related workflows in one app or specific private connectivity, evaluate Standard with those requirements in the pilot. If the supported Consumption model fits the connections and operating needs, it can be an appropriate starting point without introducing provisioned hosting capacity.

Keep the reason for the choice beside the integration design. That gives the team something concrete to revisit when the traffic pattern, backend network or release process changes.
