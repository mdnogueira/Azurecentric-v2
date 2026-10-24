---
title: "Enable GitHub secret scanning and assign alert ownership"
description: "Enable GitHub Secret Scanning and push protection, then assign alert ownership via security configurations."
pubDate: 2024-11-28
category: governance
tags: ["github-advanced-security", "secret-scanning", "push-protection", "security-configurations", "devops"]
translationKey: enable-github-secret-scanning-and-assign-alert-ownership
draft: true
---

You have a repository, or perhaps an entire organisation, and you want to know if secrets are leaking into the codebase. The first step is not to write code, but to configure the scanning service and decide who owns the resulting alerts. GitHub Secret Scanning is a gated feature within GitHub Advanced Security. It does not run by default on private repositories, and enabling it requires specific permissions and a clear plan for handling the findings.

The core question is scope: are you protecting a single repository, an organisation, or an enterprise? The answer determines where you click, who you need to ask for permission, and how you assign ownership. A common mistake is to enable scanning at the repository level without considering whether organisation-wide policies would be more efficient, or to assume that enabling scanning automatically blocks pushes. It does not. You must enable push protection separately to prevent new secrets from being committed.

[![Secret Scanning and Push Protection Workflow](/images/posts/2024/azc-119-checkpoints.svg)](/images/posts/2024/azc-119-checkpoints.svg)

## Confirm permissions and plan scope

Before you touch any settings, verify your role. For a public repository, any administrator can enable Secret Scanning. For a private repository, you need to be an organisation owner or have the Advanced Security feature enabled at the organisation level. If your organisation is part of an enterprise, an enterprise owner can enable the feature at the enterprise level, which cascades to all organisations and repositories within that enterprise.

The documentation states that "People with admin permissions to a public repository can enable Secret Scanning for the repository" and that for private repositories, "you need to be an organisation owner" or have the feature enabled at the organisation level [Configuring secret scanning for your repositories](https://docs.github.com/en/code-security/secret-scanning/configuring-secret-scanning-for-your-repositories). If you are unsure whether Advanced Security is enabled for your organisation, check the organisation settings under "Code security and analysis". If the option is greyed out, you likely need an organisation owner to enable it first.

Decide on your scope early. Enabling scanning at the organisation level ensures that all new repositories inherit the setting, reducing the risk of orphaned repositories. However, if you are piloting the feature, a single repository is a safer starting point. You can always expand later.

## Enable Secret Scanning and push protection

Once you have confirmed your permissions and scope, you can enable the features. The process differs slightly depending on whether you are using GitHub Enterprise Cloud or GitHub Enterprise Server, but the navigation is consistent.

Navigate to the repository settings. Click on **Settings** in the left-hand menu, then select **Code security and analysis**. If Secret Scanning is not already enabled, you will see an **Enable** button. Click it. If you see a **Disable** button, the feature is already active [Enabling secret scanning for your repository](https://docs.github.com/en/code-security/secret-scanning/enabling-secret-scanning-features/enabling-secret-scanning-for-your-repository).

Enabling Secret Scanning generates alerts for known secret patterns. It does not, however, stop contributors from pushing secrets. To prevent this, you must enable push protection. This is a separate toggle on the same page. Click **Enable** next to **Push protection**. This feature blocks pushes that contain known secrets and generates an alert if a user bypasses the block.

For private repositories, push protection requires that Advanced Security is enabled for the repository. If you are enabling it at the organisation level, ensure that the organisation has Advanced Security enabled. The documentation notes that "To use Secret Scanning as a push protection in private or internal repositories, the enterprise or organization also needs to have GitHub Advanced Security enabled" [Push protection for repositories and organizations](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations).

You can also configure push protection for custom patterns. This is useful if you have internal secrets that are not part of the standard partner patterns. To do this, you must first define the custom pattern, then enable push protection for that specific pattern. This is done in the same **Secret scanning** settings page, under the **Custom patterns** section.

## Assign alert ownership

Enabling scanning and push protection is only half the job. You need to ensure that the alerts are reviewed by the right people. GitHub does not automatically assign alerts to specific individuals. You must configure this manually.

The most effective way to manage alert ownership is through Security Configurations. If your organisation uses Security Configurations, you can define a policy that assigns alerts to specific teams or roles. This ensures that every new repository that inherits the policy has the same alert ownership.

To configure this, go to the organisation settings. Click on **Code security and analysis**. If you have Security Configurations enabled, you will see a list of policies. Create a new policy or edit an existing one. Under **Secret scanning**, you can specify which teams or roles should receive alerts. This is a more scalable approach than assigning alerts manually for each repository.

If you are not using Security Configurations, you can assign alerts manually. Go to the repository settings, then **Security** > **Secret scanning**. Click on **Alerts**. You can then assign each alert to a specific user or team. This is time-consuming and error-prone, so it is best suited for small numbers of repositories or for initial triage.

You can also use the `bypassed:true` filter to see which alerts are the result of a user bypassing push protection. This is useful for monitoring the effectiveness of your push protection policy [Push protection for repositories and organizations](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations). If you see a high number of bypasses, you may need to review your bypass reasons or provide additional training to your contributors.

## Verify and refine

Once you have enabled Secret Scanning and push protection, and assigned alert ownership, you need to verify that everything is working as expected. The best way to do this is to create a test commit that contains a known secret pattern. Push the commit to the repository. If push protection is enabled correctly, the push should be blocked, and an alert should be generated.

Check the **Security** tab of the repository. You should see the alert. Verify that it has been assigned to the correct team or user. If it has not, review your Security Configuration or manual assignment settings.

You can also review the **Secret scanning** settings page to ensure that the features are still enabled. Settings can sometimes be reset by organisation policies or by users with admin permissions. Regularly reviewing these settings is a good practice to ensure that your security posture remains consistent.

Finally, consider enabling validity checks for partner patterns. This feature allows GitHub to automatically check the validity of a secret found in your repository by sending it to the relevant partner. This helps reduce false positives. You can enable this in the **Secret scanning** settings page, under the **Validity checks** section [Configuring secret scanning for your repositories](https://docs.github.com/en/code-security/secret-scanning/configuring-secret-scanning-for-your-repositories).

By following these steps, you will have a robust Secret Scanning setup that not only detects secrets but also prevents them from being committed and ensures that the right people are notified. This is a foundational step in securing your codebase, but it is not the last. Regularly review your alerts, refine your custom patterns, and ensure that your team is trained on how to handle secrets securely.
