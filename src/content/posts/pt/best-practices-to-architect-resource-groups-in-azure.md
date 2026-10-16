---
title: "Boas práticas para arquitetar Resource Groups no Azure"
description: "A localização de um Resource Group determina que região do ARM processa as escritas. Se os RGs estão todos numa região e esta falha, perde a gestão dos recursos nas outras. O que fazer."
pubDate: 2019-06-21
category: governance
tags: [arm-templates, portal, disaster-recovery]
translationKey: best-practices-to-architect-resource-groups-in-azure
---

Num workshop no cliente, estávamos a falar sobre quais são as boas práticas para desenhar uma arquitetura de Resource Groups (RG) no Azure. Desta vez tivemos um bom debate sobre os cenários possíveis e as limitações que existem quando se trata de arquitetar e padronizar o deploy de RGs.

O cenário mais interessante envolvia a limitação que os RGs têm no momento de uma falha de região.

Deixem-me explicar. Imaginem que uma organização configura a região primária e a secundária (conhecida como DR) em duas regiões diferentes e, por alguma razão, criou todos os RGs numa só região, embora os recursos (exemplo: VMs) tenham sido criados segundo a arquitetura abaixo:

**Região primária:** North Central  

**Região secundária:** South Central  

**Todos os RGs:** apenas North Central  

**Recursos primários:** North Central (vNETs, VMs, Storage Accounts, etc.)  

**Recursos secundários (DR e Backup):** South Central (vNETs, VMs, Storage Accounts, etc.)

Com o cenário acima, o que acontece se a região primária falhar?

Estas são as experiências que poderá sentir:
- A mais óbvia é que o acesso a todos os recursos fica afetado; isto significa que os recursos podem não parar de correr, mas não os consegue aceder a partir de fora da região
- Os recursos noutras regiões, mas que pertencem a RGs da região indisponível, continuam acessíveis, embora não os consiga modificar (ou seja, "escritas" não são possíveis)

**Qual é a explicação?**

A localização do RG determina, do lado do ARM, que região do ARM é responsável pelas escritas — o que inclui o processamento de coisas como deploys de templates — independentemente da região em que o recurso está. Por isso, num cenário em que uma região inteira desaparece, surge o problema descrito acima.

Em regiões com availability zones, todas as zonas teriam de ficar em baixo para perder as escritas, porque nessas regiões o ARM está configurado com ZRS. Como o ARM (ou seja, management.azure.com) é um serviço global com deploys regionais de Compute e Storage, a Microsoft tem mais flexibilidade para servir transações de leitura do que de escrita. No fim, estas também são servidas pelo resource provider, que é muitas vezes regional (exemplo: um RG em Central US com uma VM em North US e um utilizador na Europa vai de management.azure.com para um front door do ARM na Europa, via Traffic Manager, até um worker role do ARM em Central US e daí ao RP Microsoft.Compute em North US).

**O que fazer?**

Como boa prática de desenho e arquitetura de RGs, recomenda-se criar um RG por região, onde os recursos vão estar. Ter um mapeamento 1-1 entre o RG e a localização real dos recursos mitiga estes problemas e reduz o impacto no seu deploy de Azure como um todo.

**Como posso prevenir?**

Existe uma built-in policy que reporta quando a localização do recurso não coincide com a localização do resource group — uma excelente boa prática.

Um abraço,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
