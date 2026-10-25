---
title: "Erro ao criar um Azure CDN Profile com o Resource Provider"
description: "Ao criar um Azure CDN Profile para distribuir conteúdo estático por várias regiões do Azure, a validação falhou: o Resource Provider Microsoft.CDN não estava registado na subscrição."
pubDate: 2020-11-21
category: networking
tags: ["azure-cdn", "troubleshooting", "powershell"]
translationKey: error-on-creating-an-azure-cdn-profile-with-resource-provider
cover: ../../../assets/old/posts/2020/11/cnd1.png
coverAlt: "Erro ao criar um Azure CDN Profile com o Resource Provider"
---

Hoje estava a criar um Azure CDN Profile para poder fazer o deploy de conteúdo estático em várias regiões do Azure. Fui ao Azure Portal e iniciei o processo. O primeiro passo é criar o CDN Profile. Neste caso nunca tinha usado o CDN nesta subscrição, como se vê na imagem abaixo.

 ![Imagem 1](../../../assets/old/posts/2020/11/cnd1.png)

No entanto, durante o processo de criação do CDN Profile, depois de clicar no botão Create, o Azure valida se está tudo em ordem. Neste caso obtive o erro mostrado na imagem abaixo.

>In order to create this CDN profile, please ensure that Microsoft.CDN is listed as a registered Resource Provider in your Azure subscription

 ![Imagem 2](../../../assets/old/posts/2020/11/cnd2.png)

## O que significa isto?
Significa que nem todos os Azure Resource Providers disponíveis para este tipo de subscrição estão registados ou sequer disponíveis. Consoante o tipo de subscrição, pode haver Resource Providers que nem estão disponíveis para utilização ou, como neste caso, para registo.

No caso do Resource Provider do CDN foi simples verificar com o cmdlet de PowerShell
```powershell
Get-AzResourceProvider -ProviderNamespace Microsoft.Cdn
```
 
![Imagem 3](../../../assets/old/posts/2020/11/cnd3.png)

Depois de confirmar que o Resource Provider está "Unregistered", basta correr o cmdlet de PowerShell para o registar

```powershell
Register-AzResourceProvider -ProviderNamespace Microsoft.Cdn
```

![Imagem 4](../../../assets/old/posts/2020/11/cnd4.png)
 
A partir daí consegui prosseguir com a configuração do CDN sem problemas.

Um abraço,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
