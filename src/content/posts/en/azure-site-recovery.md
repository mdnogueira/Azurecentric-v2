---
title: "Azure Site Recovery"
description: "Microsoft Azure Site Recovery was first introduced in January 2014, and helps customers to protect important services by coordinating the replication and recovery of System…"
pubDate: 2015-10-12
category: backup-dr
tags: ["azure-site-recovery", "replication"]
translationKey: azure-site-recovery
legacy: true
legacyUrl: /2015/10/azure-site-recovery.html
---

Microsoft Azure Site Recovery was first introduced in January 2014, and helps customers to protect important services by coordinating the replication and recovery of System Center 2012 private clouds at a secondary location. Azure Site Recovery provides three key functions: automated protection, continuous health monitoring, and orchestrated recovery.

## **Simple, Automated Protection**

Your environment can be protected by automating the replication of the virtual machines based on policies that you set and control. Site Recovery coordinates and manages the ongoing replication of data by integrating with existing technologies such as Hyper-V Replica, System Center, and SQL Server AlwaysOn.

## **Continuous Health Monitoring**

Site Recovery monitors the state of System Center Virtual Machine Manager clouds continuously and remotely from Azure. When replicating between two sites you control, only the Virtual Machine Manager servers communicate directly with Azure - your virtual machines data and replication remains on your networks. All communication with Azure is encrypted.

## **Orchestrated Recovery**

The service helps automate the orderly recovery of services in the event of a site outage at the primary datacenter. Virtual machines can be brought up in an orchestrated fashion to help restore service quickly, even for complex multi-tier workloads. Recovery plans are simple to create through the Azure management portal, where they are stored. The plans can be as simple or as advanced as your business requirements demand, including the execution of custom Windows PowerShell scripts and pauses for manual interventions. Networks can also be customized by mapping virtual networks between the primary and recovery sites. These plans can be tested whenever you like without disrupting the services at your primary location.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
