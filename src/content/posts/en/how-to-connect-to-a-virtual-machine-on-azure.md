---
title: "How to connect to a Virtual Machine on Azure?"
description: "Once you have created an Azure VM instance with the default settings, you will be able to connect to it."
pubDate: 2016-12-24
category: compute
tags: [linux]
translationKey: how-to-connect-to-a-virtual-machine-on-azure
legacy: true
legacyUrl: /2016/12/how-to-connect-to-a-virtual-machine-on-azure.html
---

Once you have created an Azure VM instance with the default settings, you will be able to connect to it.

The connectivity method will depend on the operating system running within the VM:
  * RDP allows you to establish a GUI session to an Azure VM that runs the Windows operating system. When viewing a Windows VM in the Azure Portal, you will have access to the **Connect** This action automatically provisions an .rdp file, which you can either open or download, and save for later use. Opening the file initiates an RDP connection to the corresponding VM. The Azure PowerShell **_Get-AzureRemoteDesktopFile_** cmdlet delivers the same outcome when you invoke it from the Windows PowerShell console.
  * SSH allows you to establish a command-line interface session to an Azure VM that runs the Linux operating system. To establish such a session, you typically use a terminal emulator, such as PuTTY (available for both Windows and Linux operating systems).

For security reasons, you can disable connectivity to Azure VMs from the Internet by removing the public IP address associated with the virtual machine. In this case, you would connect to it from a jump VM on the same Azure virtual network. You also would connect from your on-premises computers, if you establish a secure connection to the target virtual network.

To sign in to a VM, you use credentials that you specified during its creation. When connecting via SSH, it is also possible to use certificate-based authentication, if you selected the **SSH public key **authentication type when creating the Linux VM
  **Note:** If you forget the password for the Azure VM, you can perform a password reset by using the VMAccess and VMAccessforLinux extensions.

Each Windows VM created by using an Azure Marketplace image has its local Windows Firewall enabled. By default, Windows Firewall has the rule that allows incoming RDP connections enabled. However, if you want to allow connectivity on a different port (such as HTTP port 80), you will need to configure Windows Firewall accordingly.

The same principle applies to Azure network security groups associated with a newly created VM. By default, such a group will include a rule allowing connectivity via RDP or SSH (depending on the operating system of the VM). Enabling incoming connections on other ports would require the addition of extra rules to the security group.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
