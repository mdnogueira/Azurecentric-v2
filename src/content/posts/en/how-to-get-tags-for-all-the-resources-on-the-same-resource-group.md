---
title: "How to get Tags for all the resources on the same Resource Group"
description: "When you heavily use Tags on your Azure Resources, is very easy to reach the limits of the Tags that Azure allow to use on each resource. On the other hand, to be consistent on…"
pubDate: 2018-07-04
category: powershell
tags: ["powershell", "resource-tags", "resource-groups", "azure-automation"]
translationKey: how-to-get-tags-for-all-the-resources-on-the-same-resource-group
legacy: true
legacyUrl: /2018/07/how-to-get-tags-for-all-the-resources-on-the-same-resource-group.html
---

When you heavily use Tags on your Azure Resources, is very easy to reach the limits of the Tags that Azure allow to use on each resource. On the other hand, to be consistent on the Tags applied on those resources is key to a good Tag implementation.

The way that I like to do is to create an Azure Automation runbook, so when it runs you will have the output of the Tags for each Resource Group on that Azure Subscription.

To execute the below PowerShell cmdlets in Azure Automation runbook:

  1. Create an Automation Account with Run As account.
  2. Modify the AzureAutomationTutorialScript with below PowerShell cmdlets and execute the AzureAutomationTutorialScript.
    Please use the below PowerShell:
```powershell
Login-AzureRMAccount
$ResourceGroups = Get-AzureRmResourceGroup
foreach ($ResourceGroup in $ResourceGroups)  {   
  Write-Output ("Showing resources in resource group" + $ResourceGroup.ResourceGroupName)  
  $Resources = Find-AzureRmResource -ResourceGroupNameContains
  $ResourceGroup.ResourceGroupName | Select ResourceName, ResourceType, Tags | Format-Table  
  $Resources  
  }
```

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
