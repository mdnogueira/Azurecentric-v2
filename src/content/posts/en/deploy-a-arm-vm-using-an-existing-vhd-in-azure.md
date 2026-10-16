---
title: "Deploy a ARM VM using an existing VHD in Azure"
description: "Another day, one of my costumer wants to rebuild a virtual machine from the existing VHD and place on the new Resource Group and on a different VLAN, but without transferring…"
pubDate: 2017-07-11
category: compute
tags: [arm-templates, powershell, vhd]
translationKey: deploy-a-arm-vm-using-an-existing-vhd-in-azure
legacy: true
legacyUrl: /2017/07/deploy-a-arm-vm-using-an-existing-vhd-in-azure.html
---

Another day, one of my costumer wants to rebuild a virtual machine from the existing VHD and place on the new Resource Group and on a different VLAN, but without transferring VHD. The idea was to park the VHD on a storage account to avoid transferring this huge VHD.

First, I want to clarify if you delete the VM, you are not deleting the all the resources, that means that the vhd(s), network adapter9s) or the network IPs will remain intact. You are only deleting the compute section of the VM. That means you can redeploy using the same configuration, or change the network, for example.

To achieve that though, you need to do it through PowerShell and/or using JSON files.

So, if you change the original JSON file just replacing the VHD you will probably get an error message saying, "_Cannot attach an existing OS disk if the VM is created from a platform or user image._"

To avoid that you have to change the JSON file to reflect **_createOption_** to use the attach method instead.

Here is what you need to change:

Original JSON:
```json
"storageProfile": {
    "imageReference": {
        "publisher": "MicrosoftWindowsServer",
        "offer": "WindowsServer",
        "sku": "[parameters('windowsOSVersion')]",
        "version": "latest" 
        },
    "osDisk": { "createOption": "FromImage" 
    },
}
```

Replace with:
```json
"storageProfile": {
    "osDisk": { "createOption": "attach",
        "managedDisk": {
            "id": [Managed_Disk_ID] 
        },
    }
}
```

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
