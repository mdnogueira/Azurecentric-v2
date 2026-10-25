---
title: "Plan private DNS zones before adding private endpoints"
description: "Plan private DNS zones before adding private endpoints to ensure correct resolution and avoid connectivity failures."
pubDate: 2024-12-26
category: networking
tags: ["azure-private-link", "private-dns", "private-endpoints", "dns-configuration", "networking"]
translationKey: plan-private-dns-zones-before-adding-private-endpoints
draft: false
---

You create a private endpoint, the connection is approved, and the network interface has a private IP. Yet the application cannot connect. The most likely cause is not the network path, but the DNS resolution. A private endpoint alone does not disable public access or fix DNS. Without a correctly configured private DNS zone, the fully qualified domain name (FQDN) still resolves to the public IP address, or fails entirely if public access is restricted.

This is a common trap. Many practitioners assume that enabling a private endpoint automatically routes traffic privately. It does not. The private endpoint provides the network interface and the private IP, but the client must still resolve the service name to that IP. If the DNS configuration is missing or incorrect, the client bypasses the private endpoint and attempts to reach the public endpoint.

## The DNS resolution gap

When you connect to an Azure service like Azure Storage or Azure SQL Database via a public endpoint, the client resolves the service FQDN (e.g., `mystorageaccount.blob.core.windows.net`) to a public IP address via the public DNS infrastructure. Azure creates an A record on the public DNS pointing to that public IP.

However, this public DNS configuration does not automatically override resolution within your virtual network (VNet) to point to the private endpoint's IP. To connect using the private endpoint, you must override the DNS resolution for that specific domain within your VNet. This is typically done using a private DNS zone.

The private DNS zone acts as a local override. When a VM in your VNet queries for the service FQDN, the Azure Private DNS service, linked to the VNet, responds with the private IP address of the private endpoint. Without this link, the VM falls back to the public DNS resolution, which points to the public IP.

## Planning your private DNS zones

The critical mistake is creating private DNS zones ad-hoc, or worse, reusing existing zones for unrelated services. Azure Private DNS zones are domain-specific. You cannot place records for multiple services in the same DNS zone if they share a domain suffix but require different resolution targets, or if they are distinct services that happen to use similar naming conventions.

Microsoft provides specific recommended zone names for each Azure service that supports private endpoints. These names are designed to avoid conflicts with public DNS and to ensure that the private endpoint's automatic DNS configuration works correctly. For example:

*   **Azure Storage:** `privatelink.blob.core.windows.net` for blob storage, `privatelink.file.core.windows.net` for file shares, etc.
*   **Azure SQL Database:** `privatelink.database.windows.net`
*   **Azure Key Vault:** `privatelink.vaultcore.azure.net`

You must create a separate private DNS zone for each of these service-specific domains. Do not attempt to consolidate them into a single zone like `privatelink.azure.com` or a custom domain unless you have a very specific, documented reason and understand the implications for DNS forwarding and resolution.

A key limitation is that existing private DNS zones linked to a single Azure service should not be associated with two different Azure service Private Endpoints. This will cause a deletion of the initial A-record and result in resolution issues when attempting to access that service from each respective private endpoint. Create a DNS zone for each private endpoint of like services. Don't place records for multiple services in the same zone.

Some services share the same private DNS zone name. For instance, Azure Service Bus and Event Hubs both use `privatelink.servicebus.windows.net`. You can place records for both services in the same zone. However, you should not mix records for different service types (e.g., Storage and SQL) in a single zone.

## Implementing the DNS configuration

The process involves three main steps: creating the private DNS zone, linking it to your virtual network, and ensuring the private endpoint is configured to use it.

1.  **Create the Private DNS Zone:** Use the recommended zone name for the service you are connecting to. For example, for Azure Storage blob storage, create a zone named `privatelink.blob.core.windows.net`.
2.  **Link the Virtual Network:** Link the private DNS zone to the VNet where your client VMs reside. This allows the VMs to resolve records in the zone. If you enable automatic registration, the zone will automatically manage A records for VMs in the linked VNet, but for private endpoints, you typically rely on the manual or automatic configuration of the endpoint's DNS settings.
3.  **Configure the Private Endpoint:** When creating the private endpoint, you can specify the private DNS zone to use. If you use the recommended naming scheme, Azure can often automatically configure the DNS settings. However, it is crucial to verify that the private endpoint is linked to the correct zone. The network interface associated with the private endpoint contains the FQDN and private IP addresses, and the DNS zone must map that FQDN to that IP.

If you are connecting to a service that requires multiple subresources (e.g., Azure Storage blob, file, queue, table), you need separate private endpoints for each subresource, and potentially separate DNS zones if the FQDNs differ significantly. For Azure Storage, the blob, file, queue, and table services have distinct private DNS zone names (`privatelink.blob.core.windows.net`, `privatelink.file.core.windows.net`, etc.). You must create and configure DNS for each one you intend to use.

## Verification and Troubleshooting

After deployment, verification is essential. Do not assume the connection is working because the private endpoint status is "Approved".

1.  **Check DNS Resolution:** From a VM in the linked VNet, use `nslookup` or `dig` to query the service FQDN. It should return the private IP address of the private endpoint, not the public IP.
    *   Example: `nslookup mystorageaccount.blob.core.windows.net`
    *   Expected: The IP address should be within your VNet's private IP range.
2.  **Check Private Endpoint DNS Settings:** In the Azure portal, navigate to the private endpoint and check the "DNS configuration" section. Ensure the private DNS zone is listed and that the record is present.
3.  **Test Connectivity:** Attempt to connect to the service using the application or a tool like `az storage blob list` (for Azure Storage). If it fails, check the error message. A common error is "Server failed to authenticate the request" or "The remote name could not be resolved", which often points to DNS issues.

If you encounter resolution failures, check the following:
*   **Zone Link:** Is the private DNS zone linked to the correct VNet?
*   **Zone Name:** Did you use the recommended zone name? A mismatch here is a frequent cause of failure.
*   **Public Access:** If the service has public access enabled and you are trying to connect via the private endpoint, ensure that the DNS override is working. If public access is disabled, DNS resolution *must* point to the private IP, or the connection will fail completely.
*   **Conflicting Records:** Are there any manually created A records in the private DNS zone that conflict with the automatic records? Remove any manual records that might interfere.

## Handling Split-Horizon DNS

In some scenarios, you may need to access the same service from both inside and outside the VNet. This is known as split-horizon DNS. Azure Private DNS supports this by allowing you to create a private zone with the same name as a public zone. The private zone resolves to the private IP for clients in the linked VNet, while the public zone resolves to the public IP for external clients.

However, be cautious when overriding a zone that's actively in use to resolve public endpoints. Connections to resources won't be able to resolve correctly without DNS forwarding to the public DNS. To avoid issues, create a different domain name or follow the suggested name for each service listed in the documentation.

For example, if you have an existing application that relies on the public DNS for Azure Storage, and you introduce private endpoints, you must ensure that the private DNS zone does not inadvertently break the public resolution for other clients. This is why using the specific `privatelink.*` domain names is recommended, as they are distinct from the public domains.


Reference: [Azure Private Endpoint private DNS zone values](https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-dns).
