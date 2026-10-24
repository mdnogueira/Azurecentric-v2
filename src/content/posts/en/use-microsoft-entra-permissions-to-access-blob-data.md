---
title: "Use Microsoft Entra permissions to access blob data"
description: "Assign Azure RBAC roles for blob data access, distinguishing data-plane permissions from control-plane management."
pubDate: 2024-05-21
category: storage
tags: ["azure-rbac", "blob-storage", "microsoft-entra-id", "data-access", "storage-security"]
translationKey: use-microsoft-entra-permissions-to-access-blob-data
draft: false
---

You need a user or application to read or write blobs using Microsoft Entra ID. The first thing to check is whether the security principal already has the correct data-plane role. It is a common mistake to assume that a role like **Contributor** or **Storage Account Contributor** grants access to the blob data itself. These are control-plane roles; they allow you to manage the storage account, but they do not permit reading or writing the blobs inside it.

To access blob data via Microsoft Entra ID, you must explicitly assign a data access role, such as **Storage Blob Data Reader** or **Storage Blob Data Contributor**, at the appropriate scope. This is separate from the permissions required to manage the account.

[![Blob Access Authorization Flow](/images/posts/2024/azc-051-checkpoints.svg)](/images/posts/2024/azc-051-checkpoints.svg)

## Understand the two layers of permission

Azure Storage separates management operations from data operations. This distinction is critical when troubleshooting access issues.

*   **Control-plane (Management):** Roles like **Reader**, **Contributor**, and **Storage Account Contributor** allow you to view, create, update, or delete the storage account resource itself. They do not grant access to the data within the account when using Microsoft Entra authentication.
*   **Data-plane:** Roles like **Storage Blob Data Reader** and **Storage Blob Data Contributor** grant permissions to perform operations on the blobs and containers. These roles are defined by Azure Storage and are enforced by the Blob service when an OAuth 2.0 token is presented.

If a user has **Contributor** on the storage account but no data role, they can change the account settings but will receive an `AuthorizationPermissionMismatch` error when trying to list or upload blobs using their Entra credentials.

## Assign the data role

You can assign these roles using the Azure portal, PowerShell, Azure CLI, or templates. The scope can be the subscription, resource group, storage account, or individual container. For least privilege, scope the role to the specific container or account rather than the subscription.

### Using Azure CLI

To assign the **Storage Blob Data Contributor** role to a user for a specific container, use the `az role assignment create` command. You need to specify the role, the assignee, and the precise scope.

```azurecli-interactive
az role assignment create \
    --role "Storage Blob Data Contributor" \
    --assignee "user@contoso.com" \
    --scope "/subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Storage/storageAccounts/<storage-account-name>/blobServices/default/containers/<container-name>"
```

To assign read-only access at the storage account level, use **Storage Blob Data Reader**:

```azurecli-interactive
az role assignment create \
    --role "Storage Blob Data Reader" \
    --assignee-object-id "<object-id-of-user>" \
    --assignee-principal-type "User" \
    --scope "/subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Storage/storageAccounts/<storage-account-name>"
```

### Using PowerShell

PowerShell uses the `New-AzRoleAssignment` cmdlet. Ensure you have a role that includes `Microsoft.Authorization/roleAssignments/write` permissions to run this.

```powershell
New-AzRoleAssignment -SignInName "user@contoso.com" `
    -RoleDefinitionName "Storage Blob Data Contributor" `
    -Scope "/subscriptions/Examplesubscriptionid/resourceGroups/Exampleresourcegroupname/providers/Microsoft.Storage/storageAccounts/Examplestorageaccountname/blobServices/default/containers/Examplecontainername"
```

## Portal access requirements

If the user needs to access the data via the Azure portal, they require an additional permission. The data roles alone do not provide the management permissions needed to navigate the storage account resources in the portal interface.

To view blobs in the portal using Microsoft Entra credentials, the user must have:
1.  A data access role (e.g., **Storage Blob Data Reader** or **Storage Blob Data Contributor**).
2.  The Azure Resource Manager **Reader** role (or higher) at the storage account scope or higher.

The **Reader** role allows the user to see the storage account and its containers in the portal hierarchy. Without it, the user might have data permissions but cannot navigate to the container to view the blobs.

## Verification and propagation

After assigning the role, changes may take up to 30 minutes to propagate across Azure [Authorize access to blobs using Microsoft Entra ID](https://learn.microsoft.com/en-us/azure/storage/blobs/authorize-access-azure-active-directory). If you attempt to access data immediately and receive an access denied error, wait and retry.

To verify the assignment:
1.  Check the role assignments on the storage account or container in the Azure portal or via CLI/PowerShell.
2.  Ensure there are no deny assignments blocking the principal.
3.  Confirm the principal is authenticated with Microsoft Entra ID, not using the storage account key. If the portal falls back to Shared Key authorization (because the user has `listKeys` permission), it may succeed even without data roles, masking the missing permission.

To test data access specifically with Entra credentials, use Azure CLI or PowerShell signed in as the target user. For example:

```azurecli-interactive
az storage blob list \
    --account-name <storage-account-name> \
    --container-name <container-name> \
    --auth-mode login \
    --output table
```

If this command fails with an authorization error, the data role is either missing, incorrectly scoped, or still propagating.

## Managing access for applications

For applications running in Azure, such as VMs or App Services, use managed identities instead of user accounts. Assign the same data roles to the managed identity. The Azure Identity client library can then acquire an OAuth 2.0 token automatically, simplifying the authentication flow and improving security by eliminating the need to store credentials.

For resources hosted outside of Azure, such as on-premises applications, you can use managed identities through Azure Arc [Authorize access to blobs using Microsoft Entra ID](https://learn.microsoft.com/en-us/azure/storage/blobs/authorize-access-azure-active-directory). For example, apps running on Azure Arc-enabled servers can use managed identities to connect to Azure services. To learn more, see [Authenticate against Azure resources with Azure Arc-enabled servers](/azure/azure-arc/servers/managed-identity-authentication).

Alternatively, for scenarios where shared access signatures (SAS) are used, Microsoft recommends using a user delegation SAS. A user delegation SAS is secured with Microsoft Entra credentials instead of the account key [Authorize access to blobs using Microsoft Entra ID](https://learn.microsoft.com/en-us/azure/storage/blobs/authorize-access-azure-active-directory).

Always review the scope of your role assignments. Broad roles at the subscription level increase the risk if a principal is compromised. Scope roles to the container or account level where possible, and use Azure RBAC conditions if you need further granularity based on resource attributes.

References for Use Microsoft Entra permissions to access blob data: [Assign an Azure role for access to blob data](https://learn.microsoft.com/en-us/azure/storage/blobs/assign-azure-role-data-access), [Authorize access to blobs using Microsoft Entra ID](https://learn.microsoft.com/en-us/azure/storage/blobs/authorize-access-azure-active-directory), [Authorize operations for data access](https://learn.microsoft.com/en-us/azure/storage/common/authorize-data-access).
