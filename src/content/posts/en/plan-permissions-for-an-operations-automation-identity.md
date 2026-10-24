---
title: "Plan permissions for an operations automation identity"
description: "Separate Automation account operational roles from managed identity resource permissions to enforce least privilege."
pubDate: 2026-01-17
category: governance
tags: ["azure-automation", "managed-identities", "rbac", "least-privilege", "security"]
translationKey: plan-permissions-for-an-operations-automation-identity
draft: false
---

An automation identity requires two distinct sets of permissions: access to the Automation account itself, and access to the resources it manages. Confusing these scopes is a common source of over-permissioning. The Automation account permissions control who can author, schedule, and run the code. The target resource permissions control what the code can actually do when it executes.

Start by defining the operational scope. Who needs to manage the runbooks? Who needs to trigger them? And what specific actions must the runbook perform on the target resources? Answering these questions separately prevents the temptation to assign broad roles like Contributor or Owner to the automation identity.

[![Automation Identity Permission Flow](/images/posts/2026/azc-267-checkpoints.svg)](/images/posts/2026/azc-267-checkpoints.svg)

## Define the operational roles

Azure Automation provides built-in roles that separate the concerns of managing the account from managing the jobs. The Automation Contributor role allows you to manage all resources in the Automation account, but excludes modifying other users' access permissions. This is suitable for developers who need to update the automation logic.

For operators who only need to execute runbooks without seeing the underlying code or credentials, the Automation Operator role is more appropriate. It allows viewing runbook names and properties, and creating, stopping, resuming, and suspending jobs, as well as reading job streams and output. If you need finer control, you can combine the Automation Job Operator and Automation Runbook Operator roles. The Job Operator handles job lifecycle (start, stop, resume), while the Runbook Operator restricts visibility to just the runbook name and properties.

These roles are assigned at the Automation account scope. They do not grant any permissions on the resources the runbook interacts with. A user with the Automation Operator role can start a runbook that stops a virtual machine, but they cannot stop the machine directly if they lack the Virtual Machine Contributor role on that VM.

## Enable and assign the managed identity

The runbook itself needs an identity to authenticate against target resources. A system-assigned managed identity is the preferred method. It is automatically managed by Azure and tied to the lifecycle of the Automation account. To enable it, you can use the Azure portal, PowerShell, or an ARM template.

Using PowerShell, the command is straightforward:

```powershell
# Illustrative example: Enable system-assigned managed identity
Set-AzAutomationAccount `
    -ResourceGroupName "MyResourceGroup" `
    -Name "MyAutomationAccount" `
    -AssignSystemIdentity
```

Once enabled, the Automation account has a principal ID in Microsoft Entra ID. You must then assign the appropriate role to this principal ID on the target resources. This is where the principle of least privilege is critical. If the runbook only needs to read from a Key Vault, assign the Key Vault Reader role. If it needs to start and stop VMs, assign the Virtual Machine Contributor role to the specific VM or resource group.

To assign an Azure role you must have Microsoft.Authorization/roleAssignments/write permission such as User Access Administrator or Owner on the scope where the role assignment is created (e.g., the subscription or resource group containing the target resource). The assignment is done using `New-AzRoleAssignment` with the managed identity's object ID.

## Verify the separation

A common mistake is to assume that because the automation identity has Contributor access to the Automation account, it has broader permissions elsewhere. This is not the case. The Automation account permissions are strictly scoped to the Automation service. The target resource permissions are independent.

To verify this separation:

1.  Check the role assignments on the Automation account. Ensure only the necessary operational roles (Automation Contributor, Automation Operator) are assigned to users or groups.
2.  Check the role assignments on the target resources. Ensure the managed identity has only the permissions required for the runbook's specific tasks.
3.  Test the runbook execution. Confirm that it can perform the required actions and fails appropriately when attempting actions outside its scope.

This approach ensures that your automation is both secure and maintainable. By separating operational access from resource access, you reduce the risk of accidental changes and make it easier to audit who can do what.

## Considerations for specific workloads

If your runbooks interact with Log Analytics workspaces, you may need Log Analytics Contributor or Reader roles. These roles allow reading monitoring data and editing monitoring settings, which is separate from the Automation account's internal resources. Note that the Log Analytics Contributor role can create and configure Automation accounts, which is a broad permission that should be assigned with caution to prevent unauthorized resource creation.

Always review the specific permissions required for the services your runbooks interact with. The built-in roles provide a good starting point, but custom roles may be necessary for more granular control. The key is to start with the minimum permissions required and expand only as needed.

References for Plan permissions for an operations automation identity: [Manage role permissions and security in Azure Automation](https://learn.microsoft.com/en-us/azure/automation/automation-role-based-access-control), [Using a system-assigned managed identity for an Azure Automation account](https://learn.microsoft.com/en-us/azure/automation/enable-managed-identity-for-automation), [Roles and Permissions in Azure Update Manager](https://learn.microsoft.com/en-us/azure/update-manager/roles-permissions).
