---
title: "Put an API behind Azure API Management"
description: "How to manually add an API to Azure API Management, map operations, and test them using the Azure portal."
pubDate: 2025-06-09
category: apps
tags: ["azure-api-management", "how-to", "api-gateway", "azure-portal", "backend-integration"]
translationKey: put-an-api-behind-azure-api-management
draft: false
---

You have an API Management instance ready and a backend service you want to expose. The first practical step is to add the API and map its operations so that API Management can route traffic correctly. This guide shows how to do that manually in the Azure portal, including how to handle parameterised paths and wildcard operations.

## Prerequisites and scope

You need an existing API Management instance. If you do not have one, the [Create an Azure API Management instance](https://learn.microsoft.com/en-us/azure/api-management/get-started-create-service-instance) quickstart covers the initial setup. The steps below apply to all API Management tiers, including Classic, V2, and Consumption [Manually Add an API by Using the Azure portal | Microsoft Docs](https://learn.microsoft.com/en-us/azure/api-management/add-api-manually).

You also need permission to manage the API Management service. The management plane is where you define APIs, products, and policies, and it is accessed via the Azure portal, Azure CLI, PowerShell, or REST API [Azure API Management - Overview and key concepts](https://learn.microsoft.com/en-us/azure/api-management/api-management-key-concepts). Ensure your account has the necessary role (such as API Management Service Contributor or Owner) on the service resource.

## Add a blank API

Start by creating the API container. This does not automatically import operations; it simply establishes the link to the backend.

1. In the Azure portal, search for and select **API Management services**, then select your instance.
2. In the left menu, under **APIs**, select **APIs**.
3. Select **+ Add API**.
4. Select the **HTTP** tile.

![Screenshot that shows the HTTP tile in the Azure portal.](/images/posts/2025/azc-188-learn-1.png)

5. Enter the **Web service URL** for your backend. For example, `https://httpbin.org`.
6. Configure other settings as required, such as the display name and API path. The [Import and publish your first API](https://learn.microsoft.com/en-us/azure/api-management/import-and-publish) tutorial explains these settings in detail.
7. Select **Create**.

At this point, you have an API connected to a backend, but no operations are exposed through API Management. If you call a backend operation that has not been explicitly mapped, you will receive a 404 error [Manually Add an API by Using the Azure portal | Microsoft Docs](https://learn.microsoft.com/en-us/azure/api-management/add-api-manually).

## Map operations to the backend

You must create API Management operations that map to the backend operations you want to expose. You can do this for simple endpoints, parameterised paths, or wildcards.

### Simple operation

To expose a specific endpoint, such as `/get`:

1. Select the API you just created.
2. Select **+ Add operation**.
3. In **URL**, select **GET** and enter `/get`.
4. Enter a **Display name**, such as `FetchData`.
5. Select **Save**.

### Parameterised operation

For endpoints that take path parameters, such as `/status/{code}`:

1. On the **Design** tab, select **+ Add operation**.
2. In **URL**, select **GET** and enter `/status/{code}`.
3. Enter a **Display name**, such as `GetStatus`.
4. Select **Save**.

When testing, you will be prompted to provide the value for `code`.

### Wildcard operation

A wildcard operation allows you to pass an arbitrary value with the request, mapping to `/*`.

1. On the **Design** tab, select **+ Add operation**.
2. In **URL**, select **GET** and enter `/*`.
3. Enter a **Display name**, such as `WildcardGet`.
4. Select **Save**.

> [!CAUTION]
> Be cautious when configuring a wildcard operation. This configuration might make an API more vulnerable to certain API security threats, such as improper inventory management [Manually Add an API by Using the Azure portal | Microsoft Docs](https://learn.microsoft.com/en-us/azure/api-management/add-api-manually).

## Test the operations

You can test the operations directly in the Azure portal. This uses the built-in **all-access subscription**, which automatically populates the `Ocp-Apim-Subscription-Key` header for testing purposes [Import an OpenAPI specification to Azure API Management | Microsoft Docs](https://learn.microsoft.com/en-us/azure/api-management/import-api-from-oas).

1. Select the API and then the **Test** tab.
2. Select the operation you created (e.g., `FetchData` or `GetStatus`).
3. Enter any required parameters (e.g., `code` for `GetStatus`).
4. Select **Send**.

The response from the backend will appear in the **HTTP response** section. If you are testing against a backend that is not publicly accessible, you may need to select **Bypass CORS proxy** in the test console to send the request directly from the browser to the API Management instance [Import an OpenAPI specification to Azure API Management | Microsoft Docs](https://learn.microsoft.com/en-us/azure/api-management/import-api-from-oas).

## Next steps

Once the operations are mapped and tested, you can proceed to secure the API by creating products and subscriptions, or apply policies for rate limiting and transformation. The [Transform and protect your API](https://learn.microsoft.com/en-us/azure/api-management/transform-api) guide covers these advanced configurations.

If you have an OpenAPI specification, you can also import it to automatically generate operations, rather than adding them manually [Import an OpenAPI specification to Azure API Management | Microsoft Docs](https://learn.microsoft.com/en-us/azure/api-management/import-api-from-oas).
