---
title: "Overview of Networking with Windows Server 2012 R2"
description: "Windows Server 2012 R2 makes it as straightforward to manage an entire network as a single server, giving you the reliability and scalability of multiple servers at a lower…"
pubDate: 2013-06-23
category: windows-server
tags: [hyper-v]
translationKey: overview-of-networking-with-windows-server-2012-r2
legacy: true
legacyUrl: /2013/06/overview-of-server-virtualization-with-windows-server-2012-r2-2.html
---

Windows Server 2012 R2 makes it as straightforward to manage an entire network as a single server, giving you the reliability and scalability of multiple servers at a lower cost. Automatic rerouting around storage, server, and network failures enables file services to remain online with minimal noticeable downtime. In addition, Windows Server 2012 R2 provides the foundation for software-defined networking out-of-the-box – enabling seamless connectivity across public, private, and hybrid cloud implementations.  

It offers several new and enhanced features that can help reduce networking complexity while lowering costs, simplifying management tasks, and delivering services reliably and efficiently.  

## Software-defined networking 

Software-defined networking (SDN) enhances the management of modern networks by providing the ability for applications to control access to network resources dynamically. A key enabler of SDN is that it uses networking functionality that has been moved to a virtual switch, providing the ability to modify packets in transit and enabling integration of more advanced switch extensions. Finally, SDN also brings the benefit of unifying the management of both the physical and virtual infrastructure.  

**Hyper-V Network Virtualization **and the **Hyper-V Extensible Switch **are the foundations of SDN in Windows Server 2012 R2. You can isolate network traffic from different business units or customers on a shared infrastructure and not be required to use VLANs. Hyper-V Network Virtualization also lets you move virtual machines as needed within your virtual infrastructure while preserving their virtual network assignments. You can even use Hyper-V Network Virtualization to transparently integrate these private networks into a preexisting infrastructure on another site.  

Hyper-V Network Virtualization extends the concept of server virtualization to allow multiple virtual networks, potentially with overlapping IP addresses, to be deployed on the same physical network. With Hyper-V Network Virtualization, you can set policies that isolate traffic in your dedicated virtual network independently of the physical infrastructure.  

The Hyper-V Extensible Switch in Windows Server 2012 R2 is a layer-2 virtual network switch that provides programmatically managed and extensible capabilities to connect virtual machines to the physical network. It is an open platform that makes it possible for multiple vendors to provide extensions that are written to standard Windows API frameworks, the reliability of which are strengthened through the Windows standard framework.  

On the same physical network, with Hyper-V Network Virtualization and the Hyper-V Extensible Switch, you can run multiple virtual network infrastructures and you can have overlapping IP addresses with each virtual network infrastructure acting as if it was the only one running on the shared physical network infrastructure.  

In Windows Server 2012, we also introduced a feature called cross-premises connectivity, with provides VPN site-to-site functionality to help establish cross-premises connectivity between enterprises and hosting service providers. Cross-premises connectivity enables enterprises to connect to private subnets in a hosted cloud network. It also enables connectivity between geographically separate enterprise locations. However, some of the limitations of this feature were that you needed one gateway per tenant. Windows Server 2012 R2 now includes a **multi-tenant VPN gateway **built right into the operating system. This function can provide a seamless connection over a site-to-site VPN link between multiple external organizations and the resources that those organizations own in a hosted cloud. It also enables connectivity between physical and virtual networks, enterprise datacenters, and hosting organizations, and between enterprise networks and Windows Azure.  

Another challenge on the path to a software-defined datacenter has been the fact that today’s datacenters are made up of different classes of devices – such as load balancers, power distribution units, baseboard management controllers (BMCs), top-of-rack (TOR) switches, and routers – from a variety of device manufacturers.  

Windows Server 2012 R2 includes **standards-based switch configuration **as a device management abstraction layer that further reduces the complexity of heterogeneous device management with the goal that devices can be easily managed and configured using standards technologies. Windows Server 2012 R2 allows you to enable device management using a common abstraction layer, working over standard protocol and schema; as a consequence, it allows you to move from a complex datacenter device world into a world of well-defined, standard based components; and build a ready to use solution for device management right in Windows.  

## High-performance networking 

