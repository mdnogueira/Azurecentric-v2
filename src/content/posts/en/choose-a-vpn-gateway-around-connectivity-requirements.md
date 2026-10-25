---
title: "Choose a VPN gateway around connectivity requirements"
description: "Select an Azure VPN Gateway SKU and topology by matching throughput, tunnel count, and availability requirements."
pubDate: 2025-04-20
category: networking
tags: ["azure-vpn-gateway", "networking", "high-availability", "bgp", "sku-selection"]
translationKey: choose-a-vpn-gateway-around-connectivity-requirements
draft: false
---

## Match the SKU to your throughput and tunnel requirements

The first decision is which gateway SKU to provision. The Azure VPN Gateway documentation provides aggregate throughput benchmarks and maximum tunnel counts for each generation and tier [About Azure VPN Gateway](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways). These numbers are not aspirational; they define the hard limits of the virtual network gateway resource.

If your design requires more than 100 site-to-site (S2S) or VNet-to-VNet tunnels, VPN Gateway is not the correct service. You should use Virtual WAN instead [About Azure VPN Gateway](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways). For smaller deployments, the choice comes down to Generation 1 or Generation 2, and whether you need zone redundancy.

Generation 2 gateways offer higher aggregate throughput than Generation 1 equivalents. For example, a Generation 2 VpnGW2 provides 1.25 Gbps, compared to 1 Gbps for a Generation 1 VpnGW2 [About Azure VPN Gateway](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways). A Generation 2 VpnGW5 supports up to 10 Gbps and 10,000 Point-to-Site (P2S) IKEv2/OpenVPN connections, whereas a Generation 1 VpnGW3 tops out at 1.25 Gbps and 1,000 P2S connections [About Azure VPN Gateway](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways).

| SKU | Generation | Aggregate Throughput | Max S2S/VNet-to-VNet Tunnels | Max P2S IKEv2/OpenVPN | Zone-Redundant |
|---|---|---|---|---|---|
| VpnGW1 | 1 | 650 Mbps | 30 | 250 | No |
| VpnGW2 | 2 | 1.25 Gbps | 30 | 500 | No |
| VpnGW4 | 2 | 5 Gbps | 100 | 5,000 | No |
| VpnGW5 | 2 | 10 Gbps | 100 | 10,000 | No |
| VpnGW2AZ | 2 | 1.25 Gbps | 30 | 500 | Yes |
| VpnGW5AZ | 2 | 10 Gbps | 100 | 10,000 | Yes |

*Data sourced from the VPN Gateway aggregate throughput table [About Azure VPN Gateway](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways).*

If you require high availability at the infrastructure level, select a SKU with the **AZ** suffix. These gateways are deployed in Azure Availability Zones, providing physical and logical separation within the region [About Azure VPN Gateway](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways). A standard VpnGW2 is not zone-redundant, but a VpnGW2AZ is [About Azure VPN Gateway](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways).

## Decide on redundancy: active-standby vs active-active

Every Azure VPN gateway consists of two instances in an active-standby configuration by default [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable). For planned maintenance, the standby instance takes over automatically, causing a brief interruption of 10 to 15 seconds. For unplanned issues, recovery is typically faster but can take about 1 to 3 minutes in the worst case [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable). P2S client connections are disconnected and require manual reconnection [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable).

If your workload cannot tolerate even brief interruptions, you can configure the gateway in **active-active** mode. In this configuration, both gateway instances establish S2S VPN tunnels to your on-premises device simultaneously [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable). Each instance has a unique public IP address [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable). Traffic is spread across both tunnels, although a single TCP or UDP flow typically stays on one tunnel [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable).

Active-active mode does not strictly require BGP for basic cross-premises connectivity, but it is required if you are using multiple on-premises VPN devices or need Equal-cost multi-path routing (ECMP) [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable). You must also configure your on-premises VPN device to accept tunnels from both Azure public IP addresses [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable). When one instance fails, the IPsec tunnel disconnects, and BGP automatically withdraws the routes if enabled, switching traffic to the other active tunnel [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable).

For even higher availability, you can combine active-active Azure gateways with multiple on-premises VPN devices. This creates a full mesh of four IPsec tunnels, guarding against failures on both sides [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable). This topology requires BGP and ECMP on the on-premises side [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable).

## Configure BGP for dynamic routing and failover

BGP is required for active-active gateways when using multiple on-premises VPN devices or ECMP [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable). It allows the VPN gateway and on-premises devices to exchange routing information dynamically [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto). Without BGP, you are limited to static routing, which does not support automatic failover or route propagation across multiple connections [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto).

To enable BGP, you must configure the following:

1. **VPN Gateway**: Enable BGP and specify an Autonomous System Number (ASN). You can also specify a custom Azure APIPA BGP IP address if your on-premises devices use APIPA addresses (169.254.21.0 to 169.254.22.255) [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto).
2. **Local Network Gateway**: Configure BGP settings, including the ASN and BGP peer IP address (the on-premises device's IP) [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto).
3. **Connection**: Enable BGP on the S2S or VNet-to-VNet connection [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto).

If you are using an active-active gateway and your on-premises devices use APIPA addresses for BGP, you must configure two custom Azure APIPA BGP IP addresses, one for each gateway instance [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto). These addresses must be unique and within the allowed range [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto). The on-premises device must initiate the BGP peering sessions if APIPA addresses are used [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto). If your on-premises devices use standard IP addresses, the gateway uses default IPs from the GatewaySubnet range, and no custom APIPA addresses are needed.

## Verify the configuration

After deployment, verify the following:

1. **Gateway Status**: Ensure the gateway is in the `Connected` state [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto).
2. **BGP Peers**: Check the BGP peer status on the gateway configuration page. Both peers should be in the `Established` state [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto).
3. **Tunnel Status**: Verify that all IPsec tunnels are up and active [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable).
4. **Routing**: Confirm that routes are being learned dynamically via BGP [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto).

If BGP peers are not establishing, check the following:

- The ASN and BGP peer IP addresses match on both sides [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto).
- The on-premises device is configured to accept BGP sessions from the Azure gateway IPs [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto).
- Firewall rules allow UDP port 179 (BGP) between the gateway and on-premises devices [Configure BGP for VPN Gateway: Portal](https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto).

For active-active gateways, ensure that both public IP addresses are configured on the on-premises device [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable). If only one IP is configured, the second tunnel will not establish, and active-active mode will not function as intended [Design highly available gateway connectivity](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable).
