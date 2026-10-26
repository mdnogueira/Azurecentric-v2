---
title: "Configure health probes that reflect application readiness"
description: "Configure health probes that reflect application readiness using Azure Load Balancer and Application Gateway, avoiding common pitfalls."
pubDate: 2025-11-22
category: networking
tags: ["health-checks", "azure-application-gateway", "azure-load-balancer"]
translationKey: configure-health-probes-that-reflect-application-readiness
draft: false
---

A health probe that only checks if a port is open is not a health probe; it is a port scanner. If your application is listening on port 80 but is stuck in a restart loop, a TCP probe will mark the instance as healthy. The load balancer will then send traffic to a broken application, resulting in failures for your users.

The core problem is that network availability does not equal application readiness. To fix this, you must configure probes that exercise the application logic. This requires choosing the right protocol and path for your specific workload, whether you are using Azure Load Balancer or Application Gateway.

## Choose the right protocol for your workload

The first decision is whether to use TCP, HTTP, or HTTPS. TCP probes are the simplest but the least informative. They confirm that a socket is open but say nothing about the service behind it. Use TCP only when you are load balancing UDP traffic, where HTTP probes are not supported, or when the application itself does not expose an HTTP interface.

For HTTP-based applications, always use HTTP or HTTPS probes. These allow you to target a specific URI. If your application has a dedicated health endpoint, such as `/health` or `/ready`, configure the probe to use that path. This ensures that the probe verifies the application can actually serve requests, not just that the network stack is responsive.

Azure Load Balancer supports TCP, HTTP, and HTTPS probes in the Standard SKU. The Basic SKU supports TCP and HTTP. Application Gateway supports HTTP and HTTPS probes. Neither service supports mutual authentication (client certificates) for HTTPS probes, so do not rely on them for that purpose.

## Configure Application Gateway probes for readiness

Application Gateway provides more granular control over probe matching than Load Balancer. This is useful when your application returns non-200 status codes for specific conditions that you still consider healthy.

By default, Application Gateway considers a probe healthy if the response status code is between 200 and 399. You can override this using custom match criteria. For example, if your application returns a 403 Forbidden for unauthenticated requests, but you want the probe to succeed regardless of authentication, you can configure the probe to accept 403 as a healthy response.

You can also match the response body. This is useful for applications that return a specific string, such as "Healthy", in the body of the response. The match is a simple string presence check, not a regular expression, and must be 4090 characters or less.

In Application Gateway, the probe source IP depends on the backend type. For public endpoints, the source is the gateway's frontend public IP. For private endpoints, the source is from the gateway subnet's address space. Ensure your network security groups (NSGs) allow traffic from the appropriate source.

## Configure Load Balancer probes for flow control

Azure Load Balancer uses probes to determine which backend instances receive new connections. When a probe fails, the load balancer stops sending new flows to that instance. Existing TCP flows continue until they close or idle out, depending on the SKU.

The Standard SKU allows established TCP flows to continue even if all probes are down, provided there is more than one backend instance. The Basic SKU terminates all existing TCP flows when all probes are down. This distinction is critical for planned maintenance. If you need to drain connections, you can manipulate the probe response to fail, triggering the load balancer to stop sending new traffic while allowing existing traffic to complete.

HTTP/S probes in Load Balancer have a built-in timeout of 30 seconds. If the configured interval is longer than 30 seconds, the probe will time out if no response is received within 30 seconds. This means you cannot set an interval of 60 seconds and expect the probe to wait 60 seconds for a response. It will fail after 30 seconds.

The probe source IP for Load Balancer is always 168.63.129.16 for IPv4. You must allow this IP in your NSGs and local firewalls. Blocking this IP will cause all probes to fail, marking all instances as unhealthy.

## Verify probe configuration

After configuring probes, verify their effectiveness. In Application Gateway, check the Backend Health page. It shows the health status of each backend instance based on the probe. In Load Balancer, check the backend pool health in the Azure portal or via Azure Monitor.

To test a probe failure, you can use an NSG rule to block the probe source IP or port. This simulates a backend failure without taking the instance offline. Ensure you remove the rule after testing to avoid unintended outages.

Remember that probe definitions are not validated by the API or CLI. Validation only occurs in the Azure portal. If you deploy probes via ARM templates or Bicep, ensure the configuration is correct before deployment. A misconfigured probe will not be caught until the first probe is sent.

## Common pitfalls to avoid

Do not use a TCP probe for an HTTP application. It will not detect application-level failures. Do not block the probe source IP in NSGs. It will cause false negatives. Do not assume that a healthy probe means the application is ready for production traffic. Always test the probe path with a real request to ensure it reflects the application's state.

By configuring probes that reflect application readiness, you ensure that traffic is only sent to instances that can actually serve it. This improves the reliability of your application and reduces user-visible errors.

References for Configure health probes that reflect application readiness: [Health monitoring overview for Azure Application Gateway](https://learn.microsoft.com/en-us/azure/application-gateway/application-gateway-probe-overview), [Azure Load Balancer health probes](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-custom-probe-overview), [Manage health probes for Azure Load Balancer - Azure portal](https://learn.microsoft.com/en-us/azure/load-balancer/manage-probes-how-to).
