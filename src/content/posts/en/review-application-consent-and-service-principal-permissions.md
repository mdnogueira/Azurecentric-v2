---
title: "Review application consent and service principal permissions"
description: "How to review and revoke permissions for enterprise applications in Microsoft Entra ID, including admin and user consent."
pubDate: 2026-04-08
category: governance
tags: ["entra-id", "security", "permissions", "consent", "powershell"]
translationKey: review-application-consent-and-service-principal-permissions
draft: false
---

You have an enterprise application in your tenant that is requesting more permissions than it needs, or you have detected a suspicious app that has been granted tenant-wide access. The first step is to understand the scope of the permissions and then revoke them carefully. Revoking permissions does not stop users from re-consenting, so you must also address the consent workflow to prevent recurrence.

## Understand the difference between admin and user consent

[![Permission Revocation Flow](/images/posts/2026/azc-296-checkpoints.svg)](/images/posts/2026/azc-296-checkpoints.svg)

Permissions granted to an application fall into two categories: admin consent and user consent. Admin consent applies to the entire organisation, while user consent applies only to the individual user who granted it. The portal separates these into distinct tabs, but the mechanisms for revoking them differ.

When you revoke admin consent, you remove the permission for all users. However, if users have previously granted their own consent, those permissions remain active. You cannot revoke user consent permissions directly from the portal; you must use PowerShell or Microsoft Graph API for that. This distinction is critical because a partial revocation might leave the application functional for some users while breaking it for others.

## Review permissions in the Microsoft Entra admin center

To start, you need the correct permissions. You must be signed in as a Cloud Application Administrator or Application Administrator. Navigate to **Entra ID** > **Enterprise apps** > **All applications** and select the application you want to review.

Select **Permissions** under the **Security** section. You will see two tabs: **Admin consent** and **User consent**. The **Admin consent** tab lists permissions granted on behalf of the organisation. The **User consent** tab lists permissions granted by individual users.

To review admin consent permissions, select the **Admin consent** tab. Click on any permission to open the **Permission Details** pane, which provides context on what the permission allows. If you identify a permission that should not be granted, you can revoke it directly from the portal. Select the **...** control next to the permission and choose **Revoke permission**.

:::image type="content" source="/images/posts/2026/azc-296-learn-1.png" alt-text="Screenshot shows how to revoke admin consent."

This action removes the permission for the entire organisation. However, it does not affect permissions granted by users. To remove user consent permissions, you must use PowerShell or Microsoft Graph API, as the portal does not support this action.

## Revoke user consent permissions using PowerShell

Since the portal cannot revoke user consent permissions, you need to use PowerShell. You can use either Microsoft Entra PowerShell or Microsoft Graph PowerShell. Both require you to sign in with the appropriate scopes.

Here is an example using Microsoft Graph PowerShell to remove all delegated permissions (user consent) for a specific service principal:

```powershell
# Illustrative example: unrun code
Connect-MgGraph -Scopes "Application.ReadWrite.All", "Directory.ReadWrite.All", "DelegatedPermissionGrant.ReadWrite.All", "AppRoleAssignment.ReadWrite.All"

# Get Service Principal using objectId
$sp = Get-MgServicePrincipal -ServicePrincipalId "ExampleServicePrincipalobjectID"

# Get all delegated permissions for the service principal
$spOAuth2PermissionsGrants = Get-MgOauth2PermissionGrant -All | Where-Object { $_.clientId -eq $sp.Id }

# Remove all delegated permissions
$spOAuth2PermissionsGrants | ForEach-Object {
    Remove-MgOauth2PermissionGrant -OAuth2PermissionGrantId $_.Id
}
```

This script retrieves all delegated permissions granted to the service principal and removes them. Note that this action is irreversible without re-consent. You should also remove application permissions (app roles) using similar commands, as shown in the source documentation.

## Stop users from re-consenting

Revoking permissions is only a temporary fix if users can easily re-consent to the application. To prevent this, you need to configure the admin consent workflow or restrict user consent settings.

If you have an admin consent workflow enabled, you can review and take action on consent requests. Navigate to **Entra ID** > **Enterprise apps** > **Admin consent requests** under the **Activity** section. Select the **My Pending** tab to view requests. You can **Approve**, **Deny**, or **Block** the request. Blocking a request prevents future requests for the same application and creates a disabled service principal object.

If you do not have an admin consent workflow, you can configure user consent settings to require admin consent for all applications or specific APIs. This ensures that users cannot grant permissions without administrative approval. Refer to the [Configure how end-users consent to applications](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-user-consent) documentation for details.

## Verify the changes

After revoking permissions and configuring consent settings, verify that the application no longer has the required access. You can do this by reviewing the permissions tab in the portal or using Graph API queries to confirm the absence of permissions, as per S1.

You should also monitor the admin consent requests to ensure no new requests are submitted for the application. If the application is deemed untrustworthy, consider blocking it entirely to prevent future access.

References for Review application consent and service principal permissions: [Review permissions granted to enterprise applications](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/manage-application-permissions), [Grant tenant-wide admin consent to an application](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/grant-admin-consent), [Review and take action on admin consent requests](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/review-admin-consent-requests).
