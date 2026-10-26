---
title: "Options to connect your datacenter to Azure Virtual Networks – Part 3 – Site-to-Site VPN"
description: "On the one of the previous post (see here) I briefly describe the options that you have to cross-premise connections to Azure. On this post, I want to explore more one of the…"
pubDate: 2017-05-26
category: networking
tags: ["azure-vpn-gateway", "vpn", "azure-virtual-network"]
translationKey: options-to-connect-your-datacenter-to-azure-virtual-networks-part-3-site-to-site-vpn
legacy: true
legacyUrl: /2017/05/options-to-connect-your-datacenter-to-azure-virtual-networks-part-3-site-to-site-vpn.html
---

On the one of the previous post (see [here](/posts/options-to-connect-your-datacenter-to-azure-virtual-networks-part-1)) I briefly describe the options that you have to cross-premise connections to Azure. On this post, I want to explore more one of the options: Site-to-Site VPN.

Site-to-site VPNs rely on static routes to direct traffic between on-premises networks and Azure virtual networks. The Azure platform generates these routes when you create the site-to-site VPN connection based on two pieces of data: the IP address space that you assigned to the Azure virtual network and the local network, which you define in the process of setting up the VPN connection. The local network represents the IP address space of your on-premises networks.

Keep in mind that Azure implements the routing configuration of Azure virtual network. For cross-premises connectivity to function, you must update the on-premises routing configuration.

The site-to-site VPN method employs the IPSec protocol with a pre-shared key to provide authentication between the on-premises VPN gateway and the Azure VPN gateway. The key is an alphanumeric string between 1 and 128 characters.

From the infrastructure standpoint, in addition to a reliable connection to the Internet from your on-premises network, a site-to-site VPN requires a VPN gateway on each end of the VPN tunnel. On the Azure side, you provision a VPN gateway as part of creating a site-to-site VPN. Its characteristics depend on a couple of factors:
  * The VPN gateway SKU determines capacity and performance characteristics. There are two SKUs available in this case:
    * The Basic and Standard SKUs offers up to 100 Mbps throughput with maximum of 10 IPSec tunnels.
    * The High Performance SKU offers up to 200 Mbps throughput with maximum of 30 IPSec tunnels.
  * The VPN gateway type determines functional characteristics. The type of the Azure VPN gateway depends directly on the type of the VPN gateway used on premises, because they have to match. There are two types of VPN gateways:
    * Policy-based (formerly known as static).
    * Route-based (formerly known as dynamic).
      **Note:** You can increase or decrease the SKU of a VPN gateway on as needed basis. However, you cannot change the existing gateway type.
      **Note:** The effective throughput of VPN connections might vary, depending on the bandwidth of the Internet connection and impact of encryption associated with the VPN functionality.

Policy-based VPN devices operate according to local IPSec policies that you define. The policies determine whether to encrypt and direct traffic that reaches an IPSec tunnel interface based on the source and target IP address prefixes.

Route-based VPN devices rely on routes in the local routing table that you define to deliver traffic to a specific IPSec tunnel interface, which, at that point, performs encryption and forwards the encrypted network packets. In other words, in this case, any traffic reaching the interface is automatically encrypted and forwarded to the Azure VPN gateway on the other end of the tunnel.
  **Note:** A site-to-site VPN does not support transitive routing between on-premises locations.

The choice of the device type has a number of significant implications: 	
  * Policy-based VPN devices support only a single site-to-site connection. With route-based VPN devices, that number depends on the Azure VPN gateway SKU, with up to 10 connections in case of the Basic and Standard SKUs and up to 30 connections in case of the High Performance SKU.
  * Policy-based VPN devices do not support point-to-site VPNs. This becomes important when you want to provide shared access to an Azure virtual network to clients connecting via a site-to-site VPN and a point-to-site VPN. Effectively, to implement this functionality, you would have to use a route-based VPN gateway in Azure, which implies the need to have the matching VPN device type on premises.
  * From the encryption standpoint, policy-based VPN devices support the Internet Key Exchange version 1 (IKEv1), AES256 (Advanced Encryption Standard), and AES128 3DES (Data Encryption Stanadrd) encryption algorithms, as well as the SHA1(SHA128) (Secure Hash Algorithm) hashing algorithm. Route-based VPN devices offer support for the IKEv2 and AES256 3DES encryption algorithm (during IKE Phase 1 setup) as well as both the SHA1(SHA128) and the SHA2(SHA256) hashing algorithms (again, during IKE Phase 1 setup). In addition, they also support perfect forward secrecy (DH Group1, 2, 5, 14, and 24).

Specifics of on-premises site-to-site VPN configuration are device specific. Microsoft offers configuration instructions for each of the validated VPN devices. Non-validated VPN devices may support site-to-site VPN, but they require independent testing.

For a list of VPN devices that Microsoft has validated in partnership with their vendors, and their configuration instructions, refer to [VPN devices for Site-to-Site VPN Gateway connections](https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-devices)

There are additional considerations regarding your on-premises infrastructure. In particular, if your VPN gateway resides on the perimeter network behind a firewall, you must ensure that the following types of traffic are allowed to pass through for both the inbound and outbound directions:
  * IP protocol 50
  * UDP port 500
  * UDP port 4500

The cost of site-to-site VPNs is comprised of two main components. The easiest-to-estimate part is the hourly cost of virtual machines hosting the VPN gateway. This depends on its SKU. There are three pricing tiers: Basic, Standard, or High Performance. In addition, there is a charge for outbound data transfers at standard data transfer rates, which depend on the volume of data and the zone in which Azure datacenter hosting the VPN gateway resides. The first 5 gigabytes (GB) per month are free of charge. There is also no cost associated with inbound data transfers.

There is a 99.9 percent availability Service Level Agreement (SLA) for each VPN gateway. A number of third-party vendors of VPN gateway devices support redundant configurations, which increase the resiliency of the on-premises endpoint of the VPN tunnel.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
