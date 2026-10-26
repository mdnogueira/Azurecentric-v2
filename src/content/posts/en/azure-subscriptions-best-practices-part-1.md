---
title: "Azure Subscriptions Best Practices - Part 1"
description: "Frequently when I’m working on an Azure Foundation project, one of the topic that I like to explore is the Azure Subscriptions. These series of blog post will detail all the…"
pubDate: 2017-02-18
category: governance
tags: ["azure-subscriptions", "rbac"]
translationKey: azure-subscriptions-best-practices-part-1
legacy: true
legacyUrl: /2017/02/azure-subscriptions-best-practices-part-1.html
---

Frequently when I’m working on an Azure Foundation project, one of the topic that I like to explore is the Azure Subscriptions. These series of blog post will detail all the information that is required to know to architect a very good foundation for your Azure Infrastructure.

Initially a subscription was the **administrative security boundary** of Microsoft Azure. With the advent of Azure Resource Management (ARM) environment, a subscription now has two administrative models. Azure Service Management (ASM or classic) and Azure Resource Management.

With ARM, the subscription is no longer needed as an administrative boundary.  ARM provides a more granular Roles Based Access Control (RBAC) model for assigning administrative rights at the resource level. RBAC is currently being released in stages, 32 new roles have been released and user defined roles is coming in a future release. There will be some complexity during the coexistence of the service management and resource management environments and will need to be carefully considered.

A subscription additionally forms the **billing unit**. Services charges are accrued to the subscription currently, as part of the new Azure Resource Management model it will be possible to roll up costs to a resource group.

A standard naming convention for Azure resource object types can be used to manage billing across projects teams, business units, or other desired view.

A **logical limit of scale by which resources can be allocated**, these limits include both hard and soft caps of various resource types (like 10,000 compute cores /subscription) and are changing as capacity and capabilities are updated within Azure.

Scalability will continue to be a function of subscriptions and therefore is a key element to understand how the Subscription strategy will account for growth as consumption increases.

So, Subscriptions are…
  * Administrative security boundary
  * Support RBAC delegation
  * A billing unit
  * Logical limit of scale
  * The First BIg container that you create

Although, there are some considerations that we might have to take into account:
  * Subscriptions do not cost anything
  * Each subscription has its own admins, although a single account can be an admin in multiple subscriptions
  * Are global

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
