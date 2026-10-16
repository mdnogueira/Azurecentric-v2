---
title: "How to configure your Hybrid Network Solution with Azure"
description: "By combining the existing Azure networking features, it is possible to configure Azure virtual networks to function as an extension of your on-premises datacenter. You have the…"
pubDate: 2017-06-12
category: networking
tags: [architecture, hybrid]
translationKey: how-to-configure-your-hybrid-network-solution-with-azure
legacy: true
legacyUrl: /2017/06/how-to-configure-your-hybrid-network-solution-with-azure.html
---

By combining the existing Azure networking features, it is possible to configure Azure virtual networks to function as an extension of your on-premises datacenter. You have the option of deploying multi-tier production workloads in Azure and making them available via Azure internal load balancers to on-premises users. Another possibility is to implement your lab or test environment in a dedicated subnet or a virtual network that is fully isolated from your production systems. You can also leverage Azure virtual machines to host your disaster recovery site. ExpressRoute introduces a range of additional options, including hybrid applications with tiers distributed between the on-promises network and the Azure virtual network, high-volume backups, or cross-premises big data workloads.

When architecting solutions such as these, in addition to implementing site-to-site or ExpressRoute connectivity as described in the previous posts (see [here](/posts/creating-a-site-to-site-vpn-on-azure) and [here](/posts/creating-an-expressroute-vpn-on-azure), respectively), you can also take advantage of a variety of Azure networking technologies, such as load balancers, user-defined routes, network security groups, or forced tunneling. You also have the option to leverage a large assortment of virtual appliances available on Microsoft Azure Marketplace, including products from such vendors as Barracuda, CheckPoint, Cohesive Networks, Fortinet, or SecureSphere.

These technologies also allow you to build another type of hybrid solution: one with an Azure virtual network emulating an on-premises perimeter network (also referred to as a DMZ, demilitarized zone, and screened subnet).

The recommended design in this case involves the following components:
* **Cross-premises connectivity.** Cross-premises connectivity by using either a site-to-site VPN or ExpressRoute connection.
* **A pair of virtual network appliances.** A pair of virtual network appliances with traffic filtering capabilities placed on the edge of the virtual network.
* **A load balancer.** A load balancer positioned in front of the pair of virtual network appliances, handling distribution of incoming traffic and failover in case of an appliance failure. The load balancer further enhances security by filtering traffic according to its load balancing and NAT rules.
* **A user-defined route.** A user-defined route applied to the Azure VNP gateway subnet redirecting the incoming traffic to the load balancer. Optionally, you can create a route that will bypass load balancer to allow for direct access to a management subnet.
* **User-defined routes.** User-defined routes applied to subnets hosting virtual machines running your production workloads, which allow you to control the flow of outbound traffic.
* **Forced tunneling.** Forced tunneling to ensure that the outbound traffic to the Internet flows via an on-premises traffic inspection system for auditing purposes.
* **Network security groups.** Network security groups to restrict traffic between virtual machines behind the pair of network virtual appliances.

The specifics of implementing forced tunneling depend on the cross-premises connectivity method. In particular, with site-to-site VPN, you need to create a user-defined route with the default route of 0.0.0.0/0, and set its next hop type to be the VPN gateway. In addition, if there are multiple on-premises sites connected to the virtual network, you need to define the default site where traffic will be routed. To do this, run the **_Set-AzureRmVirtualNetworkGatewayDefaultSite_** Azure PowerShell cmdlet. ExpressRoute, on the other hand, relies on the advertisement of default routes via private peering sessions.
  **Note:** If you decide to forced tunneling, then you must apply user-defined routing to override the default route for every subnet that requires direct Internet connectivity. To use the Azure-based Key Management Server (KMS) license activation of Windows virtual machines, you need to define a route for the prefix 23.102.135.246/32 with the next hop type set to Internet.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
