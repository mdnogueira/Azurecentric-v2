---
title: "Lets try to understand the Azure Datacenters"
description: "You probably see on a Microsoft Azure presentation the slide that shows the footprint of Azure. It seems incredible. Look awesome on the slide, but when you are deploying the…"
pubDate: 2016-07-09
category: cloud
tags: ["cloud-computing"]
translationKey: lets-try-to-understand-the-azure-datacenters
legacy: true
legacyUrl: /2016/07/lets-try-to-understand-the-azure-datacenters.html
---

You probably see on a Microsoft Azure presentation the slide that shows the footprint of Azure. It seems incredible. Look awesome on the slide, but when you are deploying the workloads and designing the solution in Azure, its where the nightmare starts. Where I should deploy my solution? That is the question that comes to my head when I design a solution.

Usually when I design a solution, I always look to see if that region has the feature that I’m looking for available. That is one of the first thing that I look to see what region I will choose. But let’s understand the Azure regions. Why do I have so many regions?

First let’s look where the datacenters are located. These datacenters, including the newly announced ones, are in the following geographic areas at the present moment:
  * Americas
    * Central US
    * East US
    * East US 2
    * North Central US
    * South Central US
    * West Central US
    * West US
    * West US 2
    * US Gov Arizona
    * US Gov Iowa
    * US Gov Texas
    * US Gov Virginia
    * Canada Central
    * Canada East
    * Brazil South
  * Europe
    * France Central
    * France South
    * Germany Central
    * Germany Northeast
    * North Europe
    * West Europe
    * UK South
    * UK West
  * Asia Pacific
    * Australia East
    * Australia Southeast
    * China East
    * China North
    * Central India
    * South India
    * West India
    * Japan East
    * Japan West
    * Korea Central
    * Korea South
    * East Asia
    * Southeast Asia

Microsoft managed the datacenter that host Azure services throughout the world. Whenever you create a new Azure service, you must select an Azure region to determine the datacenter where the service will run. When you select an Azure region, you should consider where the users of that service are located and place the service as close to them as possible. Some services enable you to serve content from more than one Azure region. In this way, you can serve content to a truly global audience while helping to ensure that a local response gives them the highest possible performance.

A range of architectures that spans several generations and is continually evolving forms the basis of these datacenters. The latest generation of datacenters has as its basis a fully modular design that includes the following features:
  * Clusters of servers are packaged into preassembled units based on shipping containers, enabling clusters that contain thousands of servers to be rapidly provisioned and swapped out.
  * The datacenters include uninterruptable power supplies and alternate power supplies for all components, in addition to backup power that can keep the datacenter running in the event of a localized disaster.
  * The clusters within datacenters are connected by redundant high-speed networks.
  * The datacenters are connected to one another and the Internet via high-speed optical networks.
  * The data within a single datacenter can be replicated to three redundant storage devices and also between pairs of datacenters in the same geographic region.
  * The physical and network security for Azure datacenters meets a range of industry and government standards.

The datacenters are designed to minimize power and water usage for maximum efficiency, including servers and other hardware, cooling, and support operations.

The servers in each datacenter are provisioned in clusters, and each cluster includes multiple racks of servers that run Windows Server. A distributed management service implemented by Azure Service Fabric handles provisioning, dynamic scaling, and hardware fault management for the virtual servers that host cloud services on the physical servers in the clusters.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
