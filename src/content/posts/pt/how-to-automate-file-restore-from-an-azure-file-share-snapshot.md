---
title: "Como automatizar o restore de ficheiros a partir de um Azure File Share Snapshot"
description: "Um cliente queria deixar de restaurar ficheiros um a um no Azure Portal a partir de um File Share Snapshot. Três formas de o fazer: montar o snapshot, AzCopy sync e um comando de Azure CLI."
pubDate: 2020-01-09
category: storage
tags: ["azure-storage", "azure-files", "azure-cli"]
translationKey: how-to-automate-file-restore-from-an-azure-file-share-snapshot
---

Um dos meus clientes enviou-me um email a perguntar se seria possível automatizar o restore de ficheiros a partir de um Azure File Share Snapshot. Ele estava a usar o Azure Portal para restaurar os ficheiros, um processo bastante tedioso. Queria algo mais elegante e fluido, em vez de ir ao Azure Portal, navegar até ao conteúdo do File Share Snapshot e depois clicar com o botão direito em cada ficheiro e escolher Restore.

Fui então ver como podia automatizar este processo. Depois de alguma pesquisa e de explorar a funcionalidade com mais detalhe, encontrei duas formas de o conseguir:
1. Uma é montar a share normalmente e navegar até ao snapshot. A pasta do snapshot é read-only, por isso é preciso copiar a partir daí para a share principal para restaurar os ficheiros.
2. A outra é usar o AzCopy. O `azcopy sync` faz uma cópia diferencial com base na data da última modificação.
```powershell
azcopy sync 'https://<source-storage-account-name>.file.core.windows.net/<file-share-name><SAS-token>&sharesnapsot<snapshot-ID>' 'https://<destination-storage-account-name>.file.core.windows.net/<file-share-name><SAS-token>' –recursive
```
Estas duas soluções eram boas, mas decidi ver se encontrava outra. Depois de experimentar o Azure CLI e de mais alguma pesquisa, cheguei a uma terceira solução.
```powershell
az storage file copy start --account-name $STORAGE_ACCOUNT_NAME --account-key $STORAGE_ACCOUNT_KEY --destination-share $DEST_SHARE_NAME --destination-path $DEST_SHARE_PATH --source-share $SRC_SHARE_NAME --source-path $SRC_SHARE_PATH --file-snapshot $SNAPSHOT_TIMESTAMP
```
Esta terceira opção foi a que enviei ao meu cliente.

Um abraço,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
