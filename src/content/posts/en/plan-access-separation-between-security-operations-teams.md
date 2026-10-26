---
title: "Plan access separation between security operations teams"
description: "Separate security and operations access in Microsoft Sentinel using resource-context RBAC and table-level RBAC."
pubDate: 2026-09-23
category: siem-xdr
tags: ["microsoft-sentinel", "rbac", "security-operations", "azure-monitor", "log-analytics"]
translationKey: plan-access-separation-between-security-operations-teams
draft: false
---

You have a Microsoft Sentinel workspace ingesting logs from across your estate. The security operations centre (SOC) needs the full experience to investigate incidents, but the applications teams only need to view logs for the servers they own. You do not want to give the applications teams access to the entire workspace, nor do you want to fragment your security data into separate workspaces unnecessarily.

The solution is to use resource-context RBAC for the applications teams and keep the SOC on standard workspace-level roles. This approach lets you share a single workspace while enforcing strict data boundaries.

## Understand the access models

Microsoft Sentinel runs on top of a Log Analytics workspace. Access to that workspace is controlled by Azure RBAC. By default, if you give a user or group access to the workspace, they can see all the data inside it. This is fine for the SOC, but it is too broad for other teams.

Resource-context RBAC changes this. It allows users to access log data based on the Azure resources they are permitted to view, rather than the workspace itself. If an applications team has Reader access to a specific resource group, they can query the logs for those resources in the Sentinel workspace, even if they have no permissions on the workspace. They cannot see logs for resources they do not own.

For the SOC, you should continue to use standard Microsoft Sentinel roles such as Sentinel Reader, Contributor, or Administrator. These roles grant access to the full workspace and the Sentinel features like analytics rules, playbooks, and incidents. Do not try to restrict the SOC using resource-context RBAC; it is designed for non-SOC teams who need data access without the Sentinel experience.

## Configure resource-context RBAC

Resource-context RBAC is enabled at the Azure Monitor level, not within Sentinel itself. You must enable it before you can assign the relevant permissions.

1.  **Enable resource-context RBAC in Azure Monitor.**
    Follow the guidance in [Manage access to log data and workspaces in Azure Monitor](/azure/azure-monitor/logs/manage-access) to enable resource-context RBAC for the workspace. This setting allows the system to evaluate permissions based on the resource ID attached to the log records.

2.  **Assign permissions to the applications teams.**
    You do not assign a specific "Sentinel" role to these teams. Instead, you assign them the standard Azure RBAC roles they need for their resources, such as **Reader** or **Contributor**, on the specific resource groups or individual resources they manage. 

    For example, grant the "Web Applications Team" the **Reader** role on the `rg-web-prod` resource group. Because resource-context RBAC is enabled, this team can now open the **Logs** blade in Azure Monitor, scope the query to that resource group, and see the logs flowing from those virtual machines into the Sentinel workspace. They cannot scope to other resource groups, nor can they access Sentinel-specific features like **Threat management** or **SOC optimization**. Their experience is limited to querying accessible resources via Azure Monitor Logs.

3.  **Handle non-Azure resources.**
    Azure resources automatically tag their logs with their resource ID. Non-Azure resources, such as Syslog, CEF, or data collected via custom APIs, do not have a built-in resource ID. If you need to apply resource-context RBAC to these, you must explicitly configure the resource ID in the log records. 

    For example, if you are using a Logstash collector, you can set the `azure_resource_id` field in the output configuration to point to the resource group or specific resource that owns the data. If you are using the Log Analytics data collector API, you can pass the resource ID in the `x-ms-AzureResourceId` header. Without this tagging, the system cannot link the log to a resource, and resource-context RBAC will not filter it correctly.

## Use table-level RBAC for specific data types

Resource-context RBAC is ideal for separating data by resource ownership. However, it does not help if you need to separate data by type. For instance, an internal audit team might need access to all **OfficeActivity** logs across the entire organisation, regardless of which resource generated them. They do not need access to the rest of the workspace.

In this case, use table-level RBAC. This feature, managed in Azure Monitor, allows you to grant access to specific tables within the workspace. You can assign the audit team the **Log Reader** role at the table level, restricted only to the **OfficeActivity** table. They will not see any other tables, nor will they have access to the Sentinel features.

