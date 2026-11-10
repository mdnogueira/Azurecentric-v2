---
title: "Dependabot’s inactivity pause: check coverage before 8 December"
slug: "dependabot-alerts-inactive-repositories"
description: "GitHub will pause Dependabot alerts on most inactive repositories from 8 December. Review workload ownership, enforced settings and monitoring coverage."
pubDate: "2026-11-10T16:44:20+00:00"
language: "en-CA"
category: "cloud-security"
tags: ["dependabot", "supply-chain-security", "github", "vulnerability-management", "devsecops"]
translationKey: "dependabot-alerts-inactive-repositories"
draft: false
---

A repository can stop changing while the application built from it keeps running. That distinction matters when deciding where dependency monitoring must remain enabled.

GitHub's [10 November announcement](https://github.blog/changelog/2026-11-10-dependabot-alerts-will-pause-on-inactive-repositories) says that, starting **8 December 2026**, Dependabot alerts will be turned off on most repositories with no activity for a year. Existing alerts will be archived rather than deleted. This is an announced future change, rather than a reason to assume that an inactive repository has already lost alert coverage today.

[![GitHub announcement graphic: Dependabot will turn off alerts on inactive repositories.](/images/news/dependabot-inactive-repositories-20261110.png)](https://github.blog/changelog/2026-11-10-dependabot-alerts-will-pause-on-inactive-repositories)

The proposed operational approach is to identify dormant repositories that still matter to a running service, recovery process or future deployment. Keep the decision about monitoring attached to an owner and the workload's lifecycle, rather than treating the absence of commits as evidence that the code no longer matters.

## Understand the clock and the exceptions

GitHub counts a push to any branch or tag, repository creation, or enabling Dependabot alerts as activity. A push automatically enables alerts again; administrators can also enable them in repository settings. Either route restores archived alerts and restarts the one-year clock.

The announcement identifies two exceptions: an enforced security configuration that enables Dependabot alerts, and an enterprise Dependabot policy that prevents repository administrators from enabling or disabling them. Check that alerts are actually enabled; restricting who can change a setting is not, by itself, evidence that the desired setting is on.

The change covers all plans on GitHub.com and GitHub Enterprise Cloud with data residency, where archived alerts remain in the enterprise's region. GitHub Enterprise Server is excluded. The notice does not specify a completion time for every repository or detailed API and webhook behaviour for the transition.

## Build an inventory around the service

Consider a hypothetical application deployed to Azure from a repository whose last push was more than a year ago. The application still serves users, and the repository remains its rebuild source. A quiet repository and a retired application are different lifecycle states.

Start with the service owner and establish whether that code can still reach production, directly or through a recovery procedure. Include deployment scripts and dependencies used to rebuild an older release. The useful output is a small set of explicit decisions, rather than an artificial maintenance commit made only to reset a clock.

| Review question | Evidence to retain |
| --- | --- |
| Is this code still operationally relevant? | Running service, deployment or recovery dependency, confirmed by an owner. |
| What is the repository's status? | Last relevant activity, alert enablement and whether the repository itself is archived. |
| What keeps monitoring enabled? | The applied configuration and its enforcement, or the applicable enterprise policy and current alert setting. |
| Who handles a finding? | A named remediation owner and a route for reviewing an affected dependency. |
| How will we verify the decision? | A dated coverage check and a review after the announced change begins. |

This is a suggested worksheet, not a report of repositories inspected or a tested migration procedure. Archiving alerts under the new policy should also be distinguished from archiving the repository itself: GitHub's [Dependabot documentation](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-alerts) states that archived repositories are not scanned.

## Check the applied configuration, not just its name

GitHub's [custom security configuration guidance](https://docs.github.com/en/code-security/how-tos/secure-at-scale/configure-organization-security/establish-complete-coverage/create-custom-configuration) separates choosing feature settings from enforcing them. Enforcement covers settings explicitly enabled or disabled; settings left unspecified are not enforced. Creating a configuration also needs to be followed by applying it to the intended repositories.

Review this with the appropriate organization administrator. For enterprise policy, [GitHub documents a specific control](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise#enforcing-a-policy-to-manage-the-use-of-dependabot-alerts-in-your-enterprise) over whether repository administrators can manage Dependabot alerts. Organization owners and security managers retain separate authority, so describe the actual policy rather than claiming that nobody can change the setting.

The announcement does not introduce a new monitoring fee or say that every repository needs a paid Advanced Security product. However, a custom configuration can also enable paid Code Security or Secret Protection features on private and internal repositories. Review the whole configuration and its licensing implications before applying it broadly. This article does not enable a product, change policy or incur service charges.

## Verify coverage separately from the alert count

For teams using Azure, [Microsoft Defender for Cloud's DevOps security documentation](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-devops-introduction) describes visibility into connected repositories, security enablement and dependency findings. That makes coverage a useful part of a review alongside the findings themselves. It does not establish how this particular GitHub transition will appear in every connector or custom integration.

If you export Dependabot data to another tool, check its behaviour against the applicable documentation and your actual configuration. Establish how you distinguish alerts enabled with no findings from alerts disabled or data unavailable. A lower count does not prove remediation. Do not base a detection rule on an assumed webhook event.

Before 8 December, agree which repositories require continued monitoring and verify their configuration. After the change starts, recheck coverage and record any exceptions with an owner. The decision should remain understandable to the next person responsible for the service.

Marcos Nogueira  
[LinkedIn](https://www.linkedin.com/in/mdnoga/)
