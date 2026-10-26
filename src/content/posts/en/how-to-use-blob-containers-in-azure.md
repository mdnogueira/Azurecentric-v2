---
title: "How to use Blob containers in Azure"
description: "I know that Microsoft Azure looks easy, because you create your subscription, then you start to consume all the resources. But in some cases, start to be overwhelming, with so…"
pubDate: 2017-03-13
category: storage
tags: ["azure-storage", "blob-storage", "powershell"]
translationKey: how-to-use-blob-containers-in-azure
legacy: true
legacyUrl: /2017/03/how-to-use-blob-containers-in-azure.html
---

I know that Microsoft Azure looks easy, because you create your subscription, then you start to consume all the resources. But in some cases, start to be overwhelming, with so many details that you must take in consideration, it’s not easy to take advantage of what Azure have to offer you.

Regarding the Azure storage, sounds easy but, in a lot of cases I’m seeing some implementations that are not following the best practices and not secure. For example, what level of access should I give to the blob? Is the default configuration secured?

Blobs store directly in the root container of the storage account or within a container that is created after the account is provisioned. You can create blob containers by using any of the tools that you are comfortable with.

**Creating blob containers**

When you create a container, you must give it a name and choose the level of access that you want to allow from the following options:
  * **Private**. This is the default option. The container does not allow anonymous access.
  * **Public Blob**. This option allows anonymous access to each blob within the container; however, it prevents browsing the content of the container. In other words, it is necessary to know the full path to the target blob to access it.
  * **Public Container**. This option allows anonymous access to each blob within the container, with the ability to browse the container’s content.

Use the following commands in Windows PowerShell to create a new container. Before you can create the container, you must obtain a storage context object by passing the storage account’s primary key:

**Creating a blob container in Windows PowerShell**
```powershell
$storageKey = (Get-AzureRmStorageAccountKey –ResourceGroup ‘myResourceGroup’ -StorageAccountName $storageAccount).Value[0]
$storeContext = New-AzureStorageContext -StorageAccountName ‘mystorageaccount’ -StorageAccountKey $storeKey
$container = New-AzureStorageContainer –Name ‘mycontainer’ -Permission Container -Context $storeContext
```
Administrators can view and modify containers, in addition to uploading and copying blobs by using tools such as AzCopy and Azure Storage Explorer, or they can use the following Azure PowerShell cmdlets:
  * **_Get-AzureStorageBlobCopyState_**. Get the copy state of a specified storage blob.
  * **_Remove-AzureStorageBlob_**. Remove the specified storage blob.
  * **_Set-AzureStorageBlobContent_**_._ Upload a local file to the blob container.
  * **_Start-AzureStorageBlobCopy_**. Copy to a blob.
  * **_Stop-AzureStorageBlobCopy_**. Stop copying to a blob.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com/)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
