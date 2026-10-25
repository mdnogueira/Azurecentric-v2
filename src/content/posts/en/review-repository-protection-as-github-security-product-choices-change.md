---
title: "Review repository protection as GitHub security product choices change"
description: "How to apply GitHub security configurations after the April 2025 GHAS split into Secret Protection and Code Security."
pubDate: 2025-04-05
category: governance
tags: ["github", "security", "ghas", "secret-protection", "code-security", "configuration"]
translationKey: review-repository-protection-as-github-security-product-choices-change
draft: false
---

The April 2025 restructuring of GitHub Advanced Security (GHAS) changes how you manage repository protection. The single monolithic product has split into two standalone offerings: GitHub Secret Protection and GitHub Code Security. This split affects both the billing model and the configuration strategy for GitHub Team and Enterprise customers.

If you are managing an organisation on the GitHub Team plan, you now have the option to purchase these products separately. For Enterprise customers, the transition depends on your renewal cycle. The immediate operational question is not just which product to buy, but how to apply the new security configurations to your repositories effectively.

## Understand the new product boundaries

GitHub Secret Protection and GitHub Code Security serve different purposes. Secret Protection focuses on detecting and preventing secret leaks. It includes secret scanning, AI-detected passwords, and push protection. Code Security focuses on vulnerabilities in your code and dependencies. It includes Copilot Autofix, security campaigns, and Dependabot features.

Both products are available for $19 and $30 per month per active committer respectively for new customers. GitHub Team customers can purchase them on a consumption-based, pay-as-you-go model starting April 1, 2025. Existing Enterprise customers with sales-managed plans transition at renewal. Self-serve customers will receive transition instructions via the GitHub roadmap and changelog.

## Choose a configuration strategy

GitHub offers two types of security configurations: the GitHub Security Configuration and Custom Security Configurations. The GitHub Security Configuration is the recommended starting point. It is created and managed by GitHub’s subject matter experts and is designed to secure both low- and high-impact repositories. It includes features from both Secret Protection and Code Security.

Applying the GitHub Security Configuration to private and internal repositories incurs usage costs or requires licenses. It is the quickest way to apply security settings across your organisation. However, if you have specific security needs that the default configuration cannot meet, you can create Custom Security Configurations. These allow you to edit enablement settings for different features and control usage and costs by including or excluding specific product features for particular repositories.

Only one security configuration can be applied to a repository at a time. You should start with the GitHub Security Configuration, evaluate the findings, and then decide if a custom configuration is necessary.

## Apply the configuration to your repositories

To apply a security configuration, you need organisation-level permissions. You can apply the configuration to all repositories or filter for specific ones.

1. Navigate to your organisation’s settings.
2. Go to the security configurations page.
3. Select the repositories you want to apply the configuration to. You can use filters to narrow down the list.
4. Select **Apply configuration** and choose the configuration name.

If you apply an enforced configuration, repository owners are blocked from changing features that have been enabled or disabled in the configuration. Features that are not set are not enforced.

Alternatively, you can use Security Overview to enable or disable security features for multiple repositories at the same time. This is useful for gradual rollouts or complex security setups. You can use the search bar to filter repositories based on criteria such as repository name, enablement status, or custom properties. Select the repositories, click **Security settings**, and enable or disable the desired features. Click **Apply changes** to confirm.

## Verify and monitor

After applying the configuration, verify that the security features are enabled as expected. Check the security findings for each repository to ensure the configuration is working correctly. If you encounter issues, refer to the troubleshooting documentation. You can also interpret security findings to understand the security posture of your repositories.

The transition to the new product structure requires careful planning. By understanding the boundaries of Secret Protection and Code Security, choosing the right configuration strategy, and applying the configuration effectively, you can maintain a strong security posture for your repositories. Monitor your usage and costs regularly to ensure you are getting the most value from the new products.

For further details on the transition, refer to the GitHub changelog and roadmap. Contact your account team if you have an Enterprise plan managed by GitHub or Microsoft sales.


References for Review repository protection as GitHub security product choices change: [Review repository protection as GitHub security product choices change](https://github.blog/changelog/2025-03-04-introducing-github-secret-protection-and-github-code-security/), [Applying a custom security configuration](https://docs.github.com/en/code-security/securing-your-organization/enabling-security-features-in-your-organization/applying-a-custom-security-configuration), [Choosing a security configuration for your repositories](https://docs.github.com/en/code-security/securing-your-organization/introduction-to-securing-your-organization-at-scale/choosing-a-security-configuration-for-your-repositories).
