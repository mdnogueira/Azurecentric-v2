---
title: "The difference between Azure Virtual Machines and Azure Cloud Services?"
description: "Azure offers several compute hosting options for integrating on-premises workloads in Azure. On a previous post (see here), I described the difference between the both…"
pubDate: 2017-04-17
category: apps
tags: []
translationKey: the-difference-between-azure-virtual-machines-and-azure-cloud-services
legacy: true
legacyUrl: /2017/04/the-difference-between-azure-virtual-machines-and-azure-cloud-services.html
---

Azure offers several compute hosting options for integrating on-premises workloads in Azure.  On a previous post ([see here](/posts/arm-vs-classic-virtual-machines)), I described the difference between the both deployment methods, Azure Resource Manager and Azure Service Manager (Classic). On this post, I will focus on the difference between Azure virtual machines and Azure Cloud Services, because they serve as the basis on integration solutions.

## **Azure virtual machines**

Azure virtual machines provide the greatest degree of control over the virtual machine operating system. You can arbitrarily configure an Azure virtual machine and install almost any third-party software as long as you do not violate the restrictions. Every virtual machine has at least one fixed disk with up to 64 data disks, which persist content across restarts.

You can provision Azure virtual machines by using ether the classic or the Azure Resource Manager deployment model. When using the Azure Resource Deployment model, you must deploy Azure virtual machines into an Azure virtual network.

Because you have complete control over the virtual machine at the operating system level, you are responsible for maintaining the operating system. The responsibilities include installing software updates from the operating system vendor, performing backups, and implementing resiliency to provide a sufficient level of business continuity.

When using the classic deployment model to horizontally scale Azure virtual machines, you must pre-provision additional Azure virtual machines and keep them offline until you are ready to scale out. With the Azure Resource Manager deployment model, you have the option of using virtual machine scale sets for horizontal scaling.

Azure virtual machines are best suited for hosting:
  * Windows Server or Linux infrastructure servers, such as Active Directory domain controllers or Domain Name System (DNS) servers.
  * Highly customized app servers for which the setup involves a complex configuration.
  * Stateful workloads that require persistent storage, such as database servers.

## **Azure Cloud Services**

Azure Cloud Services allows you to manage the virtual machine operating system. However, because Azure Cloud Services uses temporary storage, any change you directly apply does not persist across restarts. The virtual disks automatically provision whenever you start the service, based on the custom code and configuration files you provide. Moreover, you are not responsible for maintaining the operating system updates. Business continuity is part of the service, with the code and configuration automatically replicated across multiple locations.

Azure Cloud Services supports only the classic deployment model. You can deploy virtual disks in a virtual network, but you must provision such a network by using the classic deployment model.

Azure Cloud Services offers superior horizontal scaling capabilities when compared with Azure virtual machines. It can scale to thousands of instances, which the Azure platform automatically provisions based on criteria you define. In addition, it simplifies the development of solutions that consist of multiple tiers. In a typical implementation, a cloud service contains a web role and a worker role. The web role contains virtual machines that provide front-end functionality. The worker role manages the processing of background tasks. Both roles can scale independently of each other.

Azure cloud services are best suited for hosting:
  * Multitiered web apps.
  * Stateless apps that require a highly scalable, high-performance environment.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
