---
title: "Use Conditional Access authentication strengths carefully"
description: "Enforce specific authentication strengths for external users by configuring cross-tenant MFA trust and applying Conditional Access policies in report-only mode."
pubDate: 2025-12-20
category: governance
tags: ["conditional-access", "authentication-strengths", "external-users", "cross-tenant-access", "entra-id"]
translationKey: use-conditional-access-authentication-strengths-carefully
draft: false
---

You need to enforce a specific authentication strength for external users accessing your resources, but you are unsure how the home tenant's authentication interacts with your Conditional Access policy. The core issue is that authentication strength does not work in isolation; it relies on cross-tenant access settings to determine whether the external user's home tenant can satisfy the requirement or if your tenant must issue a new challenge.

Authentication strength is a Conditional Access control that specifies which combinations of authentication methods users can use to access a resource. For external users, this becomes complex because the user authenticates in their home tenant first. Your tenant then evaluates whether the authentication session from the home tenant meets your requirements. If it does not, or if you do not trust the home tenant's MFA claim, you may need to challenge the user again in your tenant.

## Check cross-tenant MFA trust settings

Before creating any Conditional Access policy, you must verify your cross-tenant access settings. These settings determine how your tenant trusts MFA claims from external identities.

If MFA trust is enabled, Microsoft Entra ID checks the user's authentication session for a claim indicating that MFA was fulfilled in the user's home tenant. If MFA trust is disabled, your tenant presents the user with a challenge to complete MFA in the resource tenant using an acceptable authentication method. The authentication methods available to satisfy this challenge depend on whether the user is completing MFA in the home tenant or the resource tenant.

You should confirm that your inbound MFA trust settings are configured as intended for the external user types you are targeting. Note that authentication strength policies currently only work for external users who authenticate with Microsoft Entra ID. For email one-time passcode, SAML/WS-Fed, and Google federation users, you must use the MFA grant control instead.

## Create the Conditional Access policy

To enforce an authentication strength, you need to create a Conditional Access policy that targets external users. You will need at least the Conditional Access Administrator role to perform this configuration.

1. Sign in to the Microsoft Entra admin center.
2. Browse to **Protection** > **Conditional Access** > **Policies**.
3. Select **New policy**.
4. Give the policy a meaningful name.
5. Under **Assignments**, select **Users or workload identities**.
   - Under **Include**, choose **Select users and groups**, then select **Guest or external users**.
   - Select the specific types of guest or external users you want to apply the policy to.
   - Under **Exclude**, select **Users and groups** and choose your organization's emergency access or break-glass accounts.
6. Under **Target resources** > **Cloud apps**, select any applications you want to include in or exclude from the authentication strength requirements.
7. Under **Access controls** > **Grant**, select **Grant access**.
   - Select **Require authentication strength**, then select the built-in or custom authentication strength from the list.
   - Select **Select**.

:::image type="content" border="true" source="/images/posts/2025/azc-257-learn-1.png" alt-text="Screenshot of a Conditional Access policy with an authentication strength configured in grant controls."
:::

The built-in authentication strengths available are **Multifactor authentication strength**, **Passwordless MFA strength**, and **Phishing-resistant MFA strength**. You can also create a custom authentication strength based on specific combinations of methods.

## Verify with report-only mode

After creating the policy, leave it in **Report-only** mode. This allows you to determine the results of the new policy decisions without actually blocking access. You can review the sign-in logs to see how external users are being evaluated against the authentication strength requirement.

Once you are confident that the policy behaves as expected, you can move the **Enable policy** toggle from **Report-only** to **On**. This ensures that external users must satisfy the specified authentication strength to access your resources.

Remember that authentication strengths are evaluated after the initial authentication. If a user signs in with a method that does not satisfy the authentication strength, they will be prompted to provide a method that does. If they are not registered for any methods that satisfy the requirement, they will be redirected to combined registration.

For federated domains, an admin can enforce MFA by using Microsoft Entra Conditional Access or by setting `federatedIdpMfaBehavior` for the on-premises federation provider. If `federatedIdpMfaBehavior` is set to `enforceMfaByFederatedIdp`, the user must authenticate on the federated identity provider and can satisfy only the *federated multifactor* combination of the authentication strength requirement.

## Review authentication method combinations

When selecting an authentication strength, consider the combinations of methods that are allowed. For example, the **Phishing-resistant MFA strength** allows combinations of Windows Hello for Business, FIDO2 security keys, and Microsoft Entra certificate-based authentication. The **Multifactor authentication strength** allows a broader set, including SMS, voice, and push notifications.

Ensure that the authentication methods you require are enabled in the policy for authentication methods and that users are registered for them. If a user is not registered for a method that satisfies the authentication strength, they will be prompted to register during the sign-in process, provided the method is available in Interrupt mode.

Some passwordless and phishing-resistant methods cannot be registered as part of Interrupt mode in combined registration. Make sure users are registered for these methods before you apply a Conditional Access policy that can require them to be used for sign-in.

## Next steps

Verify policy impact by reviewing sign-in logs in the Microsoft Entra admin center under **Protection** > **Conditional Access** > **Insights** > **Sign-in logs** filtered by the new policy name.

References for Use Conditional Access authentication strengths carefully: [Overview of Conditional Access Authentication Strengths](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strengths), [How Authentication Strengths Work in a Conditional Access Policy](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strength-how-it-works), [Conditional Access - Authentication strength for external users](https://learn.microsoft.com/en-us/entra/identity/conditional-access/howto-conditional-access-policy-authentication-strength-external).
