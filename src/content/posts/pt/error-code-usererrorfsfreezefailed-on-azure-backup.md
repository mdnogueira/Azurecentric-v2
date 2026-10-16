---
title: "Error code UserErrorFsFreezeFailed no Azure Backup"
description: "Os backups de três worker nodes de Kubernetes em Ubuntu 16.04 começaram a falhar com UserErrorFsFreezeFailed. O que significa o erro, a causa provável (fsfreeze bloqueado) e como resolver."
pubDate: 2019-06-11
category: backup-dr
tags: [azure-backup, portal, docker, linux]
translationKey: error-code-usererrorfsfreezefailed-on-azure-backup
---

No outro dia um cliente ligou-me a dizer que os backups que tínhamos ativado anteriormente estavam a dar o seguinte erro:

<table class="" ><tbody ><tr >
<td >
  Error Code
  
</td>
<td >
  UserErrorFsFreezeFailed
  
</td></tr><tr >
<td >
  Error Message
  
</td>
<td >
  Failed to freeze one or more mount-points of the VM to take a file-system consistent snapshot
  
</td></tr><tr >
<td >
  Recommended Action
  
</td>
<td >
  Check for devices with dirty filesystem state and unmount them. Run file-consistency check for these devices using the fsck command and mount them again after successful consistency check. For more details, refer to [https://aka.ms/AB-UserErrorFsFreezeFailed](https://aka.ms/AB-UserErrorFsFreezeFailed)
  
</td></tr></tbody></table>

O erro ocorria numa instância de uma aplicação com 7 VMs Ubuntu 16.04 no Azure, todas com backup de VM ativo. Os backups corriam bem há algumas semanas, até à manhã em que falharam nas 3 VMs que são worker nodes de Kubernetes. Esses worker nodes correm também o filesystem Ceph num dos discos de dados.

Isto pode acontecer quando o filesystem usado nessas VMs entra num estado inconsistente e o ***fsfreeze*** não retorna corretamente, porque um dos filesystems fica bloqueado. Na maioria dos casos é um problema temporário, e limpar os filesystems deve devolver o backup ao estado saudável.

Se o problema se repetir com frequência, abra um ticket na Microsoft, porque é preciso uma investigação mais profunda.

Um abraço,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
