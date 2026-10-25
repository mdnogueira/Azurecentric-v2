---
title: "Troubleshoot a managed identity that cannot reach a resource"
description: "Troubleshoot managed identity access failures by verifying assignment, checking control-plane state, and confirming RBAC scope."
pubDate: 2025-09-04
category: identity-access
tags: ["microsoft-entra-id", "managed-identities", "troubleshooting", "rbac"]
translationKey: troubleshoot-a-managed-identity-that-cannot-reach-a-resource
draft: false
---

A managed identity cannot reach a resource when the identity is not attached to the resource, the target resource rejects the identity, or the identity lacks the necessary permissions. The first thing to check is whether the identity is actually assigned to the resource and whether the target resource accepts that identity. If those are correct, the problem often lies in how the token is requested or how long it takes for permission changes to propagate.

## Verify the identity attachment and type

A managed identity must be explicitly assigned to the resource before it can request tokens. For system-assigned identities, this is a property of the resource itself. For user-assigned identities, the identity must be listed in the resource's identity configuration.

If you are troubleshooting a virtual machine that cannot access a storage account, start by confirming the identity assignment. You can check the identity of a specific VM using Azure CLI:

```azurecli-interactive
az vm show -n <VM Name> -g <Resource Group> --query identity
```

If the resource does not appear in this list, the system-assigned identity is not enabled. If you are using a user-assigned identity, check the resource's configuration in the portal or via CLI to ensure the specific user-assigned identity is attached. A resource with no attached identity cannot request tokens from the Azure Instance Metadata Service (IMDS).

## Check for control-plane state issues

Control-plane operations such as moving resources or transferring subscriptions can leave managed identities in a broken state. If a virtual machine was moved while running, it may continue to run but fail to start after a restart because it uses an outdated managed identity reference. In this case, trigger an update on the VM to refresh the identity URI:

```azurecli-interactive
az vm update -n <VM Name> -g <Resource Group> --set tags.fixVM=1
```

Once the VM starts, remove the tag:

```azurecli-interactive
az vm update -n <VM Name> -g <Resource Group> --remove tags.fixVM
```

If a subscription was transferred between Microsoft Entra directories, managed identities do not update automatically. System-assigned identities must be disabled and re-enabled. User-assigned identities must be deleted, re-created, and re-attached to the resources. This is a known issue documented in the [known issues for managed identities](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/known-issues).

## Confirm RBAC permissions and assignment scope

A managed identity needs specific RBAC permissions on the target resource. Having a role at the control plane does not imply data-plane rights. For example, to read from a storage account, the managed identity must have the `Storage Blob Data Reader` role assigned to it on that storage account.

To assign roles, you need the `Owner` or `User Access Administrator` role on the target resource. You also need `Reader` access to the managed identity itself. If you cannot find the managed identity when searching for a principal, you can search by its service principal name instead.

Check that the role assignment is on the correct resource. A common mistake is assigning the role to the subscription or resource group instead of the specific storage account or key vault. Also, verify that the managed identity is not blocked by Azure Policy. You can prevent the creation of user-assigned managed identities using a policy definition that denies `Microsoft.ManagedIdentity/userAssignedIdentities`.

## Account for token caching and rate limits

Managed identity tokens are cached by the underlying Azure infrastructure for performance and resiliency. The cache lasts for around 24 hours. This means that if you change a managed identity's permissions or group membership, it can take several hours for the changes to take effect. You cannot force a token refresh before its expiry. If you need immediate permission changes, consider using a user-assigned identity with permissions applied directly to the identity rather than through groups.

IMDS has rate limits. Requests to the Managed Identity category are limited to 20 requests per second and 5 concurrent requests. Exceeding this threshold results in 429 responses. If your application makes frequent token requests, ensure it is caching tokens appropriately and not hitting the IMDS rate limit.

If multiple user-assigned identities are attached to a resource, you must specify the identity in the token request. If you do not specify an identity and multiple user-assigned identities exist, the request will fail with the error `Multiple user assigned identities exist, please specify the clientId / resourceId of the identity in the token request`.

## Verify the token request

Ensure that the application is requesting tokens from the correct IMDS endpoint. For Windows VMs, the endpoint is `http://169.254.169.254/metadata/identity/oauth2/token`. For Linux VMs, it is similar. The request must include the `api-version` and the `resource` or `scope` parameter. If you are using a user-assigned identity, include the `client_id` or `resource_id` parameter.

Check the application logs for specific error messages. Common errors include `401 Unauthorized` (permissions issue), `403 Forbidden` (policy or network issue), or `429 Too Many Requests` (rate limit exceeded). If the error is `401`, verify the RBAC assignment. If it is `403`, check for network policies or Azure Policy restrictions. If it is `429`, reduce the frequency of token requests.

If the managed identity is still failing to reach the resource after these checks, consider whether the target resource supports managed identities. Not all Azure services support managed identities. Check the [services that support managed identities](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/managed-identities-status) for compatibility.

Finally, remember that managed identities are soft deleted for 30 days. If you recently deleted a managed identity, it may still exist in a soft-deleted state, which can cause confusion if you try to re-create it with the same name. You cannot restore or permanently delete soft-deleted managed identities.

If you have verified the attachment, permissions, and token request, and the issue persists, review the [frequently asked questions for managed identities](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/managed-identities-faq) for additional troubleshooting steps.
