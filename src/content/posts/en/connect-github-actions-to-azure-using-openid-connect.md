---
title: "Connect GitHub Actions to Azure using OpenID Connect"
description: "Secure GitHub Actions to Azure using OIDC federation and Microsoft Entra Conditional Access for workload identities."
pubDate: 2024-09-30
category: identity-access
tags: ["microsoft-entra-id", "github", "workload-identity-federation", "github-actions", "openid-connect", "conditional-access"]
translationKey: connect-github-actions-to-azure-using-openid-connect
draft: false
---

You are configuring a GitHub Actions workflow to deploy to Azure. The traditional method involves storing a service principal client secret in GitHub Secrets. That secret is a long-lived credential. If it is leaked, it grants access until you rotate it, and it does not distinguish between a legitimate deployment and a compromised one.

OpenID Connect (OIDC) in GitHub Actions solves this by issuing short-lived tokens. Azure trusts these tokens via a federated identity credential on a service principal. The token proves the workflow ran in a specific repository, branch, or environment. This removes the need for long-lived secrets.

However, a federated credential alone does not restrict where the workflow can run. It trusts the token's content, not the network path. If you need to ensure deployments only come from known IP ranges or block high-risk requests, you must layer Microsoft Entra Conditional Access policies for workload identities on top of the OIDC trust.

## Configure the federated identity credential

The first step is to create a service principal in your Microsoft Entra tenant and link it to your GitHub repository. This establishes the trust relationship. You do not need a client secret for this identity.

1. Create a service principal in your Microsoft Entra tenant. You need the **Application Administrator** or **Cloud Application Administrator** role, or be the owner of the service principal, to perform this step [Add an OpenID Connect-based single sign-on application](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/add-application-portal-setup-oidc-sso).
2. In your GitHub repository, navigate to **Settings** > **Security** > **Service connections** > **Azure**.
3. Select **Configure** and follow the prompts to create a new service principal or select an existing one.
4. GitHub will automatically create a federated identity credential on that service principal. This credential maps the GitHub OIDC token to the Azure service principal.

The credential typically targets a specific repository and branch. For example, you might restrict it to `main` branch deployments. This ensures that even if the token is intercepted, it is only valid for the intended workflow context.

## Verify the trust chain

Before enabling restrictive policies, confirm that the workflow can authenticate successfully. Run a simple GitHub Actions workflow that uses the `azure/login` action with the `use-oidc: true` setting.

```yaml
# Illustrative example: GitHub Actions workflow using OIDC
name: Deploy to Azure
on: push
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: azure/login@v3
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          use-oidc: true
      - run: az group list
```

This code assumes you have configured the GitHub secrets with the service principal details. The `use-oidc: true` flag tells the action to request an OIDC token from GitHub instead of using a client secret. If the deployment succeeds, the federated identity is working. If it fails, check the service principal's federated credentials in the Microsoft Entra admin center to ensure the repository and branch match exactly.

## Apply Conditional Access for workload identities

Federated identities are powerful, but they lack network or risk-based controls. Microsoft Entra Conditional Access for workload identities allows you to apply policies to service principals, including those authenticated via OIDC [Microsoft Entra Conditional Access for workload identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity).

This feature requires **Workload Identities Premium** licenses [Microsoft Entra Conditional Access for workload identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity). Without these licenses, you cannot create or modify Conditional Access policies scoped to service principals. Existing policies will continue to function, but you cannot update them.

### Create a location-based policy

To restrict deployments to specific IP ranges, create a location-based Conditional Access policy.

1. Sign in to the Microsoft Entra admin center as a **Conditional Access Administrator** [Microsoft Entra Conditional Access for workload identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity).
2. Navigate to **Protection** > **Conditional Access** > **Policies** > **New policy**.
3. Name the policy, for example, "Block GitHub Deployments from Unknown IPs".
4. Under **Assignments**, select **Users or workload identities**. Choose **Workload identities** and then **Select service principals**. Add the service principal you created for GitHub.
5. Under **Target resources**, select **Cloud apps** > **Include** > **All cloud apps**. This ensures the policy applies whenever the service principal requests a token.
6. Under **Conditions** > **Locations**, include **Any location** and exclude **Selected locations**. Add the public IP ranges of your GitHub Actions runners. GitHub provides documentation on these IP ranges.
7. Under **Grant**, select **Block access**. This is the only option available for workload identity Conditional Access policies [Microsoft Entra Conditional Access for workload identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity).
8. Save the policy in **Report-only** mode first. This allows you to verify the impact without blocking legitimate deployments.

### Review sign-in logs

After enabling the policy in report-only mode, monitor the **Sign-in logs** for service principals [Microsoft Entra Conditional Access for workload identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity).

1. Navigate to **Identity** > **Monitoring & health** > **Sign-in logs** > **Service principal sign-ins**.
2. Filter by the service principal object ID. Note that you must use the service principal Object ID, not the application registration Object ID [Microsoft Entra Conditional Access for workload identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity).
3. Check the **Conditional Access** tab for evaluation details. Look for events where the policy was evaluated but not enforced.

If the logs show expected traffic from your GitHub IPs, switch the policy to **On**. If you see unexpected traffic, investigate the source before enforcing.

## Handle risk-based conditions

In addition to location checks, you can block service principals based on risk detected by Microsoft Entra ID Protection [Microsoft Entra Conditional Access for workload identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity). This is useful if you suspect a compromise or if the service principal's credentials are exposed.

1. Create a new Conditional Access policy.
2. Under **Assignments**, select the GitHub service principal.
3. Under **Conditions** > **Service principal risk**, set the toggle to **Yes** and select the risk levels that should trigger the policy (e.g., High).
4. Under **Grant**, select **Block access**.
5. Save in report-only mode and review logs.

This layer of protection adds resilience against credential theft. Even if a token is stolen, it may be blocked if the risk engine detects anomalous behaviour.

## Verify and refine

Once your policies are enforced, run your GitHub Actions workflow again. If the deployment fails, check the error message. A failure due to Conditional Access will typically state "Access has been blocked due to Conditional Access policies" [Microsoft Entra Conditional Access for workload identities](https://learn.microsoft.com/en-us/entra/identity/conditional-access/workload-identity).

Use the **Sign-in logs** to diagnose the failure. Identify whether the block was due to location or risk. Adjust your named locations or risk thresholds as needed. Remember that Conditional Access policies for workload identities are evaluated at token request time. This means every API call from your workflow is subject to these checks.

Start with a single service principal and a single policy. Monitor the logs closely. Expand to other workloads only after you are confident in the policy logic and its impact on your deployment pipeline.
