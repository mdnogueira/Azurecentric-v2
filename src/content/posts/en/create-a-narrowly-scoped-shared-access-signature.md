---
title: "Create a narrowly scoped shared access signature"
description: "Delegate Azure Storage access securely using stored access policies and account-level expiration policies."
pubDate: 2024-07-14
category: storage
tags: ["azure-storage", "access-control", "sas"]
translationKey: create-a-narrowly-scoped-shared-access-signature
draft: false
---

You need to delegate access to Azure Storage resources without handing over the storage account key. The most effective way to do this is to create a narrowly scoped shared access signature (SAS) that is bound to a stored access policy and constrained by an account-level expiration policy. This approach gives you the ability to revoke access without rotating keys and limits the validity window if a token is leaked.

A SAS is a token appended to a resource URI that grants specific permissions for a defined interval. Azure Storage supports three types of SAS: user delegation SAS, service SAS, and account SAS. User delegation SAS tokens are secured with Microsoft Entra credentials and are recommended for Blob storage where possible, as they avoid the need to store account keys in your application code. However, user delegation SAS tokens must be ad hoc; they cannot be bound to a stored access policy. Service SAS and account SAS tokens are signed with the storage account key. Service SAS tokens delegate access to a single storage service (Blob, Queue, Table, or Files), while account SAS tokens can delegate access to multiple services and even service-level operations.

To achieve narrow scoping and revocability, you should use a service SAS bound to a stored access policy. Stored access policies are supported for service SAS tokens on blob containers, file shares, queues, and tables. They allow you to define constraints such as start time, expiry time, and permissions on the server side. When you associate a service SAS with a stored access policy, the SAS inherits these constraints. Crucially, you can update or delete the stored access policy to revoke or modify access for all SAS tokens bound to it, without needing to regenerate the storage account keys.

## Configure an expiration policy at the storage account level

Before creating individual SAS tokens, you should configure a SAS expiration policy on the storage account. This policy sets a recommended upper limit for the validity interval of service SAS and account SAS tokens. If a user creates a SAS with a validity interval exceeding this limit, they will see a warning. This acts as a guardrail against accidentally creating long-lived tokens.

To configure this policy, you may need to rotate the storage account keys first. If the `keyCreationTime` property for either account key is null, the policy configuration will fail. You can check this property using the Azure portal or CLI. If rotation is required, regenerate both keys before proceeding.

You can set the expiration policy using the Azure portal, PowerShell, or Azure CLI. In the portal, navigate to your storage account, select **Configuration** under Settings, and enable the setting for **Allow recommended upper limit for shared access signature (SAS) expiry interval**. Specify the time values for the recommended interval. If the setting is grayed out, it indicates that key rotation is required.

Using the Azure CLI, you can set the policy with the `az storage account update` command:

```azurecli-interactive
az storage account update \
  --name <storage-account> \
  --resource-group <resource-group> \
  --sas-exp <days>.<hours>:<minutes>:<seconds>
```

For example, to set a maximum validity of 1 day, 12 hours, 5 minutes, and 6 seconds, use `1.12:05:06`. To verify the policy, query the storage account properties:

```azurecli-interactive
az storage account show \
  --name <storage-account> \
  --resource-group <resource-group> \
  --query "{SasPolicy:sasPolicy}"
```

This policy applies to both service SAS and account SAS tokens signed with the account key. It does not apply to user delegation SAS tokens, which are secured by Microsoft Entra ID. However, configuring this policy is still a best practice for any service SAS or account SAS you might generate.

## Define a stored access policy for granular control

A stored access policy provides an additional layer of control over service SAS tokens. It allows you to group SAS tokens and manage their constraints centrally. You can define the start time, expiry time, and permissions for the policy. When you create a service SAS, you can reference this policy by its identifier. The SAS then inherits the constraints defined in the policy.

Stored access policies are supported for blob containers, file shares, queues, and tables. They are not supported for account SAS or user delegation SAS. To create a stored access policy, you must authorize the operation using Shared Key authentication with the account access keys. Microsoft Entra credentials are not supported for creating stored access policies.

