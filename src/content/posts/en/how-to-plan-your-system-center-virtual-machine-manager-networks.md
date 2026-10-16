---
title: "How to plan your System Center Virtual Machine Manager Networks"
description: "For several times I have just ending up to explain how we should handle with networks on SCVMM in different scenarios. Here is the base that I use to planning SCVMM networks…"
pubDate: 2013-10-01
category: windows-server
tags: [networking, scvmm]
translationKey: how-to-plan-your-system-center-virtual-machine-manager-networks
legacy: true
legacyUrl: /2013/10/how-to-plan-your-system-center-virtual-machine-manager-networks-2.html
---

For several times I have just ending up to explain how we should handle with networks on SCVMM in different scenarios. Here is the base that I use to planning SCVMM networks for all scenarios.

SCVMM provides many options when you plan to connect your virtual machines to a physical network. You can use these options on their own or in a mixed environment, depending on your needs.
  * **VLAN-based configuration** – You can use familiar virtual area network (VLAN) technology for network isolation. You can manage those networks as they are, using SCVMM to simplify the management process.
  * **No isolation** – You can get direct access to the logical network with a VM network. This is the simplest configuration, where the VM network is the same as the logical network on which it is configured. This configuration is appropriate for a network through which you will manage a host.
  * **Network virtualization** – You can support multiple tenants (also called clients or customers) with their own networks, isolated from the networks of others. With this isolation, your tenants can use any IP addresses that they want for their virtual machines, regardless of the IP addresses that are used on other VM networks. Also, you can allow your tenants to configure some aspects of their own networks, based on limits that you specify. Network virtualization abstracts the physical address space and presents a virtual address space of the tenants.
  * **Use external networks** – You can use a vendor network-management console that allows you to configure settings on your forwarding extension, for example, settings for logical networks, network sites, and VM networks. SCVMM will import those settings.
  * **No virtual networking** – Networks that don’t require access by VMs do not use VM networks. For example, storage networks.

<table cellpadding="0" cellspacing="0" border="0" ><tbody ><tr >
<td width="248" valign="top" >

**Networking Level**

</td>
<td width="531" valign="top" >

**How SCVMM networking can be used**

</td></tr><tr >
<td width="248" valign="top" >

Physical Fabric

</td>
<td width="531" valign="top" >

**Fabric administrators** can maintain network hardware (such as network adapters and switches) without requiring other administrators or users to understand it. Fabric administrators can maintain a stable physical network configuration while still being able to provide flexibility to others who need specific IP address spaces for their virtual machines.

</td></tr><tr >
<td width="248" valign="top" >

Logical Networks and Logical Switches

</td>
<td width="531" valign="top" >

**Fabric administrators** can create logical networks and logical switches as an underlying configuration that is straightforward to maintain and is not visible to tenant administrators or users.

</td></tr><tr >
<td width="248" valign="top" >

VM Networks

</td>
<td width="531" valign="top" >

**Tenant administrators** can create VM network easily, making it easy to respond when users need additional or different IP address spaces. (Tenant administrators can also control resource usage through user role quotas.)  
**Self-service users** can create virtual machines and connect them to VM networks without having to involve tenant administrators.

</td></tr></tbody></table>

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
