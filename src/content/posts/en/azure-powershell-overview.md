---
title: "Azure PowerShell - Overview"
description: "On Windows Server 2008, Microsoft introduces us back to the world of the command line with PowerShell. At the beginning, I must admit, at that time I was a bit reluctant to…"
pubDate: 2016-07-26
category: automation
tags: [powershell]
translationKey: azure-powershell-overview
legacy: true
legacyUrl: /2016/07/azure-powershell-overview.html
---

On Windows Server 2008, Microsoft introduces us back to the world of the command line with PowerShell. At the beginning, I must admit, at that time I was a bit reluctant to this command line tool, because I’m a GUI guy! But with time and all my peers tell me the benefits, I slowly start to play with and see the benefits! Now I can’t leave without it!

So, what is Azure PowerShell? Azure PowerShell is a module of the Windows PowerShell that every Windows OS (either client or server) have by default installed and now becomes part of the OS. In this case is to manage Azure!

To manage Azure resources by using Windows PowerShell, you first need to install the Azure PowerShell modules that provide this functionality. The Azure PowerShell modules belong to the following three categories:
  * **Azure Resource Manager**. A collection of Azure Resource Manager component modules, consisting of cmdlets that implement features of individual Azure Resource Manager resource providers. For example, cmdlets of the **Compute** provider (which facilitates the deployment of Azure Virtual Machines) reside in the **Compute **module.
  * **Azure Service Management**. A collection of cmdlets that implement features of the Service Management model, which is also known as the _classic deployment model_.
  * **Azure Storage**. A collection of cmdlets that facilitate the management of Azure Storage.

The two primary methods of installing the latest versions of the Azure PowerShell modules are:
  * **The Web Platform Installer** ([Web PI](https://azure.microsoft.com/en-us/downloads/)). This installation method is available directly from the Azure Downloads page. It simplifies the setup process by relying on Web PI capabilities, which include obtaining the most recent version of the installation files and automatically deploying and configuring any prerequisites.
  * **The PowerShell Gallery**. This installation method relies on the capabilities built in to the PowerShell Gallery, which constitutes the central repository for Windows PowerShell content. It requires either Windows Management Framework 5.0 with Windows PowerShell 5.0 or the Package Management component on systems running Windows PowerShell version 3 and Windows PowerShell version 4. Windows Management Framework 5.0 is included by default in Windows 10, and for earlier versions of the Windows operating system, it is available for download from the Microsoft Download Center. To perform the installation, run the **Install-Module **cmdlet from an elevated session within the Windows PowerShell console or from the Windows PowerShell ISE console pane. In particular, to install the Azure PowerShell modules from the PowerShell Gallery, run the following commands at the Windows PowerShell command prompt:
```powershell
Install-Module AzureRM
Install-Module Azure
```
  **Note:** Web PI installs Azure PowerShell modules within the %ProgramFiles%\Microsoft SDKs\Azure\PowerShell directory structure. PowerShell Gallery–based installations use the %ProgramFiles%\WindowsPowerShell\Modules directory structure. Both installation methods automatically update the $env:PSModulePath variable. However, you also have the option of explicitly importing the Azure PowerShell modules into your current Windows PowerShell session by running the following commands at the Windows PowerShell command prompt:
```powershell
Import-AzureRM
Import-Module Azure
```
It is also possible to import individual component modules. For example, to import only the AzureRM.Compute module, run the following command at the Windows PowerShell command prompt:
```powershell
Import-Module AzureRM.Compute
```
You can easily distinguish between Azure Resource Manager and Service Management cmdlets because they use slightly different formats. Both types of cmdlets use the verb-noun syntax, but while the noun portions of Azure Resource Manager cmdlets start with **_AzureRm_**, the Service Management cmdlets include only _Azure _(without the _Rm_ string). For example, to deploy a new Azure virtual machine by using Azure Resource Manager, you run the **_New-AzureRmVM_** cmdlet. To accomplish the same task in the classic deployment model, you use the **_New-AzureVM_** cmdlet.

## **Azure AD module for Windows PowerShell**

If you plan to manage Azure Active Directory (Azure AD) by using Windows PowerShell, you need a separate module intended specifically for this purpose, because this functionality is not included in the Azure PowerShell modules. You can use the Azure AD module to manage objects, such as users, groups, devices, and applications, and other aspects of your Azure AD tenant.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
