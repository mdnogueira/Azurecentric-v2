---
title: "Restrict access to an application deployment endpoint"
description: "Secure App Service deployment endpoints by combining private endpoints with disabled public network access, avoiding the trap of relying on access restrictions for private traffic."
pubDate: 2026-06-11
category: app-paas
tags: ["azure-app-service", "deployment", "private-endpoints", "access-restrictions"]
translationKey: restrict-access-to-an-application-deployment-endpoint
draft: false
---

You need to deploy code to an Azure App Service app from a virtual network, but you also want to ensure that the app's deployment endpoint (the Kudu/scm site) is not publicly accessible. A common mistake is to assume that enabling a private endpoint automatically blocks public access. It does not. Traffic through a private endpoint bypasses access restriction rules entirely, so you must configure both the network path and the access controls explicitly.

The goal here is to allow your deployment pipeline (running in a virtual network) to reach the app, while denying all other public access. We will use a private endpoint for the deployment traffic and disable public network access to secure the app.

## Understand the traffic paths

App Service evaluates traffic based on the entry point. If traffic arrives via a private endpoint, it goes directly to the site without being checked against access restriction rules [App Service Access restrictions](https://learn.microsoft.com/en-us/azure/app-service/overview-access-restrictions). This means that simply adding a private endpoint does not secure the app against public access; it just adds another entry point.

To restrict the public entry point, you need to use App Service access restrictions. These rules apply only to the default (public) endpoint [App Service Access restrictions](https://learn.microsoft.com/en-us/azure/app-service/overview-access-restrictions). You can configure rules to allow or deny traffic based on IP addresses, service endpoints, or service tags.

## Configure the private endpoint for deployment

First, ensure your app is on a pricing tier that supports private endpoints: Basic, Standard, PremiumV2, PremiumV3, PremiumV4, IsolatedV2, or Functions Premium [Use Private Endpoints for Apps](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint).

1. Create a private endpoint for your app in the virtual network where your deployment pipeline resides. This gives the app a private IP address from the VNet address space [Use Private Endpoints for Apps](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint).
2. Ensure that the virtual network is registered for the `Microsoft.Web` resource provider if it is in a different subscription [Use Private Endpoints for Apps](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint).
3. Configure DNS so that `myapp.azurewebsites.net` resolves to the private endpoint IP. You can use an Azure Private DNS Zone for `privatelink.azurewebsites.net` [Use Private Endpoints for Apps](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint).

With the private endpoint in place, your deployment pipeline can reach the app using the private IP or the private DNS name. However, the app is still publicly accessible unless you take further steps.

## Restrict public access

Now, you need to block public access to the app and its deployment endpoint. The most secure approach is to disable public network access entirely. This ensures that the app is only accessible via private endpoints [Use Private Endpoints for Apps](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint).

### Disable public network access

If you disable public network access, the app is only accessible via private endpoints. This is the simplest way to ensure no public access. However, this also means that you cannot use access restrictions to selectively allow certain public IPs if you ever need them. If you disable public network access, you must ensure that all clients, including your deployment pipeline, can reach the app via private endpoints [Use Private Endpoints for Apps](https://learn.microsoft.com/en-us/azure/app-service/overview-private-endpoint).

To disable public network access:

1. Go to the App Service app in the Azure portal.
2. Navigate to **Configuration** > **General settings**.
3. Set **Public network access** to **Disabled**.

This action effectively blocks all traffic to the app's public endpoint, including the Kudu/scm site. Since access restriction rules do not apply to private endpoint traffic, this is the only way to ensure the Kudu site is not publicly accessible while still allowing private deployment traffic [App Service Access restrictions](https://learn.microsoft.com/en-us/azure/app-service/overview-access-restrictions).

## Verify the configuration

To verify that your configuration is working:

1. Try to access the app from a public IP. You should receive a 403 error or a connection timeout.
2. Try to access the app from your deployment pipeline's VNet. You should be able to access it via the private endpoint.
3. Check the **IPSecurity Audit logs** in Diagnostic Settings to confirm that public access attempts are being denied [App Service Access restrictions](https://learn.microsoft.com/en-us/azure/app-service/overview-access-restrictions).
