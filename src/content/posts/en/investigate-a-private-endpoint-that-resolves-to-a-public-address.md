---
title: "Investigate a private endpoint that resolves to a public address"
description: "Diagnose why a private endpoint resolves to a public IP by checking DNS zone linkage, record accuracy, and client resolver settings."
pubDate: 2026-05-02
category: networking
tags: ["private-link", "dns", "troubleshooting", "private-endpoint", "networking"]
translationKey: investigate-a-private-endpoint-that-resolves-to-a-public-address
draft: false
---

A private endpoint is designed to bring a service into your virtual network via a private IP address. If a client resolves the service's fully qualified domain name (FQDN) to a public IP, the traffic leaves the Microsoft backbone and traverses the public internet. This bypasses the private link path. Whether this breaks connectivity depends entirely on the target service's network access settings; many Azure PaaS services disable public network access by default or enforce private link, meaning a public resolution will result in a connection failure.

The resolution to a public IP is almost always a DNS configuration issue. A private endpoint provides the network interface, but it does not automatically push DNS records to every client. You must explicitly configure DNS so that the client's virtual network queries a server that hosts the private zone and returns the private IP address.

## Verify the Private DNS Zone linkage

The first step is to confirm that the private DNS zone is correctly associated with the virtual network containing the client. If the zone is not linked to that specific virtual network, the client's DNS queries will not reach the private zone records.

1. Open the **Private DNS zone** resource intended for the service.
2. Select **Virtual network links**.
3. Confirm that the client's virtual network is listed in the links.
4. Ensure the link is in an **Active** state.

If the link is missing or inactive, create it. The zone must be linked to the virtual network where the client VM or service is running. A link to a different virtual network will not help resolve the address for this client. Existing Microsoft Azure services might already have a DNS configuration for a public endpoint, and this private configuration must be explicitly linked to override it for the specific network scope [Azure Private Endpoint private DNS zone values](https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-dns).

## Verify the A record matches the private IP

Even with a correct link, the DNS record itself must contain the private IP address assigned to the private endpoint. A common mistake is creating a record with the public IP or leaving it blank.

1. Go to the **Private DNS zone**.
2. Select **Record sets**.
3. Find the **A record** for the service FQDN.
4. Check the **IP address** field. It must match the **Private IP address** shown on the private endpoint resource.

You can find the private IP address on the private endpoint resource under the **Properties** tab or by viewing the network interface associated with the endpoint. If the IP address in the DNS record does not match, update it. The troubleshooting guidance states that DNS resolution from the test results must have the same private IP address assigned to the private endpoint [Troubleshoot Azure Private Endpoint connectivity problems](https://learn.microsoft.com/en-us/azure/private-link/troubleshoot-private-endpoint-connectivity).

## Check the client's DNS server configuration

If the private DNS zone is linked and the record is correct, the issue may lie with the DNS server the client is actually using. The client must be configured to query a DNS server that can resolve the private zone. This is typically the virtual network's configured DNS servers.

1. Connect to the client VM.
2. Check the network adapter settings to see which DNS servers are configured.
3. Verify that these DNS servers are the virtual network's DNS servers (or custom DNS servers that forward queries correctly).

If the client is using a custom DNS server, ensure it is configured to forward queries for the private domain to the Azure Private DNS zone or the private endpoint's IP address. Alternatively, use Azure Private Resolver to manage DNS resolution across virtual networks [Azure Private Endpoint private DNS zone values](https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-dns).

## Test resolution from the client

Once you have verified the DNS configuration, test resolution from the client VM.

1. Connect to the client VM.
2. Run a DNS lookup command for the service FQDN.
3. Verify that the returned IP address is the private IP address.

If the resolution is still incorrect, check the network security group (NSG) rules on the client subnet. Ensure that outbound traffic to the DNS server port (typically 53) is allowed. Also, verify that the client VM is not using a static DNS configuration that overrides the virtual network settings.

## Review Private Endpoint configuration

If DNS is confirmed correct, review the private endpoint configuration. Ensure the connection state is **Approved** and that the private endpoint is linked to the correct subnet. A private endpoint in a different subnet or virtual network will not be reachable by the client.

Check the metrics on the private endpoint resource to see if data is flowing. If data is flowing but the IP is still public, the issue is likely at the application layer, such as a hardcoded public endpoint in the application configuration.
