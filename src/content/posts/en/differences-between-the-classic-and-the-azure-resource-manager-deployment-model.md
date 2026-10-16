---
title: "Differences between the classic and the Azure Resource Manager deployment model"
description: "A lot of times I got these questions, where is should create my resources? On the classic portal or on the ARM portal? What is the difference? Is it only the URL? Why if I…"
pubDate: 2017-04-24
category: governance
tags: [networking]
translationKey: differences-between-the-classic-and-the-azure-resource-manager-deployment-model
legacy: true
legacyUrl: /2017/04/differences-between-the-classic-and-the-azure-resource-manager-deployment-model.html
---

A lot of times I got these questions, where is should create my resources? On the classic portal or on the ARM portal? What is the difference? Is it only the URL? Why if I choose to create a VM on classic within the same region I cannot use my network created on the ARM portal or vice-versa?

All these questions are valid, but someone of them are misconception of the way that Azure works or has been setup. On older post I cover the difference on creating virtual machines between the ASM Portal (Classic) and the ARM Portal (see [here](/posts/arm-vs-classic-virtual-machines)), however there is a lot more than virtual machines in Azure.

Although most of the general networking principles outlined in the previous post (see [here](http://azurecentric.com/2017/04/azure-virtual-network-service/)) apply to Azure virtual networks regardless of their deployment model, there are some differences between Azure Resource Manager and classic virtual networks.

In the classic deployment model, network characteristics of virtual machines are determined by:	
  * A mandatory cloud service that serves as a logical container for virtual machines.
  * An optional virtual network that allows you to implement direct connectivity among virtual machines in different cloud services and to on-premises networks. In particular, cloud services support virtual network placement but do not enforce it. As a result, you have the option of deploying a cloud service without creating a new virtual network or without using an existing one.

In the Azure Resource Manager model, network characteristics of virtual machines include that: 	
  * There is no support for cloud services. To deliver the equivalent functionality, the Azure Resource Manager model provides a number of additional resource types. In particular, to implement load balancing and NAT, you can implement an Azure load balancer. To allow connectivity to a virtual machine, you must create and attach it to a virtual network adapter. While this increases to some extent the complexity of the provisioning resources, it offers significant performance and flexibility benefits. In particular, you can deploy your solutions much faster than when using the classic deployment model.
  * A virtual machine must reside within a virtual network. A virtual machine attaches to a virtual network by using one or more virtual network interface cards.

**Note:** A load balancer constitutes a separate Azure Resource Manager resource, while in the classic deployment model it is part of the cloud service in which load-balanced virtual machines reside. Similarly, a network interface is an inherent part of a classic virtual machine, but Azure Resource Manager allows you to manage it separately, including detaching it from one virtual machine and attaching it to another. The same logic applies to a public IP address. In particular, every cloud service has at least one automatically assigned public IP address. However, public IP address assignment is optional with Azure Resource Manager. Due to the lack of support for cloud services in the Azure Resource Manager deployment model, you have the choice of associating it with either Azure load balancers or network adapters.

The following table summarizes the primary differences between the classic deployment model and the Azure Resource Manager model from the networking standpoint.
<table style="border: 1px solid black;" >
<tbody >
<tr style="border: 1px solid black;" >

<td width="143" >Item
</td>

<td width="258" >Azure Service Management
</td>

<td width="299" >Azure Resource Manager
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="145" >Azure Cloud Services for virtual machines
</td>

<td width="260" >The cloud service is a mandatory container for virtual machines and associated objects.
</td>

<td width="296" >The cloud service does not exist.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="143" >Load balancing
</td>

<td width="258" >The cloud service functions as a load balancer for infrastructure as a service (IaaS) resources within Azure Cloud Services.
</td>

<td width="302" >The load balancer is an independent resource. You can associate a network adapter that is attached to a virtual machine with a load balancer.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="143" >Virtual IP address (VIP)
</td>

<td width="260" >The platform automatically assigns a VIP to a cloud service upon its creation. You use this IP address to allow connectivity to virtual machines within the cloud service from Internet or from Azure-resident services.
</td>

<td width="306" >You have the option of assigning a public IP to a network adapter or a load balancer.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="143" >Reserved IP address
</td>

<td width="258" >You can reserve an IP address in Azure and then associate it to a cloud service to ensure that its VIP remains constant.
</td>

<td width="302" >Static mode public IP addresses provide the same capability as reserved IP addresses.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="143" >Public IP address per virtual machine
</td>

<td width="258" >You can assign public IP addresses to a virtual machine directly.
</td>

<td width="308" >You can assign public IP addresses to a network interface attached to a virtual machine.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="143" >Endpoints
</td>

<td width="258" >You can allow external connections to virtual machines by configuring endpoints of the cloud service.
</td>

<td width="309" >You can access a virtual machine by using its public IP address. Alternatively, you can provide access to a virtual machine on a specific port by configuring inbound NAT rules on a load balancer associated with the network adapter attached to the virtual machine.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="143" >DNS name
</td>

<td width="258" >Every cloud service has a public DNS name in the cloudapp.net namespace, such as:

mdnogadev.cloudapp.net
</td>

<td width="312" >The DNS name associated with a public IP address of a virtual machine or a load balancer is optional. The FQDN includes the Azure region where the load balancer and the virtual machine reside, such as:

mdnogavm1.westus.cloudapp.azure.com.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="143" >Network interfaces
</td>

<td width="260" >You define the primary and secondary network interfaces within the configuration of a virtual machine.
</td>

<td width="312" >The network interface is an independent resource that is persistent in the Azure environment. You can attach it to, and detach it from, virtual machines without losing its identity and configuration state. Its lifecycle does not have to depend on the lifecycle of a virtual machine.
</td>
</tr>
</tbody>
</table>

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
