---
title: "Create a Storage account with private access in mind"
description: "Create a Blob Storage account with a deliberate private endpoint, DNS and public-access policy, then verify networking and data permissions separately."
pubDate: 2024-02-02
category: storage
tags: [azure-storage, private-endpoints, private-dns, blob-storage]
translationKey: create-a-storage-account-with-private-access-in-mind
draft: true
---

A private endpoint gives a storage service a private network path. It does not, by itself, disable that service's public endpoint or give an application permission to read its data. Plan all three parts: the endpoint, name resolution and access control.

For this illustrative exercise, use a general-purpose v2 storage account and the Blob service. General-purpose v2 is the choice for this example, not a claim that it is the only account type supporting private endpoints. Check the [account creation guidance](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-create) and the [private endpoint requirements](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints) for the particular account and service.

## Define the access path first

Choose the subscription, resource group, region, VNet and subnet. Identify the client that will access Blob Storage and the identity it will use.

If the client is on-premises or in another VNet, include the routing and DNS arrangements in the design. The endpoint is not useful merely because its network interface exists; the intended client needs a working path to its private address.

Keep the distinction between permissions clear. Creating an account or private endpoint involves Azure resource-management permissions. Reading or writing blobs requires appropriate data permissions, such as the relevant Storage Blob Data role when using Microsoft Entra authentication. A management-plane Reader role does not provide blob-data access.

## Create the account and the Blob endpoint

Create the storage account through the Azure portal using an available account name and the agreed redundancy settings. Review its security and networking settings before deployment.

Choose the public-network access setting that matches the private-only requirement. Avoid leaving public access enabled simply because the private endpoint will be added later. If necessary, complete the network configuration before attempting any data-plane operations from the portal.

Create a private endpoint for that account, selecting **blob** as the target subresource and the intended VNet and subnet. Check the approval state of the private endpoint connection. Approval depends on the applicable permissions and consent process; do not assume every request is approved automatically.

A Blob endpoint is not a private endpoint for every service in the account. Azure Files, Queues, Tables and Data Lake Storage access can introduce additional endpoint and DNS requirements. Keep this first exercise scoped to Blob Storage.

## Make DNS part of the configuration

For Blob Storage, the relevant private DNS zone is `privatelink.blob.core.windows.net`. Confirm that the private endpoint has the expected DNS record and that the client's DNS path can resolve it.

A client should normally continue using the storage service's regular hostname, such as `<account>.blob.core.windows.net`. With the appropriate DNS configuration, that name resolves through the private-link namespace to the endpoint's private IP address.

If Azure-provided DNS is used, check the private zone's VNet links and endpoint integration. If the client uses custom DNS, plan the necessary forwarding and resolution path. Creating a private zone does not automatically configure every on-premises or custom DNS server to use it.

For an illustrative Windows client, replace the account name below with the one actually created:

```powershell
$storageAccountName = 'azcprivatelab01'
Resolve-DnsName "$storageAccountName.blob.core.windows.net"
```

This example has not been run against a deployment. The expected result, from a correctly configured private client, includes resolution to the endpoint's private address. Compare the returned address with the private endpoint's actual network interface.

## Verify networking and authorisation separately

First confirm that the client resolves the expected private address and can reach the intended service over its network path. Then test a permitted Blob operation using the intended application identity.

A correct private IP does not prove that data permissions are present. An authorisation error after successful connectivity needs an identity and role-assignment investigation, rather than another DNS change.

Also test from a client that does not have the private path, using otherwise appropriate test credentials. Confirm that the account's public-access configuration behaves as intended. Review any authorised service exceptions separately rather than assuming the endpoint configuration describes every permitted access route.

Keep the public-access restriction in place while investigating private DNS or routing problems. Reopening the public endpoint can hide the problem the test was intended to find.

For a disposable lab, remove its endpoint and resources after checking whether DNS zones or VNet links are shared. For a retained account, record the service subresource, endpoint connection, DNS ownership and data-access identity so the next application change can be checked against the same design.
