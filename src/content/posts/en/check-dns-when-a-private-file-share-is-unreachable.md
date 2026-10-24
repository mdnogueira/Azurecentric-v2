---
title: "Check DNS when a private file share is unreachable"
description: "Troubleshoot Azure Files mount failures over private endpoints by verifying DNS forwarding and resolving cross-tenant conflicts."
pubDate: 2025-08-12
category: storage
tags: ["azure-files", "private-endpoints", "dns-forwarding", "troubleshooting", "networking"]
translationKey: check-dns-when-a-private-file-share-is-unreachable
draft: true
---

You have configured a private endpoint for an Azure Files storage account and established a site-to-site VPN or ExpressRoute connection. When you attempt to mount the file share from an on-premises server, the connection fails. The storage account firewall is not blocking the traffic, and the tunnel is up. The next thing to check is DNS resolution.

When you create a private endpoint, Azure automatically creates a private DNS zone and links it to the virtual network containing the endpoint. This zone contains a CNAME record mapping `storageaccount.file.core.windows.net` to a private `privatelink` A record. However, this configuration only affects clients within that virtual network. On-premises DNS servers still resolve the storage account name to its public IP address. If your network routing directs traffic for the private subnet through the tunnel, or if the public endpoint is blocked by firewall rules, the public IP address is useless. You need the on-premises DNS server to return the private IP address instead.

[![DNS Resolution Flow for Azure Files Private Endpoint](/images/posts/2025/azc-211-checkpoints.svg)](/images/posts/2025/azc-211-checkpoints.svg)

## How DNS resolution differs by location

It is useful to understand what happens when you query the storage account name from different locations. From an Azure virtual machine in the same VNet as the private endpoint, the query hits the Azure private DNS zone.

```powershell
Resolve-DnsName -Name "storageaccount.file.core.windows.net"
```

The output shows a CNAME pointing to `storageaccount.privatelink.file.core.windows.net`, which resolves to an A record with a private IP address (e.g., `192.168.0.4`).

From an on-premises server, the same query hits your local DNS server, which forwards it to the public internet. The result is a CNAME chain leading to the public Azure storage cluster IP address (e.g., `52.239.194.40`).

If your storage account firewall blocks public access, or if your network routing directs traffic for the private subnet through the tunnel, the public IP address is useless. You need the on-premises DNS server to return the private IP address instead.

## Configuring DNS forwarding

There are two primary methods to achieve this: using DNS server virtual machines within Azure or using Azure DNS Private Resolver. Both methods require configuring a conditional forwarder on your on-premises DNS servers.

### Option 1: Using DNS Server VMs

If you already have DNS servers running in your Azure virtual network, you can configure them to forward `core.windows.net` queries to the Azure private DNS service. The Azure private DNS service is accessible from within a virtual network via the reserved IP address `168.63.129.16`.

On your Azure DNS server, run the following PowerShell command to create a conditional forwarder zone:

```powershell
$storageAccountEndpoint = Get-AzContext | `
    Select-Object -ExpandProperty Environment | `
    Select-Object -ExpandProperty StorageEndpointSuffix

Add-DnsServerConditionalForwarderZone `
        -Name $storageAccountEndpoint `
        -MasterServers "168.63.129.16"
```

This ensures that any query for `core.windows.net` received by the Azure DNS server is forwarded to the private DNS resolver.

Next, on your on-premises DNS servers, you need to forward the same zone to the IP address of your Azure DNS server. Replace `<azure-dns-server-ip>` with the private IP address of your Azure DNS server.

```powershell
$vnetDnsServers = "Exampleazurednsserverip"

$storageAccountEndpoint = Get-AzContext | `
    Select-Object -ExpandProperty Environment | `
    Select-Object -ExpandProperty StorageEndpointSuffix

Add-DnsServerConditionalForwarderZone `
        -Name $storageAccountEndpoint `
        -MasterServers $vnetDnsServers
```

### Option 2: Using Azure DNS Private Resolver

If you do not want to manage DNS server VMs, you can use Azure DNS Private Resolver. This service handles the forwarding to the Azure private DNS zone automatically. You only need to point your on-premises DNS servers to the resolver's inbound endpoint IP address.

On your on-premises DNS servers, create a conditional forwarder zone pointing to the resolver's inbound endpoint IP address. Replace `<resolver-ip>` with the actual IP address.

```powershell
$privateResolver = "Exampleresolverip"

$storageAccountEndpoint = Get-AzContext | `
    Select-Object -ExpandProperty Environment | `
    Select-Object -ExpandProperty StorageEndpointSuffix

Add-DnsServerConditionalForwarderZone `
        -Name $storageAccountEndpoint `
        -MasterServers $privateResolver
```

## Verifying the configuration

After configuring the forwarders, you must verify that the on-premises DNS server is correctly resolving the storage account name to the private IP address.

First, clear the DNS cache on your on-premises DNS server and any clients to ensure stale records are not used:

```powershell
Clear-DnsClientCache
```

Then, run a DNS query from an on-premises server:

```powershell
Resolve-DnsName -Name "storageaccount.file.core.windows.net"
```

You should see a CNAME record pointing to `storageaccount.privatelink.file.core.windows.net`, followed by an A record with the private IP address of the private endpoint (e.g., `192.168.0.4`). If you still see a public IP address, check the conditional forwarder configuration on your on-premises DNS server and ensure it is pointing to the correct Azure DNS server or resolver IP.

Once DNS resolution is correct, test the network connectivity to the private endpoint:

```powershell
Test-NetConnection -ComputerName "storageaccount.file.core.windows.net" -CommonTCPPort SMB
```

If the TCP connection to port 445 is successful, you should be able to mount the file share using the storage account name and your credentials.

## Cross-tenant considerations

Be aware that forwarding `core.windows.net` to your Azure DNS infrastructure affects all queries for this public domain. If you need to access a storage account in a different tenant that also uses private endpoints, you may encounter issues. Azure DNS will answer the query for the storage account public name with a CNAME that does not exist in your private DNS zone, because the private DNS zone is scoped to your tenant.

In such cases, you may need to create a cross-tenant private endpoint or configure specific DNS records for the external storage account to ensure correct resolution. This is a known limitation when consolidating DNS forwarding for multi-tenant scenarios.

## Cleanup and maintenance

If you need to remove the DNS forwarding configuration, simply remove the conditional forwarder zone from your on-premises DNS servers:

```powershell
Remove-DnsServerConditionalForwarderZone -Name $storageAccountEndpoint -Force
```

Ensure that you have alternative DNS resolution methods in place if you are relying on the public endpoint for other services. Removing the forwarder will cause all `core.windows.net` queries to resolve to public IP addresses again.

By ensuring that your on-premises DNS servers correctly forward `core.windows.net` queries to your Azure private DNS infrastructure, you can reliably access Azure Files over private endpoints. This configuration is essential for secure, isolated access to your file shares from on-premises networks.

References for Check DNS when a private file share is unreachable: [Configure DNS forwarding for Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-networking-dns), [Networking Considerations for Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-networking-overview), [Azure Storage Network security](https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security-overview).
