---
title: "GitHub Code Security and Secret Protection: plan for the new product choices"
description: "Plan for GitHub's new security products starting April 2025, separating secret protection from code security."
pubDate: 2025-03-08
category: cloud-security
tags: ["github-advanced-security", "github", "github-secret-protection", "github-code-security"]
translationKey: github-code-security-and-secret-protection-plan-for-the-new-product-choices
draft: false
---

The announcement on 4 March 2025 changes how GitHub structures its advanced security offerings. Starting 1 April 2025, GitHub Advanced Security (GHAS) splits into two standalone products: GitHub Secret Protection and GitHub Code Security. This separation forces a decision that many organisations have previously avoided: do you need to stop secrets leaking, or do you need to fix vulnerabilities in your code? Or both?

The split is not just a billing change. It alters which features you enable, who pays, and how you govern the results. If you are planning a rollout, you need to understand the capabilities of each product before you commit to a budget.

## The two new products

GitHub Secret Protection focuses on preventing sensitive data from entering your repositories. It includes secret scanning, AI detection with a low rate of false positives, and push protection. Push protection is a governance feature that stops commits containing secrets from being pushed to the repository in the first place. This requires configuration to enforce rules, but it prevents the leak from happening.

GitHub Code Security focuses on vulnerabilities in the code itself. It includes Copilot Autofix for vulnerabilities in existing code and pull requests, security campaigns to address security debt at scale, and Dependabot features for protection against dependency-based vulnerabilities. It also provides security findings for third-party tools. This product is about fixing the code before it reaches production.

Both products include a security overview. This provides insight into the distribution of risk across your organisation. You can view, sort, and filter security alerts and coverage information from across your organisation or enterprise. This is where you assess adoption and risk.

## Pricing and availability

The pricing model is per active committer. GitHub Secret Protection is $19 per month per active committer. GitHub Code Security is $30 per month per active committer. If you need both, the cost is $49 per month per active committer. This is a consumption-based, pay-as-you-go model.

Starting 1 April 2025, customers on the GitHub Team plan can purchase Secret Protection and Code Security. This is a significant change. Previously, these features were largely available only to Enterprise customers. Now, smaller teams can access them. For existing customers with plans managed with a GitHub or Microsoft sales account team, you can transition to the new GitHub Advanced Security plans at the start of renewal for renewal dates after 1 April 2025. For existing self-serve customers, instructions on how to transition will be announced over the coming months through GitHub’s roadmap and changelog.

## Planning your rollout

Adopting these tools at scale requires a phased approach. GitHub recommends six core phases for rolling out GHAS. You should follow these phases, but modify them to meet the needs of your company.

1. Align on your rollout strategy and goals. Think about what success will look like, and align on how GHAS will be implemented in your company. This phase may only take a few days or a week, but it lays a solid foundation for the rest of the rollout.
2. Preparing to enable at scale. Prepare developers, collect data about your repositories, and ensure you're ready for the next phase.
3. Pilot programs. Optionally, pilot an initial rollout to a few high-impact projects and teams. This will allow an initial group within your company to get familiar with GHAS before you roll out to the remainder of your company.
4. Create internal documentation. Create and communicate internal documentation for the consumers of GHAS. Without proper documentation provided to developers, security engineers, and others who will be using GHAS, the value will get lost in the rollout.
5. Rollout and scale code scanning. Leveraging the available APIs, automatically rollout code scanning by team and by language across your enterprise, using the repository data you collected earlier.
6. Rollout and scale secret scanning. Roll out secret scanning, which involves less configuration and is therefore simpler to adopt than code scanning. Still, it's critical to have a strategy for handling new and old results.

## Making the decision

You need to decide which product to buy first. If your primary concern is preventing accidental leaks of API keys or passwords, start with GitHub Secret Protection. The push protection feature is a strong control. It stops the leak before it happens. This is often the easiest win for security teams.

If your primary concern is fixing vulnerabilities in your code, start with GitHub Code Security. The Copilot Autofix feature can help developers fix vulnerabilities in existing code and pull requests. This is a developer-first security management approach. It reduces the burden on security teams by enabling developers to fix issues themselves.

If you need both, you can purchase both products. The security overview will help you track the distribution of risk across your organisation. You can view metrics for secret scanning push protection and pull request alerts. This data is essential for measuring the effectiveness of your security posture.

## Next steps

Check your current GitHub plan. If you are on the Team plan, you can purchase Secret Protection or Code Security from your organization settings pages starting 1 April 2025. If you are on an Enterprise plan, contact your account team to discuss the transition.

Start by aligning on your rollout strategy. Define what success looks like for your organisation. Then, prepare your developers and collect data about your repositories. Finally, pilot the features you choose with a few high-impact projects. This will allow you to test the tools and refine your processes before a full rollout.

The split of GitHub Advanced Security into two standalone products is a significant change. It forces you to think about your security needs in a more granular way. By understanding the capabilities of each product and following a phased rollout approach, you can ensure that your codebase is secure and your developers are supported.

For more information, see the [GitHub blog post](https://github.blog/changelog/2025-03-04-introducing-github-secret-protection-and-github-code-security/) and the [Introduction to adopting GitHub Advanced Security at scale](https://docs.github.com/en/code-security/adopting-github-advanced-security-at-scale/introduction-to-adopting-github-advanced-security-at-scale).
