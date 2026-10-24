---
title: "Use deployment outputs without exposing secrets"
description: "Prevent secrets from leaking into deployment history by using @secure() outputs or dynamic lookups."
pubDate: 2026-01-07
category: automation
tags: ["bicep", "azure-key-vault", "deployment", "security", "outputs"]
translationKey: use-deployment-outputs-without-exposing-secrets
draft: false
---

You have a Bicep file that deploys a resource requiring a secret, such as a database password or an API key. The natural instinct is to return that value as an output so a downstream pipeline or another team can consume it. The problem is that Azure Resource Manager logs all deployment outputs. Anyone with access to the deployment history can view them, and they remain in the log for the retention period. This turns a temporary credential into a persistent exposure risk.

The solution depends on whether the secret is generated during the deployment or retrieved from an existing resource. In both cases, the goal is to ensure the value never appears in the deployment history or command-line output.

[![Secret Handling Decision Flow](/images/posts/2026/azc-264-checkpoints.svg)](/images/posts/2026/azc-264-checkpoints.svg)

## Mark sensitive outputs as secure

If your Bicep file generates a secret, such as a random password for a new resource, you can mark the output as secure. Bicep supports the `@secure()` decorator for outputs of type `string` or `object`. When you apply this decorator, Azure Resource Manager treats the value as sensitive. It prevents the value from being logged or displayed in the deployment history, the Azure portal, or command-line outputs.

This feature is available in Bicep version 0.35.1 and later. The decorator aligns with the `secureString` and `secureObject` types in ARM templates.

```bicep
@secure()
output generatedPassword string = myPassword
```

If you need to output an array or a number securely, you must wrap it in a `secureObject` or serialize it as a `secureString`, as the decorator is valid only for those two types.

It is important to understand what this decorator does and does not do. It protects the value in the deployment history. It does not encrypt the value at rest in the resource itself. The value is still passed to resources but hidden from logs. If you need to pass this secret to another resource in the same deployment, you can reference the output directly. The security boundary is the logging layer, not the deployment scope.

## Avoid outputs for secrets from existing resources

A common pattern is to look up a secret from an existing resource, such as a storage account key or a Key Vault secret, and output it for use by a dependent resource. The best practice guidance is clear: avoid using Bicep outputs for this purpose. Outputs are logged to the deployment history, and anyone with access to the deployment can view the values.

Instead, use the `existing` keyword to obtain a strongly typed reference to the pre-created resource, and then use the resource's built-in methods to access the secret at deployment time. This approach keeps the secret within the deployment scope and avoids passing it through the output layer.

For example, if you need to configure an Azure Functions app with a storage account key, do not output the key from the storage account deployment. Instead, reference the storage account in the Functions deployment and use the `listKeys()` method.

```bicep
resource storageAccount 'Microsoft.Storage/storageAccounts@2025-06-01' existing = {
  name: storageAccountName
}

var storageAccountConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${listKeys(storageAccount.id, storageAccount.apiVersion).keys[0].value}'

resource functionApp 'Microsoft.Web/sites@2025-03-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  properties: {
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: storageAccountConnectionString
        }
      ]
    }
  }
}
```

This code is an illustrative example of how to avoid outputs for secrets. It demonstrates looking up the key dynamically within the deployment scope. The `listKeys()` method returns the key at deployment time, and it is used directly in the `appSettings` array. It is not exposed as an output.

## Use Key Vault for shared secrets

If the secret needs to be shared across multiple deployments or teams, do not use Bicep outputs to pass it. Instead, store the secret in Azure Key Vault and use the `getSecret` function to retrieve it during deployment.

You can reference a Key Vault defined in another resource group by using the `existing` and `scope` keywords together. This allows you to retrieve the secret without exposing it in the deployment history of the consuming deployment.

```bicep
resource networkingSecretsKeyVault 'Microsoft.KeyVault/vaults@2025-05-01' existing = {
  scope: resourceGroup('Secrets')
  name: 'contosonetworkingsecrets'
}

module exampleModule 'module.bicep' = {
  name: 'exampleModule'
  params: {
    mySecret: networkingSecretsKeyVault.getSecret('mySecret')
  }
}
```

The `getSecret` function retrieves the secret value and passes it to the module as a parameter. If the parameter is marked with `@secure()`, the value will not be logged. This pattern keeps the secret in Key Vault and limits its exposure to the deployment scope.

## Verify the protection

To verify that your secrets are protected, check the deployment history after a successful deployment. If you used `@secure()` on an output, the value should appear as `***` or be omitted entirely in the portal and CLI output. If you used `listKeys()` or `getSecret()`, the value should not appear in the deployment history at all.

If you find that a secret is visible in the deployment history, it is likely because it was passed as an output without the `@secure()` decorator, or it was logged by a custom script or task outside of Bicep. Review the deployment outputs and ensure that all sensitive values are marked as secure or retrieved dynamically.

The key takeaway is to treat deployment history as a public log. If you would not want a colleague to see a value in a log file, do not output it. Use `@secure()` for generated secrets, and use dynamic lookups or Key Vault for shared secrets.

References for Use deployment outputs without exposing secrets: [Outputs in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/outputs), [Use Bicep to manage secrets](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/scenarios-secrets), [Learn best practices when developing Bicep files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/best-practices#template-limits).
