---
title: "Choose Load Balancer or Application Gateway for a workload"
description: "Compare Azure Load Balancer and Application Gateway v2 for workload routing, focusing on OSI layer, protocol support, and traffic patterns."
pubDate: 2025-09-29
category: networking
tags: ["azure-load-balancer", "application-gateway", "networking", "layer-4", "layer-7", "comparison"]
translationKey: choose-load-balancer-or-application-gateway-for-a-workload
draft: false
---

You have a workload that needs to accept network traffic and you need to decide between Azure Load Balancer and Application Gateway. The choice depends on whether your application speaks TCP/UDP at the network layer or HTTP/HTTPS at the application layer.

Azure Load Balancer operates at Layer 4 of the OSI model. It distributes incoming network traffic across backend virtual machines (VMs) or virtual machine scale sets (VMSS) based on IP address and port. It is designed for high-throughput, low-latency scenarios where you need to balance raw TCP or UDP flows. Azure Application Gateway, specifically the v2 SKU, operates at Layer 7. It understands HTTP, HTTPS, and WebSocket protocols, allowing it to make routing decisions based on URL paths, host headers, and cookies. It also provides built-in Web Application Firewall (WAF) capabilities.

## Understand the Layer 4 vs Layer 7 distinction

The fundamental difference lies in the OSI layer at which the service operates. Azure Load Balancer is a Layer 4 service. It sees traffic as streams of packets identified by source and destination IP addresses and ports. It does not inspect the content of the traffic. This makes it ideal for non-HTTP workloads, such as database traffic, gaming servers, or custom TCP/UDP applications. It provides pass-through load balancing, which means it forwards the client's original IP address to the backend without modification, preserving the original connection state.

Application Gateway v2 is a Layer 7 service. It terminates the client connection, inspects the HTTP request, and then establishes a new connection to the backend. This allows for advanced traffic management features such as URL-based routing, host-based routing, cookie-based session affinity, and header modification. It is designed for web applications and APIs where routing decisions depend on the content of the request. For example, you can route requests for `/api` to one backend pool and requests for `/web` to another.

## Evaluate protocol and traffic requirements

If your workload uses HTTP, HTTPS, or WebSocket, Application Gateway v2 is generally the more appropriate choice. It provides native support for these protocols and can terminate TLS, offloading the encryption overhead from your backend servers. It also supports mutual TLS (mTLS) for client certificate authentication, which is critical for secure API gateways. The v2 SKU includes a Web Application Firewall that can protect your application from common web exploits such as SQL injection and cross-site scripting.

If your workload uses TCP or UDP, or if you need to balance traffic for services that do not speak HTTP, Azure Load Balancer is the correct choice. It supports high-availability ports, which allow you to load balance all traffic on a specific port to the backend, regardless of the protocol. It also supports port forwarding, which can be useful for managing access to virtual machines via public IP addresses and specific ports. Azure Load Balancer does not provide WAF capabilities, so you would need to implement security controls at the application or network level.

## Consider scaling and availability needs

Both services offer high availability and scalability, but they achieve it differently. Azure Load Balancer Standard SKU supports availability zones, allowing you to distribute traffic across multiple zones for resilience. It can handle millions of flows for TCP and UDP applications. The pricing is based on the number of rules and data processed.

Application Gateway v2 Standard and WAF SKUs also support availability zones and offer autoscaling. The v2 SKU can scale out or in based on changing traffic load patterns, removing the need to choose a fixed instance count. It provides a static VIP, which ensures that the IP address associated with the gateway does not change for the lifecycle of the deployment. This is important for DNS routing and client configurations. The pricing model for Application Gateway v2 is based on consumption, including the number of Application Gateway Units (AGUs) and data processed.

## Make the decision based on your workload

Choose Azure Load Balancer if:
- Your workload uses TCP or UDP protocols.
- You need low-latency, high-throughput load balancing for non-HTTP services.
- You want to preserve the client's original IP address.
- You do not need advanced HTTP routing or WAF capabilities.

Choose Application Gateway v2 if:
- Your workload uses HTTP, HTTPS, or WebSocket protocols.
- You need URL-based or host-based routing.
- You require TLS termination, WAF, or mTLS.
- You need cookie-based session affinity or header modification.

## Verify your configuration

Once you have selected a service, verify that your backend pool contains healthy instances. For Azure Load Balancer, configure health probes to monitor the health of backend VMs. For Application Gateway, configure health probes to monitor the health of backend servers and ensure that the WAF policy is in the correct mode (Detection or Prevention). Test your configuration by sending traffic to the frontend IP address and verifying that it is routed to the correct backend pool.

For Application Gateway v2, ensure that you have registered for the preview if you are using the Basic SKU, as it is currently in public preview. You can register using the following Azure CLI commands:

```azurecli-interactive
az feature register --name AllowApplicationGatewayBasicSku --namespace Microsoft.Network
```

This code is an illustrative example and has not been tested. Ensure that you have the necessary permissions to register provider features in your subscription.

For Azure Load Balancer, note that the Basic SKU will be retired on September 30, 2025. You should upgrade to the Standard SKU to ensure continued support and access to advanced features such as availability zones and security enhancements.

The decision between Azure Load Balancer and Application Gateway v2 is not about which service is better, but which service is better suited to your workload. By understanding the layer at which each service operates and the protocols it supports, you can make an informed decision that meets your application's requirements.

References for Choose Load Balancer or Application Gateway for a workload: [What is Azure Application Gateway v2?](https://learn.microsoft.com/en-us/azure/application-gateway/overview-v2), [What is Azure Load Balancer?](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview), [How an application gateway works](https://learn.microsoft.com/en-us/azure/application-gateway/how-application-gateway-works).
