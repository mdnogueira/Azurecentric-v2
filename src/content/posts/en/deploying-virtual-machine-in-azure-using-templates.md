---
title: "Deploying virtual machine in Azure using templates"
description: "You can also create Azure VMs by using Azure Resource Manager templates. This option relies on the capability to describe an Azure Resource Manager deployment by using an…"
pubDate: 2016-10-10
category: automation
tags: [arm-templates]
translationKey: deploying-virtual-machine-in-azure-using-templates
legacy: true
legacyUrl: /2016/10/deploying-virtual-machine-in-azure-using-templates.html
---

You can also create Azure VMs by using Azure Resource Manager templates. This option relies on the capability to describe an Azure Resource Manager deployment by using an appropriately formatted text file, referred to as an Azure Resource Manager template. Such a text file follows the JSON syntax and includes definitions of all the Azure Resource Manager resources that are part of the deployment. Templates typically contain several parameters, which enable you to customize each deployment, accounting for individual preferences and requirements. Thus, every deployment based on the same template might potentially result in a different outcome, depending on the values of parameters you provide.

The following code is part of a JSON template for the deployment of an Azure Resource Manager virtual machine:
```json
{
"$schema": "[http://schema.management.azure.com/schemas/2014-04-01-preview/deploymentTemplate.json#](http://schema.management.azure.com/schemas/2014-04-01-preview/deploymentTemplate.json)",
"contentVersion": "1.0.0.0",
"parameters": {
    "newStorageAccountName": {
        "type": "string",
        "metadata": {
            "Description": "Unique DNS name for the storage account where the virtual machine's disks will be placed."
        }
    },
    "adminUsername": {
        "type": "string",
        "metadata": {
           "Description": "User name for the virtual machine."
        }
    },
    "adminPassword": {
        "type": "securestring",
        "metadata": {
            "Description": "Password for the virtual machine."
        }
    },
    "dnsNameForPublicIP": {
        "type": "string",
        "metadata": {
              "Description": "Unique DNS Name for the Public IP used to access the virtual machine."
        }
    },
    "windowsOSVersion": {
        "type": "string",
        "defaultValue": "2012-R2-Datacenter",
        "allowedValues": [
            "2008-R2-SP1",
            "2012-Datacenter",
            "2012-R2-Datacenter",
            "Windows-Server-Technical-Preview"
        ],
        "metadata": {
            "Description": "The Windows version for the virtual machine. This will pick a fully updated image of this given Windows version. Allowed values: 2008-R2-SP1, 2012-Datacenter, 2012-R2-Datacenter, Windows-Server-Technical-Preview."
        }
    }
},
"variables": {
    "location": "West US",
    "imagePublisher": "MicrosoftWindowsServer",
    "imageOffer": "WindowsServer",
    "OSDiskName": "osdiskforwindowssimple",
    "nicName": "myVMNic",
    "addressPrefix": "10.0.0.0/16",
    "subnetName": "Subnet",
    "subnetPrefix": "10.0.0.0/24",
    "storageAccountType": "Standard_LRS",
    "publicIPAddressName": "myPublicIP",
    "publicIPAddressType": "Dynamic",
    "vmStorageAccountContainerName": "vhds",
    "vmName": "MyWindowsVM",
    "vmSize": "Standard_D1",
    "virtualNetworkName": "MyVNET",
    "vnetID": "[resourceId('Microsoft.Network/virtualNetworks',variables('virtualNetworkName'))]",
    "subnetRef": "[concat(variables('vnetID'),'/subnets/',variables('subnetName'))]"
},
```

## **Deploying a virtual machine by using a template**

To utilize the definitions hosted within a JSON template such as the one above, you must use the **_New-AzureRMResourceGroupDeployment_** cmdlet with the **_–Template_** switch. The following example creates an Azure Resource Manager resource group named TestRG, and then deploys the template contents into the resource group in the West US region:
```powershell
$deployName="DeploymentName"
$RGName="ResrouceGroup"
$locname="WestUS"
$templateURI="[https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/101-simple-windows-vm/azuredeploy.json](https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/101-simple-windows-vm/azuredeploy.json)"
New-AzureRmResourceGroup –Name $RGName –Location $locName
New-AzureRmResourceGroupDeployment -Name $deployName -ResourceGroupName $RGName -TemplateUri $templateURI
```
You can accomplish the same outcome by running the **azure group deployment create** Azure CLI command. In either case, you would also need to provide values of parameters specified in the template.

Using Azure PowerShell and Azure CLI requires familiarity with their syntax and installation of their scripting engines. There is a more convenient way of deploying Azure Resource Manager resources, which is the GitHub template repository, where you will find hundreds of ready-to-use templates. Each of the templates published on GitHub has a corresponding **Deploy to Azure **link. When you click the link, it automatically redirects you to the Azure portal and initiates deployment, prompting you only for values of required parameters. In addition, on the same GitHub page, you will see a **Visualize **link, which opens the template in Azure Resource Manager Template Visualizer, displaying a diagram showing resources defined in the template, including the relationships between them.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
