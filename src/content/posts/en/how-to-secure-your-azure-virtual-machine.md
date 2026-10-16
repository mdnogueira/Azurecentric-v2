---
title: "How to secure your Azure Virtual Machine"
description: "We know that Microsoft Azure offers several technologies that help to keep your data secure in use, in transit, and at rest. But what additional security measures can we…"
pubDate: 2017-03-06
category: compute
tags: [linux]
translationKey: how-to-secure-your-azure-virtual-machine
legacy: true
legacyUrl: /2017/03/how-to-secure-your-azure-virtual-machine.html
---

We know that Microsoft Azure offers several technologies that help to keep your data secure in use, in transit, and at rest. But what additional security measures can we implement to increase the security of my virtual machine? One of the way is by leveraging encryption capabilities provided by Azure Key Vault and that apply to Azure VM disk files at rest.

## **What is the Azure Key Vault?**

Key Vault serves as a store of cryptographic keys and secrets, such as storage account keys or passwords. The vault maintains its content in encrypted form and offers the ability to further secure it by applying hardware security module (HSM)-based protection.

A secret is essentially a small data blob (of up to 10 KB in size) that authorized users and applications can retrieve from the vault. To secure access to secrets, you create Azure Active Directory objects representing these users or applications, which they subsequently use to authenticate. Effectively, you avoid potential risk associated with users storing secrets in nonsecure locations and eliminate the need to hard-code them into applications.

Unlike secrets, keys stored in a vault do not leave its boundaries. Instead, once you add a key to the vault, users and applications must invoke cryptographic functions to perform any operations that require its knowledge. On the other hand, the ability to complete such invocation is also subject to a successful Azure Active Directory-based authentication. To access keys and secrets, users and applications must possess valid Azure Active Directory tokens representing security principal with sufficient permissions to the target vault.

Every object residing in an Azure Key Vault has a unique identifier, which you must reference when attempting to retrieve it (secret) or accessing it via a cryptographic function (key). In addition, you can assign several additional attributes to both secrets and keys, which help with their retrieval and usage:
  * **exp**. An expiration date of the secret, after which it is no longer possible to retrieve it from the vault.
  * **nbf**. A date at which the secret becomes accessible.
  * **enabled**. A Boolean value that determines whether the secret is accessible (assuming that the access attempt takes place between the dates set by the values of the nbf and exp parameters).

Secrets also include the **contentType** attribute in the form of a string of up to 255 characters, which you can use to describe their purpose.

## **How to use the Key Vault**

You can use a REST-based API, Azure PowerShell, or Azure CLI to retrieve secrets and public parts of keys (in JSON format) from Key Vault. In addition to performing the GET operation, you also have the ability to carry out other management tasks targeting keys (create, import, update, delete, list, backup, or restore) and secrets (set, list, or delete). Similarly, either of these two methods allow you to manage the vault and its properties. Some of the most commonly used PowerShell cmdlets that facilitate interaction with an Azure Key Vault include:
  * **_New-AzureRmKeyVault_** creates a new Key Vault.
  * **_Add-AzureKeyVaultKey_** creates a new—or imports an existing—key into a Key Vault.
  * **_Get-AzureKeyVaultKey_** retrieves a public part of a key from a Key Vault.
  * **_Get-AzureKeyVaultSecret_** retrieves a secret from a Key Vault.
  * **_Remove-AzureKeyVaultKey_** remove a key from a Key Vault.

## **How to use Azure Disk Encryption**

Azure Disk Encryption is a capability built into the Azure platform that allows you to encrypt file system volumes residing on Windows and Linux Azure Resource Manager virtual machine disks.

Azure Disk Encryption leverages existing file system-based encryption technologies already available in the guest operating system (BitLocker in Windows and DM-Crypt in Linux) to provide encryption of volumes hosting the operating system and data. The solution integrates with Key Vault to securely store volume encryption keys. Additionally, you also have the option to encrypt these keys by utilizing Key Encryption Key (KEK) functionality of the vault. The combination of these features enhances security of Azure virtual machine disks at rest by encrypting their content.

**Note:** It is possible to encrypt the data (but not the operating system) volumes of Azure IaaS virtual machines running the Windows operating system by using BitLocker without relying on Azure Disk Encryption. You also have the option of encrypting any volume (including the operating system one) by implementing third-party solutions offered on Azure Marketplace, such as CloudLink SecureVM. You can also combine Azure Disk Encryption with Azure Storage Service Encryption, which encrypts all the content of the storage account.

There are three main scenarios in which you would use Azure Disk Encryption, all of them are applicable to Azure Resource Manager deployments of standard-tier virtual machines:
  * Enabling encryption on new Azure Resource Manager virtual machines created from a customer-encrypted VHD by using existing encryption keys.
  * Enabling encryption on new Azure Resource Manager virtual machines created from Azure Marketplace images.
  * Enabling encryption on existing Azure Resource Manager virtual machines that are already running in Azure.

Although, Azure Disk Encryption is not supported for:
  * Basic-tier virtual machines.
  * Classic virtual machines.
  * Integration with on-premises Key Management Service.
  * Content of Azure Files (Azure file share), network file system (NFS), dynamic volumes, and software-based Redundant Array of Independent Disks (RAID) volumes on Windows VMs. There is support for encryption of volumes created by using Storage Spaces on Windows VMs and by using either mdadm or Logical Volume Manager (LVM) on Linux VMs.
  * Disabling encryption on the OS drive for Linux VMs. You can disable encryption on data drives of Linux VMs and on both OS and data drives of Windows VMs.

Azure Disk Encryption requires additional changes to obtain access to the Azure Key Vault where secrets and encryption keys will reside. In particular, you must set the **enabledForDiskEncryption** property on the vault to allow Azure platform to read BitLocker encryption keys and DM-Crypt passphrases from it. When applying encryption to new or existing volumes, you also have to set up an Azure Active Directory application with write permissions to the vault. This application provides a security context for Azure platform, allowing it to securely store newly generated cryptographic material. In addition, you need to configure the vault access policy to allow the **Microsoft.Compute** resource provider and Azure Resource Manager to retrieve its secrets during virtual machine deployments.

Finally, you need to enable encryption on new or existing Azure Resource Manager virtual machines. Specifics of this last step depend on which of the three scenarios you are implementing and which deployment methodology you are using.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com/)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
