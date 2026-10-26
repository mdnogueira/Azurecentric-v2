---
title: "Using Virtual Machine extensions to configure the OS on a VM"
description: "When deploying Azure VMs, in addition to configuring the platform-specific settings (such as Azure Storage or networking parameters), you can also configure the operating…"
pubDate: 2017-01-07
category: automation
tags: ["azure-cli", "vm-extensions", "azure-virtual-machines", "azure-storage", "linux"]
translationKey: using-virtual-machine-extensions-to-configure-the-os-on-a-vm
legacy: true
legacyUrl: /2017/01/using-virtual-machine-extensions-to-configure-the-os-on-a-vm.html
---

When deploying Azure VMs, in addition to configuring the platform-specific settings (such as Azure Storage or networking parameters), you can also configure the operating system and applications running in the VM. This ability depends on a software component called the Azure Virtual Machine Agent (VM agent). The primary purpose of the VM agent is to load additional software components called VM agent extensions that implement specific management, monitoring, or security features.

VM images available from the Azure Marketplace include a VM agent by default. When using custom images or disks, you have the option of installing the agent manually. Both the Windows and Linux operating system versions of the VM agent are available for download, from the Microsoft Downloads website and GitHub, respectively.

After the installation completes, you also need to set the **_ProvisionGuestAgent_**property of the VM via Azure PowerShell or Azure CLI.

Some of the more commonly used VM extensions include:
  * **BGInfo.** This extension displays desktop background on Windows VMs containing such information as the computer name, total amount of memory allocated to it, its IP address, or the operating system version.
  * **VMAccessAgent.** This extension enables you to reset local administrative credentials and fix misconfigured RDP settings on Windows VMs.
  * **VMAccessforLinux.** This extension enables you to reset local administrative credentials and fix misconfigured SSH settings on Linux VMs.
  * **ChefClient** and **PuppetEnterpriseAgent.** These extensions integrate Windows and Linux VMs into cross-platform Chef and Puppet (respectively) enterprise management solutions.
  * **CustomScriptExtension.** This extension enables you to run custom scripts within Windows or Linux Azure VMs. On the Windows operating system, you implement scripts by using Windows PowerShell. The extension for the Linux operating system allows running code written in any scripting language that the operating system supports, such as Python or Bash.
The most common use of the Custom Script extension involves applying custom configuration settings during VM provisioning. However, it is also possible to use it to perform any scriptable action after the initial deployment. The script can reside in an Azure Storage or a GitHub location.
  * **PowerShell Desired State Configuration (PowerShell DSC) extension.** This extension implements a template-based configuration of Windows operating systems, including the ability to modify such settings as file, folder, registry, service, or an operating system feature.
  * **AzureDSCForLinux.** This extension implements a template-based configuration of Linux operating systems, equivalent to the one that PowerShell DSC provides for Windows.
  * **IaaSAntimalware.** This extension protects in against viruses, spyware, and malware in real time.
  * **IaaSDiagnostics.** This extension enables Azure VM diagnostics, collecting metrics and logs from the operating system and its components.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
