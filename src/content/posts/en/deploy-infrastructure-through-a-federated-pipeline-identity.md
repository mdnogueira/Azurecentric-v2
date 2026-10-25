---
title: "Deploy infrastructure through a federated pipeline identity"
description: "Deploy Bicep via Azure Pipelines using federated identity and bicepparam files."
pubDate: 2025-02-12
category: automation
tags: ["azure-pipelines", "bicep", "federated-identity", "ci-cd", "azure-cli"]
translationKey: deploy-infrastructure-through-a-federated-pipeline-identity
draft: false
---

How do you deploy infrastructure through a federated pipeline identity without managing long-lived service principal secrets? The answer is to combine Azure DevOps federated credentials with the `AzureCLI@2` task and a `bicepparam` file. This approach removes the need for static credentials while keeping the deployment logic declarative and repeatable.

The first thing to establish is the identity. Azure Pipelines supports federated identity credentials, which allow a pipeline to authenticate to Azure using OpenID Connect. This means the pipeline acts as a trusted workload, and you grant it permissions via standard Azure RBAC. You do not need to store a client secret in Azure DevOps variable groups.

## Configure the federated identity

Before writing any pipeline code, you need a service principal that the pipeline can assume. Create a service principal in your Microsoft Entra tenant and note its application (client) ID. Then, add a federated credential to that service principal. The credential should specify the Azure DevOps organization, project, and the specific pipeline resource as the subject. This links the pipeline run directly to the identity.

Next, grant this service principal the necessary permissions in Azure. You need at least Contributor access to the target resource group, or more granular roles depending on your security requirements. The key point is that these permissions are attached to the service principal, not to a static secret.

## Use a bicepparam file for deployment

Bicep parameter files (`bicepparam`) allow you to separate parameter values from the infrastructure definition. When using the `AzureCLI@2` task, you can deploy directly from a `bicepparam` file. This is often cleaner than passing parameters inline, especially for complex deployments.

Your repository should contain a `main.bicep` file defining your resources and a `main.bicepparam` file referencing it. The `bicepparam` file must include a `using` statement to point to the Bicep file. For example:

```bicep
using './main.bicep'

param storagePrefix string = 'mystorage'
param location string = 'westeurope'
```

The pipeline will use the Azure CLI to execute the deployment. The `AzureCLI@2` task handles the authentication using the federated credential configured in the previous step. You specify the service connection name, and the task automatically obtains a token for the service principal.

## Define the pipeline

Create a YAML pipeline in Azure DevOps. The pipeline should trigger on changes to your infrastructure code. Use the `AzureCLI@2` task to run the deployment command.

```yaml
trigger:
  - main

name: Deploy Bicep with Federated Identity

parameters:
  - name: azureServiceConnection
    type: string
    default: 'MyFederatedServiceConnection'

variables:
  vmImageName: 'ubuntu-latest'
  resourceGroupName: 'exampleRG'
  location: 'westeurope'
  bicepParamFile: './main.bicepparam'

pool:
  vmImage: $(vmImageName)

steps:
  - task: AzureCLI@2
    inputs:
      azureSubscription: '${{ parameters.azureServiceConnection }}'
      scriptType: bash
      scriptLocation: inlineScript
      inlineScript: |
        az --version
        az group create --name $(resourceGroupName) --location $(location)
        az deployment group create \
          --resource-group $(resourceGroupName) \
          --parameters $(bicepParamFile) \
          --name DeployPipelineTemplate
```

Replace `MyFederatedServiceConnection` with the name of the Azure service connection you created in Azure DevOps. This connection should be configured to use the federated identity. The `az deployment group create` command uses the `bicepparam` file to deploy the resources. Note that you cannot override parameters inline when using a `bicepparam` file with the Azure CLI task; all parameters must be defined in the file or passed as variables within it.

## Verify the deployment

After committing the pipeline YAML, Azure DevOps will trigger a run. Check the pipeline logs to ensure the `AzureCLI@2` task completes successfully. The logs will show the Azure CLI output, including the deployment status.

If the deployment fails, check the following:

1. **Federated Credential**: Ensure the federated credential is correctly configured and matches the pipeline resource.
2. **RBAC Permissions**: Verify that the service principal has the necessary permissions in the target resource group.
3. **Bicep Syntax**: Check for syntax errors in the `main.bicep` and `main.bicepparam` files.

Once verified, the infrastructure is deployed using a secure, secretless identity. This method reduces the risk of credential leakage and simplifies the management of deployment permissions.

tags: [azure-pipelines, bicep, federated-identity, ci-cd, azure-cli]
diagram:
  title: Federated Identity Deployment Flow
  nodes:
    - "Pipeline Trigger"
    - "Azure DevOps OIDC Request"
    - "Microsoft Entra ID Token Issuance"
    - "Azure CLI Authentication"
    - "Bicep Deployment Execution"
claims:
  - claim: "Federated identity allows pipelines to authenticate without secrets."
    source_id: "S2"
    evidence_span: "Generate deployment credentials... Configure the GitHub secrets... create-secrets-with-openid.md"
  - claim: "AzureCLI task supports bicepparam files for deployment."
    source_id: "S1"
    evidence_span: "The az deployment group create command requires only a bicepparam file."
  - claim: "Role assignments in Bicep require deterministic GUID names."
    source_id: "S3"
    evidence_span: "name: guid(resourceGroup().id, principalId, contributorRoleDefinition.id)"
review_questions:
  - "How does the pipeline handle parameter overrides if needed?"
  - "What are the specific RBAC roles required for different resource types?"

References for Deploy infrastructure through a federated pipeline identity: [CI/CD with Azure Pipelines, Bicep, and bicepparam files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/add-template-to-azure-pipelines), [Deploy Bicep files by using GitHub Actions](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-github-actions), [Create Azure RBAC resources by using Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/scenarios-rbac).
