---
title: "Options to connect your datacenter to Azure Virtual Networks – Part 4 – ExpressRoute"
description: "On the one of the previous post (see here) I briefly describe the options that you have to cross-premise connections to Azure. On this post, I want to explore more one of the…"
pubDate: 2017-06-02
category: networking
tags: [architecture, expressroute, hybrid]
translationKey: options-to-connect-your-datacenter-to-azure-virtual-networks-part-4-expressroute
legacy: true
legacyUrl: /2017/06/options-to-connect-your-datacenter-to-azure-virtual-networks-part-4-expressroute.html
---

On the one of the previous post (see [here](/posts/options-to-connect-your-datacenter-to-azure-virtual-networks-part-1)) I briefly describe the options that you have to cross-premise connections to Azure. On this post, I want to explore more one of the options: ExpressRoute.

ExpressRoute delivers private, network-layer connectivity between on-premises networks and Microsoft Cloud, without crossing the Internet, in the form of:

* **Private peering.** This includes connections to Azure virtual machines and Azure cloud services residing on Azure virtual networks. You have the ability to establish connectivity to multiple Azure virtual networks, with up to 10 virtual networks with the standard ExpressRoute offering and up to 100 virtual networks with the ExpressRoute Premium add-on.
* **Public peering.** This includes connections to Azure services not accessible directly via Azure virtual networks, such as Azure Storage or Microsoft Azure SQL Database. With public peering you can ensure that traffic from on-premises locations to Azure public IP addresses does not cross the Internet. It also delivers predictable performance and latency when connecting to these IP addresses.
* **Microsoft peering.** This includes connections to the Office 365 and Microsoft Dynamics CRM Online services.

Each of these peering arrangements constitutes a separate routing domain, but all of them are provisioned over the same physical connection. You have the option of combining them into the same routing domain, although the recommendation is to implement private peering between the internal network and Azure virtual networks, while limiting the scope of public peering and Microsoft peering to on-premises perimeter networks.

Each peering arrangement allows you to connect to all Azure regions in the same geopolitical region as the location of the ExpressRoute circuit. You can expand the scope of the connectivity globally by provisioning the ExpressRoute Premium add-on.
  **Note:** The only Azure services not supported by public peering at the present time include:

* Content Delivery Network (CDN)
* Visual Studio Team Services load testing
* Microsoft Azure Multi-Factor Authentication
* Azure Traffic Manager

From the provisioning standpoint, besides implementing physical connections, you also need to create one or more logical ExpressRoute circuits. You can identify each individual circuit based on its service key (s-key), which takes the form of a globally unique identifier (GUID). A single circuit can support up to three routing domains (private, public, and Microsoft, as listed above). Each circuit has a specific nominal bandwidth associated with it, which can range between 50 Mbps and 10 Gbps, shared across the routing domains. You have the option to increase or decrease the amount of provisioned bandwidth without the need to re-provision the circuit.

In private peering scenarios, establishing connection to a target virtual network requires creating a link between the ExpressRoute circuit and the Azure VPN gateway attached to that virtual network. As the result, the effective throughput on a per-virtual network basis depends on the SKU of the VPN gateway:
 	
* Up to 500 Mbps. It does not support the coexistence of a site-to-site VPN and ExpressRoute.
* Up to 1,000 Mbps. It supports the coexistence of a site-to-site VPN and ExpressRoute.
* High Performance. Up to 2,000 Mbps. It supports the coexistence of a site-to-site VPN and ExpressRoute.

There are three ExpressRoute connectivity models:

* A co-location in a facility hosting an ExpressRoute exchange provider. This facilitates private routing to Microsoft Cloud by using either Layer 2 or managed Layer 3 cross-connect with the exchange provider.
* A Layer 2 or managed Layer 3 connection to an ExpressRoute point-to-point provider.
* An any-to-any network (IPVPN) network, implemented commonly as a Multiprotocol Label Switching (MPLS) cloud, with a wide area network (WAN) provider handling Layer 3 connectivity to the Microsoft cloud.

Because ExpressRoute depends on having access to provider services, its availability depends on the customer location. For up-to-date information, refer to [ExpressRoute partners and peering locations](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-locations).

ExpressRoute routing is dynamic and relies on Border Gateway Protocol (BGP) route exchange between the on-premises environment and the Microsoft Cloud. You can advertise up to 4,000 prefixes (up to 10,000 with the ExpressRoute Premium add-in) within the private peering routing domain and up to 200 in the case of public peering and Microsoft peering. The prefixes that you advertise via BGP comprise one or more autonomous systems. Each autonomous system that relies on BGP route exchange has a corresponding autonomous system number (ASN). There are two types of ASNs: public and private. A public ASN is globally unique and supports exchanging routing information with any other autonomous system on the Internet. A private ASN is useful in scenarios that involve route exchange with a single provider only, which eliminates the requirement of global uniqueness. ExpressRoute requires a public ASN with all three peering scenarios.

To facilitate routing between your on-premises network and the Microsoft edge routers, you will need to designate several ranges of IP addresses. Specifics of this configuration depend to some extent on the peering arrangement, but:

* You must choose a pair of /30 subnets or a /29 subnet for each peering type.
* Each of the two /30 subnets will facilitate a separate BGP session. It is necessary to establish two sessions to qualify for the ExpressRoute availability SLA.
* With private peering, you can use either private or public IP addresses. With public peering and Microsoft peering, public IP addresses are mandatory.

Some providers manage routing of ExpressRoute traffic as part of their managed services. Usually, however, when provisioning ExpressRoute via Layer 2 connectivity providers, routing configuration and management is the customer’s responsibility.

For more details about [ExpressRoute routing requirements](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-routing)
  **Note:** ExpressRoute does not support transitive routing between on-premises locations. If you need this functionality, you must implement it based on the services offered by your connectivity provider.

The cost of ExpressRoute depends primarily on the billing model that you choose when provisioning the service. At the time of authoring this course, there are three billing models:

* **Unlimited data.** This set monthly fee covers the service as well as an unlimited amount of data transfers.
* **Metered data.** This set monthly fee covers the service. There is an additional charge for outbound data transfers on a per GB basis. Prices depend on the zone where the Azure region resides.
* **ExpressRoute Premium add-in.** This service extension provides additional ExpressRoute capabilities including:
  * An increased number of routes that can be advertised in the public and private peering scenarios, up to the 10,000-route limits.
  * Global connectivity to Microsoft Cloud from a circuit in an individual Azure region.
  * An increased number of virtual network links from an individual circuit, up to the 100 link limit.

When you evaluate the total cost of an ExpressRoute-based solution with private peering configuration, you should also take into account the cost of VPN gateways that will provide connectivity to individual virtual networks. As mentioned earlier, the cost of a VPN gateway depends on its SKU, with three pricing tiers: Basic, Standard, or High Performance.

From the resiliency standpoint, ExpressRoute circuits support a pair of connections between your network edge devices and Microsoft edge routers via a redundant infrastructure maintained by a connectivity provider. You must deploy redundant connections on your end of the circuit to qualify for the 99.9 percent circuit availability SLA. In private peering scenarios, each link to an individual virtual network is a subject to the 99.9 percent availability SLA applicable to the Azure VPN gateway.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
