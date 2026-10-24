---
title: "Prepare Azure administrators for mandatory multifactor authentication"
description: "Prepare Azure administrators for mandatory multifactor authentication (MFA) enforcement starting October 2024."
pubDate: 2024-08-19
category: governance
tags: ["conditional-access", "mfa", "entra-id", "security", "azure-portal"]
translationKey: prepare-azure-administrators-for-mandatory-multifactor-authentication
draft: true
---

The Azure portal, Microsoft Entra admin center, and Intune admin center will require multifactor authentication (MFA) for all administrative sign-ins starting in the second half of 2024. Microsoft is rolling this out gradually to all tenants worldwide. If your administrators do not have MFA configured, they will be challenged during sign-in. If they cannot complete that challenge, access will be blocked.

This requirement is part of Microsoft’s Secure Future Initiative. The goal is to reduce the risk of account compromise. Research cited by Microsoft indicates that MFA can block more than 99.2% of account compromise attacks. While the enforcement for interactive portals begins in the second half of 2024, a second phase targeting Azure CLI, Azure PowerShell, and Infrastructure as Code (IaC) tools will commence in early 2025. For now, the immediate priority is securing the interactive sign-in experience for administrators.

[![MFA Enforcement Preparation Flow](/images/posts/2024/azc-083-checkpoints.svg)](/images/posts/2024/azc-083-checkpoints.svg)

## Identify the scope and affected accounts

Before configuring any policies, you need to know who is affected. The mandatory requirement applies to all users who sign into the Azure portal, Microsoft Entra admin center, or Intune admin center to perform any Create, Read, Update, or Delete (CRUD) operation. This includes Global Administrators, but it also extends to any user with administrative privileges in these portals.

Workload identities, such as managed identities and service principals, are not impacted by this MFA enforcement because they do not sign in interactively. However, if you are using a user identity as a service account to run automation scripts, that user identity will need to sign in with MFA once enforcement begins. Microsoft recommends migrating these user-based service accounts to workload identities to avoid friction. For break-glass or emergency access accounts, MFA is also required once enforcement begins. Microsoft recommends updating these accounts to use passkey (FIDO2) or certificate-based authentication to ensure you can still access them if primary methods fail.

## Configure Conditional Access in report-only mode

The recommended approach to prepare your administrators is to use Microsoft Entra Conditional Access. You should not enable enforcement immediately. Instead, start by creating a policy in report-only mode. This allows you to verify which users would be challenged without actually blocking their access.

You need the Conditional Access Administrator role to create these policies. Sign in to the Microsoft Entra admin center and navigate to **Protection** > **Conditional Access** > **Policies**. Select **New policy** and give it a clear name, such as "MFA for Azure Admin Portals - Report Only".

Under **Assignments**, select **Users or workload identities**. In the **Include** section, choose **Directory roles** and select the administrative roles that require MFA. Microsoft recommends including at least the following built-in roles:

*   Global Administrator
*   Application Administrator
*   Authentication Administrator
*   Billing Administrator
*   Cloud Application Administrator
*   Conditional Access Administrator
*   Exchange Administrator
*   Helpdesk Administrator
*   Password Administrator
*   Privileged Authentication Administrator
*   Privileged Role Administrator
*   Security Administrator
*   SharePoint Administrator
*   User Administrator

Note that Conditional Access policies only support built-in roles. They do not enforce administrative unit-scoped or custom roles. Under **Exclude**, you must select **Users and groups** and add your emergency access or break-glass accounts. Excluding these accounts is critical to prevent a lockout scenario where you cannot access the portal to fix the policy.

Under **Target resources** > **Cloud apps** > **Include**, select **Select apps** and choose **Microsoft Admin Portals**. This app object covers the Azure portal, Microsoft Entra admin center, and Intune admin center. Under **Access controls** > **Grant**, select **Grant access**, then **Require multifactor authentication**. Confirm your settings and set the **Enable policy** toggle to **Report-only**. Select **Create** to save the policy.

## Verify readiness and handle exceptions

Once the policy is in report-only mode, you can monitor its impact. Microsoft provides tools to help you identify which users are signing in with and without MFA. You can use the Multifactor Authentication Gaps workbook or PowerShell scripts to export a list of users and their authentication methods. The application ID for the Azure portal and other admin portals is `c44b4083-3bb0-49c1-b47d-974e53cbdf3c`, which you can use in your queries to isolate the relevant traffic. Use the application ID `04b07795-8ddb-461a-bbee-02f9e1bf7b46` for Azure CLI and `1950a258-227b-4e31-a9cf-717495945fc2` for Azure PowerShell.

Check the Conditional Access insights to see how many sign-ins would have been challenged by your report-only policy. If you see administrators who are not registered for MFA, you need to engage them to register a method. Microsoft Authenticator, FIDO2 security keys, and certificate-based authentication are all supported. SMS or voice approval is available but is the least secure option and is not phishing-resistant.

If you are using an external MFA solution or a federated identity provider, ensure it is configured to send an MFA claim. External authentication methods are in preview and can be used to meet the requirement, but legacy Conditional Access custom controls will not satisfy the mandatory MFA enforcement. For external MFA solutions, verify that the external authentication method is correctly configured to send the MFA claim in the Conditional Access policy. Use the Conditional Access insights to confirm that sign-ins using external methods are recognized as MFA-compliant.

## Plan for the October enforcement

Microsoft will send a 60-day advance notice to all Global Administrators via email and Azure Service Health Notifications (tracking ID: 4V20-VX0) before enforcement begins. If you need more time to prepare due to complex environments or technical barriers, you can request a postponement. Between 15 August 2024 and 15 October 2024, Global Administrators can go to the Azure portal page for managing MFA for Azure to postpone the start date of enforcement to 15 March 2025. This requires elevated access, which is a specific, temporary high-privilege feature in Microsoft Entra ID that must be explicitly enabled by a Global Administrator. This action is audited and has a limited duration, requiring careful planning for the postponement request.

Once you are confident that all administrators have registered for MFA and your break-glass accounts are secured, you can move the Conditional Access policy from **Report-only** to **On**. This will enforce MFA for the targeted roles and apps. Remember that this only covers the interactive portals. For Azure CLI, Azure PowerShell, and IaC tools, you will need to plan for the early 2025 enforcement phase, which may require migrating user identities to workload identities or configuring MFA for those clients.

Start by reviewing your current MFA registration status for all administrative roles. Use the report-only policy to validate your configuration. Verify that your emergency accounts are excluded and configured with phishing-resistant methods. Once you have confirmed that no administrators are left without a valid MFA method, you can enable enforcement and ensure your team is ready for the October rollout.

References for Prepare Azure administrators for mandatory multifactor authentication: [Prepare Azure administrators for mandatory multifactor authentication](https://azure.microsoft.com/en-us/blog/announcing-mandatory-multi-factor-authentication-for-azure-sign-in/), [Mandatory Microsoft Entra multifactor authentication (MFA)](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mandatory-multifactor-authentication), [Require multifactor authentication for Microsoft admin portals](https://learn.microsoft.com/en-us/entra/identity/conditional-access/how-to-policy-mfa-admin-portals).
