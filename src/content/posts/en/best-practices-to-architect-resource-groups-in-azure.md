---
title: "Best practices to architect Resource Groups in Azure"
description: "On a workshop at the client, we were talking about what are the best practices to design an architecture for Resource Groups (RG) in Azure. This time we have a good time…"
pubDate: 2019-06-21
category: governance
tags: ["resource-groups"]
translationKey: best-practices-to-architect-resource-groups-in-azure
legacy: true
legacyUrl: /2019/06/best-practices-to-architect-resource-groups-in-azure.html
---

On a workshop at the client, we were talking about what are the best practices to design an architecture for Resource Groups (RG) in Azure. This time we have a good time debating what will be the scenarios and what are the limitations when you come to architect and standardize the deployment of RG.

The most interesting scenario was evolving the limitation that RG have at the time of a region failure. 

Let me explain. In case an organization is setting up the Primary and Secondary (known as DR) across two different regions, and for some reasons the created all the RG in one region, although the resources (example: VMS) are deployed based on the architecture bellow:

**Primary Region:** North Central  

**Second Region:** South Central  

**All RGs:** North Central only  

**Primary Resources:** North Central (vNETs, VMs, Storage Accounts, etc)  

**Second Resources (DR & Backup):** South Central (vNETs, VMs, Storage Accounts, etc)

With the scenario above what will happen if the primary region fails?

These are the experiences that you might feel:
- The most obvious is the access to all the resource are impacted, this means that the resources might not stop running, but you will not able to access from outside of the region
- Resource in other regions but located on the RG in the region unavailable are still accessible, although you cannot modify them (this means that “writing changes” are not possible)

**What is the explanation for that?**

The RG location does determine from the ARM side, which ARM region is responsible for writes and includes processing things like template deployment, regardless of which region the resource is in, so on a scenario where a complete region is gone there would be this issue as describe above.

In regions with zones available, all zones would need to be down, so you don’t have the writes available, as ARM is configured with ZRS in those regions. As ARM
(ie. management.azure.com) is a global service with a regional Compute and Storage deployments, Microsoft does have more flexibility for serving reads path transactions than writes. At the end, they also are served by the resource provider, which is often regional as well (example: RG in CentralUS with a VM in NorthUS and a user in Europe will go from management.azure.com to an ARM frontdoor in Europe based on a traffic manager to an ARM worker role in CentralUS
to the Microsoft.Compute RP in NorthUS).

**What to do?**

As a best practice for design and architecting RG, it’s recommended to create an RG per region, where the resource will be located. Having a 1-1 mapping between the RG and the actual location the resources, will mitigate these issues and have a less impact on your overall Azure deployment.

**How I can prevent?**

There is a built-in policy that can report when the resource location doesn’t match the resource group location as that is a great best practice.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
