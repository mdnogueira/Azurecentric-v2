---
title: "ARM vs Classic Virtual Machines"
description: "Right now, Azure allows us to use the classic and the ARM portal. They might be very similar, except the end-user experience (in this case the portal himself), because you can…"
pubDate: 2016-02-16
category: compute
tags: [vhd]
translationKey: arm-vs-classic-virtual-machines
legacy: true
legacyUrl: /2016/02/arm-vs-classic-virtual-machines.html
---

Right now, Azure allows us to use the classic and the ARM portal. They might be very similar, except the end-user experience (in this case the portal himself), because you can create virtual machines in both. Although there is a huge difference.

The choice of the deployment model determines the characteristics of the Azure components that you deploy. The Azure classic deployment model was originally referred to as the Service Management model. Introduced in 2009, this model served as the primary method of deploying and managing Azure services until the introduction of Azure Resource Manager.

You can provision Azure VMs by using either the classic or the Azure Resource Manager deployment model. Although it’s recommend exclusive use of Azure Resource Manager for any future deployments, there might be scenarios where using the classic deployment model is necessary.

In comparison to the classic deployment model, the capabilities of Azure Resource Manager deliver significant changes to the implementation and management of virtual machines and their associated infrastructure, including:
  * Support for large scale and parallel deployment of virtual machines.
  * Support for up to three fault domains in an availability set. Each fault domain consists of independent set of hardware components, corresponding roughly to a separate datacenter rack. By enforcing placement of virtual machines in different fault domains, you can eliminate single points of failure for a virtual machine. Classic deployment model supports two fault domains in an availability set.
  * Integration of the Azure Key Vault with virtual machines to store sensitive data and secrets such as passwords. This also provides support for platform-based encryption of VM disks.
  * Exposure of network APIs that enable independent creation and assignment of network resources such as network interfaces, load balancers, and virtual networks. These resources are not dependent on a virtual machine, and you can reuse them in the deployment process for other virtual machines or solutions.

Azure Resource Manager introduces a new approach to creating and managing IaaS resources. The following table identifies the primary differences between the classic model and the Azure Resource Manager model.
<table width="679" style="height: 2515px; border: 1px solid black;" >
<tbody >
<tr style="border: 1px solid black;" >

<td width="163" >Management model
</td>

<td width="282" >The classic model uses an Azure cloud service as a container for virtual-machine resources. You must deploy a virtual machine and its resources into a cloud service. A cloud service serves as the primary management point of virtual machines within it.

</td>

<td width="270" >Azure Resource Manager handles virtual-machine resources as independent objects that you can attach to each other. For example, a virtual-network adapter is a separate entity that you use to attach a virtual machine to a virtual network. You can manage these resources individually, or as logical units, in resource groups. Resource groups are the primary logical container used for both the initial deployment and management of a group of Azure resources.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="163" >Azure Cloud Services for virtual machines
</td>

<td width="282" >A cloud service is a mandatory container for virtual machines and associated objects.
</td>

<td width="256" >Cloud Services do not exist.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="163" >Availability sets
</td>

<td width="280" >You can achieve high availability by placing two or more virtual machines into the same availability set. Virtual machines that you assign to the same availability set are automatically placed into different fault domains, there are two fault domains per availability set.
</td>

<td width="260" >Availability sets also are available in Azure Resource Manager. There is support for up to three fault domains per availability set.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="163" >Affinity groups
</td>

<td width="281" >You have the option of using affinity groups to affect placement of compute and storage resources in physical proximity to each other.
</td>

<td width="256" >Affinity groups do not exist.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="163" >Load balancing
</td>

<td width="280" >The Cloud Service object includes load balancing functionality. .
</td>

<td width="270" >The load balancer is an independent resource. You can attach a network adapter of a virtual machine to a load balancer.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="163" >Virtual IP address (VIP)
</td>

<td width="280" >The platform automatically assigns a VIP to each cloud service upon its creation. This address is associated with the cloud service load balancer.
</td>

<td width="268" >You have the option of adding a public IP address to a network adapter of a virtual machine or a load balancer.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="163" >Reserved IP address
</td>

<td width="280" >You can reserve an IP address in Azure, and then associate it with a cloud service.
</td>

<td width="260" >Static public IP addresses provide the same capability as reserved IP addresses.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="165" >Public IP address per virtual machine
</td>

<td width="280" >You can assign public IP addresses to a virtual machine directly.
</td>

<td width="267" >You can assign public IP addresses to a network interface, which then can be assigned to a virtual machine.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="163" >Endpoints
</td>

<td width="282" >You have the option of allowing inbound connectivity from the Internet by configuring input endpoints for the cloud service in which the virtual machines reside. Alternatively, you can assign a public IP address directly to an Azure VM.
</td>

<td width="270" >You can allow inbound connectivity to an Azure VM by configuring network address translation (NAT) rules on a load balancer associated with that VM. Alternatively, you can also assign a public IP directly to the network adapter attached to the VM.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="163" >DNS name
</td>

<td width="280" >Each cloud service must have a globally unique Domain Name System (DNS), such as:

vm1.cloudapp.net
</td>

<td width="269" >You have the option of assigning a regionally unique DNS name to the public IP address of a VM. The fully qualified domain name (FQDN) includes the Azure region, such as:

vm1.westus.cloudapp.azure.com.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="163" >Network interfaces
</td>

<td width="280" >You define the primary and secondary network interfaces as part of the configuration of a virtual machine.
</td>

<td width="266" >Network interfaces are independent resources. However, each network interface is directly associated with the virtual machine to which it is attached.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="163" >Creation and management
</td>

<td width="282" >You can use the classic portal, the Azure portal, the Azure Service Management Windows PowerShell module, Azure CLI, or the Azure Service Management API.
</td>

<td width="270" >You can use the Azure portal, Azure Resource Manager templates, the Azure Resource Manager Windows PowerShell, the Azure CLI, or the Azure Resource Manager API.
</td>
</tr>
</tbody>
</table>

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
