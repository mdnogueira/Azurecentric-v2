---
title: "Protect a workflow secret with Key Vault"
description: "Protect workflow secrets in Azure Logic Apps by using managed identities for Key Vault access and enabling input/output obscuring in run history."
pubDate: 2025-11-19
category: apps
tags: ["logic-apps", "key-vault", "security", "managed-identity", "run-history"]
translationKey: protect-a-workflow-secret-with-key-vault
draft: false
---

You have a workflow that needs to authenticate to a backend service. The most common mistake is storing the credential as plain text in the workflow definition or in a connection string that gets logged. If you do that, anyone with access to the run history can see the secret.

The correct approach is to keep the secret in Azure Key Vault and have the workflow retrieve it at runtime. Azure Logic Apps supports this natively for many connectors, and you can also use the Key Vault action explicitly. To ensure the secret never appears in logs, you must also configure the workflow to obscure the inputs and outputs that carry the secret.

## Store the secret in Key Vault

First, create an Azure Key Vault in your subscription. Store your secret there. Note the secret name and version (if you specify a version, the workflow uses that exact version; if you omit it, the workflow uses the latest version, which can change if you update the secret).

You need to grant the workflow permission to read the secret. The most secure way is to use a managed identity. If your logic app is in a Consumption plan, it can have a system-assigned managed identity. If it is in a Standard plan, it can also use a system-assigned or user-assigned managed identity.

1. Enable a managed identity on your logic app resource.
2. In Key Vault, go to **Access control (IAM)**.
3. Add a role assignment for the **Key Vault Secrets User** role.
4. Select the managed identity from your logic app and assign it to the Key Vault resource.

This setup ensures that only your logic app can retrieve the secret, and no other service or user can, unless they are explicitly granted access.

## Retrieve the secret in the workflow

In your logic app designer, add the **Azure Key Vault** action. Select the **Get secret** operation. You will be prompted to authenticate. Use the managed identity you configured earlier. Enter the Key Vault name and the secret name.

The action returns the secret value as an output. You can then use this output in subsequent actions, such as an HTTP request, by referencing the dynamic content from the Key Vault action.

If you are using a connector that supports managed identity authentication (many built-in connectors do), you might not need the explicit Key Vault action. Instead, you can configure the connection to use the managed identity directly. However, for secrets that are not tied to a specific connector, the explicit Key Vault action is the standard pattern.

## Obscure secrets in run history

Even when you retrieve a secret from Key Vault, you must ensure it does not appear in the run history. Azure Logic Apps provides settings to obscure inputs and outputs for triggers and actions.

For the **Azure Key Vault** action, turn on **Secure Inputs** and **Secure Outputs**. This tells Logic Apps to hide the secret value from the run history and from Log Analytics.

If you pass the secret to a downstream action, such as an HTTP request, you should also turn on **Secure Inputs** for that action. This ensures that the secret value, when used as a parameter, is not logged.

Note that obscuring inputs or outputs has a trade-off: you lose visibility into those values in the run history and in Log Analytics. This is a deliberate security decision. You cannot troubleshoot issues related to the secret value by looking at the run history if it is obscured. You must rely on other diagnostic data.

Some actions do not support obscuring inputs or outputs. For example, the **Compose** action only supports **Secure Inputs**, and if you use obscured outputs as inputs to a Compose action, the Compose action's inputs are hidden, but its outputs are not automatically obscured. You must manually enable **Secure Inputs** on the Compose action if you need to hide its output. However, the Compose action's outputs are not obscured if they are used as inputs to a downstream action that does not have **Secure Inputs** enabled.

## Verify the configuration

To verify that your secret is protected:

1. Run the workflow.
2. Go to the run history for that run.
3. Open the details for the **Azure Key Vault** action and any downstream actions that use the secret.
4. Confirm that the inputs and outputs are obscured (usually shown as `***` or similar).
5. Check that the workflow still functions correctly, meaning the secret was retrieved and used successfully despite being obscured in the logs.

If the secret appears in plain text in the run history, check that you have enabled **Secure Inputs** and **Secure Outputs** on all relevant actions. Remember that obscuring is not automatic; you must configure it explicitly for each action that handles the secret.

This approach ensures that your secrets are protected both in storage (Key Vault) and in transit (managed identity) and at rest in logs (obscuring). It is a standard pattern for securing sensitive data in Azure Logic Apps.

## Cleanup

If you are testing this in a non-production environment, you can delete the logic app, the Key Vault, and the managed identity. Be aware that deleting the Key Vault will permanently delete all secrets stored in it. Ensure you have backups if needed.

For production environments, follow your organization's retention and deletion policies for secrets and identities.

References for Protect a workflow secret with Key Vault: [Secure access and data in workflows](https://learn.microsoft.com/en-us/azure/logic-apps/logic-apps-securing-a-logic-app), [Use Managed Identities in Azure API Management | Microsoft Docs](https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-use-managed-service-identity), [Set up Multiple Connections](https://learn.microsoft.com/en-us/azure/api-management/configure-credential-connection).
