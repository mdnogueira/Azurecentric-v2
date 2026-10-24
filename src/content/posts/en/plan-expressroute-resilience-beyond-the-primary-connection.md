---
title: "Plan ExpressRoute resilience beyond the primary connection"
description: "Plan ExpressRoute disaster recovery using geo-redundant circuits and BGP path selection."
pubDate: 2026-01-14
category: networking
tags: []
translationKey: plan-expressroute-resilience-beyond-the-primary-connection
draft: true
---

You have an ExpressRoute circuit that works well until the peering location goes down. A single circuit provides built-in redundancy within the Microsoft network, but it does not protect against regional outages or metro-level failures. To plan for those scenarios, you need to design for disaster recovery using geo-redundant ExpressRoute circuits.

This is not just about having a second cable. It is about controlling how traffic flows across those cables so that you do not end up with asymmetric routing or unexpected latency spikes. The first thing to establish is whether you are dealing with a small to medium on-premises network or a large distributed enterprise, because the routing strategies differ significantly.

## Why a single circuit is not enough

ExpressRoute is designed for high availability within the Microsoft network. Each circuit consists of two connections to two Microsoft Enterprise Edge (MSEE) routers at a specific peering location. This built-in redundancy means there is no single point of failure in the ExpressRoute path within Microsoft's network [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

