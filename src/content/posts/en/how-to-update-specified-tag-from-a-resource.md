---
title: "How to update specified tag from a resource"
description: "The usage of Tags on Azure resources is a very common and very useful for several reasons that I will not cover on this post. Although in some occasions, if you need to update…"
pubDate: 2018-07-06
category: governance
tags: [azure-automation, powershell, tags]
translationKey: how-to-update-specified-tag-from-a-resource
legacy: true
legacyUrl: /2018/07/how-to-update-specified-tag-from-a-resource.html
---

The usage of Tags on Azure resources is a very common and very useful for several reasons that I will not cover on this post. Although in some occasions, if you need to update a Tag from a resource, because either it’s not suitable anymore or you are reaching the limit of the number of Tags allowed by Azure.

In this case the idea is reuse the Tag Shutdown, although with different values for a specific virtual machine

```powershell
#Get all tags from Resource (VM)
$tags = (Get-AzureRMVM -ResourceName $VMName -ResourceGroupName $ResourceGroup).Tags
#Since this is a hash table, not an array. Update the value for Shutdown.
$tags['Shutdown'] = "NewValue"
#Write the hash table back to the resource
$UpdateTag = Set-AzureRmResource -Tag $tags -ResourceName $ServerName -ResourceGroupName $ResourceGroup -ResourceType Microsoft.Compute/virtualMachines
```

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
