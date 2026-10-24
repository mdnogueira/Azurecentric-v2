---
title: "Plan a private endpoint for a Storage account"
description: "Plan private endpoints for Azure Storage by mapping services, managing DNS, and configuring firewalls."
pubDate: 2025-04-25
category: storage
tags: ["azure-storage", "private-endpoints", "private-link", "dns-configuration", "networking"]
translationKey: plan-a-private-endpoint-for-a-storage-account
draft: false
---

You are planning a private endpoint for an Azure Storage account. The immediate technical task is creating the network interface, but the actual work is mapping your application’s protocol requirements to the correct storage sub-resources and ensuring DNS resolves to the private IP. If you skip the service mapping, your application may fail at runtime. If you skip the DNS check, it may fail silently or route over the public internet.

The first thing to establish is which storage services your workload actually uses. A private endpoint is not a subscription to a storage account; it is a network interface attached to a specific sub-resource. You need a separate private endpoint for each service you intend to access: Blobs, Data Lake Storage (DFS), Files, Queues, Tables, or Static Websites.

[![Private Endpoint Flow for Azure Storage](/images/posts/2025/azc-172-checkpoints.svg)](/images/posts/2025/azc-172-checkpoints.svg)

## Map services to endpoints

A common mistake is creating one private endpoint for a storage account and expecting all protocols to work. They do not. The documentation states clearly that you need a separate private endpoint for each storage resource [Use private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints).

Consider a workload that uses Azure Files for SMB mounts and also performs blob copy operations. You must create:

1. A private endpoint for the **File** sub-resource (`privatelink.file.core.windows.net`).
2. A private endpoint for the **Blob** sub-resource (`privatelink.blob.core.windows.net`).

If you only create the File endpoint, blob copy operations will fail because the client cannot reach the Blob service privately. Similarly, if you use Data Lake Storage (DFS), you must create endpoints for both the **DFS** and **Blob** sub-resources. Operations targeting DFS may redirect to Blob, and some management APIs require the DFS endpoint specifically [Use private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints).

For geo-redundant storage (GRS) with read-access to the secondary region (RA-GRS), you should also create separate private endpoints for the secondary instance. This improves read performance. Note that you do not need a separate endpoint for failover; the private endpoint automatically connects to the new primary instance after a failover event [Use private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints).

## Verify DNS resolution

Private endpoints rely on DNS to route traffic. By default, Azure creates a private DNS zone (e.g., `privatelink.file.core.windows.net`) and links it to your virtual network (VNet). This zone contains an A record for the private endpoint’s IP address and a CNAME record for the standard storage account name (e.g., `storageaccount.file.core.windows.net`).

When a client in the VNet resolves `storageaccount.file.core.windows.net`, it receives the private IP address. When resolved from outside the VNet, it receives the public IP address. This allows you to use the same connection string for clients inside and outside the VNet [Use private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints).

However, this default behaviour breaks if you use a custom DNS server or if you need on-premises clients to resolve the private IP. In those cases, you must configure your DNS infrastructure to delegate the `privatelink` subdomain to the Azure private DNS zone or manually add A records for the private endpoint IPs [Use private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints).

You can verify DNS resolution from an Azure VM using PowerShell:

```powershell
Resolve-DnsName -Name "storageaccount.file.core.windows.net"
```

If the output shows an IP address within your VNet’s address space, the private endpoint is correctly resolved. If it shows a public IP, the private DNS zone is not linked or your custom DNS is overriding it [Networking considerations for Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-networking-overview).

## Configure the firewall

Creating a private endpoint does not automatically block public access. The storage account’s firewall still allows traffic from the public internet unless you explicitly restrict it. To enforce private-only access, you must configure the storage firewall to deny access from the public endpoint by default [Use private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints).

When you deny public access, you must ensure that all required subnets have private endpoints or service endpoints configured. If you use service endpoints, traffic still traverses the public IP but is validated at the network layer. Private endpoints use a private IP on the Microsoft backbone network [Use private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints).

Be aware of the constraint that clients in a VNet with private endpoints may face restrictions when accessing other storage accounts. If VNet N1 has a private endpoint for Storage A, and Storage B also has a private endpoint in VNet N2, clients in VNet N1 must access Storage B via a private endpoint as well. If Storage B has no private endpoint for the required service, the client may be unable to access it due to DNS changes [Use private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints).

## Verify connectivity

After creating the endpoints and configuring DNS, verify connectivity using the same connection strings you use in production. Do not use the `privatelink` subdomain URL directly; rely on DNS resolution to route the traffic [Use private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints).

For Azure Files, ensure that the SMB or NFS protocol is supported by your storage account type. Private endpoints are supported for Standard (GPv2) and Premium file shares. NFS is supported on both Standard (GPv2) and Premium file shares, provided the storage account uses LRS or ZRS redundancy [Networking considerations for Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-networking-overview).

If you are copying blobs between storage accounts using private endpoints, ensure that both accounts have private endpoints for the Blob or File sub-resources. Copying between storage accounts via NFS is not yet supported [Use private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints).

Check the private endpoint status in the Azure portal under the storage account’s **Networking** blade. Ensure the endpoint is **Connected** and that the DNS zone is linked to the correct VNet. If the endpoint is **Pending**, the storage account owner must approve the connection request [Use private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints).