You can combine resource-context RBAC and table-level RBAC. An applications team might use resource-context RBAC to view their server logs, while the audit team uses table-level RBAC to view specific security tables across the estate. The SOC retains full workspace access via standard roles.

## Verify the separation

To confirm that the separation is working, perform the following checks:

1.  **Test the applications team access.**
    Sign in as a member of the applications team. Open **Azure Monitor** > **Logs**. Scope the query to the resource group they own. Run a simple query, such as `Heartbeat | take 10`. You should see results. Now, scope the query to a resource group they do not own. The query should return no results, or you should receive an authorization error if you try to access data outside their scope. They should not be able to access the **Microsoft Sentinel** blade in the portal.

2.  **Test the SOC access.**
    Sign in as a SOC analyst with the **Sentinel Contributor** role. Open the **Microsoft Sentinel** blade. You should see the full workspace, including **Threat management**, **SOC optimization**, and **Analytics rules**. You should be able to run queries across the entire workspace without scoping to specific resources.

3.  **Test the audit team access.**
    Sign in as an audit team member. Open **Azure Monitor** > **Logs**. Try to query the **OfficeActivity** table. You should see results. Try to query the **SecurityEvent** table. You should receive an authorization error.

This configuration gives you a single, manageable workspace for security operations while ensuring that other teams only see the data they are authorised to access. It avoids the complexity and cost of multiple workspaces, while still meeting strict data isolation requirements.

If you have non-Azure sources that cannot be tagged with a resource ID, you may need to consider alternative access models, such as table-level RBAC or separate workspaces, as resource-context RBAC will not be able to filter that data effectively.

tags: [microsoft-sentinel, rbac, log-analytics, security-operations, azure-monitor]
diagram:
  title: Access Flow in Shared Sentinel Workspace
  nodes:
    - SOC Team: Has Sentinel Contributor role on Workspace. Sees all data and Sentinel features.
    - Apps Team: Has Reader role on Resource Group. Sees only logs for those resources via Azure Monitor Logs.
    - Audit Team: Has Table-level RBAC on OfficeActivity. Sees only that specific table across the workspace.
    - Sentinel Workspace: Central store. Enforces access rules based on Azure RBAC and table permissions.
    - Non-Azure Sources: Require explicit azure_resource_id tagging to work with resource-context RBAC.
claims:
  - claim: Resource-context RBAC allows users to access log data based on the Azure resources they are permitted to view, rather than the workspace itself.
    source_id: S2
    evidence_span: "Managing access by resource enables you to provide access to specific data only, without the entire Microsoft Sentinel experience."
  - claim: Resource-context RBAC is enabled in Azure Monitor, not within the Microsoft Sentinel blade.
    source_id: S2
    evidence_span: "Enable resource-context RBAC in Azure Monitor. For more information, see Manage access to log data and workspaces in Azure Monitor."
  - claim: Non-Azure resources like Syslog or CEF do not have built-in resource IDs and require manual configuration for resource-context RBAC.
    source_id: S2
    evidence_span: "If your data is not an Azure resource, such as Syslog, CEF, or Microsoft Entra ID data... you'll need to manually configure the resource ID that's used to identify the data."
  - claim: Table-level RBAC is used to grant access to specific tables, such as OfficeActivity, without granting access to the rest of the workspace.
    source_id: S3
    evidence_span: "Table-level RBAC enables you to define specific data types (tables) to be accessible only to a specified set of users."
  - claim: The SOC should use standard Microsoft Sentinel roles for full workspace access, not resource-context RBAC.
    source_id: S2
    evidence_span: "SOC team... Permissions: The entire workspace... Experience: The full Microsoft Sentinel experience."
review_questions:
  - "How does resource-context RBAC interact with Azure Lighthouse when managing workspaces across multiple tenants?"
  - "What are the performance implications of using table-level RBAC versus resource-context RBAC for high-volume log queries?"
  - "Can resource-context RBAC be applied to logs ingested via Microsoft Sentinel data connectors that do not support resource ID tagging?"


References for Plan access separation between security operations teams: [Optimize security operations](https://learn.microsoft.com/en-us/azure/sentinel/soc-optimization/soc-optimization-access), [Manage access to Microsoft Sentinel data by resource](https://learn.microsoft.com/en-us/azure/sentinel/resource-context-rbac), [Workspace architecture best practices for Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/best-practices-workspace-architecture).
