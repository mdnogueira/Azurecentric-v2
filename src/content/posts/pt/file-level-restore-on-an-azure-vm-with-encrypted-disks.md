---
title: "File level restore numa Azure VM com discos encriptados"
description: "O Azure Backup não faz restore ao nível de ficheiro em VMs com discos encriptados. Num File Server com discos de mais de 1 TB, as opções que considerámos e a solução híbrida a que chegámos."
pubDate: 2019-10-04
category: backup-dr
tags: ["backup", "azure-virtual-machines", "azure-backup"]
translationKey: file-level-restore-on-an-azure-vm-with-encrypted-disks
---

Num dos meus clientes estávamos a rever a estratégia de backup das Azure VMs. Escolhemos o Azure Backup Service para o fazer. Durante o brainstorming sobre o tema surgiu esta questão: e o restore de ficheiros numa Azure VM com discos encriptados?

Depois de uma pesquisa rápida, encontrei este artigo: [Back up and restore encrypted Azure VM](https://docs.microsoft.com/en-us/azure/backup/backup-azure-vms-encryption). Mas uma das limitações descritas no artigo é: "Encrypted VMs can't be recovered at the file/folder level. You need to recover the entire VM to restore files and folders."

Logo a seguir veio a discussão: o que fazer no caso de discos de VM grandes (>1 TB) que exigem restores de ficheiros frequentes (exemplo: um File Server)? Neste caso, vale a pena investir tempo a desenhar uma solução que cumpra todos os requisitos.

Há alguns pontos a considerar:
  * Não ativar a encriptação de discos na Azure VM – Esta opção permite fazer restore ao nível de ficheiros e pastas. Mas deixa de seguir as boas práticas de segurança para Azure VMs e a pontuação no Azure Security Center baixa.
  * Fazer restore apenas do disco da Azure VM, em vez da VM completa – Esta opção elimina apenas a criação da Azure VM com todos os outros discos. Neste caso, a Azure VM tinha 4 discos de dados além do disco de OS. Isto reduz o tempo do processo de recuperação, mas continuamos a ter de recuperar um disco grande.
  * Fazer restore da Azure VM completa – Esta é a opção mais comum e a opção por omissão. Neste caso é também a mais demorada e a mais cara.
  * Alterar a política da organização para só permitir restore de ficheiros das últimas 12 a 24 horas (isto só se aplicava a este cenário) – Permite à organização ter uma tarefa diária de restore do disco grande, com uma janela maior.

Qual foi a solução final para este cenário?

Usámos uma abordagem híbrida. Decidimos fazer o restore apenas do disco da Azure VM para uma VM existente, alterando ao mesmo tempo a política de restore. Usámos um processo de automação que, quando o backup do File Server termina, faz o restore dos discos da Azure VM para uma storage account e depois anexa-os a uma Azure VM existente.

Um abraço,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
