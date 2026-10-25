---
title: "Export a small Azure resource inventory with PowerShell"
description: "Export Azure Policy definitions, initiatives, and assignments to JSON using PowerShell for backup or policy-as-code workflows."
pubDate: 2026-08-22
category: governance
tags: ["azure-policy", "powershell", "governance", "policy-as-code", "export"]
translationKey: export-a-small-azure-resource-inventory-with-powershell
draft: false
---

You need a copy of your Azure Policy definitions, initiatives, and assignments. Perhaps you are backing up your governance structure, migrating to a new tenant, or treating policy as code. The Azure portal no longer supports exporting policy resources directly to GitHub, so the command line is the reliable path.

The first thing to check is whether you are looking for a single object or a full inventory. Azure Policy resources—definitions, initiatives (set definitions), and assignments—are distinct types. You export each type individually using its specific cmdlet. You cannot dump everything into one file with a single command; you must query each type and save the results separately.

## Prerequisites and permissions

You need the `Az.Resources` module installed. If you are using a managed identity or service principal, ensure the identity has at least Reader access to the scope where the policies are defined (management group, subscription, or resource group). To register the `Microsoft.PolicyInsights` resource provider, which is required for compliance state queries, you need Contributor or Owner permissions on the subscription.

```powershell
# Check if the module is available
Get-Module -ListAvailable Az.Resources

# Connect to your Azure tenant
Connect-AzAccount
```

If you are working in a multi-tenant environment, ensure you are connected to the correct directory. If you have multiple subscriptions, set the context:

```powershell
Get-AzSubscription
Set-AzContext -SubscriptionId 'Exampleyoursubscriptionid'
```

## Exporting a single definition

Each policy definition has a unique `Name` property, which is often a GUID, not the `DisplayName`. Using the display name in the `Name` parameter will fail. The official documentation provides a built-in definition ID for testing: `b2982f36-99f2-4db5-8eff-283140c09693` (Storage accounts should disable public network access).

To export a single definition to JSON:

```powershell
# Illustrative example: Export a specific definition
Get-AzPolicyDefinition -Name 'b2982f36-99f2-4db5-8eff-283140c09693' | 
    Select-Object -Property * | 
    ConvertTo-Json -Depth 10 | 
    Out-File -FilePath './policy-definition.json' -Encoding utf8
```

The `-Depth 10` parameter in `ConvertTo-Json` is critical. Policy definitions are nested objects; the default depth often truncates the output, resulting in incomplete JSON that cannot be re-imported or used effectively.

## Exporting all definitions and assignments

For a full inventory, you can export all definitions and assignments into a single JSON array. This is useful for creating a baseline or backing up your governance structure.

```powershell
# Illustrative example: Export all definitions to a single file
Get-AzPolicyDefinition | 
    Select-Object -Property * | 
    ConvertTo-Json -Depth 10 | 
    Out-File -FilePath './all-definitions.json' -Encoding utf8

# Illustrative example: Export all assignments to a single file
Get-AzPolicyAssignment | 
    Select-Object -Property * | 
    ConvertTo-Json -Depth 10 | 
    Out-File -FilePath './all-assignments.json' -Encoding utf8
```

Note that `Get-AzPolicyAssignment` returns assignments at the current scope. If you need assignments from child scopes, you may need to iterate through management groups or subscriptions first. The `Name` property of an assignment is also a GUID or a custom name you assigned, so using it as a filename is safe.

## Exporting initiatives (set definitions)

Initiatives are groups of policy definitions. They are exported using `Get-AzPolicySetDefinition`:

```powershell
# Illustrative example: Export all initiatives to a single file
Get-AzPolicySetDefinition | 
    Select-Object -Property * | 
    ConvertTo-Json -Depth 10 | 
    Out-File -FilePath './all-initiatives.json' -Encoding utf8
```

## Verification

After exporting, verify the JSON files are valid and complete. Open one of the definition files and check that the `properties` section includes `parameters`, `policyRule`, and `metadata`. If the file is truncated, increase the `-Depth` parameter.

You can also use Azure Resource Graph to query policy resources at scale. The portal’s Resource Graph explorer allows you to download query results to CSV, which is useful for a high-level inventory. However, for policy-as-code workflows, the JSON export is preferred because it preserves the full object structure.

## Cleanup

If you created any test assignments or definitions during this process, remove them to avoid clutter:

```powershell
# Remove a test assignment
Remove-AzPolicyAssignment -Name 'test-assignment' -Scope '/subscriptions/Examplesubscriptionid'

# Disconnect
Disconnect-AzAccount
```

The exported JSON files are now available for version control, backup, or migration. Remember that policy assignments are tied to their scope; when re-importing, ensure the target scope exists and has the necessary permissions.


References for Export a small Azure resource inventory with PowerShell: [Export Azure Policy resources](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/export-resources), [Quickstart: Create policy assignment using Azure PowerShell](https://learn.microsoft.com/en-us/azure/governance/policy/assign-policy-powershell), [Quickstart: Create policy assignment using Azure CLI](https://learn.microsoft.com/en-us/azure/governance/policy/assign-policy-azurecli).
