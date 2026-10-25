---
title: "Roll out GitHub push protection without disrupting developers"
description: "Configure GitHub push protection with delegated bypass to block secret commits while maintaining a controlled approval workflow for developers."
pubDate: 2025-01-20
category: governance
tags: ["github-advanced-security", "secret-scanning", "push-protection", "delegated-bypass", "security-workflow"]
translationKey: roll-out-github-push-protection-without-disrupting-developers
draft: false
---

You have enabled secret scanning, but now you face a practical problem: developers are blocked from pushing legitimate code that happens to contain test keys, or worse, they are bypassing the block with a generic "false positive" reason because they have no other option. Push protection stops secrets from leaving the repository, but without a structured review process, it becomes a friction point rather than a security control.

The solution is to enable push protection and configure delegated bypass. This ensures that only authorised reviewers can approve a push containing a detected secret, while the rest of the team must fix the commit. This approach maintains security without grinding development to a halt.

## Prerequisites and scope

Before configuring bypass rules, you must ensure the underlying protection is active. Push protection requires secret scanning to be enabled for the repository. The licensing requirements differ depending on the repository visibility. For public repositories, secret scanning (and thus push protection) can be enabled without GitHub Advanced Security. However, for private or internal repositories, GitHub Advanced Security must be enabled at the organisation level [Push protection for repositories and organizations](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations).

You need organisation owner, security manager, or repository administrator permissions to change these settings [Enabling secret scanning for your repository](https://docs.github.com/en/code-security/secret-scanning/enabling-secret-scanning-features/enabling-secret-scanning-for-your-repository). Note that the github.dev web-based editor does not support push protection, so these changes must be made via the portal or API [Push protection for repositories and organizations](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations).

## Enable push protection

If push protection is not already active, enable it at the organisation level to apply it across your repositories, or at the individual repository level for a pilot.

To enable it for an organisation:

1. Navigate to your organisation settings.
2. Select **Code security and analysis**.
3. Under **Push protection**, select **Enable** for secret scanning.

This setting applies to all existing repositories in the organisation. If you are using security configurations, you can manage this at scale through those policies to ensure consistent application to new repositories as well [Push protection for repositories and organizations](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations).

When a developer attempts to push a commit containing a detected secret, the push is blocked. By default, anyone with write access can bypass this block by selecting a reason. This default behaviour is insufficient for strict security because it allows any contributor to override the control without oversight [Push protection for repositories and organizations](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations).

## Configure delegated bypass

Delegated bypass restricts who can override the block. You define a bypass list containing specific roles or teams. Only members of this list can approve bypass requests from other contributors [About delegated bypass for push protection](https://docs.github.com/en/code-security/secret-scanning/using-advanced-secret-scanning-and-push-protection-features/delegated-bypass-for-push-protection/about-delegated-bypass-for-push-protection).

To configure this at the organisation level:

1. Go to **Organisation settings** > **Code security and analysis**.
2. Under **Push protection**, locate **Who can bypass push protection for secret scanning**.
3. Select **Specific roles or teams**.
4. Click **Add role or team** and select the reviewers (e.g., the security team or repository administrators).

If you configure bypass at the organisation level, repository-level settings for this feature are disabled [Push protection for repositories and organizations](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations). This ensures a consistent policy across your estate.

Members of the bypass list can still push secrets, but they can choose to bypass the block by specifying a reason. They do not need to request approval from others. However, they are responsible for reviewing and approving or denying requests from other contributors. These requests appear in the **Security** tab under **Push protection bypass** [About delegated bypass for push protection](https://docs.github.com/en/code-security/secret-scanning/using-advanced-secret-scanning-and-push-protection-features/delegated-bypass-for-push-protection/about-delegated-bypass-for-push-protection).

## Verify the workflow

To verify the configuration, ask a developer who is not on the bypass list to attempt a push containing a known test secret. The push should be blocked, and the developer should be prompted to request a bypass. Check that the request appears in the **Push protection bypass** page for the designated reviewers [About delegated bypass for push protection](https://docs.github.com/en/code-security/secret-scanning/using-advanced-secret-scanning-and-push-protection-features/delegated-bypass-for-push-protection/about-delegated-bypass-for-push-protection).

Reviewers should evaluate the request. If approved, the developer can push the commit. If denied, the developer must remove the secret and push again. This cycle ensures that every bypass is intentional and reviewed [About delegated bypass for push protection](https://docs.github.com/en/code-security/secret-scanning/using-advanced-secret-scanning-and-push-protection-features/delegated-bypass-for-push-protection/about-delegated-bypass-for-push-protection).

You can monitor these activities by applying the `bypassed:true` filter on the secret scanning alerts page. This helps you identify patterns where bypasses are frequent, indicating a need for better developer guidance or secret management practices [Push protection for repositories and organizations](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations).

## Custom patterns and exceptions

If your organisation uses custom secret patterns, you can enable push protection for them as well. This requires testing the pattern in a repository first to avoid false positives [Push protection for repositories and organizations](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations). Enable push protection for the custom pattern at the enterprise, organisation, or repository level, depending on your scope [Push protection for repositories and organizations](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations).

Remember that forked repositories do not inherit push protection settings. You must enable it manually on each fork if required [Push protection for repositories and organizations](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations).
