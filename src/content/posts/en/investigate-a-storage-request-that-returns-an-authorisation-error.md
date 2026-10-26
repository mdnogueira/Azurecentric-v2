---
title: "Investigate a storage request that returns an authorisation error"
description: "Troubleshoot Azure Storage authorisation errors by identifying the auth method, checking account settings, and verifying data-plane permissions."
pubDate: 2024-09-08
category: storage
tags: ["troubleshooting", "azure-storage", "authorization", "sas", "shared-key", "microsoft-entra-id"]
translationKey: investigate-a-storage-request-that-returns-an-authorisation-error
draft: false
---

You receive an authorisation error when accessing Azure Storage. The first step is to identify which authentication method the client is attempting to use, because the storage account may have restricted or disabled that specific method. Azure Storage supports Microsoft Entra ID, Shared Key (storage account keys), and Shared Access Signatures (SAS), alongside anonymous access for blobs. Each method has distinct requirements, and a mismatch between the client's credentials and the account's allowed methods is the most common cause of failure.

## Identify the authentication method in use

The error message usually indicates the failure point, but it rarely specifies the underlying configuration conflict. You need to determine whether the client is using a storage account key, a SAS token, or Microsoft Entra ID credentials.

If the client is using a storage account key, it is performing Shared Key authorization. This method requires the client to sign the request using the SHA256 algorithm and Base64 encode the signature. The storage account must allow Shared Key authorization. If the account has been configured to disallow Shared Key access, any request using the account key will fail with an authorisation error, regardless of whether the key itself is correct.

If the client is using a SAS token, you must verify the type of SAS. User delegation SAS tokens are signed with Microsoft Entra credentials and are only supported for blob storage. Account SAS and service SAS tokens are signed with the storage account key and are supported for blobs, files, queues, and tables. If you attempt to use a user delegation SAS for a file or queue resource, the request will fail because that authorization option is not supported for those services.

If the client is using Microsoft Entra ID, it relies on Azure RBAC or ABAC. Microsoft recommends using Microsoft Entra ID with managed identities for optimal security. A role assignment at the storage account scope grants permissions to blob, queue, and table resources. However, a role assignment at the resource group or subscription scope does not automatically grant data-plane access to the storage account. You must assign the role specifically to the storage account or a container within it.

## Check the storage account configuration

Once you know the authentication method, check the storage account's security settings. Microsoft recommends disallowing Shared Key authorization for storage accounts to prevent inadvertent use of the account key, which provides full access to the configuration and data.

If Shared Key authorization is disabled, clients must use Microsoft Entra ID or a user delegation SAS (for blobs). If you are seeing Shared Key authorization errors after disabling this feature, it might indicate that a trusted access mechanism is being used, or that the client is still attempting to use the account key. You can verify the current setting in the Azure portal or via the REST API. The setting is explicitly designed to enforce the use of more secure authentication methods.

For Microsoft Entra ID authentication, ensure that the storage account is configured to accept Entra credentials. This is the default for most modern storage accounts, but it is worth confirming. If you are using Azure Files over SMB, you must also ensure that the correct identity provider is enabled, such as Microsoft Entra Domain Services, Microsoft Entra Kerberos for hybrid identities, or On-premises Active Directory Domain Services (AD DS). On-premises AD DS credentials must be synced to Microsoft Entra ID for Azure Files to accept them.

## Verify permissions and scope

If the authentication method is supported, the next step is to verify that the security principal has the necessary permissions. For Microsoft Entra ID, this means checking the RBAC assignments. The principal must have a role such as Storage Blob Data Reader, Storage Blob Data Contributor, or Storage Queue Data Contributor, assigned at the correct scope.

A common mistake is to assign a role at the management plane scope, such as Contributor on the resource group. This grants permission to manage the storage account resource itself, but not to access the data within it. Data-plane permissions must be assigned separately. For example, to read blobs, the principal needs the Storage Blob Data Reader role assigned to the storage account or a specific container.

If you are using SAS, verify the token's validity period and permissions. A SAS token specifies the permissions granted to the resource and the interval over which the signature is valid. If the token has expired or does not include the required permission (e.g., Read when Write is needed), the request will fail. For user delegation SAS, ensure that the token was generated by a principal with the necessary permissions to delegate access.

## Test and validate

To isolate the issue, try accessing the storage resource using a different authentication method if possible. For example, if Microsoft Entra ID is failing, try using a SAS token generated with the account key, provided Shared Key is allowed. If that works, the issue is likely with the Entra ID configuration or permissions. If that also fails, the issue may be with the SAS token or the storage account configuration.

You can use the Azure Storage Explorer or a simple script to test the connection. If you are using C#, you can create a simple REST request to list containers or blobs. The request must include the correct headers, such as `x-ms-date` and `x-ms-version`, and the appropriate authorization header. If the request succeeds, the authentication method and permissions are correct. If it fails, review the error code and message for more specific guidance.

Remember that diagnostic logs can provide valuable information. Enable storage analytics logging to capture request details, including the authorization method used and the result of the authorization check. This can help you identify whether the failure is due to an unsupported method, an invalid token, or a missing permission.

By systematically checking the authentication method, storage account configuration, and permissions, you can resolve most authorisation errors in Azure Storage. Always prefer Microsoft Entra ID with managed identities for new applications, as it provides superior security and ease of use over Shared Key authorization.

References for Investigate a storage request that returns an authorisation error: [Authorize operations for data access](https://learn.microsoft.com/en-us/azure/storage/common/authorize-data-access), [Call REST API operations with Shared Key authorization](https://learn.microsoft.com/en-us/azure/storage/common/storage-rest-api-auth).
