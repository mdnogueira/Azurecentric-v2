---
title: "Separate API authentication from subscription keys"
description: "Separate API authentication from subscription keys in Azure API Management using OAuth 2.0 and JWT validation."
pubDate: 2025-08-04
category: integration
tags: ["azure-api-management", "authentication", "authorization", "jwt"]
translationKey: separate-api-authentication-from-subscription-keys
draft: false
---

Subscription keys in Azure API Management are often treated as the primary security gate for APIs. They are useful for tracking usage and controlling access to specific products, but they are not a strong form of authentication. Relying on a subscription key alone leaves your API vulnerable to token leakage and replay attacks, as the key identifies the subscriber but does not verify the user or the intent of the request. To secure access effectively, you should separate subscription management from actual API authentication. The recommended approach is to use OAuth 2.0 for authorization and validate tokens at the gateway level, keeping subscription keys as a supplementary layer. This allows you to leverage time-limited tokens, scopes, and audience validation while maintaining the operational benefits of subscription tracking.

## Why subscription keys are insufficient for authentication

The documentation for Azure API Management explicitly recommends using a subscription key *in addition to* another method of authentication or authorization. On its own, a subscription key is not a strong form of authentication. It is better viewed as a tracking or access-granting token for specific products or customers. When you move to OAuth 2.0, you shift from a static credential model to a dynamic, time-limited token model that supports granular permissions and identity verification. This separation ensures that even if a subscription key is compromised, it cannot be used to impersonate a specific user or access resources beyond the scope defined by the OAuth token.

## Choosing the right OAuth 2.0 authorization scenario

API Management supports several OAuth 2.0 authorization scenarios. The choice depends on whether your backend API can handle tokens or if it requires the gateway to manage the authentication chain. Understanding these scenarios is crucial for designing a secure and maintainable API architecture.

### Scenario 1: Client app authorizes directly to backend
In this setup, the client application obtains an access token from an identity provider (such as Microsoft Entra ID) and presents it to the API Management gateway. The gateway acts as a transparent proxy, passing the token unchanged to the backend. This is ideal when your backend API is modern and can validate the token itself. However, for defense in depth, you should still configure a policy in API Management to validate the JWT. This ensures that requests without a valid token or with a token intended for a different resource are rejected before they reach the backend. The audience claim in the token should match the backend API's client ID.

### Scenario 2: Client app authorizes to API Management
Here, the API Management service acts on behalf of the API. The client requests access to the gateway, and the gateway validates the token before forwarding the request to the backend. This is particularly useful when:
* The backend is a legacy API that cannot be updated to support OAuth.
* The context required by the backend cannot be established from the caller.
* The organization wants to standardize on OAuth 2.0 for all API consumers, regardless of backend capabilities.

In this scenario, after validating the incoming token, API Management can use its own managed identity or a custom policy (like `send-request`) to obtain a separate token for the backend. The audience claim in the token should match the API Management gateway's client ID. This decouples the client's identity from the backend's authentication requirements.

### Scenario 3: API Management authorizes to backend
This scenario involves using managed connections (formerly called authorizations) in the Credential Manager. A client might authenticate to the gateway using a subscription key or another method, but API Management handles the OAuth 2.0 flow to the backend SaaS service (like LinkedIn or GitHub). This simplifies token management for scenarios where a client needs to access multiple SaaS backends or where backend authentication is delegated to a common organizational account. API Management acquires and refreshes the tokens for API access in the OAuth 2.0 flow, reducing the complexity for the client application.

## Implementing token validation

Regardless of the scenario, validating the token at the gateway is critical. The `validate-jwt` policy allows you to enforce strict checks on the incoming token. For example, you can verify that the token's audience claim matches the expected value for your specific scenario. This prevents a token issued for one service from being used to access another.

An illustrative example of a `validate-jwt` policy might look like this:

```xml
<validate-jwt header-name="Authorization" failed-validation-httpcode="401" failed-validation-error-message="Unauthorized. Access token is missing or invalid.">
    <openid-config url="https://login.microsoftonline.com/{aad-tenant}/v2.0/.well-known/openid-configuration" />
    <audiences>
        <audience>{expected-audience-value}</audience>
    </audiences>
    <issuers>
        <issuer>{issuer-value}</issuer>
    </issuers>
    <required-claims>
        <claim name="aud">
            <value>{expected-audience-value}</value>
        </claim>
    </required-claims>
</validate-jwt>
```

This policy checks the `Authorization` header against the OpenID configuration of your identity provider. It ensures the token is intended for your specific resource and was issued by a trusted issuer. Note that this is an illustrative example; you must replace `{aad-tenant}` and `{expected-audience-value}` with your actual values. For Microsoft Entra ID scenarios, API Management also provides the `validate-azure-ad-token` policy as an alternative.

## Securing the developer portal

While API authentication secures the data plane, you also need to secure the control plane and developer experience. The API Management developer portal can be secured using Microsoft Entra ID, allowing users to sign in with their organizational accounts. This is configured separately from API authentication. You can enable user sign-in automatically or manually by registering an app in Microsoft Entra ID and configuring the identity provider in the portal. This ensures that only authorized developers can access the portal, view APIs, and generate subscription keys. Enabling Microsoft Entra ID for the developer portal does not automatically configure OAuth 2.0 for your APIs; these are distinct configuration tasks.

## Verification and next steps

To verify your setup, navigate to the developer portal and use the test console. If you have configured OAuth 2.0 user authorization, the test console will prompt you to acquire a token. Once acquired, the token is passed in the `Authorization` header. Check the response from the backend to ensure it is successful. If you have added a `validate-jwt` policy, try sending a request without a token or with an invalid token to confirm that the gateway returns a `401 Unauthorized` error. Remember that enabling OAuth 2.0 does not automatically disable public access or fix DNS issues; those are separate configuration tasks. Also, ensure that your subscription keys are still managed and rotated as needed, even if they are no longer the primary authentication mechanism. They remain useful for tracking usage and controlling access to specific API products.

References for Separate API authentication from subscription keys: [API authentication and authorization - Overview](https://learn.microsoft.com/en-us/azure/api-management/authentication-authorization-overview), [Authorize access to API Management developer portal by using Microsoft Entra ID](https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-aad), [Authorize test console of API Management developer portal - OAuth 2.0](https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-oauth2).
