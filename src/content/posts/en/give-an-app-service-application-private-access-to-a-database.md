---
title: "Give an App Service application private access to a database"
description: "Secure App Service database access using private endpoints for network isolation and managed identities for authentication."
pubDate: 2024-10-08
category: apps
tags: ["app-service", "private-endpoint", "managed-identity", "azure-sql", "vnet-integration", "service-connector"]
translationKey: give-an-app-service-application-private-access-to-a-database
draft: false
---

You need an App Service application to talk to a database, but the connection must stay within your private network and the application must not carry database passwords. This requires two distinct controls: a private network path and an identity-based authentication mechanism. One handles where the traffic goes; the other handles who is allowed in.

The first step is establishing the private network path. App Service supports private endpoints, which place a network interface for your app inside a subnet of your virtual network. This allows the app to be reached only from that private network, eliminating public internet exposure for that specific connection [Connect privately to an App Service apps using private endpoint](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint). However, a private endpoint on the App Service app itself is for *incoming* traffic to the app. It does not automatically route the app’s *outgoing* traffic to a database through the virtual network. For that, you need virtual network integration, which injects outgoing traffic from the app into a specified subnet [Connect privately to an App Service apps using private endpoint](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint).

[![App Service Private Database Access Flow](/images/posts/2024/azc-101-checkpoints.svg)](/images/posts/2024/azc-101-checkpoints.svg)

Crucially, the subnet used for virtual network integration cannot be the same subnet used for the private endpoint. This is a hard limitation of the virtual network integration feature [Connect privately to an App Service apps using private endpoint](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint). You must plan for at least two subnets: one for the private endpoint NIC and another for the VNet integration. If your app is hosted on an IsolatedV2 plan (App Service Environment v3), you must first enable private endpoint support at the App Service Environment level before creating the endpoint [Connect privately to an App Service apps using private endpoint](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint).

Once the network path is defined, you must handle authentication. The most secure way to connect to Azure SQL Database, Azure Database for MySQL, or Azure Database for PostgreSQL is using managed identities. This eliminates secrets from your connection strings. App Service provides a system-assigned or user-assigned managed identity that can be granted access to the database [Tutorial: Access Azure databases with managed identity](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-azure-database).

## Configure the network path

You need a virtual network with at least two subnets. Let’s assume you have `subnet-private-endpoint` and `subnet-vnet-integration`.

1.  **Create the Private Endpoint:** Create a private endpoint for your App Service app in `subnet-private-endpoint`. This gives your app a private IP address in that subnet. The DNS for your app (`<app-name>.azurewebsites.net`) will resolve to this private IP via a private DNS zone (`privatelink.azurewebsites.net`) [Connect privately to an App Service apps using private endpoint](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint).
2.  **Enable Virtual Network Integration:** In the App Service configuration, enable virtual network integration and point it to `subnet-vnet-integration`. This ensures that when your app connects to the database, the traffic traverses the virtual network [Connect privately to an App Service apps using private endpoint](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint).
3.  **Disable Public Access:** To ensure true isolation, disable public network access on the App Service app. This prevents any traffic from reaching the app via the public internet, forcing all access through the private endpoint [Connect privately to an App Service apps using private endpoint](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint). Note that private endpoint and public access can coexist, but disabling public access is the standard practice for private-only scenarios.

## Configure Managed Identity Authentication

With the network path established, you need to grant the App Service identity access to the database.

1.  **Enable Managed Identity:** Enable a system-assigned managed identity on your App Service app. This creates an identity in Microsoft Entra ID that is tied to the app’s lifecycle [Tutorial: Access Azure databases with managed identity](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-azure-database).
2.  **Grant Database Access:** Use the Service Connector extension for Azure CLI to automate the configuration of database access. This tool sets up the necessary Microsoft Entra authentication settings on the database and configures the app’s connection strings.

    First, install the extension:
    ```azurecli-interactive
    az extension add --name serviceconnector-passwordless --upgrade
    ```

    Then, create the connection. For Azure SQL Database with a system-assigned identity:
    ```azurecli-interactive
    az webapp connection create sql \
        --resource-group <app-resource-group> \
        --name <app-name> \
        --target-resource-group <db-resource-group> \
        --server <sql-server-name> \
        --database <database-name> \
        --system-identity \
        --client-type <client-type>
    ```
    Replace `<client-type>` with the appropriate value for your application stack (e.g., `dotnet`, `java`, `python`, `nodejs`) [Tutorial: Access Azure databases with managed identity](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-azure-database).

    For Azure Database for MySQL Flexible Server, you must first manually set up Microsoft Entra authentication, as it cannot be fully automated by Service Connector [Tutorial: Access Azure databases with managed identity](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-azure-database).

    For Azure Database for PostgreSQL Flexible Server, if you have existing tables, you may need to grant permissions to the `<aad-username>` created by Service Connector [Tutorial: Access Azure databases with managed identity](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-azure-database).

## Verify the Connection

The Service Connector command updates the app’s application settings with a connection string that includes `Authentication=Active Directory Default` (or similar, depending on the stack) [Tutorial: Access Azure databases with managed identity](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-azure-database). Your application code should use this connection string. For example, in a .NET application:

```csharp
// Illustrative example: not tested
string connectionString = Environment.GetEnvironmentVariable("AZURE_SQL_CONNECTIONSTRING");
using var connection = new SqlConnection(connectionString);
connection.Open();
```

To verify:
1.  **Network Path:** Confirm that the app can reach the database IP. Since VNet integration is active, the traffic should stay within the virtual network. You can check this by inspecting the app’s outbound IP addresses or using network monitoring tools if available.
2.  **Authentication:** Confirm that the app can authenticate to the database using the managed identity. The Service Connector command should have created a database user for the managed identity and granted it access [Tutorial: Access Azure databases with managed identity](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-azure-database).
3.  **Private Endpoint:** Confirm that the app is only accessible via the private endpoint. Try accessing the app from a public IP; it should fail if public access is disabled. Try accessing it from a VM in the same virtual network; it should succeed.

## Cleanup

If you are testing this in a non-production environment, remember to clean up the resources to avoid charges. Delete the App Service app, the private endpoint, the virtual network integration, the database, and the virtual network. If you used Service Connector, it may not automatically remove the database user or Microsoft Entra admin settings, so check the database configuration manually [Tutorial: Access Azure databases with managed identity](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-azure-database).

This approach ensures that your App Service application communicates with the database over a private network and authenticates using a managed identity, removing the need for secrets in your code or configuration. The key is to treat the network path (private endpoint + VNet integration) and the identity (managed identity) as separate but complementary controls.
