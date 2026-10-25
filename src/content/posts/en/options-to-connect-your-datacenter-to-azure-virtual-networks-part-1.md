---
title: "Options to connect your datacenter to Azure Virtual Networks – Part 1"
description: "In our days, we are starting to see a lot of change how organizations approach the cloud and how they adapt the cloud to their environment. So, why the way you connect to your…"
pubDate: 2017-05-19
category: networking
tags: ["azure-virtual-network", "expressroute"]
translationKey: options-to-connect-your-datacenter-to-azure-virtual-networks-part-1
legacy: true
legacyUrl: /2017/05/options-to-connect-your-datacenter-to-azure-virtual-networks-part-1.html
---

In our days, we are starting to see a lot of change how organizations approach the cloud and how they adapt the cloud to their environment. So, why the way you connect to your environment should be different?

Instead of maintaining a big infrastructure to support all of that VPN solution, that organizations need to have, so employees and branch offices can connect to, I’m seeing even more frequent that I was expected, using the power of Azure to leverage that. Saying that, what are my options to do it?

As briefly described in the older post (see [here](/posts/azure-resource-manager-networking-part-1)), to connect to an Azure virtual network from an on-premises network, you can use one of the following methods:
  * A point-to-site VPN that connects individual computers to an Azure virtual network via a Secure Socket Tunneling Protocol (SSTP) tunnel over the Internet.
  * A site-to-site VPN that connects an on-premises network (with all of its computers) to an Azure virtual network via an IPSec tunnel over the Internet.
  * ExpressRoute, which connects an on-premises network via a private connection (point-to-point). ExpressRoute offers predictable performance with higher bandwidth and lower latency than the VPN-based methods.

Each of these methods has unique benefits and was created for specific scenarios. However, the methods share the same basic purpose. By creating a cross-premises connection to an Azure virtual network, you allow users to connect to cloud-based resources the same way that they connect to local resources.

## **Point-to-site**

Use point-to-site connections when you have a small number of client computers that you want to connect to an Azure virtual network. Remember that computers with a point-to-site VPN can use that connection from any location with Internet access. There is no need for dedicated hardware or software. You have the option of leveraging a VPN client built directly into the Windows operating system. You must deploy a VPN gateway in Azure; however, this requirement applies to each of the three connectivity options. The throughput of the VPN gateway determines the available bandwidth, which is shared by all incoming VPN connections. In this case, the largest VPN gateway supports up to 200 megabits per second (Mbps) throughput. This type of solution is suitable for connecting to development, test, and lab environments hosted in an Azure virtual network.

## **Site-to-site**

A site-to-site VPN connects an on-premises network to an Azure virtual network via an IPSec VPN tunnel. This involves an on-premises VPN component that routes traffic to and from the Azure virtual network. You can use for this purpose either a hardware VPN device or a software-based VPN service such as the Routing and Remote Access Service (RRAS) running on a Windows server. In addition, you need to modify on-premises routing configuration to ensure that the traffic bound to the Azure virtual network reaches its destination.

Use a site-to-site connections when you have a large number of client computers all of which are connected to an on-premises network. Even though clients can only use site-to-site connections when they have a direct connection to the on-premises network, you have the option of connecting to the same virtual network by using site-to-site VPN and point-to-site VPN. However, keep in mind that in this case the bandwidth (of up to 200 Mbps) is shared across all connections. This type of solution is common when implementing development, test, and lab environments that rely on connectivity to an on-premises infrastructure. It also will likely suffice when dealing with small-scale hybrid production workloads.

It is possible to connect multiple Azure virtual network and multiple on-premises networks via a combination of site-to-site VPN and VNet-to-VNet connections. This effectively allows for sharing resources residing on the same Azure virtual network across multiple on-premises locations. However, there is no support for establishing multiple, redundant tunnels between an Azure virtual network and individual on-premises sites.
  **Note:** At the present time, it is not possible to route traffic between two on-premises locations via an Azure virtual network.

## **ExpressRoute **

The ExpressRoute service relies on a private circuit from your datacenter to an Azure datacenter through a service provider connection. The private circuit allows you to establish links to multiple Azure virtual networks (potentially in different Azure regions) via their respective VPN gateways. Eliminating the dependency on Internet connectivity results in consistent, reliable performance levels. It also makes it possible to significantly increase bandwidth and minimize latency. Similar to the site-to-site VPN method, ExpressRoute requires that clients reside in an on-premises location.

ExpressRoute provides other unique benefits compared to the two VPN-based solutions. With ExpressRoute you can directly connect—without crossing the public Internet—to a number of Azure services that are not part of Azure virtual networks: for example, Azure Storage. It also supports direct connectivity to Microsoft Office 365 services.

ExpressRoute offers per-circuit throughput of up to 10 gigabits per second 19(Gbps), with the per-VPN gateway throughput of up to 2,000 Mbps. These capabilities make ExpressRoute the preferred choice for enterprise and mission-critical workloads. ExpressRoute also might be worth considering when implementing Azure as a disaster recovery site and when using Azure as the backup destination for on-premises systems. Other common scenarios that involve ExpressRoute include hybrid big data and big compute solutions.

## **Planning considerations**

When planning and configuring your VPN connections to and from virtual networks, consider the following factors: 	
  * Address spaces must not overlap. Carefully plan the address spaces that you want to use in virtual networks and any connected on-premises networks.
  * Azure supports a maximum of 30 site-to-site VPN tunnels per VPN gateway.
  * A single VPN gateway can support up to 128 point-to-site VPN connections from client computers.
  * All VPN tunnels to a virtual network share the available bandwidth on the Azure VPN gateway. This includes point-to-site VPNs.
  * On-premises VPN devices must meet a number of requirements. The Microsoft website below lists these requirements and compatible non-Microsoft VPN devices.

For more information about the devices that are compatible, visit the following link: [https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-devices](https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-devices)

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
