---
title: "Choose between network security groups, Azure Firewall and WAF"
description: "Compare Azure Firewall SKUs and NSGs to choose the right network security layer for your workload."
pubDate: 2025-10-25
category: governance
tags: ["azure-firewall", "network-security-groups", "waf", "networking", "security"]
translationKey: choose-between-network-security-groups-azure-firewall-and-waf
draft: false
---

You are designing a network perimeter or a hub-and-spoke topology and need to decide where to place your security controls. The choice is rarely between "firewall" or "no firewall"; it is about selecting the right tool for the specific traffic pattern and threat model. Azure offers Network Security Groups (NSGs), Azure Firewall, and Azure Web Application Firewall (WAF) as part of its Network Security category. Each service operates at a different layer and serves a distinct purpose.

## Understand the layer of operation

NSGs operate at Layer 3 and Layer 4. They filter traffic based on source and destination IP addresses, ports, and protocols. They are stateful, meaning they allow return traffic automatically if an outbound rule permits the initial connection. NSGs are lightweight, attached directly to subnets or network interfaces, and are the default security boundary for most Azure resources. They are cost-effective and suitable for basic segmentation, such as allowing web servers to communicate with databases on specific ports.

Azure Firewall operates as a fully managed, cloud-based network security service that protects your Azure Virtual Network resources. It is a stateful firewall as a service, featuring built-in high availability and unlimited cloud scalability. Unlike NSGs, Azure Firewall inspects both east-west and north-south traffic. It provides Layer 3 through Layer 7 filtering, including application-level FQDN filtering and network-level FQDN filtering. It also offers threat intelligence-based filtering, DNS proxy, and web content filtering. Azure Firewall is deployed in a hub virtual network and acts as a central choke point for traffic leaving or entering the spoke networks.

Azure Web Application Firewall (WAF) is designed specifically for protecting web applications. It operates at Layer 7 and provides protection against common web vulnerabilities such as SQL injection and cross-site scripting. WAF is typically integrated with Azure Application Gateway or Azure Front Door. It is not a general-purpose network firewall and should not be used as a replacement for Azure Firewall or NSGs for non-web traffic.

## Choose Azure Firewall SKUs based on requirements

If you decide that a centralised firewall is required, Azure Firewall offers three SKUs: Basic, Standard, and Premium. The choice depends on your throughput needs, security requirements, and budget.

Azure Firewall Basic is designed for small and medium-sized businesses (SMBs). It provides essential protection at an affordable price. Key limitations include support for Threat Intel alert mode only, a fixed scale unit, and a recommended throughput of 250 Mbps. It is suitable for environments with modest traffic volumes and where advanced threat protection is not a priority.

Azure Firewall Standard offers L3-L7 filtering and threat intelligence feeds directly from Microsoft Cyber Security. It can alert and block traffic from/to known malicious IP addresses and domains. It supports autoscaling to manage peak traffic up to 30 Gbps. Enterprise features like DNS proxy, custom DNS, and web categories are included. It is suitable for customers requiring robust network security with moderate to high throughput.

Azure Firewall Premium provides advanced capabilities, including signature-based Intrusion Detection and Prevention System (IDPS) for rapid attack detection. It includes over 67,000 signatures in more than 50 categories. It also supports outbound TLS termination (TLS forward proxy) and URL filtering with full path inspection. It supports up to 100 Gbps throughput. It is ideal for securing highly sensitive applications, such as payment processing, where deep packet inspection and advanced threat protection are required.

| Feature | Firewall Basic | Firewall Standard | Firewall Premium |
|---|---|---|---|
| Throughput | Up to 250 Mbps | Up to 30 Gbps | Up to 100 Gbps |
| Threat Intel | Alert mode | Alert and Block | Alert and Block |
| IDPS | No | No | Yes (Signature-based) |
| TLS Inspection | No | No | Outbound Forward Proxy |
| DNS Proxy | No | Yes | Yes |
| Web Categories | No | Yes | Yes |

## When to use NSGs versus Azure Firewall

NSGs and Azure Firewall are not mutually exclusive; they are complementary. NSGs provide granular, resource-level or subnet-level control, while Azure Firewall provides centralised, policy-based control at the network perimeter. A common pattern is to use NSGs for internal segmentation and Azure Firewall for outbound internet access and inbound traffic from the internet.

Use NSGs when you need to control traffic between resources within a virtual network or between a virtual network and the internet at a low cost and low latency. They are ideal for restricting database access to specific application servers or allowing only specific ports for management.

Use Azure Firewall when you need advanced features such as application-level FQDN filtering, threat intelligence-based filtering, DNS proxy, or centralised management across multiple subscriptions. It is also necessary when you need to inspect traffic for compliance or security policies that cannot be enforced by NSGs. For example, if you need to block traffic to known malicious domains, Azure Firewall with Threat Intel integration is the appropriate choice.

## Performance and monitoring considerations

Azure Firewall performance can be affected by rule configuration, traffic throughput, and the number of connections. Exceeding rule limitations, such as using over 20,000 unique source/destination combinations, can cause latency. High traffic throughput can saturate the firewall's capacity. An excessive number of connections can lead to SNAT port exhaustion. To mitigate SNAT port exhaustion, consider adding multiple public IP addresses to the firewall or using an Azure NAT Gateway.

Monitor Azure Firewall using metrics such as latency probe, traffic throughput, and data processed. Set up alerts for key metrics to proactively identify performance issues. Test latency introduced by the firewall by temporarily bypassing it and comparing the results. Use Azure Policy to enforce consistent configuration standards and track configuration changes using Azure Resource Graph.

## Decision summary

- Use NSGs for basic, low-cost, layer 3/4 filtering at the subnet or network interface level.
- Use Azure Firewall Basic for SMBs with low throughput requirements and basic threat intel alerting.
- Use Azure Firewall Standard for enterprise environments requiring L3-L7 filtering, threat intel blocking, and autoscaling up to 30 Gbps.
- Use Azure Firewall Premium for high-security environments requiring IDPS, TLS inspection, and high throughput up to 100 Gbps.
- Use Azure WAF for protecting web applications from layer 7 vulnerabilities.

Verify your choice by reviewing the specific requirements of your workload, including throughput, security features, and management needs. Test the configuration in a non-production environment before deploying to production.


References for Choose between network security groups, Azure Firewall and WAF: [What is Azure Firewall?](https://learn.microsoft.com/en-us/azure/firewall/overview), [Choose the right Azure Firewall SKU to meet your needs](https://learn.microsoft.com/en-us/azure/firewall/choose-firewall-sku), [Azure Firewall best practices for performance](https://learn.microsoft.com/en-us/azure/firewall/firewall-best-practices).
