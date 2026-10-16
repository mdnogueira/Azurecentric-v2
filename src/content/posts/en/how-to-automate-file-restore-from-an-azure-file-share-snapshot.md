---
title: "How to automate file restore from an Azure File Share Snapshot"
description: "One of my costumers, send me an email asking if there is a possibility of automating the file restore from an Azure File Share Snapshot. He was using the Azure portal for…"
pubDate: 2020-01-09
category: storage
tags: [azure-backup, azure-files, azure-cli]
translationKey: how-to-automate-file-restore-from-an-azure-file-share-snapshot
legacy: true
legacyUrl: /2020/01/How-to-automate-file-restore-from-an-Azure-File-Share-Snapshot.html
---

One of my costumers, send me an email asking if there is a possibility of automating the file restore from an Azure File Share Snapshot. He was using the Azure portal for restoring the files, although a very tedious process. In this case he wants a sexier and a stream process, besides going to Azure Portal, navigate to the Azure File Share Snapshot content and then right click on each individual file and select Restore.

So, then I went to see how I could automate this process. After a research and exploring more in detail the feature, I found that you can accomplish by 2 ways:
1. One is mounting the share normally and then navigate to the snapshot. The snapshot folder is in read-only, so you need to copy from there into the primary share to restore those files.
2. Other way is to use the AZ COPY. AZ Copy sync does a differential copy based on last modified time.
```powershell
azcopy sync 'https://<source-storage-account-name>.file.core.windows.net/<file-share-name><SAS-token>&sharesnapsot<snapshot-ID>' 'https://<destination-storage-account-name>.file.core.windows.net/<file-share-name><SAS-token>' –recursive
```
Those 2 solutions were good and then I decide to see if I could find another solution. After playing around with Azure CLI and a bit more of research I found a third solution.
```powershell
az storage file copy start --account-name $STORAGE_ACCOUNT_NAME --account-key $STORAGE_ACCOUNT_KEY --destination-share $DEST_SHARE_NAME --destination-path $DEST_SHARE_PATH --source-share $SRC_SHARE_NAME --source-path $SRC_SHARE_PATH --file-snapshot $SNAPSHOT_TIMESTAMP
```
This third option was the one that I sent to my costumer.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
