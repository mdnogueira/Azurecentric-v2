---
title: "Check permissions when a security plugin cannot retrieve data"
description: "Troubleshoot Security Copilot plugin data retrieval failures by verifying data-plane access for the plugin's execution identity."
pubDate: 2026-06-06
category: governance
tags: ["security-copilot", "plugins", "permissions", "troubleshooting", "azure-identity"]
translationKey: check-permissions-when-a-security-plugin-cannot-retrieve-data
draft: false
---

A Security Copilot plugin returns empty results or errors when querying a data source. The plugin configuration appears correct, the connector is enabled, and the syntax is valid. The first thing to check is not the plugin code, but the permissions under which the plugin runs.

Microsoft Security Copilot uses plugins to extend its capabilities. These plugins connect to external data sources, such as Azure resources, to enrich analysis. When a plugin cannot retrieve data, it is often because the identity executing the query lacks the necessary permissions on the target resources. This is a common point of confusion: having permission to manage the plugin does not imply permission to read the data it accesses.

## Understand the permission boundary

Security Copilot plugins operate within a specific identity context. This identity needs access to the data sources defined in the plugin configuration. If the identity lacks read access to the target resources, the plugin will fail to retrieve data, regardless of how well the plugin is configured.

The Security Copilot plugin overview explains how plugins connect to data sources. It highlights that plugins require appropriate permissions to access the underlying data. This is a critical distinction: the plugin's ability to function depends on the permissions of the identity it uses to query the data, not just the permissions of the user who created the plugin.

## Verify the plugin's execution identity

The first step is to identify the identity used by the plugin. This is typically a managed identity associated with the Security Copilot instance or a service principal configured in the plugin settings. Check the plugin configuration to see which identity is specified for data access.

If the plugin uses a managed identity, ensure that this identity has been granted the necessary roles on the target resources. For example, if the plugin queries Azure Monitor logs, the identity needs the `Log Reader` role on the Log Analytics workspace. If it queries Azure Resource Graph, the identity needs the `Reader` role on the relevant subscriptions or resource groups.

## Check data-plane access

Once you have identified the execution identity, verify its permissions on the target resources. Use the Azure portal or Azure CLI to check the role assignments for the identity on the specific resources the plugin needs to access.

For Azure resources, you can use the following command to check role assignments for a managed identity:

```bash
az role assignment list --assignee <managed-identity-client-id> --scope /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>
```

Replace `<managed-identity-client-id>`, `<subscription-id>`, and `<resource-group-name>` with the appropriate values. This command lists the roles assigned to the managed identity within the specified scope. Ensure that the identity has the necessary read permissions for the resources the plugin queries.

If the identity lacks the required permissions, assign the appropriate roles. For example, to grant the `Reader` role on a resource group:

```bash
az role assignment create --assignee <managed-identity-client-id> --role Reader --scope /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>
```

## Test the plugin after permission updates

After updating the permissions, test the plugin again. Trigger the plugin in Security Copilot and verify that it can now retrieve the expected data. If the plugin still fails, re-check the permissions and ensure that the changes have propagated. Permission updates can take a few minutes to take effect.

If the plugin continues to fail, consider other potential issues, such as network connectivity, data source availability, or plugin configuration errors. However, in most cases, insufficient permissions are the root cause of data retrieval failures.

## Common pitfalls

- **Confusing control-plane and data-plane permissions**: Having permission to manage the plugin does not imply permission to read the data it accesses. Always verify data-plane permissions separately.
- **Assuming default permissions**: Managed identities do not automatically have read access to all resources. Explicit role assignments are required.
- **Ignoring scope limitations**: Role assignments are scoped. Ensure that the permissions are granted at the correct scope (subscription, resource group, or resource level).

By carefully verifying and updating the permissions of the plugin's execution identity, you can resolve most data retrieval failures. This approach ensures that the plugin has the necessary access to function correctly, allowing Security Copilot to provide accurate and enriched analysis.

References for Check permissions when a security plugin cannot retrieve data: [README](https://github.com/Azure/Security-Copilot/blob/546fc8520e9443e311cc9df30ab5e0ac79301a9f/README.md).
