---
title: "Como remover um Host Pool do Windows Virtual Desktop no Azure"
description: "Para fazer reset a um ambiente de Windows Virtual Desktop (WVD) não basta apagar o Resource Group: os Application Groups, Session Hosts e o Host Pool só saem por PowerShell. O processo e o script."
pubDate: 2019-05-27
category: compute
tags: [powershell, virtual-desktop]
translationKey: how-to-remove-a-hostpool-from-the-windows-virtual-desktop-on-azure
cover: ../../../assets/old/posts/2019/05/RDSRem1-2.png
coverAlt: "Como remover um Host Pool do Windows Virtual Desktop no Azure"
---

Depois de fazer o deploy de uma infraestrutura de Windows Virtual Desktop (WVD) no Azure algumas vezes, percebi que às vezes é preciso fazer reset ao ambiente, especialmente se for o ambiente de testes.

Depois de algumas tentativas, desenvolvi o processo seguinte, que me permite fazer o reset em poucos minutos. O processo é simples. Basta remover as virtual machines criadas, o(s) Application Group(s), os servidores Session Host e o Host Pool.

As Virtual Machines criadas no momento do deploy do ambiente são simples de remover. Se seguiu a boa prática de criar um Resource Group vazio, basta apagar o Resource Group. No entanto, há alguns serviços/recursos em background que também é preciso apagar, como os Application Groups, os Session Hosts e o Host Pool. Neste momento não é possível fazê-lo através do Azure Portal, por isso a única opção é PowerShell.

Pode usar o PowerShell no seu desktop ou o Cloud Shell no Azure.

## 1 – Login no tenant do Windows Virtual Desktop

![Imagem 1](../../../assets/old/posts/2019/05/RDSRem1-2.png)

## 2 - Validar a infraestrutura WVD

![Imagem 2](../../../assets/old/posts/2019/05/RDSRem2.png)

![Imagem 3](../../../assets/old/posts/2019/05/RDSRem3.png)

![Imagem 4](../../../assets/old/posts/2019/05/RDSRem4-1.png)

![Imagem 5](../../../assets/old/posts/2019/05/RDSRem5.png)

## 3 - Remover o(s) Application Group(s)

![Imagem 6](../../../assets/old/posts/2019/05/RDSRem6.png)

![Imagem 7](../../../assets/old/posts/2019/05/RDSRem7.png)

## 4 - Remover os servidores Session Host

![Imagem 8](../../../assets/old/posts/2019/05/RDSRem8.png)

![Imagem 9](../../../assets/old/posts/2019/05/RDSRem9.png)

## 5 - Remover o Host Pool

![Imagem 10](../../../assets/old/posts/2019/05/RDSRem10.png)

![Imagem 11](../../../assets/old/posts/2019/05/RDSRem11.png)

Para simplificar, aqui fica o script que criei para isto:

```powershell
    $TenantName="<TENANT_NAME>"
    $HostPoolName="<HOST_POOL_NAME>"
    
    #STEP 1 - Login on Windows Virtual Desktop Tenant 
    Add-RdsAccount -DeploymentUrl "https://rdbroker.wvd.microsoft.com" 
    #STEP 2 - Remove Application Group associated to the Host Pool 
    Get-RdsAppGroup -TenantName $TenantName -HostPoolName $HostPoolName |Remove-RdsAppGroup
    #STEP 3 - Remove Session Host servers associated to the Host Pool 
    Get-RdsSessionHost -TenantName $TenantName -HostPoolName $HostPoolName |Remove-RdsSessionHost
    #STEP 4 - Remove the Host Pool 
    Get-RdsHostPool -TenantName $TenantName -HostPoolName $HostPoolName |Remove-RdsHostPool
```

Um abraço,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
