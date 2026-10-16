---
title: "How to overwrite Tags on an Azure Resource"
description: "With the limitation of 15 Tags per resource, you will reach a point that you need to intervene and either remove some of the tags or reuse them. On my previous post (How to…"
pubDate: 2018-07-10
category: governance
tags: [powershell, azure-automation]
translationKey: how-to-overwrite-tags-on-an-azure-resource
legacy: true
legacyUrl: /2018/07/how-to-overwrite-tags-on-an-azure-resource.html
---

With the limitation of 15 Tags per resource, you will reach a point that you need to intervene and either remove some of the tags or reuse
them. On my previous post ([How to update specified tag from a resource](/posts/how-to-update-specified-tag-from-a-resource)) I showed a way to update a specific tag in a Azure Resource. Some time that will be enough, other time you need to overwrite what is implemented by a new value, and not to add a value to the Tags hash table.

In case you need to overwrite the existing Tags with a new value(s), please use the following PowerShell cmdlet. In this scenario, I want to overwrite 2 Tags (Shutdown and Test).

```powershell
$VMs=Get-AzureRmVM
foreach ($VM in $VMs) {   
    $VM.Name  
    $VM.Tags  
    $VM.Id  
    $tags = @{"Shutdown" = "Yes"; "Test" = "No"}
    Set-AzureRmResource -ResourceId $VM.Id -ApiVersion 2015-06-15 -Tag $tags  
}
```

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
