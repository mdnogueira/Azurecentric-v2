---
title: "Integration between Hyper-V Network Virtualization and Windows Server Gateway"
description: "One of features on Windows Server 2012 R2 that was improved since the last version is network virtualization. Virtual networks are created by using Hyper-V Network…"
pubDate: 2013-11-01
category: hyper-v
tags: ["windows-server", "hyper-v", "network-virtualization", "windows-server-gateway", "azure-virtual-network", "vpn"]
translationKey: integration-between-hyper-v-network-virtualization-and-windows-server-gateway
legacy: true
legacyUrl: /2013/11/integration-between-hyper-v-network-virtualization-and-windows-server-gateway.html
---

One of features on Windows Server 2012 R2 that was improved since the last version is network virtualization. Virtual networks are created by using Hyper-V Network Virtualization, which is a technology that was introduced in Windows Server 2012.

In Windows Server 2012 R2 have now a service that help enable datacenters and clouds networks traffic been routed between virtual and physical networks, including the Internet. The service responsible for routing all the traffic is Windows Server Gateway. Windows Server Gateway is a vm-based software router that is able to route network traffic effectively between different datacenters or between datacenters and cloud.

## How it works

Hyper-V Network Virtualization provides the concept of a virtual machine (VM) network that is independent of the underlying physical network. With this concept of VM networks, which are composed of one or more virtual subnets, the exact physical location of an IP subnet is decoupled from the virtual network topology. As a result, organizations can easily move their subnets to the cloud while preserving their existing IP addresses and topology in the cloud. This ability to preserve infrastructure allows existing services to continue to work, unaware of the physical location of the subnets. That is, Hyper-V Network Virtualization enables a seamless hybrid cloud.

In both private and hybrid cloud environments using Windows Server 2012, however, it was difficult to provide connectivity between VMs on the virtual network and resources on physical networks at local and remote sites, creating a circumstance where virtual subnets were islands separated from the rest of the network.

In Windows Server 2012 R2, Windows Server Gateway routes network traffic between the physical network and VM network resources, regardless of where the resources are located. You can use Windows Server Gateway to route network traffic between physical and virtual networks at the same physical location or at many different physical locations.

One example is, if you have both a physical network and a virtual network at the same physical location, you can deploy a server running Hyper-V that is configured with a Windows Server Gateway VM to act as a forwarding gateway and route traffic between the virtual and physical networks.

Another example is, if your virtual networks exist in the cloud, your cloud can deploy a Windows Server Gateway so that you can create a virtual private network (VPN) site-to-site connection between your VPN server and the cloud’s Windows Server Gateway; when this link is established you can connect to your virtual resources in the cloud over the VPN connection.

### Integration between Hyper-V Network Virtualization and Windows Server Gateway

Windows Server Gateway is integrated with Hyper-V Network Virtualization, and is able to route network traffic effectively in circumstances where there are many different tenants – who have isolated virtual networks in the same datacenter.

Multi-tenancy is the ability of a cloud infrastructure to support the virtual machine workloads of multiple tenants, but isolate them from each other, while all of the workloads run on the same infrastructure. The multiple workloads of an individual tenant can interconnect and be managed remotely, but these systems do not interconnect with the workloads of other tenants, nor can other tenants remotely manage them.

## How to use

There are different way that you can use Windows Server Gateway in your organization. It will depend what is overall solution that you want to achieve. You can use Windows Server Gateway in this situation:	
  * Windows Server Gateway as a forwarding gateway for private cloud environments
  * Windows Server Gateway as a site-to-site VPN gateway for hybrid cloud environments
  * Multitenant Network Address Translation (NAT) for VM Internet access
  * Multitenant remote access VPN connections

#### Windows Server Gateway as a forwarding gateway for private cloud environments

For Enterprises that deploy an on-premises private cloud, Windows Server Gateway can act as a forwarding gateway and route traffic between virtual networks and the physical network.

If you have created virtual networks for one or more of your clouds, but many of your key resources (such as Active Directory Domain Services, SharePoint, or DNS) are on your physical network, Windows Server Gateway can route traffic between the virtual network and the physical network to provide users working on the virtual network with all of the services that they need.

The physical and virtual networks are at the same physical location. Windows Server Gateway is used to route traffic between the physical network and virtual networks.

### Windows Server Gateway as a site-to-site VPN gateway for hybrid cloud environments

If your infrastructure is a hybrid cloud, Windows Server Gateway provides a multitenant gateway solution that allows your tenants to access and manage their resources over site-to-site VPN connections from remote sites, and that allows network traffic flow between virtual resources in your datacenter and their physical network.

A Cloud Service Provider (example Azure) provides datacenter network access to multiple tenants, some of whom have multiple sites across the Internet. In this example, tenants use third party VPN servers at their corporate sites, while the CSP uses Windows Server Gateway for the site-to-site VPN connections.

### Multitenant Network Address Translation (NAT) for VM Internet access

A home user running a Web browser on their computer makes a purchase on the Internet from a Contoso Web server that is a VM on the Contoso Virtual Network. During the purchasing process, the Web app verifies the credit card information provided by the home user by connecting to a Financial Services company on the Internet. This ability to connect from the virtual network to Internet resources is provided when NAT is enabled on the CSP Windows Server Gateway.

### Multitenant remote access VPN connections

Administrators use VPN dial-in connections to administer VMs on their corporate virtual networks. The Administrator from Contoso initiates the VPN connection from an Internet-enabled branch office, and connects through the CSP Windows Server Gateway to the Contoso Virtual Network.

Similarly, the Northwind Traders Administrator establishes a VPN connection from a residence office to manage VMs on the Northwind Traders Virtual Network.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
