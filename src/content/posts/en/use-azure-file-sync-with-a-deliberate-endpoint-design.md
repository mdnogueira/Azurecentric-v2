---
title: "Use Azure File Sync with a deliberate endpoint design"
description: "Design Azure File Sync sync groups and private endpoints deliberately to ensure data isolation and network security."
pubDate: 2025-10-05
category: storage
tags: ["azure-file-sync", "private-endpoints", "dns-configuration", "file-storage", "networking"]
translationKey: use-azure-file-sync-with-a-deliberate-endpoint-design
draft: false
---

You have a Windows Server file share that needs to sit alongside an Azure file share. The first decision is not which agent to install, but how to structure the sync topology so that data isolation, performance limits, and network access behave as expected. Azure File Sync is not a simple replication tool; it is a management service that ties registered servers, sync groups, and cloud endpoints together. If you design the endpoints loosely, you will hit scale limits, permission conflicts, or network timeouts later. The correct approach is to start with the sync group as the boundary for data and access, then enforce network isolation through private endpoints and DNS.

## Structure the sync group as the data boundary

[![Azure File Sync Endpoint Flow](/images/posts/2025/azc-230-checkpoints.svg)](/images/posts/2025/azc-230-checkpoints.svg)

A sync group defines the relationship between one cloud endpoint (an Azure file share) and one or more server endpoints (paths on registered Windows Servers). The most common mistake is to assume that a single sync group can handle multiple distinct data sets or that a single server can sync multiple shares to the same cloud endpoint without careful planning. The documentation is explicit: a sync group supports only one server endpoint per registered server, and a cloud endpoint can only belong to one sync group [Deploy Azure File Sync](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-deployment-guide). This means you cannot have two different server endpoints on the same server syncing to the same Azure file share [Deploy Azure File Sync](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-deployment-guide).

If you have multiple on-premises shares that logically belong together, group them under a common root folder on the server before syncing. For example, if you have HR and Finance shares, create a folder `D:\SharedData` containing subfolders `HR` and `Finance`, and sync that single root to one Azure file share. This keeps the number of sync groups manageable and respects the limit of 30 Azure file shares per server [Deploy Azure File Sync](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-deployment-guide). Conversely, if you have distinct security requirements or different performance needs, create separate sync groups and separate Azure file shares. A storage sync service can contain multiple sync groups, but data isolation between business units requires separate storage sync services if strict separation is needed [Plan for an Azure File Sync Deployment](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning).

When creating the server endpoint, you must choose an initial sync policy. If the Azure file share is empty, use `Merge` or `ServerAuthoritative` depending on which side holds the truth. If the share already contains data, `Merge` will create conflicts for files with the same name but different content, storing both versions. `ServerAuthoritative` overwrites the cloud content with the server content. This choice determines the starting state for the first synchronization. If the policy needs to change later, the server endpoint must be removed and re-added to the sync group [Deploy Azure File Sync](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-deployment-guide).

## Configure private endpoints for network isolation

Azure File Sync relies on two main network paths: the storage account for file data and the Storage Sync Service for management and sync coordination. Both require network access. By default, these are public endpoints. For production environments, you should restrict access to private endpoints within your virtual network. This is not optional if you want to disable public access to the storage account entirely.

Creating a private endpoint for the storage account involves deploying a network interface with a private IP in your subnet and configuring a private DNS zone. The DNS zone is not just a convenience; it is explicitly required for mounting the Azure file share using an AD user principal or accessing via the REST API [Deploy Azure File Sync](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-deployment-guide). The DNS suffix for storage accounts is `privatelink.file.core.windows.net` in public cloud [Configure Azure File Sync network endpoints](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-networking-endpoints).

You must also create a private endpoint for the Storage Sync Service. This is a separate resource, and the DNS suffix is `privatelink.afs.azure.net` [Configure Azure File Sync network endpoints](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-networking-endpoints). The Storage Sync Service has multiple sub-resources (management, sync, monitoring), and the private endpoint must resolve all of them. The PowerShell example below shows how to create the private endpoint and the associated DNS records. Note that the subnet must have private endpoint network policies disabled to allow the endpoint to be created [Configure Azure File Sync network endpoints](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-networking-endpoints).

