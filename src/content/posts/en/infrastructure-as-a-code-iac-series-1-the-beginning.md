---
title: "Infrastructure as a Code (IaC) Series #1 – The beginning!"
description: "From the past months, I’ve been upgrading all my scripts that I have been using along the years to a platform that allows me to be more productive, reusing all the IP that I…"
pubDate: 2019-02-05
category: automation
tags: ["infrastructure-as-code", "terraform", "azure-backup", "azure-site-recovery"]
translationKey: infrastructure-as-a-code-iac-series-1-the-beginning
legacy: true
legacyUrl: /2019/02/infrastructure-as-a-code-iac-series-the-beginning.html
---

From the past months, I’ve been upgrading all my scripts that I have been using along the years to a platform that allows me to be more productive, reusing all the IP that I have been gathering and creating along the years. But in what way I should enhance/improve this? Then I got stroked by a light! What I was doing from all of those years was kind of an Infrastructure as a Code (IaC) on a very manual and simple way.

Then I decide to use a platform that allows me to store and work more productively and more efficient. What about Terraform? I know that are other tools for IaC out there. Although I found Terraform, more suitable for be, because is an open source IaC configuration tool that allows me to work with Azure and other Cloud providers as well.

## So, why Terraform? 

Terraform is an open source IaC configuration tool develop by Hashicorp. What it does? It allows IT Administrators to define their infrastructure components as a code, which is parsed and then passed to a Cloud Provider to provisioning the given infrastructure.

Terraform is a declarative state-based configuration. That means, the declarative syntax of Terraform allows for a wide range of choices when it comes to organize the way of how you are provisioning an organization infrastructure. 

The way that works is, any or all the **_.tf_** files (Terraform native extension files), within the working directory that you are using, will be loaded by Terraform when it’s called. This allows you to organize and chain several files, parameters, variables and others, in a very simple way. For this reason, it’s very trivial to break up a set of configuration files into directories with separate variable files.

The file structure and the file distribution can change depending on the complexity and the needs ofa given deployment.

Another good feature is the automated changing tracking. Terraform is knows the resource state and then stores as a JSON data in a file, a state file. This file, is where Terraform references when is running a plan or apply a step to decide whether any resources will be created, changed or destroyed.

To have more information I suggest visiting the [Terraform](https://www.terraform.io/) website.

## How to use it?

Now, that I introduce to my main IaC tool, how I’m using Terraform? I’m using Terraform to create Virtual Networks, Subnets, VPNs, Gateways, Storage Accounts, Virtual Machines, Disaster Recovery (ASR and Azure Backup), Load Balancers, NSGs, among others Azure Services that I need to setup to build an Azure Virtual Datacenter.

Before you start to use Terraform, I highly recommend you start with the prerequisites, that you want to make sure you have installed.
This is the toolset that I used daily:

- **Visual Studio Code** – Visual Studio Code is a lightweight code editor that can be used with almost any coding language. It supports syntax highlighting, language-specific extensions, and integrated git features that make branching and updating repositories easy.
- **Terraform Extension** – Mikael Olenfalk’s Terraform extension for Visual Studio Code will provide syntax highlighting and autocomplete that is specific to the Terraform language.
- **Git** – Git is essential to the build and release process, which relies heavily on repositories to handle changes to Terraform code.
- **PowerShell** – PowerShell comes pre-installed with Windows 10 (or Windows Server 2016/2019), so you won’t have to download anything, however, make sure you know how to open PowerShell as an Administrator. 
    - **AzureRM Powershell** – Azure PowerShell is a set of modules for PowerShell that allows Windows to interface with Azure. Once you are able to sign in,   **AzureRM**is set up, and you are ready to proceed.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
