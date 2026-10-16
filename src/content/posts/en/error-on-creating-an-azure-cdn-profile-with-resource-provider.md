---
title: "Error on creating an Azure CDN profile with Resource Provider"
description: "Today I was creating an Azure CDN Profile, so I could deploy static content across different azure regions. So, I went to Azure Portal I start the process. First step is to…"
pubDate: 2020-11-21
category: storage
tags: [powershell, cdn, portal]
translationKey: error-on-creating-an-azure-cdn-profile-with-resource-provider
cover: ../../../assets/old/posts/2020/11/cnd1.png
coverAlt: "Error on creating an Azure CDN profile with Resource Provider"
legacy: true
legacyUrl: /2020/11/Error-on-creating-an-Azure-CDN-profile-with-Resource-Provider.html
---

Today I was creating an Azure CDN Profile, so I could deploy static content across different azure regions. So, I went to Azure Portal I start the process. First step is to create the CDN Profile. In this case I never use the CDN on this subscription, as you can see from the picture bellow.

 ![Image1](../../../assets/old/posts/2020/11/cnd1.png)

Although during the process of creating the CDN Profile, after I click on the Create button, Azure validates if everything is OK. In this case, I got an error as shown on the picture bellow.

>In order to create this CDN profile, please ensure that Microsoft.CDN is listed as a registered Resource Provider in your Azure subscription

 ![Image2](../../../assets/old/posts/2020/11/cnd2.png)

## What this means? 
Means that not all the Azure Resource Providers available on this type of the subscription are not registered or yet available. Depending on the type of subscription, you might have the Resource Providers that are not even available to be used, or in this case to be registered.

For the CDN Resource Provider it was simple to verifying by using the PowerShell cmdlet
```powershell
Get-AzResourceProvider -ProviderNamespace Microsoft.Cdn
```
 
![Image3](../../../assets/old/posts/2020/11/cnd3.png)

After you validate the resource in unregistered, you can run the PowerShell cmdlet to registered

```powershell
Register-AzResourceProvider -ProviderNamespace Microsoft.Cdn
```

![Image4](../../../assets/old/posts/2020/11/cnd4.png)
 
After that, I was able to procced with the configuration of the CDN successfully.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
