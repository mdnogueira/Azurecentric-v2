---
title: "Azure Cloud Shell vs Azure CLI"
description: "At a local community event, after my presentation I was answering some questions and one of the attendee ask me if Azure Cloud Shell is the same tool as Azure CLI."
pubDate: 2017-11-20
category: automation
tags: ["azure-cloud-shell", "azure-cli", "linux", "powershell"]
translationKey: azure-cloud-shell-vs-azure-cli
legacy: true
legacyUrl: /2017/11/azure-cloud-shell-vs-azure-cli.html
---

At a local community event, after my presentation I was answering some questions and one of the attendee ask me if Azure Cloud Shell is the same tool as Azure CLI.

So here is, Azure Cloud Shell is a containerized based shell running in the Azure Portal (or in the browser), using either a Linux (Bash) or Windows (PowerShell) base containers. Both containers are supported by Azure CLI, as well as the Windows based containers supporting Azure PowerShell. For more information How to use Azure Cloud Shell, visit the previous post ([here](/posts/how-to-use-azure-cloud-shell)).

As far as I know, Microsoft updates the CLI and the PowerShell version on a regular basis to whatever is the most stable and updated version. The update is applied to the respective container (Bash to the Linux container, and PowerShell to the Windows container (Windows Server 2016)), so everyone is always running the latest version on Azure Cloud Shell.

Is that mean that when we enable the Azure Cloud Shell, we are creating 2 containers? Yes. If you see the previous post, about how to use Azure Cloud Shell (see link above), you will see that on creation of the resources needed, beside the Resource Groups, Storage Accounts and File Shares, you are also creating the containers. Although, those are on the fly. That means every time you open the Azure Cloud Shell, you are connecting to the respective container.

**Bash and PowerShell with possibility to run CLI?**

You have the choice to run a Windows based cloud shell or a Linux based one. On the Windows one, comes with Azure PowerShell and also Azure CLI (on Bash on Windows). On the Linux one, comes with Bash and Azure CLI. In future, it will also support Azure PowerShell on Linux.

The Azure Cloud Shell comes with preinstalled open source PowerShell in both, Windows- and Linux-based Cloud Shell. I want to clarify that on Windows based cloud shell, Azure CLI runs directly in cmd.exe (Bash on Windows is not enabled in cloud shell yet).

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
