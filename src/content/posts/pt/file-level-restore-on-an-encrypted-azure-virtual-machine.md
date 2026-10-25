---
title: "File level restore numa Azure Virtual Machine encriptada"
description: "Num workshop de Azure Backup surgiu a pergunta: como restaurar ficheiros ou pastas de uma VM com discos encriptados sem restaurar a VM inteira? A limitação documentada e a alternativa que existe."
pubDate: 2019-07-08
category: backup-dr
tags: ["azure-backup", "azure-virtual-machines", "backup"]
translationKey: file-level-restore-on-an-encrypted-azure-virtual-machine
---

No cliente, enquanto dava um workshop de Azure sobre o tema Azure Backup, surgiram as seguintes perguntas:
  * Numa VM com discos encriptados, como é que a restauramos?
  * Qual é a solução para fazer file level restore (ficheiros ou pastas) sem restaurar a VM inteira?

Na documentação do Microsoft Azure Backup – [Backup Azure VM Encryption](https://docs.microsoft.com/en-us/azure/backup/backup-azure-vms-encryption) – a limitação está documentada: "**_Encrypted VMs can't be recovered at the file/folder level. You need to recover the entire VM to restore files and folders_**." Mas isto não é prático quando os discos da VM são grandes e exigem restores de ficheiros frequentes. Então, qual é a solução?

Neste caso em concreto, depois de pesquisar, a solução disponível além de restaurar a VM inteira é fazer o restore apenas do disco e, a partir daí, recuperar os ficheiros ou pastas de que precisar.

É preciso ter presente que a Microsoft, por razões de segurança e privacidade, não tem acesso às nossas chaves privadas quando a encriptação está ativa. Nós somos os responsáveis por essas chaves. A Microsoft pode gerá-las por nós, mas, fora isso, devem estar num Key Vault.

Ou seja, ao encriptar os discos de uma VM está a limitar a funcionalidade de restore do Azure Backup. Por isso, o planeamento é sempre recomendado quando se trata destas funcionalidades. Caso contrário, acaba por se deparar com este tipo de perguntas.

Um abraço,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
