---
title: "Use API Management policies for a controlled backend change"
description: "Use API Management policies to transform request paths for a new backend version while keeping the public API contract stable."
pubDate: 2026-06-24
category: integration
tags: ["azure-api-management", "policies", "rewrite-uri", "versioning"]
translationKey: use-api-management-policies-for-a-controlled-backend-change
draft: false
---

You need to migrate an API to a new backend service without breaking existing clients. The most reliable way to do this in Azure API Management is to use a policy that rewrites the request path before it reaches the backend, rather than changing the backend URL directly in the API settings. This keeps the public contract stable while you migrate the underlying service.

API Management policies are runtime rules executed inside the gateway. They transform, validate, secure, and route requests and responses. Unlike Azure Policy, which governs resource compliance, API Management policies control the flow of traffic for your APIs. They are applied at specific scopes: global, workspace, product, API, or operation. For a controlled backend change, you typically apply the policy at the API or operation level to target specific traffic.

## Create a new version for the change

Before applying any policy, you should isolate the change. API Management supports versioning, which allows you to present groups of related APIs to developers. You can use versions to handle breaking changes safely. Clients can choose to use the new API version when they are ready, while existing clients continue to use the older version.

If you are adding a version to an existing non-versioned API, API Management automatically creates an `Original` version. This ensures that any existing callers are not affected by the process of adding a version. The `Original` version responds on the default URL without a version identifier. You can then create a new version, such as `v2`, and link it to a version set. The version set defines the versioning scheme, which can be path-based, header-based, or query string-based.

For this example, we will assume you have created a new API version `v2` and you want to route traffic for this version to a new backend URL. You can use path-based versioning, where the version identifier is included in the URL path, such as `https://apis.contoso.com/products/v2`.

## Use the rewrite-uri policy

The `rewrite-uri` policy converts a request URL from its public form to the form expected by the web service. You can use this policy to transform a human-friendly or browser-friendly URL into the URL format expected by the backend service. This is particularly useful when you need to change the backend URL for a specific version without altering the public API contract.

The policy is applied in the `inbound` section of the policy definition. It runs sequentially with other policies. You must include the `base` element at the beginning of each policy section to inherit policies from the parent scope, such as global or product level. This ensures that any policies defined at a higher level are not inadvertently overridden or ignored.

Here is an example of how to use the `rewrite-uri` policy in the `inbound` section of a policy definition for a specific API version:

```xml
<policies>
  <inbound>
    <base />
    <rewrite-uri template="/api/v2/{operation}" />
  </inbound>
  <outbound>
    <base />
  </outbound>
</policies>
```

In this example, the `template` attribute defines the new path structure. The `{operation}` placeholder is replaced by the operation ID from the API definition. This allows you to map a simple public path to a more complex backend path.

## Verify the change

Once you have applied the policy, you should verify that the request is being rewritten correctly. You can use the API Management gateway's test console to send a request to the API and inspect the outbound request. The test console shows the request that is sent to the backend, allowing you to confirm that the path has been rewritten as expected.

You should also check the backend service logs to ensure that the request is being processed correctly. If the backend service returns an error, you can use the `on-error` section of the policy to handle the error and return a custom response to the client.

## Clean up

Once you have verified that the new backend is working correctly, you can remove the old API version. You should also update any documentation or developer portal pages to reflect the new API version. If you no longer need the `Original` version, you can delete it from the API Management instance.

References for Use API Management policies for a controlled backend change: [Policies in Azure API Management](https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-policies), [Azure API Management policy reference - rewrite-uri | Microsoft Docs](https://learn.microsoft.com/en-us/azure/api-management/rewrite-uri-policy), [Versions in Azure API Management | Microsoft Docs](https://learn.microsoft.com/en-us/azure/api-management/api-management-versions).