**Single Root I/O Virtualization **(SR-IOV) is a standard introduced by the PCI-SIG, the special-interest group that owns and manages PCI specifications as open industry standards. SR-IOV works in conjunction with system chipset support for virtualization technologies that provide remapping of interrupts and Direct Memory Access, and allows SR-IOV-capable devices to be assigned directly to a virtual machine.  

Introduced with Windows Server 2012, Hyper-V enables support for SR-IOV-capable network devices and allows a SR-IOV virtual function of a physical network adapter to be assigned directly to a virtual machine. This increases network throughput and reduces network latency while also reducing the host CPU overhead required for processing network traffic. You can configure your systems to maximize the use of host system processors and memory to effectively handle the most demanding workloads. These Hyper-V features let you take full advantage of the largest available host systems to deploy mission-critical, tier-1 business applications with large, demanding workloads.  

Windows Server 2012 R2 also helps you provide fault tolerance on your network adapters without having to buy additional hardware and software. Windows Server 2012 R2 includes **NIC Teaming **which allows multiple network interfaces to work together as a team, preventing connectivity loss if one network adapter fails. NIC Teaming also allows you to aggregate bandwidth from multiple network adapters, so for example, four 1-gigabyte (GB) network adapters can provide an aggregate of 4 GB/second of throughput. In Windows Server 2012 R2, the load-balancing algorithms have been further enhanced with the goal to better utilize all NICs in the team, significantly improving performance.  

The advantages of a Windows NIC Teaming solution are that it works with all network adapter vendors, spares you from most potential problems that proprietary solutions cause, provides a common set of management tools for all adapter types, and is fully supported by Microsoft.  

## Improved manageability and diagnostics

Windows Server 2012 R2 builds on the networking advances in Windows Server 2012 with an array of new and enhanced features that help reduce networking complexity while lowering costs and simplifying management tasks. With Windows Server 2012 R2, you now have the tools to automate and consolidate networking processes and resources.  

IP Address Management (IPAM), introduced in Windows Server 2012, is an out-of-the-box framework for discovering, monitoring, auditing, and managing the IP address space and the associated infrastructure servers on a corporate network. IPAM provides automatic IP address infrastructure discovery, migration of IP address data from spreadsheets or other tools, custom IP address space display, reporting and management, audit of server configuration changes and tracking of IP address usage, and monitoring and specific scenario-based management of DHCP and Domain Name System services. Windows Server 2012 R2 adds **virtual IP address space management**, which means that IPAM in Windows Server 2012 R2 now can show both the physical and the virtual address space in a single view, including tenant IP subnets and address spaces as well as the provider IP address space.  

Since Windows Server 2012, you have been able to manage Quality of Service (QoS) policies and settings dynamically with Windows PowerShell. Most hosting providers and enterprises today use a dedicated network adapter and a dedicated network for a specific type of workload such as storage or live migration to help achieve network performance isolation on a server running Hyper-V. QoS minimum bandwidth benefits vary between service providers to enterprises. For service providers, **QoS management **allows them to host customers on a server running Hyper-V and still be able to provide a certain level of performance based on SLAs. It also helps them to ensure that customers won’t be affected or compromised by other customers on their shared infrastructure, which includes computing, storage, and network resources. For enterprises, QoS management allows them to run multiple application servers on a server running Hyper-V and be confident that each application server will deliver predictable performance.  

Hyper-V in Windows Server 2012 R2 helps providers build a multitenant environment in which virtual machines can be served to multiple clients in a more isolated way. Because a single client may have many virtual machines, aggregation of resource use data can be a challenging task. However, Windows Server 2012 R2 simplifies this task by using resource pools, a Hyper-V feature that allows for **resource metering. **Resource pools are logical containers that collect the resources of the virtual machines that belong to one client, permitting single-point querying of the client’s overall resource use. Resource Metering in Windows Server 2012 R2 can measure and track a series of important data points, including the following:  
  * The average CPU, in megahertz, used by a virtual machine over a period of time.  
  * The average physical memory, in megabytes, used by a virtual machine over a period of time.  
  * The lowest amount of physical memory, in megabytes, assigned to a virtual machine over a period of time.  
  * The highest amount of physical memory, in megabytes, assigned to a virtual machine over a period of time.  
  * The highest amount of disk space capacity, in megabytes, allocated to a virtual machine over a period of time.  
  * The total incoming network traffic, in megabytes, for a virtual network adapter over a period of time.  
  * The total outgoing network traffic, in megabytes, for a virtual network adapter over a period of time. 

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
