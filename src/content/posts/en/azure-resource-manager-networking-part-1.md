---
title: "Azure Resource Manager Networking – Part 1"
description: "Usually when we talk about Azure Networking, our focus has been on Azure virtual networks and resources that facilitate deployment of virtual machines into virtual networks.…"
pubDate: 2017-05-18
category: networking
tags: []
translationKey: azure-resource-manager-networking-part-1
legacy: true
legacyUrl: /2017/05/azure-resource-manager-networking-part-1.html
---

Usually when we talk about Azure Networking, our focus has been on Azure virtual networks and resources that facilitate deployment of virtual machines into virtual networks. However, there are additional resources and services, which deliver additional network-related features, that you can provision by using Azure Resource Manager.

## **Azure Load Balancer **

You can use an Azure Load Balancer to enhance availability and scalability of virtual machines, by configuring them as a load-balanced set. Azure Load Balancer provides functionality similar to hardware load balancers, by eliminating single points of failure (application or hardware) and increasing uptime during planned maintenance or upgrades.

You can use two types of Azure load balancers:
  * An internal load balancer.
  * An Internet-facing load balancer. You can use the Internet-facing load balancer to load balance incoming Internet traffic.

### **An internal load balancer **

Use an internal load balancer to load balance traffic within a virtual network or traffic originating from another directly connected network. You can use the internal load balancers to balance traffic that is designated to specific IP addresses and specific Transmission Control Protocol (TCP) or User Datagram Protocol (UDP) ports. Some of the more common scenarios that involve its use include: 	
  * Cross-premises deployments with on-premises traffic targeting load-balanced Azure virtual machines.
  * Multi-tier applications hosted on Azure virtual machines, with the Internet-facing tier communicating with the back-end tier.

## **An Internet-facing load balancer**

An Internet-facing load balancer distributes traffic targeting a public IP address assigned to its front-end configuration across a set of virtual machines residing within a virtual network. Incoming traffic is subject to load balancer rules and inbound NAT rules that you define. The outcome of rule processing determines which virtual machine behind the load balancer becomes the recipient of that traffic.

To configure a load balancer in Azure Resource Manager, provide the following details: 	
  * Front-end IP configuration. Identifies incoming traffic that needs to be load balanced.
  * Back-end address pool. Designates the virtual machines that receive network traffic from the load balancer.
  * Load balancing rules. Determine how to distribute incoming traffic across virtual machines in the back-end address pool.
  * Verify the health and availability of virtual machines in the back-end pool.
  * Inbound NAT rules. Determine the types of traffic that should be redirected to individual virtual machines in the back-end pool rather than being distributed across the VMs.

## **Application Gateway**

Application Gateway provides routing and load-balancing services at the application layer and is commonly known as a _layer-7 load balancer_. You can use Application Gateway in the following scenarios: 	
  * SSL offload. After uploading a server certificate and creating a listener on port 443, you can configure Application Gateway with routing rules that terminate an SSL session at the gateway instead of the load-balanced web tier.
  * Cookie-based affinity. Application Gateway redirects requests from a given client consistently to the same virtual machine in the load-balanced set.
  * URL path-based routing. Application Gateway supports customizing its routing behavior according to the URL path of incoming requests.

## **Azure Traffic Manager**

Microsoft Azure Traffic Manager is a DNS load-balancing solution available in Azure. Rather than directly handling incoming traffic, it provides custom DNS name resolution. An individual name returned by Traffic Manager in response to incoming requests represents an optimal endpoint where the corresponding traffic should be directed. The endpoint is essentially just another DNS name, which subsequently gets resolved into the corresponding IP address. Effectively, it is possible to use Traffic Manager to load balance across the entire globe, targeting different Azure regions, other cloud providers, or on-premises datacenters. You can use load balancing algorithms to speed up response time by redirecting traffic to the closest endpoint or to spread the load across multiple endpoints according to custom-defined distribution ratios.

## **Network security groups**

You can use network security groups to provide network isolation for Azure resources by defining rules that allow or deny specific traffic to individual virtual machines or subnets. This makes it possible to configure an Azure virtual network to provide a network experience that is similar to an on-premises network. In particular, you can achieve the same functionality in your Azure virtual network as you would in an on-premises perimeter network (also known as DMZ, demilitarized zone, and screened subnet).

## **User-defined routes **

Use user-defined routes to modify the default routing behavior in Azure virtual networks. This involves defining a route that identifies the next IP address in the network traffic flow based on the prefix of the destination IP address range. One or more routes form a routing table, which you can subsequently assign to subnets within a virtual network. Effectively, traffic leaving these subnets and targeting the IP address range matching one of the routes will follow the corresponding route.

## **Forced tunneling**

Forced tunneling is a specific use case of user-defined routes. In this case, you define a default route, which targets the virtual private network (VPN) tunnel between an Azure virtual network and your on-premises network. As a result, all traffic targeting IP address ranges not matching prefixes in the routing rules associated with a given subnet, including Internet-bound traffic, follows the default route. Organizations that want to implement packet inspection or audit all outbound traffic commonly use forced tunneling.

## **Azure VPN Gateway**

When implementing Azure virtual networks, you have the option to provide direct connectivity from your on-premises environment. To accomplish this, use one of these methods: 	
  * A point-to-site VPN. This approach involves connecting individual computers to an Azure virtual network.
  * A site-to-site VPN. This approach involves connecting an on-premises network to an Azure virtual network. Effectively, all on-premises computers can take advantage of cross-premises connectivity without the need to set up individual connections.
  * Microsoft Azure ExpressRoute. This approach relies on a private connection that does not cross the Internet. It allows for connecting to one or more virtual networks as well as to a variety of Azure services that do not support direct connectivity to virtual networks, such as Microsoft Azure Storage. ExpressRoute offers predictable performance as well as higher bandwidth and lower latency than the VPN-based methods.

You also can create a VPN IPSec tunnel that connects directly two Azure virtual networks. These are called _VNet-to-VNet connections_.

In each of these scenarios, you must provision a VPN gateway in every Azure virtual network for which you want to establish connectivity. VPN Gateway handles routing of network traffic in and out of the virtual network. VPN Gateway operates as a pair of highly available virtual machines hosting the VNP gateway software.

## **Azure DNS**

Azure DNS is a hosted service that provides hosting of DNS zones, facilitating name resolution by relying on the Microsoft global infrastructure. Azure DNS uses anycast networking, which delivers the quickest response to name queries by identifying the closest DNS server. You can use Azure DNS as an authoritative server for queries targeting your DNS domain name or as an additional DNS server in your DNS infrastructure.
  **Note:** At the present time, Azure DNS does not support domain registration. Instead, it provides hosting of existing public domains.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