However, if the entire peering location or the Azure region experiences a degradation, a single circuit cannot help. You need a redundant connectivity solution that spans different locations. The guidance for disaster recovery assumes you have sufficient time and resources to set up these circuits properly [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

## Choosing your peering locations

When you add a second circuit for redundancy, you must decide where it connects. You have two main options for metro selection:

1. **Same metro**: You can build two parallel paths using two locations in the same metro, such as Amsterdam and Amsterdam2. This keeps end-to-end latency consistent during normal operation and failover. The risk is that a natural disaster like an earthquake could affect both paths simultaneously [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).
2. **Different metros**: For better disaster recovery, select the secondary location in a different metro within the same geopolitical region. This lowers the chance of a metro-specific event taking out both links, but it increases end-to-end latency. If you need to connect to a location outside the geopolitical region, you must use the Premium SKU for both circuits [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

You also need to consider the service provider. Using diverse service provider networks for different circuits improves resiliency further [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

## Managing path selection for small to medium networks

In a small to medium on-premises network, you typically have one primary circuit and one standby circuit. By default, if you advertise routes identically over all ExpressRoute paths, Azure load-balances traffic across a maximum of four circuits using Equal-cost multi-path (ECMP) routing [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

This default behaviour is often undesirable for disaster recovery because it ignores latency differences between your primary and standby paths. You want Azure to prefer the circuit with minimal latency during normal operation. You can influence this path selection using three techniques, listed in order of effectiveness [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering):

### 1. More specific routes

You can advertise a more specific route over the preferred circuit. For example, if your on-premises network uses the `10.1.11.0/24` range, you can advertise it as `10.1.11.0/25` via the primary ExpressRoute circuit and as `10.1.11.0/24` via the standby circuit. Because the `/25` route is more specific, Azure sends traffic to that subnet via the primary path. If the primary circuit fails, the standby circuit becomes the only option [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

### 2. Connection weight

You can configure the connection weight on the ExpressRoute connection in Azure. The default weight is 0. If you set the weight of the primary circuit's connection to 100, Azure prefers the connection with the highest weight when it receives the same route prefix from multiple circuits [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

This is often the easiest method to implement because it is managed within the Azure portal and does not require changes to your on-premises BGP advertisements [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

### 3. AS path prepend

You can prepend the Autonomous System (AS) path on the route advertisement from the less preferred circuit. BGP prefers the route with the shortest AS path. By adding extra AS numbers to the standby circuit's advertisements, you make them less attractive to Azure [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

Regardless of which technique you use, you must also ensure symmetrical routing. If Azure prefers the primary circuit for inbound traffic, your on-premises network must also prefer the primary circuit for outbound traffic. You typically achieve this by configuring the local preference value on your on-premises iBGP sessions [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

## Designing for large distributed enterprises

If you have a large distributed enterprise with multiple on-premises locations and multiple Azure regions, you can use active-active ExpressRoute circuits. This avoids the need for a standby circuit and improves overall capacity [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

Consider a scenario where you have two on-premises locations connected to two Azure regions via ExpressRoute. You have two main architectural choices for disaster recovery [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering):

### Scenario 1: Local traffic stays local

In this design, all traffic between an Azure region and its local on-premises network flows through the local ExpressRoute circuit in the steady state. If the local circuit fails, the remote circuit takes over. You can use connection weight to influence the virtual networks to prefer the local connection. On the on-premises side, you use local preference on iBGP sessions to ensure reverse traffic follows the same path [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

### Scenario 2: Cross-region traffic uses the Microsoft backbone

In this design, all traffic between virtual networks and on-premises locations flows through the Microsoft backbone in the steady state. Traffic only flows through the interconnection between on-premises locations if an ExpressRoute circuit fails. You can influence this using more specific routes or AS path prepend on the virtual network side. On the on-premises side, you configure the interconnection link as less preferable using local preference or IGP metrics [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

## Verification and testing

When you use certain ExpressRoute circuits as stand-by, you need to actively manage them and periodically test failover operations. Enabling BFD on the circuits helps with faster link failure detection, but overall failover and convergence may take up to 180 seconds under some failure conditions [Azure ExpressRoute: Designing for disaster recovery](https://learn.microsoft.com/en-us/azure/expressroute/designing-for-disaster-recovery-with-expressroute-privatepeering).

Do not assume that enabling a second circuit automatically provides disaster recovery. You must verify that your BGP advertisements and connection weights are configured correctly. Check that traffic is flowing over the preferred path and that failover behaves as expected during a controlled test.

Also, remember that virtual network to virtual network connectivity through ExpressRoute is not recommended for performance reasons. Use virtual network peering for VNet-to-VNet traffic instead [Connectivity between virtual networks over Azure ExpressRoute](https://learn.microsoft.com/en-us/azure/expressroute/virtual-network-connectivity-guidance).

tags: [expressroute, disaster-recovery, networking, bgp, high-availability]
diagram:
  title: Geo-redundant ExpressRoute Path Selection
  nodes:
    - On-premises Network
    - Primary ExpressRoute Circuit
    - Standby ExpressRoute Circuit
    - Azure Virtual Network
    - BGP Path Selection Logic
claims:
  - claim: A single ExpressRoute circuit has built-in redundancy within Microsoft's network but does not protect against regional outages.
    source_id: S1
    evidence_span: "there's no single point of failure in the ExpressRoute path within Microsoft network... focus on solutions that go beyond failures that can be addressed using a single ExpressRoute circuit."
  - claim: Connection weight is a method to influence Azure to prefer one ExpressRoute circuit over another.
    source_id: S1
    evidence_span: "the virtual network prefers the connection with the highest weight."
  - claim: Virtual network to virtual network connectivity via ExpressRoute is not recommended due to gateway limitations and latency.
    source_id: S3
    evidence_span: "Microsoft recommends using virtual network peering for optimal performance... ExpressRoute connectivity is managed through Microsoft Enterprise Edge (MSEE) devices... introduces extra latency."
  - claim: Using different metros for redundancy lowers the chance of a single event taking out both links but increases latency.
    source_id: S1
    evidence_span: "the chances of a natural disaster causing an outage to both links are lower but at the cost of increased latency end-to-end."
review_questions:
  - "How does the failover time change when using AS path prepend compared to connection weight?"
  - "What are the specific bandwidth limitations of ExpressRoute virtual network gateways compared to virtual network peering?"
  - "How does the Premium SKU affect route limits and global connectivity in a disaster recovery scenario?"
