---
title: "Investigate asymmetric routing through an Azure firewall"
description: "Diagnose asymmetric routing drops at Azure Firewall by confirming path asymmetry and applying SNAT or routing fixes."
pubDate: 2025-08-07
category: networking
tags: ["azure-firewall", "asymmetric-routing", "expressroute", "network-troubleshooting", "stateful-firewall"]
translationKey: investigate-asymmetric-routing-through-an-azure-firewall
draft: false
---

Your firewall is dropping packets that look legitimate. The source IP is correct, the destination is right, and the port is open. Yet the connection fails. This is a classic symptom of asymmetric routing colliding with a stateful inspection engine.

Azure Firewall is a fully stateful firewall as a service. It inspects traffic based on the flow state it records when the first packet of a conversation arrives. If the return traffic takes a different path and arrives at a firewall instance that has no record of that initial flow, the firewall drops the packet. It does not see the original request because it never saw it.

[![Asymmetric Routing Flow and State Mismatch](/images/posts/2025/azc-209-checkpoints.svg)](/images/posts/2025/azc-209-checkpoints.svg)

This usually happens when your network has multiple paths to a destination. You might have an internet connection and an ExpressRoute circuit, or multiple ExpressRoute circuits. The outbound traffic might take one path, but the return traffic takes another. If that return path traverses a firewall that did not see the outbound flow, you get a silent drop.

## Why the firewall drops the return traffic

To understand this, we need to look at two concepts: multiple network paths and stateful devices. 

When an enterprise network has only one link to the internet, all traffic travels the same path. It is common to purchase multiple circuits to improve uptime. With this configuration, it is possible for traffic to go out one link and return through a different link. This is asymmetric routing. In asymmetric routing, the return network traffic takes a different path from the original outgoing flow.

Routers look at the IP header to determine the best path. They select the path based on routing protocols like BGP and the specificity of the subnet mask. If a router receives multiple advertisements for the same IP address, it selects the path with the longer subnet mask because it is considered more specific.

A firewall, however, looks deeper. It inspects Layer 4 headers and keeps a state table. It permits or rejects packets based on various criteria. To improve performance, the firewall inspects the first packet of a flow. If it allows the packet to pass, it keeps the flow information in its state table. Any ensuing packets related to this flow are then allowed based on that initial determination.

A packet that is part of an existing flow may arrive at a firewall that did not originate the flow. Since it has no prior state information about the initial flow, the firewall drops the packet. This is the core mechanism causing your connectivity issues.

## Identifying the asymmetric path

Before changing configurations, you need to confirm that traffic is indeed taking different paths. The best way to verify this is using traceroute.

If you suspect traffic from a specific server to a Microsoft service is taking the internet path but returning over ExpressRoute, run a traceroute from that server to the destination. The result validates whether traffic is leaving your network toward the internet or toward ExpressRoute. If the traceroute shows different hops for the outbound and return paths, you have confirmed asymmetric routing.

You should also check your routing advertisements. If you have an ExpressRoute circuit, Microsoft advertises more specific IP prefixes for certain services. Your routing infrastructure will choose ExpressRoute as the preferred path for those prefixes. If you do not advertise your public IP addresses to Microsoft over ExpressRoute, Microsoft communicates with your public IP addresses through the internet. This mismatch between the outbound and inbound paths is a common trigger for this issue.

## Resolving the issue

You have two primary options to solve asymmetric routing: routing adjustments or Source-based NAT (SNAT). The choice depends on your network design and whether you can control the routing advertisements.

### Option 1: Adjust routing

The first solution is to ensure your public IP addresses are advertised to the appropriate wide area network (WAN) links. This requires careful coordination of your BGP advertisements.

For example, if you want to use the internet for authentication traffic and ExpressRoute for mail traffic, do not advertise your Active Directory Federation Services (AD FS) public IP addresses over ExpressRoute. If you do, your routers will prefer ExpressRoute for authentication traffic because the routes received over ExpressRoute are more specific. This can cause the return traffic to come back over ExpressRoute while the outbound traffic went out over the internet.

If you want to use ExpressRoute for authentication, make sure you are advertising your AD FS public IP addresses over ExpressRoute without NAT. When configured this way, traffic originating from Microsoft to your on-premises AD FS server will go over ExpressRoute. The return traffic from your network to Microsoft will also use ExpressRoute because it is the preferred route over the internet. This ensures both directions of the flow traverse the same firewall.

### Option 2: Use Source-based NAT

If you cannot or do not want to change your routing advertisements, you can use SNAT. This is often easier to implement if you have limited control over the WAN routing.

For example, suppose you choose not to advertise the public IP address of an on-premises SMTP server over ExpressRoute. You intend to use the internet for this communication. A request originating from Microsoft to your SMTP server traverses the internet. You configure SNAT on the incoming request to translate it to an internal IP address. The return traffic from the SMTP server goes to the edge firewall (which you use for NAT) instead of through ExpressRoute. As a result, the return traffic takes the internet path.

This ensures that both the outbound and return traffic for that specific flow traverse the same firewall instance, allowing the state table to match the return packet to the original flow.

## Verification

After applying either solution, verify the connectivity. Run traceroute again to confirm that the traffic is now taking a symmetric path. Check the Azure Firewall logs to ensure that the packets are no longer being dropped due to missing state information. You can also monitor the firewall metrics to ensure that the throughput and connection counts remain within expected limits.

Remember that Azure Firewall is designed to protect your Azure Virtual Network resources. It is fully stateful and offers built-in high availability. However, it relies on the network topology to ensure that flows are symmetric. If your network design introduces asymmetry, you must address it at the routing or NAT layer to maintain connectivity.

By aligning your routing advertisements or using SNAT, you can ensure that both directions of a flow traverse the same firewall, allowing the stateful inspection to work as intended. This is not a limitation of Azure Firewall, but a fundamental requirement of stateful network security devices.

Cheers,

Marcos

References for Investigate asymmetric routing through an Azure firewall: [What is Azure Firewall?](https://learn.microsoft.com/en-us/azure/firewall/overview), [Azure ExpressRoute: Asymmetric routing](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-asymmetric-routing), [Azure Firewall best practices for performance](https://learn.microsoft.com/en-us/azure/firewall/firewall-best-practices).
