---
title: "How to access Azure Blob Storage container via a SAS token"
description: "Today I received an email, from a colleague ask me if it’s there is a way that you can download the entire blob container having a SAS token via PowerShell."
pubDate: 2018-06-12
category: storage
tags: [azcopy, blob-storage, powershell]
translationKey: how-to-access-azure-blob-storage-container-via-a-sas-token
legacy: true
legacyUrl: /2018/06/how-to-access-azure-blob-storage-container-via-a-sas-token.html
---

Today I received an email, from a colleague ask me if it’s there is a way that you can download the entire blob container having a SAS token via PowerShell.

After research, I found that it’s possible and I found 2 ways. One is through PowerShell and the other one is through AzCopy. Please find bellow the example of the code required to download the whole content of a blob container.

## **PowerShell**
```powershell
$BlobContent = New-AzureStorageContext -StorageAccountName $StorageAccountName -SasToken $sasToken
Get-AzureStorageBlob -Context BlobContent -Container $container | Get-AzureStorageBlobContent
```
Btw, the PowerShell code was based on the documented Azure Storage cmdlets ([https://docs.microsoft.com/en-us/powershell/module/azure.storage/](https://docs.microsoft.com/en-us/powershell/module/azure.storage/))

## **AzCopy**
```js
AzCopy /Source:https://<STORAGE_ACCOUNT>.blob.core.windows.net/<CONTAINER_NAME> /Dest:C:\<FOLDER> /SourceSAS:SAS1
```

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
