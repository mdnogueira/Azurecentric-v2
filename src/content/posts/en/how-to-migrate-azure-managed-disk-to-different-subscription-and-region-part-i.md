---
title: "How to migrate Azure Managed Disk to different subscription and region – Part I"
description: "On a recent project, I was asked to help move some virtual machines from a MSDN Subscription to a CSP subscription. With this move, we use the opportunity to consolidate on a…"
pubDate: 2018-11-06
category: storage
tags: [managed-disks, powershell, vhd]
translationKey: how-to-migrate-azure-managed-disk-to-different-subscription-and-region-part-i
legacy: true
legacyUrl: /2018/11/how-to-migrate-azure-managed-disk-to-different-subscription-and-region-part-i.html
---

On a recent project, I was asked to help move some virtual machines from a MSDN Subscription to a CSP subscription. With this move, we use the opportunity to consolidate on a different region as well. This last aspect makes the move a little more complex that was described on the **[Move resources to new resource group or subscription](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-move-resources)** documentation. 

The migration of resources between different or within the same subscription is relatively simple in Azure but does not apply to all resources. And unfortunately, these VMs were configured with managed disks, supporting the operating system and the data of the virtual machines are not part of it, at least at the time I write these lines. 

The following link lists the services that can be moved, as well as those that cannot, such as managed disks: **Move resources to new resource group or subscription**

From the link above, in a few PowerShell lines, it is possible to migrate a managed disk from a subscription A to a B subscription, although within the same region. The **_New-AzureRmDiskConfig_** command provides the **_-Location_** parameter, which must specify the same source and target membership region. Here is the code used:

```powershell
###SETTING THE VARIABLES###  
#1#SOURCE OF MANAGED DISKS##  
#Provide the subscription Id of the subscription where managed disk exists  
$SourceSubscriptionId='<SOURCE_SUBSCRIPTION_ID>'  
#Provide the name of your resource group where managed disk exists  
$SourceResourceGroupName='<SOURCE_RESOURCE_GROUP>'  
#Provide the name of the managed disk  
$ManagedDiskName='<NAME_MANAGED_DISK>'  
#2#TARGET DESTINATION OF MANAGED DISKS##  
#Provide the subscription Id of the subscription where managed disk will be copied to  
#If managed disk is copied to the same subscription then you can skip this step  
$TargetSubscriptionId='<TARGET_SUBSCRIPTION_ID>'  
#Name of the resource group where snapshot will be copied to  
$TargetResourceGroupName='<TARGET_RESOURCE_GROUP>'  
###SCRIPT###   
#Provide the credentials to the Azure Portal  
Connect-AzureRmAccount  
#Set the context to the subscription Id where Managed Disk exists  
Select-AzureRmSubscription -SubscriptionId $SourceSubscriptionId  
#Get the source managed disk  
$ManagedDisk= Get-AzureRMDisk -ResourceGroupName $SourceResourceGroupName -DiskName $ManagedDiskName  
#Set the context to the subscription Id where managed disk will be copied to  
#If snapshot is copied to the same subscription then you can skip this step  
Select-AzureRmSubscription -SubscriptionId $TargetSubscriptionId  
$DiskConfig = New-AzureRmDiskConfig -SourceResourceId $ManagedDisk.Id -Location $ManagedDisk.Location -CreateOption Copy   
#Create a new managed disk in the target subscription and resource group  
New-AzureRmDisk -Disk $DiskConfig -DiskName "testpp06" -ResourceGroupName $TargetResourceGroupName
```

As you probably thinking, the initial goal is complete, although we need to move the VMs to a different region. In this case, we just achieved the first part, because the managed disk was copied from the subscription A to the subscription B, but not in another region.

After a few tests, this is the method that I use. I’m sure that you will find other methods, but I found this very simple for this case. In the future post, I might script these steps, for automation purposes.

  1. Stop the virtual machine to migrate
  2. Enable the Export function to generate a single URL containing the VHD of the managed disk to be migrated
  3. Create a storage disk in the target region of the new subscription
  4. Use the AzCopy command from an Azure virtual machine (this option will decrease the copying time) to copy the data (VHD file) from the managed disk to a storage account created in the target region of the new subscription
  5. From the VHD in the storage account, create a managed disk
  6. From the previously managed disk created, recreate the virtual machine

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
