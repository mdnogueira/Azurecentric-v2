---
title: "Options to connect your datacenter to Azure Virtual Networks – Part 2 – Point-to-Site VPN"
description: "On the previous post (see here) I briefly describe the options that you have to cross-premise connections to Azure. On this post I want to explore more one of the options:…"
pubDate: 2017-05-24
category: networking
tags: [hybrid]
translationKey: options-to-connect-your-datacenter-to-azure-virtual-networks-part-2-point-to-site-vpn
legacy: true
legacyUrl: /2017/05/options-to-connect-your-datacenter-to-azure-virtual-networks-part-2-point-to-site-vpn.html
---

On the previous post (see [here](/posts/options-to-connect-your-datacenter-to-azure-virtual-networks-part-1)) I briefly describe the options that you have to cross-premise connections to Azure. On this post I want to explore more one of the options: Point-to-Site VPN.

A point-to-site VPN employs SSTP to allow direct connectivity to an Azure virtual network from individual computers running any of the following Windows operating systems: 	
  * Windows 7 (32-bit and 64-bit versions)
  * Windows 8 (32-bit and 64 bit versions)
  * Windows 8.1 (32-bit and 64 bit versions)
  * Windows 10 (32-bit and 64 bit versions)
  * Windows Server 2008 R2
  * Windows Server 2012
  * Windows Server 2012 R2
  * Windows Server 2016

SSTP relies on certificates to authenticate and encrypt connections between clients and the Azure VPN gateway. You have the option of using either your internal public key infrastructure (PKI) or generating self-signed certificates. You need to upload the public key of the root (representing your PKI deployment or a self-signed one) to Azure and associated with the target virtual network containing the VPN gateway. You also have to generate client certificates (typically one per each client computer) either by relying on your PKI implementation or by generating self-signed client certificates that reference the self-signed root certificate. You install the client certificates with their respective private keys in the private certificate store on client computers. Effectively, the VPN tunnel relies on the implicit trust between the client certificates on VPN client computers and the root certificate uploaded to the Azure VPN gateway.

This functionality leverages the VPN client software built into the operating system; however, it also requires installation of a VPN software package, which is available in a 32-bit and 64-bit version (the one you choose should match the version of the operating system). The package is customer specific. You can generate and download the package from the Azure portal. Its installation configures the built-in VPN client software and creates a new VPN connection entry on client computers. At that point, users can connect to the Azure virtual network by simply activating the new connection.

From the Azure infrastructure standpoint, a point-to-site VPN requires a VPN gateway associated with the target Azure virtual network, just like a site-to-site VPN or ExpressRoute. However, in this case, there is no need for additional on-premises servers or network circuits. You also need to take into account that there is extra management overhead involved in certificate management. In particular, you need to issue, install, and maintain validity of client certificates. You should also keep track of computers to which you deployed client certificates as well as their users. This allows you to revoke certificates in case a computer gets compromised or stolen or when a user leaves your organization.

When configuring a point-to-site VPN, you will need to designate an IP address range for VPN client computers. As part of the VPN connection establishment process, a VPN client automatically receives an IP address from this range. At that point, the VPN client software automatically updates the local routing table on the client computer so that any connection targeting the IP address space of the Azure virtual network is routed via the VPN connection.
  **Note:** Updates to the local routing tables on the client computer require local Administrator privileges.

The total bandwidth available for the point-to-site connections depends on the SKU of the VPN gateway:
  * Standard is up to 100 Mbps.
  * High Performance is up to 200 Mbps.

All point-to-site VPN clients share that bandwidth, so the user experience depends on the total number of client computers simultaneously accessing the target virtual network. The VPN gateway enforces the limit of 128 concurrent connections.

Just like with a site-to-site VPN, the cost of a point-to-site VPN is comprised of two main components. The easiest-to-estimate part represents the hourly cost of virtual machines hosting the VPN gateway. This depends on its SKU. There are three pricing tiers: Basic, Standard, or High Performance. In addition, there is a charge for outbound data transfers at standard data transfer rates, which depend on the volume of data and the zone in which Azure data center hosting the VPN gateway resides. The first 5 GB per month are free of charge. There is also no cost associated with inbound data transfers.
  **Note**: For up-to-date point-to-site VPN pricing information, refer to [VPN Gateway Pricing](https://azure.microsoft.com/en-us/pricing/details/vpn-gateway/)

There is a 99.9 percent availability SLA for each VPN gateway.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
