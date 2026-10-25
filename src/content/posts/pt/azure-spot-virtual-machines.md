---
title: "Azure Spot Virtual Machines"
description: "A Microsoft anunciou a disponibilidade geral das Azure Spot VMs: capacidade de computação não utilizada com descontos que podem ultrapassar os 80% face ao pay-as-you-go. O que são e quando usar."
pubDate: 2020-05-12
category: compute
tags: ["azure-virtual-machines", "azure-spot-virtual-machines"]
translationKey: azure-spot-virtual-machines
cover: ../../../assets/old/posts/2020/05/SpotVM1.png
coverAlt: "Azure Spot Virtual Machines"
---

Hoje a Microsoft anunciou a disponibilidade geral das Azure Spot VMs (o anúncio está [aqui](https://azure.microsoft.com/en-us/blog/announcing-the-general-availability-of-azure-spot-virtual-machines/)). Esta é uma das funcionalidades que eu andava à espera que chegasse a GA para começar a usar nos meus clientes.

Então, o que são as Azure Spot VMs? É a forma que a Microsoft nos dá de usar a capacidade de computação não utilizada em cada região, com descontos muito bons. Estes descontos podem ir além dos 80% face aos preços pay-as-you-go, dependendo do tamanho da VM e da capacidade disponível.

![Imagem 1](../../../assets/old/posts/2020/05/SpotVM1.png)

Provavelmente já conhece a imagem acima, de quando fez o deploy de uma Azure VM nos últimos meses, certo? Mas chegou a explorar o que era aquela "Azure Spot Instance"? Se é como eu e gosta de testar e explorar quando a Microsoft anuncia algo novo, sabe do que estou a falar. Se não conhece, não há problema. Agora pode usar esta funcionalidade em pleno.

O deploy de Azure Spot VMs não mudou muito. Se ativar esta funcionalidade, só precisa de escolher o tipo de eviction e depois a eviction policy, para quando essa capacidade for necessária. Há uma coisa que é preciso perceber: esta capacidade de computação não é garantida. O que é que isto quer dizer? Quer dizer que a Microsoft reserva sempre a capacidade de computação para o preço normal pay-as-you-go, por isso esteja preparado (e planeie em conformidade) para que os seus workloads sejam parados ou desalocados.

![Imagem 2](../../../assets/old/posts/2020/05/spotVM2.png)

Qual é a melhor forma de usar as Azure Spot Instances? Os cenários são ilimitados, mas a ideia é usá-las em workloads que não sejam críticos nem precisem de correr 24x7. Por exemplo, para testar a carga de um determinado workload a uma fração do custo.

Um abraço,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
