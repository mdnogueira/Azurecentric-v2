---
title: "Why and when to use Azure CLI"
description: "I have been a heavy Windows user for many years, but lately I have been using another OS to increase my vision and experience. But the issue is, PowerShell is a Windows OS…"
pubDate: 2016-09-08
category: automation
tags: [azure-cli]
translationKey: why-and-when-to-use-azure-cli
legacy: true
legacyUrl: /2016/09/why-and-when-to-use-azure-cli.html
---

I have been a heavy Windows user for many years, but lately I have been using another OS to increase my vision and experience. But the issue is, PowerShell is a Windows OS based, and usually is not available on Non-Windows OS (as far as I know). So, I need to evolve to another command line tool. The natural progression is Azure CLI. Ok, you probably get the picture, but what is Azure CLI? How Azure CLI can help us managing Azure from a Non-Windows OS devices?

The Azure CLI provides a command-line, shell-based interface that you can use to interact with your Azure subscriptions. Although for the most part, the Azure CLI offers the same set of features as the Azure PowerShell modules, two primary differences exist between them:
  * You can install and run the Azure CLI not only on the Windows operating system but also on Linux and OS X.
  * Because of its ability to run on Linux, it is straightforward to integrate the Azure CLI with several traditional shell-scripting tools, such as _grep_, _awk_, _sed_, _xargs_, and _cut_, thereby allowing Linux admins to use their existing skills.

The installation process for the Azure CLI depends on the target operating system; however, the installers for all the supported operating systems are available directly from the Azure Downloads page ([see here](https://azure.microsoft.com/en-us/downloads/)). Like the Azure PowerShell modules, the Azure CLI for the Windows operating system relies on Web PI. On the Linux and OS X operating systems, you can perform the installation by using an _npm_ package.

On the Windows operating system, the installation modifies the path system environment variable. Effectively, after you launch a command prompt window, you can automatically run any of the Azure CLI commands.
  **Note:** All commands start with the word azure. To learn more about the Azure CLI syntax, run the following command from the Windows command prompt:
**_azure help_**

After you install the Azure CLI, you can connect to the Azure subscriptions that you want to manage. Like the Azure PowerShell modules, to establish such a connection, you first need to authenticate by using either a Microsoft account or a work or school account that exists in the Azure AD tenant associated with the target subscription.

To initiate the authentication process, run the following command from the command prompt:
**_azure login_**

A message displays, prompting you to start a browser and browse to the **[Device Login](http://aka.ms/devicelogin)** page, where you need to  enter the code provided in the same message. This step verifies the Azure CLI as the application publisher and allows you to type your user credentials to authenticate to the Azure subscription.

Azure AD authentication is token-based, and after signing in, the user remains authenticated until the authentication token expires. The expiration time for an Azure AD token is 12 hours.

After you authenticate, you can use the **_azure account list_** command to view a list of subscriptions associated with your account. If you have multiple subscriptions, you can specify the one you want to manage by using the **_azure account set_** command and providing either the subscription name or its ID.

**Note:** You can identify the subscription name and ID by reviewing the output of the azure account list command.

Unlike the Azure PowerShell modules, the Azure CLI uses separate modes for working with the Azure Resource Manager deployment model and the Service Management deployment model. Both modes use the same set of commands, and to switch between them, you can use the **_azure config mode_ **command.

To switch to the Azure Resource Manager mode, run the following command:
**_azure config mode arm_**

To switch to the classic deployment mode, run the following command:
**_azure config mode asm_**

At this point, you can also use Azure PowerShell cmdlets to view, provision, and manage Azure services and resources.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