```powershell
# Example: Create private endpoint for Storage Sync Service
# Prerequisites: $storageSyncService, $virtualNetwork, $subnet variables defined
# This code is illustrative and assumes the Az module is installed.

# Disable private endpoint network policies on the subnet
$subnet.PrivateEndpointNetworkPolicies = "Disabled"
$virtualNetwork | Set-AzVirtualNetwork -ErrorAction Stop

# Create private link service connection
$privateEndpointConnection = New-AzPrivateLinkServiceConnection `
    -Name "${storageSyncService.Name}-Connection" `
    -PrivateLinkServiceId $storageSyncService.ResourceId `
    -GroupId "Afs" `
    -ErrorAction Stop

# Create the private endpoint
$privateEndpoint = New-AzPrivateEndpoint `
    -ResourceGroupName $storageSyncService.ResourceGroupName `
    -Name "${storageSyncService.Name}-PrivateEndpoint" `
    -Location $virtualNetwork.Location `
    -Subnet $subnet `
    -PrivateLinkServiceConnection $privateEndpointConnection `
    -ErrorAction Stop

# Create private DNS zone and A records
$storageSyncSuffix = "afs.azure.net"
$dnsZoneName = "privatelink.$storageSyncSuffix"

# Create DNS zone if it doesn't exist
$dnsZone = Get-AzPrivateDnsZone -Name $dnsZoneName -ErrorAction SilentlyContinue
if ($null -eq $dnsZone) {
    $dnsZone = New-AzPrivateDnsZone -ResourceGroupName $virtualNetwork.ResourceGroupName -Name $dnsZoneName -ErrorAction Stop
    New-AzPrivateDnsVirtualNetworkLink -ResourceGroupName $virtualNetwork.ResourceGroupName -ZoneName $dnsZoneName -Name "VNetLink" -VirtualNetworkId $virtualNetwork.Id -ErrorAction Stop
}

# Create A records for the private endpoint IPs
$privateEndpoint | Select-Object -ExpandProperty NetworkInterfaces | ForEach-Object {
    $nic = Get-AzNetworkInterface -ResourceId $_.Id
    $nic.IpConfigurations | ForEach-Object {
        $ip = $_.PrivateIpAddress
        $fqdns = $_.PrivateLinkConnectionProperties.Fqdns
        foreach ($fqdn in $fqdns) {
            $shortName = $fqdn.Substring(0, $fqdn.IndexOf(".", $fqdn.IndexOf(".") + 1))
            $dnsRecord = New-AzPrivateDnsRecordConfig -IPv4Address $ip
            New-AzPrivateDnsRecordSet -ResourceGroupName $virtualNetwork.ResourceGroupName -Name $shortName -RecordType A -ZoneName $dnsZoneName -Ttl 600 -PrivateDnsRecords $dnsRecord -ErrorAction Stop | Out-Null
        }
    }
}
```

After creating the private endpoints, you must disable the public endpoint on the storage account if you want to enforce private access. This is done by setting the default action to `Deny` and bypassing `AzureServices` to allow Azure File Sync to function [Configure Azure File Sync network endpoints](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-networking-endpoints). If you disable public access without allowing `AzureServices`, the Azure File Sync agent will lose connectivity to the storage account.

## Verify the configuration

Verification is not just about checking if the agent is installed. You must verify that the server can resolve the private DNS names and that the sync group is healthy. Use `Resolve-DnsName` to check the storage account and Storage Sync Service names. If the resolution returns the private IP addresses, the network path is correct. If it returns public IPs, the DNS zone is not linked or the records are missing [Configure Azure File Sync network endpoints](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-networking-endpoints).

Check the sync group status in the Azure portal or via PowerShell. Look for any errors in the sync health. If the server endpoint is not syncing, check the event logs on the Windows Server for errors related to network connectivity or authentication. The agent requires specific Windows updates and PowerShell versions to function correctly [Deploy Azure File Sync](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-deployment-guide).

Finally, test file access. Create a file on the server endpoint and verify it appears in the Azure file share. Then create a file in the Azure file share and verify it appears on the server. This confirms that the sync group is working bidirectionally. Remember that changes made directly in the Azure file share outside of sync are detected only when the periodic change detection job runs, which typically occurs every 24 hours [Plan for an Azure File Sync Deployment](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning).

The endpoint design is complete when the sync group boundaries are clear, private endpoints are resolving correctly, and file sync is operational. This setup provides a secure, scalable foundation for your file services.
