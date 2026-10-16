---
title: "How to migrate Azure Managed Disk to different subscription and region – Part II"
description: "On the previous post I describe what need to do to move Azure Managed Disks between subscriptions and after that between regions (see link HERE). Although I didn’t explore the…"
pubDate: 2018-11-08
category: storage
tags: [portal, managed-disks, powershell, vhd, subscriptions]
translationKey: how-to-migrate-azure-managed-disk-to-different-subscription-and-region-part-ii
legacy: true
legacyUrl: /2018/11/how-to-migrate-azure-managed-disk-to-different-subscription-and-region-part-ii.html
---

On the previous post I describe what need to do to move Azure Managed Disks between subscriptions and after that between regions (see link [HERE](/posts/how-to-migrate-azure-managed-disk-to-different-subscription-and-region-part-i)). Although I didn’t explore the steps mention to
move between regions.

Here are the step-by-steps of each stage, mention on the previous post, of how to move the Azure Managed Disk between Azure Regions:

## **1. Stop the virtual machine from migrating**

  1. Navigate to the Azure portal ([https://portal.azure.com](https://portal.azure.com))  
  2. Click Virtual Machines on the left-hand menu, then select the virtual machine to be migrated  
  3. Click Stop

## **2. Enable the Export function to generate a single URL containing the VHD of the managed disk to migrate**

  1. On the selected virtual machine, click on Disks
  2. Select the managed disk that you want to migrate
  3. Click Export 
  4. Click on the Generate URL button 
  5. Copy this unique URL pointing to the target VHD file to the Notepad or any other clipboard.

## **3. Create a storage disk in the target region of the new subscription**

  1. So now, we need to create a storage account in the target region on the target subscription
  2. Create a Container (folder) containing the VHD file to use and retrieve the connection information to that storage account:
    1. On the Azure portal, select All Services.
    2. Scroll to storage, and then select storage accounts 
    3. On the Storage Accounts window, click Add 
    4. Select the subscription in which you want to create the storage account, as well as the target resource group  
    5. Enter the name for your storage account
    6. Select the location of your storage account (target region)
    7. Leave all other fields to their default value
    8. Click Verify + Create to review your storage account settings and create the account.
  3. After the storage account is created, click Blob on the container 
  4. On the Name field, type VHDs 
  5. Click the OK button to confirm. This folder will contain the VHD file copied to the new region.
  6. Click VHDs and then select Properties 
  7. Copy the URL to the Notepad (example: [https://tempmanagedisk.blob.core.windows.net/vhds](https://tempmanagedisk.blob.core.windows.net/vhds))
  8. Click access keys and copy the Key1 key to the Notepad.

## **4. Use the AzCopy command from an Azure virtual machine (this option will decrease the copying time) to copy the data (VHD file) from the managed disk to a storage account created in the target region of the new subscription**

AzCopy is a command-line utility designed to copy data from/to an Azure Blob, to a file or to a Table using simple commands with optimum performance. You can copy data between a file system and a storage account, or between storage accounts. 

To start, you need to download and then install the latest version of the AzCopy utility from the following link [aka.ms/downloadazcopy](https://aka.ms/downloadazcopy) on a Windows virtual machine hosted in Azure. This was the way that I found to speed up the process of transferring the data between managed disks.

So, let start with the steps to copy the data:

1. Run a command prompt from the Azure virtual machine 
2. Select the C:\Program Files (x86) \microsoft SDKs\Azure\AzCopy Directory (the utility does not modify the path).
3. Type the command to copy the data from the source managed disk to the target storage account previously created in a target subscription:   
  ```js
  azcopy /source:"<URL_FROM_VHD>” /dest:"<URL_VHD_DESTINATION>” /destkey:"<KEY1>”
  ```
## **5. From the VHD in the storage account, create a managed disk**

After the copy is completed, we need to create a managed disk from the VHD copied.

  1. Click All services 
  2. Select disks and Add
  3. Enter the name of the managed disk to be created from the VHD file copied to the Storage account 
  4. Select the target subscription, the target resource group, and especially the target region
  5. From the source Type drop-down menu, select Storage Blob, and then click the Browse button 
  6. Select the target storage account 
  7. Select the VHDs container 
  8. Select the copied VHD file and then validate by clicking the Select button
  9. Finally enter the size in GiB and then click the Create button.

## **6. From the previously managed disk created, recreate a virtual machine**

Now that the managed disk is on a different region and subscription, the final step is to create a virtual machine from the managed disk.

1. On the Azure Portal, navigate to Disks 
2. Click on the managed disk that was created 
3. Create a virtual machine 
4. Follow the steps to create the virtual machine.

With these 6 steps, we copied a managed disk from an Azure virtual machine from region A to region B of another subscription, and then recreated the virtual machine.

Finally, be aware that it is possible to enable migration of managed disks between 2 subscriptions from the Azure portal GUI, but this method does not allow you to change the region of the virtual machine (thus the managed disk) and is only valid if the source virtual machine is not backed up.

To enable this feature, run the following 2 commands from a PowerShell Azure window and the source subscription:
```powershell
Register-AzureRmProviderFeature -FeatureName ManagedResourcesMove -ProviderNamespace Microsoft.Compute
Register-AzureRmResourceProvider -ProviderNamespace Microsoft.Compute
```

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
