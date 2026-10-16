---
title: "Azure PowerShell to manage Azure Subscriptions"
description: "After you install the Azure PowerShell modules, you can connect the Azure PowerShell session to the Azure subscriptions that you want to manage. To establish this connection,…"
pubDate: 2016-08-05
category: governance
tags: [powershell, subscriptions]
translationKey: azure-powershell-to-manage-azure-subscriptions
legacy: true
legacyUrl: /2016/08/azure-powershell-to-manage-azure-subscriptions.html
---

After you install the Azure PowerShell modules, you can connect the Azure PowerShell session to the Azure subscriptions that you want to manage. To establish this connection, you first need to authenticate by using an account that exists in the Azure AD tenant and that is associated with the target subscription.

This can be a Microsoft account that you either used to create the subscription or added subsequently to the subscription’s Azure AD tenant. Alternatively, you can also create new accounts in Azure AD. These accounts were formerly referred to as _organizational accounts_ and are now known as _work or school accounts_.

When managing Azure Resource Manager resources, you authenticate by running the **_Add-AzureRmAccount_** cmdlet. By default, running this cmdlet opens a browser window prompting you for the user name and the password of a user account with access to the Azure subscription that you intend to manage.

Azure AD authentication is token-based, and after signing in, the user remains authenticated until the authentication token expires. The expiration time for an Azure AD token is 12 hours.

After you authenticate, you can use the **_Get-AzureRmSubscription_** cmdlet to view a list of subscriptions associated with your account. If you have multiple subscriptions, you can specify the one you want to manage by using the **_Set-AzureRmSubscription_** cmdlet and providing either the subscription name or ID. You can identify the subscription name and ID by reviewing the output of the **_Get-AzureRmSubscription_** cmdlet.

After you authenticate from within a Windows PowerShell session, Azure PowerShell automatically generates a collection of session-related objects, which is known as the _session context_. That context contains objects such as the account, Azure subscription, and corresponding Azure AD tenant. You can manage the content of the context by using the **_Set-AzureRmContext_** and **_Select-AzureRmSubscription_** cmdlets and view the context by using the **Get-AzureRmContext **cmdlet.

When managing Azure Service Management services, you authenticate by running the **_Add-AzureAccount_** cmdlet. For access to subscription management functionality that is equivalent to that from **_Get-AzureRmSubscription_** and **_Select-AzureRmSubscription_**, you can run the corresponding Azure PowerShell cmdlets, including **_Get-AzureSubscription_** and **_Select-AzureSubscription_**. However, in this case, no corresponding session context exists, so you need to manage its components separately.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
