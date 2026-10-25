---
title: "Separate Azure control-plane roles from data-plane permissions"
description: "Clarify that Microsoft Entra ID roles and Azure RBAC are separate systems. Assign permissions in each plane independently."
pubDate: 2025-01-23
category: governance
tags: ["azure-rbac", "entra-id", "privileged-access", "security", "rbac-separation"]
translationKey: separate-azure-control-plane-roles-from-data-plane-permissions
draft: false
---

You assign a user the Global Administrator role in Microsoft Entra ID, and they cannot manage a virtual machine in Azure. This is not a bug; it is the intended separation between the identity control plane and the Azure resource management plane.

Many practitioners assume that directory-level administrative rights automatically translate to resource management rights. They do not. Microsoft Entra ID and Azure Resource Manager operate on different data stores and policy decision points. Understanding this distinction is critical for delegating access without over-provisioning or creating security gaps.

## Two separate control planes

Microsoft Entra ID and Azure have their own role-based access control (RBAC) systems. As documented in the [Understand Microsoft Entra role concepts](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/concept-understand-roles) article, these are distinct systems with different data stores and policy decision points. 

Microsoft Entra roles manage identity resources. They grant permissions to manage users, groups, applications, and authentication policies within the directory. Azure RBAC manages Azure resources. It grants permissions to manage virtual machines, storage accounts, and networks within subscriptions, resource groups, or individual resources.

A role at the control plane does not imply data-plane rights. For example, the [Global Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference) role in Microsoft Entra ID is a cross-service role that grants administrative access to multiple Microsoft 365 services. However, it does not grant permissions to create or manage Azure resources like virtual machines unless explicitly assigned via Azure RBAC. Similarly, a Microsoft Entra role such as [Application Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference) allows management of app registrations and enterprise apps in the directory, but it does not grant permissions to manage the underlying Azure resources those apps might interact with.

## Identifying privileged roles in Microsoft Entra ID

Microsoft Entra ID identifies certain roles as privileged because they can modify credentials, authentication policies, or access restricted data. These roles are marked with a **PRIVILEGED** label in the Microsoft Entra admin center. You can also identify them programmatically using Microsoft Graph PowerShell or the Microsoft Graph API.

In the admin center, navigate to **Roles and administrators**. The **Privileged** column indicates which roles are considered privileged. This label helps you distinguish between standard directory roles and those that require stricter governance.



You can also use Microsoft Graph PowerShell to list privileged roles. The following command filters for roles where the `IsPrivileged` property is set to `true`:

```powershell
Get-MgBetaRoleManagementDirectoryRoleDefinition -Filter "isPrivileged eq true" | Format-List
```

This output includes roles such as [Application Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference) and [Helpdesk Administrator](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference). Note that the `IsPrivileged` property is specific to Microsoft Entra ID roles and does not reflect Azure RBAC permissions. Be aware that the label for privileged roles and permissions is currently in PREVIEW, as stated in the [Privileged roles and permissions](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/privileged-roles-permissions) documentation.

## Securing privileged access

Because Microsoft Entra roles control identity, compromising a privileged role can lead to broader access across your organisation. Microsoft recommends using Microsoft Entra Privileged Identity Management (PIM) to manage these roles. PIM allows you to assign roles on an eligible basis, requiring justification and approval, and provides notifications for role changes.

The [Secure access practices for administrators in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-planning) article outlines a roadmap for securing privileged access. Stage 1 recommends identifying and categorising accounts in highly privileged roles, such as Global Administrator, Privileged Role Administrator, Exchange Administrator, and SharePoint Administrator. It also recommends defining at least two emergency access accounts and requiring multifactor authentication for all users in these roles.

When delegating access, remember that Microsoft Entra roles and Azure RBAC are separate. Assigning a user a Microsoft Entra role does not grant them Azure resource permissions. Conversely, assigning a user an Azure RBAC role does not grant them directory management permissions. You must assign permissions in both systems independently if both are required.

## Verification

To verify the separation, assign a user the User Administrator role in Microsoft Entra ID. Then, attempt to create a virtual machine in Azure. The operation will fail unless the user is also assigned an Azure RBAC role, such as Contributor or Owner, at the subscription or resource group level. This confirms that directory roles do not automatically grant Azure resource permissions.

Similarly, assign a user the Virtual Machine Contributor role in Azure RBAC. Then, attempt to create a new user in Microsoft Entra ID. The operation will fail unless the user is also assigned a Microsoft Entra role, such as User Administrator. This confirms that Azure RBAC roles do not automatically grant directory management permissions.

Understanding this separation allows you to delegate access precisely. Use Microsoft Entra roles for identity management and Azure RBAC for resource management. Combine them only when necessary, and govern privileged roles with PIM and MFA to reduce risk.
