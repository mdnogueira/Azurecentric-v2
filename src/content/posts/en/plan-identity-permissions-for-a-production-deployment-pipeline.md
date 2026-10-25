---
title: "Plan identity permissions for a production deployment pipeline"
description: "Scope Entra ID roles to app registrations and apply Conditional Access to pipeline service principals."
pubDate: 2026-02-11
category: identity-access
tags: ["microsoft-entra-id", "deployment-pipeline", "conditional-access", "workload-identities", "rbac"]
translationKey: plan-identity-permissions-for-a-production-deployment-pipeline
draft: false
---

A production deployment pipeline needs identity permissions that are precise, auditable, and resilient. The first decision is not which tool to use, but how to scope the authority the pipeline requires. Microsoft Entra ID provides two distinct mechanisms for this: role-based access control (RBAC) for managing the identities themselves, and Conditional Access for controlling when those identities can act. Confusing the two leads to pipelines that are either over-privileged or fragile.

The pipeline identity is a workload identity, typically a service principal. It does not have a user account, cannot perform multifactor authentication, and often stores credentials in a way that makes it a target for compromise. Protecting it requires separating the permission to manage the identity from the permission to use it, and then applying network or risk-based controls to its usage.

## Scope the management permissions

The pipeline needs permission to manage the service principal it represents, or the applications it deploys. Microsoft Entra ID allows roles to be assigned at different scopes: tenant-wide, at the level of a specific application registration, or within an administrative unit. For a production pipeline, tenant-wide assignment is rarely appropriate.

Assigning a role at the application registration scope restricts the principal’s authority to that specific app. This is the recommended approach for deployment pipelines. It ensures that if the pipeline’s credentials are compromised, the attacker cannot manage other applications in the tenant. While custom roles can always be scoped, support for built-in roles at this level is limited. The documentation notes that built-in roles are assigned by default at tenant scope, and only custom roles, or some relevant built-in roles depending on the resource type, can be assigned at the scope of a single Microsoft Entra resource [Assign Microsoft Entra roles at different scopes](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/assign-roles-different-scopes).

To assign this scope, you need at least the Privileged Role Administrator role at the tenant level. The assignment is made in the **Identity** > **Applications** > **App registrations** blade. Select the target application, then choose **Roles and administrators**. Here, you can add the pipeline’s service principal or the user account representing it, assigning the desired role.

If you use PowerShell, the scope is defined by the `directoryScopeId`. For an application registration, this is `/` followed by the application’s object ID. The following illustrative example shows how to assign a role scoped to a specific app:

```powershell
# Illustrative example: assign role scoped to an app registration
Connect-MgGraph -Scopes "Application.Read.All","RoleManagement.Read.Directory","User.Read.All","RoleManagement.ReadWrite.Directory"
$app = Get-MgApplication -Filter "displayName eq 'ProductionPipelineApp'"
$role = Get-MgRoleManagementDirectoryRoleDefinition -Filter "displayName eq 'Application Administrator'"
$principal = Get-MgServicePrincipal -Filter "displayName eq 'PipelineSP'"

New-MgRoleManagementDirectoryRoleAssignment `
   -DirectoryScopeId "/$($app.Id)" `
   -PrincipalId $principal.Id `
   -RoleDefinitionId $role.Id
```

This code is an illustrative example and has not been tested in a live environment. It assumes the Microsoft Graph PowerShell SDK is installed and that the caller has the necessary permissions. The scope `/` is replaced with the app’s ID to restrict the assignment.

## Control usage with Conditional Access

Once the management permissions are scoped, you must control when the pipeline identity can actually acquire tokens to access resources. This is where Conditional Access for workload identities comes in. Historically, Conditional Access applied only to users, but it now extends to service principals owned by the organization. This capability requires Microsoft Entra Workload ID Premium licenses [Microsoft Entra Conditional Access for workload identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity).

The key distinction is that Conditional Access policies for service principals can only block access; they cannot grant it. The available controls are based on location and risk. You can block service principals from outside known public IP ranges, or block them if Microsoft Entra ID Protection detects risk. Note that these policies apply only to single-tenant service principals registered in your tenant. Managed identities are not covered by these policies, so pipelines using Managed Identities cannot be restricted by this specific Conditional Access capability. Also, adding a service principal to a group does not enforce the policy; it must be assigned directly to the policy as a workload identity [Microsoft Entra Conditional Access for workload identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity).

To implement a location-based policy, sign in as a Conditional Access Administrator. Navigate to **Entra ID** > **Conditional Access** > **Policies** and select **New policy**. Under **Assignments**, select **Users or workload identities**, then **Workload identities**, and choose **Select service principals**. Add your pipeline’s service principal. Under **Target resources**, select **All resources**. Under **Conditions** > **Locations**, include **Any location** and exclude the named locations corresponding to your pipeline’s IP ranges. Under **Grant**, select **Block access**. This policy will block token requests from outside the allowed IPs.

You can save the policy in **Report-only** mode first. This allows you to estimate the effects by reviewing the **Sign-in logs** under **Monitoring & health** > **Service principal sign-ins**. The **Conditional Access** tab in the log entry will show whether the policy would have blocked the request. This is critical because a misconfigured policy can lock out your deployment pipeline.

## Verify and refine

The final step is to verify that the pipeline operates correctly under the new constraints. Start by running a deployment in a non-production environment with the Conditional Access policy in Report-only mode. Check the sign-in logs for the service principal. If the logs show the policy evaluating but not blocking, you are ready to enforce it.

Once enforced, monitor the logs for any unexpected blocks. If the pipeline fails to acquire a token, check the failure reason: "Access has been blocked due to Conditional Access policies." This indicates the request came from an unauthorized location or triggered a risk condition. Adjust the named locations or risk thresholds accordingly.

Remember that enabling a Conditional Access policy does not provide workload protection on its own; it only controls access. You still need to manage the service principal’s secrets or certificates securely. Also, a role at the control plane does not imply data-plane rights; the pipeline may still need Azure RBAC roles on the target resources, which should be scoped to the resource group or subscription, not the tenant.

By scoping management permissions to the application registration and enforcing usage with Conditional Access, you create a deployment pipeline that is both precise and secure. The next action is to review the sign-in logs after the first enforced deployment to ensure no legitimate requests are being blocked.

References for Plan identity permissions for a production deployment pipeline: [Microsoft Entra Conditional Access for workload identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity), [Get started integrating Microsoft Entra ID with apps](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/plan-an-application-integration), [Assign Microsoft Entra roles at different scopes](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/assign-roles-different-scopes).
