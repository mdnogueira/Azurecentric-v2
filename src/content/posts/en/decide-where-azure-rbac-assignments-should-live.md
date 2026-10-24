---
title: "Decide where Azure RBAC assignments should live"
description: "Decide whether to assign Microsoft Entra roles at tenant, application, or administrative unit scope to match the boundary of the user's responsibility."
pubDate: 2025-05-18
category: governance
tags: ["entra-id", "rbac", "role-scoping", "least-privilege", "application-administration", "administrative-units"]
translationKey: decide-where-azure-rbac-assignments-should-live
draft: true
---

You have a developer who needs to update the credentials for a specific application registration. The instinct might be to assign the Application Administrator role at the tenant level, as that is the default scope for most built-in roles. However, granting tenant-wide permissions for a single-app task is excessive. The correct approach depends on whether the scope of the role aligns with the resource you are managing.

Microsoft Entra ID supports assigning roles at three distinct scopes: tenant, application registration, and administrative unit. Choosing the right scope is not about finding the most granular option available, but about matching the role's permissions to the actual boundary of the work. A role assigned at the tenant scope applies to the entire directory. A role assigned at the application scope applies only to that specific app. A role assigned at the administrative unit scope applies only to the members within that unit.

[![Role Assignment Scope Decision Flow](/images/posts/2025/azc-180-checkpoints.svg)](/images/posts/2025/azc-180-checkpoints.svg)

## Tenant scope: The default for broad management

When you assign a role like Application Administrator or Global Administrator without specifying a scope, it applies to the entire tenant. This is the standard model for roles that require oversight of the whole directory, such as managing all app registrations, configuring authentication policies, or handling user lifecycle events across the organisation.

If you assign Application Administrator at the tenant scope, the user can manage credentials, permissions, and properties for every application registration in the directory. This is appropriate for a central identity team responsible for the entire estate. It is not appropriate for a developer who only needs to update the redirect URIs for their own application.

The first thing to check is whether the role you are assigning has permissions that are inherently tenant-wide. Some roles, such as Global Administrator, do not support scoping to individual resources. They are always tenant-wide. For roles that do support scoping, you must decide if the user's tasks require access beyond the specific resource.

## Application registration scope: Restricting access to a single app

Microsoft Entra ID allows you to assign certain built-in roles and custom roles at the scope of a single application registration. This is the correct choice when a user needs to manage credentials, secrets, or certificates for one specific app without affecting others.

For example, if you assign the Application Administrator role to a user at the scope of a specific app registration, that user can manage that app's credentials and basic properties. They cannot manage other applications in the tenant. This reduces the blast radius if the account is compromised. It also clarifies the user's responsibilities: they are responsible for this app, not the entire identity estate.

To assign a role at the application scope, you must use the Microsoft Entra admin center, Microsoft Graph PowerShell, or the Microsoft Graph API. In the admin center, you navigate to the specific application registration, select **Roles and administrators**, and then add the assignment. The list of roles available at this scope is filtered to show only those relevant to managing app registrations.

```powershell
# Illustrative example: Assigning Application Administrator to a specific app
# Prerequisites: Microsoft.Graph PowerShell module, Connect-MgGraph with appropriate scopes

$appRegistration = Get-MgApplication -Filter "displayName eq 'MySpecificApp'"
$roleDefinition = Get-MgRoleManagementDirectoryRoleDefinition -Filter "displayName eq 'Application Administrator'"
$user = Get-MgUser -Filter "userPrincipalName eq 'developer@contoso.com'"

# The directoryScopeId is the app registration's object ID, prefixed with '/'
$directoryScope = '/' + $appRegistration.Id

New-MgRoleManagementDirectoryRoleAssignment `
    -DirectoryScopeId $directoryScope `
    -PrincipalId $user.Id `
    -RoleDefinitionId $roleDefinition.Id
```

This code assigns the role to the user, but only for the specified application. The `directoryScopeId` parameter is key here. For application registrations, the scope is the object ID of the app itself. This is different from administrative units, where the scope refers to the members of the unit.

## Administrative unit scope: Managing members, not the unit itself

Administrative units provide a way to segment the directory for users, groups, and devices. Assigning a role at the administrative unit scope is appropriate when you need to delegate management of a subset of users or groups, such as a specific department or region.

However, it is crucial to understand what this scope actually controls. When you assign a role like Groups Administrator at the scope of an administrative unit, the user can manage groups that are members of that unit. They cannot manage the administrative unit itself, nor can they manage groups outside the unit. They also cannot manage tenant-wide settings related to those groups, such as expiration policies or naming conventions.

This distinction is often misunderstood. An administrative unit scoped role does not give the user permission to manage the administrative unit object. It gives them permission to manage the *members* of the unit, based on the role they are assigned. For example, a Helpdesk Administrator assigned to an administrative unit can reset passwords for non-administrator users within that unit, but cannot reset passwords for administrators or users outside the unit.

Not all roles can be assigned at the administrative unit scope. Only roles with permissions relevant to users, groups, or devices can be scoped this way. Custom roles can also be scoped to administrative units, provided they include at least one permission relevant to these object types.

## Making the decision

The decision comes down to the boundary of the user's responsibility. If they need to manage everything, use tenant scope. If they need to manage a single application, use application scope. If they need to manage a subset of users or groups, use administrative unit scope.

It is also worth noting that you cannot assign service principals or guest users to roles with an administrative unit scope. Only users and Microsoft Entra role-assignable groups can be assigned in this way. For application registrations, service principals can be assigned roles scoped to the app.

Before making any assignments, verify the prerequisites. Assigning roles at any scope requires the Privileged Role Administrator role at the tenant level. For administrative units, the administrators also need a Microsoft Entra ID P1 or P2 license. For application registrations, the roles available are limited to those relevant to app management.

If you are unsure which scope to use, start with the most restrictive scope that still allows the user to perform their tasks. This follows the principle of least privilege and reduces the risk of accidental or malicious changes to resources outside the user's intended scope.

To verify the assignment, check the role assignments in the Microsoft Entra admin center. For tenant scope, the directory scope will be `/`. For application scope, it will be the app registration's object ID. For administrative unit scope, it will be the administrative unit's object ID. Ensure that the principal and the role definition are correct, and that the scope matches the intended boundary.

If you need to remove the assignment, use the same tool you used to create it. In PowerShell, use `Remove-MgRoleManagementDirectoryRoleAssignment` with the assignment ID. In the admin center, select the assignment and remove it. Be aware that removing a role assignment does not necessarily revoke existing tokens or sessions; it only prevents new access based on that role.

The key is to align the scope with the resource boundary. Tenant scope is for the whole directory. Application scope is for a single app. Administrative unit scope is for the members of a unit. Choosing the wrong scope either over-privileges the user or under-privileges them, leading to either security risks or operational friction.

References for Decide where Azure RBAC assignments should live: [Assign Microsoft Entra roles at different scopes](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/assign-roles-different-scopes), [Assign Microsoft Entra roles](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/manage-roles-portal), [Secure access practices for administrators in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-planning).
