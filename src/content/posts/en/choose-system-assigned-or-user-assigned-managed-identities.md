---
title: "Choose system-assigned or user-assigned managed identities"
description: "Compare system-assigned and user-assigned managed identities to decide which fits your workload lifecycle and permission requirements."
pubDate: 2024-04-21
category: governance
tags: ["managed-identities", "azure-security", "entra-id", "best-practices", "authentication"]
translationKey: choose-system-assigned-or-user-assigned-managed-identities
draft: false
---

You are building an application that needs to access Azure resources securely, and you have reached the point where you must choose between a system-assigned or a user-assigned managed identity. The decision is not about which is technically superior, but which aligns with your resource lifecycle and permission management strategy. Both options eliminate the need to store credentials in your code, but they behave differently when resources are created, deleted, or shared.

## Understand the lifecycle implications

A system-assigned managed identity is created when you enable the identity on a specific Azure resource, such as a Virtual Machine or an App Service. The identity is a service principal of a special type in Microsoft Entra ID. Its name is always the same as the name of the Azure resource it is created for. For a deployment slot, the name is `<app-name>/slots/<slot-name>`.

The critical constraint is the shared lifecycle. When the parent resource is deleted, Azure automatically deletes the service principal. This is convenient for simple, ephemeral workloads where the identity should not outlive the resource. However, it means you cannot reuse the identity across different resources or maintain permissions if the resource is replaced.

A user-assigned managed identity is created as a standalone Azure resource. You create it separately, and then you assign it to one or more Azure resources. The service principal is managed independently of the resources that use it. You must explicitly delete the user-assigned identity when you no longer need it.

This independent lifecycle is useful when resources are recycled frequently, but you want permissions to stay consistent. For example, if you have a set of virtual machines that are frequently replaced as part of an auto-scaling or update process, a user-assigned identity allows you to grant permissions once to the identity, and any new VM associated with it inherits those permissions immediately. The identity persists across the lifecycle of the individual VMs.

## Evaluate sharing and scope

System-assigned identities cannot be shared. A system-assigned identity can only be associated with a single Azure resource. If you have an application that runs on multiple virtual machines and needs to access the same storage account, you would need to create a separate system-assigned identity for each VM and grant permissions to each one individually.

User-assigned identities can be shared. The same user-assigned managed identity can be associated with more than one Azure resource. This simplifies permission management for distributed workloads. You grant permissions to the user-assigned identity once, and any resource associated with it can use those permissions.

This is particularly relevant for microservices architectures or multi-tier applications where different components might need to access the same backend resources. Instead of managing multiple identities and role assignments, you manage one identity and associate it with the necessary resources.

## Consider permission management and pre-authorization

With system-assigned identities, you authorize the identity to have access to one or more services at the resource level. The permissions are tied to the specific resource instance. If you need to change permissions, you update the role assignment for that specific identity.

With user-assigned identities, you can pre-authorize the identity to a secure resource as part of a provisioning flow. This is useful when you want to set up permissions before the resources that will use the identity are created. For example, you can create the user-assigned identity, grant it access to a Key Vault or a Storage Account, and then create the virtual machines or App Services that will use it. The resources inherit the permissions immediately upon association.

This decoupling of identity management from resource provisioning can simplify automation and reduce the risk of permission errors during deployment. It also allows you to rotate or manage permissions for the identity without affecting the resources that use it, as long as the association remains valid.

## Choose based on your workload

If your workload is contained within a single Azure resource and you do not need to share the identity with other resources, a system-assigned managed identity is simpler. It requires less setup and management overhead. You enable the identity on the resource, and you are done. The lifecycle is automatic, and you do not need to manage a separate identity resource.

If your workload runs on multiple resources, or if you need to maintain consistent permissions across resources that are frequently recreated, a user-assigned managed identity is more appropriate. It allows you to share the identity across resources and manage permissions independently of the resource lifecycle.

For example, consider an application that uses an App Service to access a Storage Account and a Key Vault. If the App Service is part of a larger ecosystem where other resources also need access to the same Storage Account and Key Vault, a user-assigned identity allows you to grant permissions once to the identity and associate it with the App Service and any other resources that need access. If you used a system-assigned identity, you would need to grant permissions to the App Service identity, and then create and manage separate identities for any other resources.

## Configure and use the identity

Once you have chosen the type of managed identity, you need to configure it and use it in your application. The process involves creating the identity, assigning it to the resource, granting permissions to the target resources, and using the identity in your code.

For a user-assigned managed identity, you first create the identity as a standalone resource. You need a role such as "Managed Identity Contributor" to create a new user-assigned managed identity. You can do this through the Azure portal, Azure CLI, PowerShell, or ARM templates.

```azurecli
az identity create --name <name of the identity> --resource-group <name of the resource group>
```

Take a note of the `clientId` and the `principalId` values that are returned. You will use `principalId` when adding permissions, and `clientId` in your application's code.

Next, you associate the user-assigned managed identity with your Azure resource. You need "Write" permissions to configure an Azure resource to have a system-assigned identity, and a role such as "Managed Identity Operator" to associate a user-assigned identity with an Azure resource.

In the Azure portal, you locate the resource, select the Identity link, select the "User-assigned" tab, and then select "Add" to choose the user-assigned identity you created earlier.

After associating the identity with the resource, you need to grant it permissions to the target resources. You need a role such as "User Access Administrator" or "Owner" for the target resource to add role assignments. Ensure you are granting the least privilege required for the application to run.

```azurecli
az role assignment create --assignee "<Object/Principal ID of the managed identity>" \
--role "<Role name or Role ID>" \
--scope "/subscriptions/{subscriptionId}/resourcegroups/{resourceGroupName}/providers/{providerName}/{resourceType}/{resourceSubType}/{resourceName}"
```

Finally, you use the managed identity in your code. The recommended method is to use the Azure Identity library for your preferred programming language. The library acquires tokens for you, making it simple to connect to target resources without handling credentials.

If you are using user-assigned managed identities, you should explicitly specify the user-assigned managed identity you wish to authenticate with by passing in the identity's client ID as a parameter. You can retrieve the client ID by browsing to the identity in the portal.

```csharp
using Azure.Identity;
using Azure.Storage.Blobs;

// Specify the Client ID if using user-assigned managed identities
var clientID = Environment.GetEnvironmentVariable("Managed_Identity_Client_ID");
var credentialOptions = new DefaultAzureCredentialOptions
{
    ManagedIdentityClientId = clientID
};
var credential = new DefaultAzureCredential(credentialOptions);                        

var blobServiceClient1 = new BlobServiceClient(new Uri("<URI of Storage account>"), credential);
```

The `DefaultAzureCredential` type automatically attempts to authenticate via multiple mechanisms, including environment variables or an interactive sign-in. It can be used in your development environment using your own credentials, and in your production Azure environment using a managed identity, with no code changes required.

## Verify the configuration

To verify that your managed identity is configured correctly, check the identity settings on your Azure resource. Ensure that the correct identity (system-assigned or user-assigned) is enabled and associated. Check the role assignments on the target resources to confirm that the managed identity has the necessary permissions.

Test the connection from your application to the target resource using the managed identity. If you encounter authentication errors, check the Azure Activity logs and Microsoft Entra ID sign-in logs for details. These logs provide information about the create, read, update, and delete operations on managed identities, as well as sign-in activity.

By carefully considering the lifecycle, sharing, and permission management requirements of your workload, you can choose the right type of managed identity and configure it securely and efficiently.


References for Choose system-assigned or user-assigned managed identities: [Managed identities for Azure resources](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview), [Developer introduction and guidelines](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview-for-developers).
