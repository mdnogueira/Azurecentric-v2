---
title: "Azure Resource Manager templates"
description: "When you need to create a consist method where you want to give to the end-user, that is consuming resources on your cloud, the power of creating resource like virtual…"
pubDate: 2016-10-02
category: automation
tags: [arm-templates, powershell]
translationKey: azure-resource-manager-templates
legacy: true
legacyUrl: /2016/10/azure-resource-manager-templates.html
---

When you need to create a consist method where you want to give to the end-user, that is consuming resources on your cloud, the power of creating resource like virtual machines, but you want to control lot of the environment aspects, you should consider using ARM templates.

An Azure Resource Manager template contain JSON formatted definition of one or more Azure resources, along with parameters and variables that facilitate customizing their configuration. When creating, and working with resource templates, you should consider:
  * Which resources you are going to deploy.
  * Where your resources will be located.
  * Which version of the resource provider API you will be use.
  * Whether there are dependencies between resources.
  * When you will specify values of resource properties. While you can include these values in the template, in general, it is preferable to specify them during deployment via corresponding parameters.

## **Understanding the structure of a resource template **
A resource template consists of the following sections:
```json
{
   "$schema": "[http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#](http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json)",
   "contentVersion": "",
   "parameters": {  },
   "variables": {  },
   "resources": [  ],
   "outputs": {  }
}
```
The following table describes the sections in the code sample above.
<table style="border: 1px solid black;" >
<tbody >
<tr style="border: 1px solid black;" >

<td width="142" >Element name
</td>

<td width="148" >Required
</td>

<td width="411" >Description
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="142" >$schema
</td>

<td width="148" >Yes
</td>

<td width="422" >This is a URL representing the location of the JSON schema file, which describes the template language.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="142" >contentVersion
</td>

<td width="148" >Yes
</td>

<td width="424" >This can be any value that helps you keep track of changes to template content.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="142" >parameters
</td>

<td width="148" >No
</td>

<td width="414" >Parameters can be provided during deployment either interactively or via a parameter file to customize properties of deployed resources.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="142" >variables
</td>

<td width="148" >No
</td>

<td width="417" >Variables are typically used to convert values of parameters to the format that is required to set resource property values.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="142" >resources
</td>

<td width="148" >Yes
</td>

<td width="414" >These are resource that you want to create or modify as the result of the deployment.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="142" >outputs
</td>

<td width="148" >No
</td>

<td width="411" >These values are returned by the deployment.
</td>
</tr>
</tbody>
</table>
The next topic discusses these sections in more detail.

The following code is an example of a complete template that deploys a web app and uses code from a .zip file to provision the app:
```json
{
   "$schema": "[http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#](http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json)",
   "contentVersion": "1.0.0.0",
   "parameters": {
     "siteName": {
       "type": "string"
     },
     "hostingPlanName": {
       "type": "string"
     },
     "hostingPlanSku": {
       "type": "string",
       "allowedValues": [
         "Free",
         "Shared",
         "Basic",
         "Standard",
         "Premium"
       ],
       "defaultValue": "Free"
     }
   },
   "resources": [
     {
       "apiVersion": "2014-06-01",
       "type": "Microsoft.Web/serverfarms",
       "name": "[parameters('hostingPlanName')]",
       "location": "[resourceGroup().location]",
       "properties": {
         "name": "[parameters('hostingPlanName')]",
         "sku": "[parameters('hostingPlanSku')]",
         "workerSize": "0",
         "numberOfWorkers": 1
       }
     },
     {
       "apiVersion": "2014-06-01",
       "type": "Microsoft.Web/sites",
       "name": "[parameters('siteName')]",
       "location": "[resourceGroup().location]",
       "tags": {
         "environment": "test",
         "team": "ARM"
       },
       "dependsOn": [
         "[resourceId('Microsoft.Web/serverfarms', parameters('hostingPlanName'))]"
       ],
       "properties": {
         "name": "[parameters('siteName')]",
         "serverFarm": "[parameters('hostingPlanName')]"
       },
       "resources": [
         {
           "apiVersion": "2014-06-01",
           "type": "Extensions",
           "name": "MSDeploy",
           "dependsOn": [
             "[resourceId('Microsoft.Web/sites', parameters('siteName'))]"
           ],
           "properties": {
             "packageUri": "[https://auxmktplceprod.blob.core.windows.net/packages/StarterSite-modified.zip](https://auxmktplceprod.blob.core.windows.net/packages/StarterSite-modified.zip)",
             "dbType": "None",
             "connectionString": "",
             "setParameters": {
               "Application Path": "[parameters('siteName')]"
             }
           }
         }
       ]
     }
   ],
"outputs": {
"siteUri": {
"type": "string",
"value": "[concat('[http://',reference(resourceId('Microsoft.Web/sites](http://',reference(resourceId('Microsoft.Web/sites)', parameters('siteName'))).hostNames[0])]"
}
}
}
```

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
