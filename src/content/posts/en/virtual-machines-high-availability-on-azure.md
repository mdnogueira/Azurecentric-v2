---
title: "Virtual Machines High Availability on Azure"
description: "In general, you want your Azure virtual machine environment to be resilient to hardware failures and maintenance events that might occur occasionally within the Azure…"
pubDate: 2017-03-04
category: compute
tags: [architecture, hyper-v]
translationKey: virtual-machines-high-availability-on-azure
legacy: true
legacyUrl: /2017/03/virtual-machines-high-availability-on-azure.html
---

In general, you want your Azure virtual machine environment to be resilient to hardware failures and maintenance events that might occur occasionally within the Azure infrastructure. The primary mechanism provided by the Azure platform that helps you accomplish this objective is the availability set feature.

Availability sets are designed to gracefully handle two types of ebent that might result in downtime of individual Azure virtual machines.
  * **Planned outages**. These outages occur because of planned system maintenance events that require a temporary virtual machine downtime. In particular, while most Azure platform updates are transparent to platform as a service (PaaS) and IaaS infrastructure, some of them might involve reboots of Hyper-V hosts. To accommodate such types of events, Azure implements update domains.
  * **Unplanned outages**. These outages can negatively affect availability of individual virtual machines in an unexpected way, and potentially for longer than the time frame of a planned Hyper-V host restart. While the Azure platform is designed to be highly resilient, there might be cases where a hardware failure results in virtual machine downtime. In Azure, unplanned outage events are mitigated by using fault domains.

## **Understanding availability sets**

To provide resiliency for your IaaS-based solutions, you should group two or more virtual machines providing the same functionality in an availability set. An availability set is a logical grouping of two or more virtual machines. By assigning virtual machines to the same availability set, you automatically distribute them across separate fault domains and separate update domains.

## **_Update domains_**

An availability set consists of up to 20 update domains (you have the ability to increase this number from its default of 5). Each update domain represents a set of physical hosts that Azure Service Fabric can update and reboot at the same time without affecting overall availability of virtual machines grouped in the same availability set.

When you assign more than five virtual machines to the same availability set (assuming the default settings), the sixth virtual machine is placed into the same update domain as the first virtual machine, the seventh in the same update domain as the second virtual machine, and so on. During planned maintenance, only hosts in one of these five update domains are rebooted concurrently, while hosts in the other four remain online.

## **_Fault domains_**

Fault domains define a group of Hyper-V hosts that, due to their placement, could be affected by a localized failure (such as servers installed in a rack serviced by the same power source or networking switches). Azure Service Fabric distributes virtual machines (VMs) in the same availability set across either two (with Azure classic deployment) or up to three (when using Azure Resource Manager) fault domains.

By placing application servers, such as web or database servers in function-based availability sets and then using load balancing or additional failover mechanism, you can protect each service and enable traffic to be continuously served by at least one instance of each service.

## **Configuring availability sets**

Availability set configuration is mostly governed by the Azure Service Fabric, and, beyond the initial setup and VM assignment, does not require user interaction. To add one or more virtual machines to an availability set, simply assign the same availability set on their Settings blade. The portal also allows you to create a new availability set by offering it as one of its Azure Marketplace components in the Compute category.

When you create an availability set, you must specify the following settings:
  * **Name**. A unique sequence of up to 80 characters, starting with either a letter or a number, followed by letters, numbers, underscores, dashes, or periods, and ending with a letter, a digit, or an underscore.
  * **Resource Group**. A resource group into which you must deploy the Azure VMs that will become part of the availability set.
  * **Location**. The Azure region that is hosting the VMs which will be part of the availability set.
  * **Fault domains**. The number of fault domains (up to three) associated with the availability set.
  * **Update domains**. The number of update domains (up to 20) associated with the availability set.
  * **Managed**. An indication that the availability set will host the VMs that use managed disks. For more information about managed disks, refer to the “Configuring virtual machine disks” lesson in this module.

Azure PowerShell provides an alternative approach to managing availability sets. The following cmdlets handle creating, modifying, and removing availability sets respectively:
```powershell
New-AzureRmAvailabilitySet
Set-AzureRmAvailabilitySet
Remove-AzureRmAvailabilitySet
```

## **Considerations for virtual machine availability**

When configuring availability sets for Azure virtual machines:
  * **Configure two or more virtual machines in an availability set for redundancy**. The primary purpose of an availability set is to provide resiliency to failure of a single virtual machine. If you do not use multiple virtual machines in an availability set, you gain no benefit from the availability set. In addition, for Internet-facing virtual machines to qualify for 99.95% external connectivity Service Level Agreement (SLA), they must be part of the same availability set (with two or more VMs per set).
    **Note:** It is critical to understand that it is not possible to add an existing Azure virtual machine to an availability set. You need to specify that a virtual machine will be part of an availability set when you provision the VM.
  * **Configure each application tier as a separate availability sets**. As long as virtual machines in your deployment provide the same functionality, such as web service or database management system, you should configure them as part of the same availability set to ensure that at least one VM in each tier is always available.
  * **Wherever applicable, combine load balancing with availability sets**. You can implement an Azure load balancer in conjunction with an availability set to distribute incoming connections among its virtual machines, as long as the application running on them supports such configuration. In addition to distributing incoming connections, a load balancer is capable of detecting a virtual machine or an application failure and redirect network traffic to other nodes in the availability set.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