For example, to create a stored access policy on a blob container using the .NET client library, you can use the `BlobContainerClient.SetAccessPolicyAsync` method. The following code creates a policy named `mysignedidentifier` with read and write permissions, valid for one day:

```csharp
async static Task CreateStoredAccessPolicyAsync(string containerName)
{
    string connectionString = "";

    // Use the connection string to authorize the operation to create the access policy.
    // Azure AD does not support the Set Container ACL operation that creates the policy.
    BlobContainerClient containerClient = new BlobContainerClient(connectionString, containerName);

    try
    {
        await containerClient.CreateIfNotExistsAsync();

        // Create one or more stored access policies.
        List<BlobSignedIdentifier> signedIdentifiers = new List<BlobSignedIdentifier>
        {
            new BlobSignedIdentifier
            {
                Id = "mysignedidentifier",
                AccessPolicy = new BlobAccessPolicy
                {
                    StartsOn = DateTimeOffset.UtcNow.AddHours(-1),
                    ExpiresOn = DateTimeOffset.UtcNow.AddDays(1),
                    Permissions = "rw"
                }
            }
        };
        // Set the container's access policy.
        await containerClient.SetAccessPolicyAsync(permissions: signedIdentifiers);
    }
    catch (RequestFailedException e)
    {
        Console.WriteLine(e.ErrorCode);
        Console.WriteLine(e.Message);
    }
}
```

Note that the start time should be set carefully to account for clock skew. Microsoft recommends setting the start time to at least 15 minutes in the past or not setting it at all to ensure immediate validity. The expiry time should be set to a near-term value to limit the blast radius if a token is compromised.

## Generate a narrowly scoped service SAS

Once the stored access policy is in place, you can generate a service SAS that references it. This SAS will inherit the permissions and time constraints defined in the policy. By referencing the policy, you can revoke access to all associated SAS tokens by updating or deleting the policy.

To generate a service SAS, you can use the Azure Storage client libraries for your preferred language. The SAS token will include the policy identifier, which links it to the stored access policy. When the client application uses this SAS token to access the storage resource, Azure Storage validates the token against the policy.

It is important to grant the least possible privileges. If a user only needs read access to a single blob, grant read access to that specific blob, not to the entire container. This minimizes the impact if the SAS is leaked. Also, always use HTTPS to distribute the SAS token to prevent interception.

## Monitor and verify

After configuring the expiration policy and creating stored access policies, you should monitor for policy violations. You can create a diagnostic setting to send storage logs to an Azure Log Analytics workspace. The logs include a `SasExpiryStatus` property that indicates whether a SAS token's validity interval exceeds the recommended upper limit.

You can query these logs to identify violations:

```kusto
StorageBlobLogs 
| where SasExpiryStatus startswith "Policy violated"
| summarize count() by AccountName, SasExpiryStatus
```

Additionally, you can use Azure Policy to ensure that storage accounts have SAS expiration policies configured. The built-in policy definition **Storage accounts should have shared access signature (SAS) policies configured** can be assigned to your subscription or resource group to enforce this requirement.

By combining stored access policies with account-level expiration policies, you create a robust mechanism for delegating access that is both secure and manageable. You can revoke access instantly by modifying the policy, and you limit the validity window of any token, reducing the risk of unauthorized access if a token is compromised.

To verify your setup, generate a service SAS bound to your stored access policy and attempt to access a resource. Then, update the stored access policy to revoke permissions and verify that the SAS token is no longer valid. This confirms that the revocation mechanism is working as expected.

### Diagram
{
  "title": "SAS Revocation Flow",
  "nodes": [
    "Storage Account",
    "Stored Access Policy",
    "Service SAS Token",
    "Client Application",
    "Azure Storage Service"
  ]
}


References for Create a narrowly scoped shared access signature: [Grant limited access to data with shared access signatures (SAS)](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview), [Configure an expiration policy for shared access signatures (SAS)](https://learn.microsoft.com/en-us/azure/storage/common/sas-expiration-policy), [Create a stored access policy with .NET](https://learn.microsoft.com/en-us/azure/storage/common/storage-stored-access-policy-define-dotnet).
