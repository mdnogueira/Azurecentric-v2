---
title: "Replace a service principal secret with workload identity federation"
description: "Replace service principal secrets with workload identity federation by linking an external OIDC provider to an Azure managed identity."
pubDate: 2024-08-05
category: governance
tags: ["workload-identity", "managed-identities", "azure-entra-id", "ci-cd", "security"]
translationKey: replace-a-service-principal-secret-with-workload-identity-federation
draft: false
---

You have a service principal with a client secret that you need to replace. The goal is to remove the secret from your application configuration and source control, replacing it with a federated identity that authenticates using an OpenID Connect (OIDC) token issued by your CI/CD pipeline. This removes the need to rotate secrets and reduces the risk of credential leakage.

Workload identity federation allows an external identity provider (IdP) to authenticate to Microsoft Entra ID. In this case, your CI/CD system (GitHub Actions, GitLab CI, etc.) acts as the IdP. The Azure resource (e.g., an App Service, Kubernetes cluster, or virtual machine) uses a managed identity. The link between the two is a federated credential on the service principal associated with that managed identity.

## Prerequisites and Permissions

Before starting, ensure you have the following:

1.  **An Azure resource** that supports managed identities (e.g., App Service, Kubernetes, VM).
2.  **A managed identity** assigned to that resource. This can be system-assigned or user-assigned. User-assigned identities are recommended for most scenarios as their lifecycle is independent of the resource [Developer introduction and guidelines](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview-for-developers).
3.  **A service principal** in Microsoft Entra ID. If you are using a user-assigned managed identity, the service principal is created automatically. If you are using a system-assigned identity, the service principal is also created automatically. You need the **Application Administrator** or **Cloud Application Administrator** role, or a custom role with `Application.Read.All` and `Application.ReadWrite.All` permissions to configure federated credentials [Secure hybrid access with Microsoft Entra integration](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/secure-hybrid-access-integrations#apply-conditional-access-policies).
4.  **An OIDC-compatible CI/CD pipeline**. The pipeline must be able to issue an OIDC token and expose specific claims (e.g., `sub`, `iss`, `aud`).
5.  **The Azure CLI** installed and logged in with sufficient permissions.

## Step 1: Configure the Managed Identity

First, ensure your Azure resource has a managed identity. If you are using a user-assigned identity, create it:

```bash
az identity create --name <identity-name> --resource-group <resource-group-name>
```

Note the `clientId` and `principalId` from the output. If you are using a system-assigned identity, skip this step and use the resource's system-assigned identity.

Next, assign the managed identity to your Azure resource. For an App Service, this is done in the **Identity** blade in the Azure portal or via CLI:

```bash
az webapp identity assign --name <app-service-name> --resource-group <resource-group-name> --identities <user-assigned-identity-client-id>
```

## Step 2: Configure the Federated Credential

The federated credential links the external IdP to the service principal. You need to provide the following details:

*   **Issuer URL**: The OIDC issuer URL of your IdP (e.g., `https://token.actions.githubusercontent.com` for GitHub Actions).
*   **Subject Claim**: A unique identifier for the workflow or repository (e.g., `repo:<owner>/<repo>:environment:<env>:ref:refs/heads/main`).
*   **Name**: A descriptive name for the credential.

Use the Azure CLI to add the federated credential:

```bash
az ad app federated-credential create \
  --id <service-principal-object-id> \
  --name <credential-name> \
  --issuer <issuer-url> \
  --subject <subject-claim> \
  --audiences <audience-claim> \
  --description <description>
```

For GitHub Actions, the audience is typically `api://AzureADTokenExchange`. The subject claim should be specific to your repository and branch to limit the scope of the federation.

## Step 3: Update the Application Code

Your application code must be updated to use the managed identity instead of the service principal secret. Use the Azure Identity client library for your language. The library automatically handles token acquisition when running in an Azure environment with a managed identity.

For example, in .NET:

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

The `DefaultAzureCredential` class automatically detects the managed identity environment and acquires a token without any secret [Developer introduction and guidelines](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview-for-developers).

## Step 4: Verify the Configuration

1.  **Check the Federated Credential**: Ensure the credential is correctly configured in the Azure portal or via CLI:
    ```bash
    az ad app federated-credential list --id <service-principal-object-id>
    ```
2.  **Test the Pipeline**: Run a pipeline that uses the managed identity. The pipeline should be able to authenticate to Azure resources without a secret.
3.  **Remove the Secret**: Once verified, remove the service principal secret from your application configuration and source control.

## Troubleshooting

*   **Token Acquisition Fails**: Ensure the managed identity is correctly assigned to the resource and the federated credential matches the claims issued by the IdP.
*   **Permission Denied**: Verify that the managed identity has the necessary RBAC roles on the target resource.
*   **Issuer Mismatch**: Ensure the issuer URL in the federated credential matches the IdP's issuer URL exactly.

By following these steps, you can securely replace a service principal secret with workload identity federation, reducing the risk of credential leakage and simplifying identity management.
