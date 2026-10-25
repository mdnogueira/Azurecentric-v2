---
title: "Review storage access after rotating an application identity"
description: "Verify storage access after rotating an application identity by checking RBAC propagation, revoking legacy SAS tokens, and disabling Shared Key auth."
pubDate: 2026-08-26
category: storage
tags: ["azure-storage", "managed-identities", "rbac", "shared-key-authorization", "azure-files"]
translationKey: review-storage-access-after-rotating-an-application-identity
draft: false
---

You have rotated the identity used by an application to access Azure Storage. The new identity is in place, but the application is failing to connect, or you are unsure if the old credentials have been fully revoked. The immediate risk is not just that the new identity fails, but that the old access method—typically a storage account key or a long-lived Shared Access Signature (SAS)—remains valid and accessible to anyone who found it.

The first thing to check is whether the new identity actually has the permissions it needs. Identity rotation often fails because the new principal was not assigned the correct role, or because the role assignment has not yet propagated. If the new identity works, you must then ensure the old access path is closed. Microsoft recommends disallowing Shared Key authorization for storage accounts to prevent legacy key-based access, which bypasses identity controls entirely.

## Confirm the new identity has the correct role

Azure Storage data access is controlled through Azure Role-Based Access Control (RBAC). A common mistake is assuming that enabling a managed identity on a resource is enough; you must also assign a specific data plane role to that identity on the storage account. For example, if your application needs to read and write blobs, it requires a role such as `Storage Blob Data Contributor`. If it only needs to read, `Storage Blob Data Reader` is sufficient.

For Azure Files accessed over SMB using managed identities, the required role is `Storage File Data SMB MI Admin`. This role grants admin-level access for managed identities on files and directories. Without this specific assignment, the managed identity cannot authenticate to the file share, even if the identity is correctly configured on the virtual machine or application.

To verify the assignment:

1. Navigate to the storage account in the Azure portal.
2. Select **Access Control (IAM)** from the left-hand menu.
3. Check the **Role assignments** tab.
4. Search for the new identity (the managed identity or service principal).
5. Confirm that the necessary data role (e.g., `Storage Blob Data Contributor` or `Storage File Data SMB MI Admin`) is assigned to it.

If the role is missing, add it. Remember that role assignments are eventually consistent and may take some time to propagate. If you just assigned the role, wait a short period before testing the application again. If you are automating this, check the assignment status and retry operations if failures persist immediately after assignment.

## Disable Shared Key authorization

Even if the new identity is working, you should ensure that the old method of access is no longer possible. If your application was previously using a storage account key, that key remains valid until you rotate it or disable the method. Microsoft strongly recommends disallowing Shared Key authorization for storage accounts. When this setting is enabled, clients must use Microsoft Entra ID or a user delegation SAS to authorize requests. This effectively cuts off access for any client still using the old storage account key.

To disable Shared Key authorization:

1. Go to the storage account in the Azure portal.
2. Under **Security + networking**, select **Configuration**.
3. Find the setting for **Allow Shared Key access**.
4. Set it to **Disabled**.
5. Select **Save**.

This change applies to all data services in the storage account: blobs, files, queues, and tables. Note that some Azure services may use trusted access with Shared Key for internal operations, but this does not affect external application access.

If you are using Azure Files with SMB and managed identities, you must also ensure that the `SMBOAuth` property is enabled on the storage account. This property allows the storage account to accept OAuth tokens for SMB authentication. You can enable this via the portal, Azure PowerShell, or Azure CLI. For example, using Azure CLI:

```azurecli
az storage account update --resource-group <resource-group> --name <storage-account-name> --enable-smb-oauth true
```

This step is necessary for managed identities to work with SMB file shares. It does not, by itself, disable Shared Key access, so you must still disable Shared Key access separately if you want to prevent key-based authentication.

## Verify the application connection

After assigning the new role and disabling Shared Key access, test the application. The application should now authenticate using the new identity. If it uses a managed identity, it will automatically obtain an OAuth token from the local metadata service. If it uses a service principal, it will use the new credentials.

If the application fails to connect, check the following:

1. **Role Propagation**: Ensure the role assignment has propagated. You can check the **Access Control (IAM)** blade again to confirm the assignment is present.
2. **Identity Configuration**: Verify that the managed identity is enabled on the resource (e.g., the virtual machine) and that it is the correct identity (system-assigned vs. user-assigned).
3. **Network Rules**: Ensure that the storage account’s network rules allow access from the application’s IP address or subnet. Disabling Shared Key access does not change network rules, but if you previously relied on a key to bypass network restrictions, you may need to adjust those rules.
4. **SMB Client Preparation**: For Azure Files over SMB, ensure the client is not joined to a domain and has the necessary client software installed. Windows clients require the `AzFilesSmbMIClient` PowerShell module, and Linux clients require specific kernel support.

## Clean up old credentials

If you were using storage account keys, rotate them now. You can regenerate the primary or secondary key using the Azure portal, Azure CLI, or PowerShell. Regenerating the primary key will invalidate the old primary key, but the secondary key will remain valid. You should regenerate the secondary key as well to ensure both are rotated.

```azurecli
az storage account keys renew --resource-group <resource-group> --name <storage-account-name> --key primary
```

If you were using Shared Access Signatures (SAS), revoke them by deleting the associated stored access policies or by regenerating the storage account key if the SAS was signed with the key. User delegation SAS tokens are signed with Microsoft Entra credentials and will expire according to their validity period, but you should monitor for any unexpected usage.


Reference: [Authorize operations for data access](https://learn.microsoft.com/en-us/azure/storage/common/authorize-data-access).
