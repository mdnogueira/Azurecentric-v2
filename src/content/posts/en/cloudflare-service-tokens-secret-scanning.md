---
title: "Cloudflare service-token detection: keep revocation in the runbook"
slug: "cloudflare-service-tokens-secret-scanning"
description: "GitHub detects Cloudflare Access service tokens. Check the exact support row, licensing and the handover from detection to credential containment."
pubDate: "2026-11-12T21:16:40+00:00"
language: "en-CA"
category: "cloud-security"
tags: ["github", "cloud-security", "secret-scanning", "cloudflare", "devsecops"]
translationKey: "cloudflare-service-tokens-secret-scanning"
draft: false
---

![A response workflow separating GitHub detection from Cloudflare credential containment and workload verification](/images/news/cloudflare-service-token-response-en.svg)

GitHub now detects Cloudflare Access service tokens through the `cloudflare_access_service_token` pattern. That gives teams another way to find an exposed credential. The useful operational question is what happens after the finding: who can stop that credential working, and who can restore the automation that depends on it?

The [12 November announcement](https://github.blog/changelog/2026-11-12-secret-scanning-adds-a-detector-for-cloudflare) identifies the new pattern. It does not announce automatic revocation or a new CI failure rule. The current detector-specific documentation is particularly useful here: user alerts are supported, but partner notifications, push protection and validity checks are not listed as supported for this pattern.

## Read the capability row before changing the runbook

The [supported-patterns table](https://docs.github.com/en/code-security/reference/secret-security/supported-secret-scanning-patterns) distinguishes capabilities for each secret type. At review time, the Cloudflare Access Service Token row shows:

| Capability | Current support for this pattern |
| --- | --- |
| User alert | Yes |
| Partner notification | No |
| Push protection | No |
| Validity check | No |
| Metadata check / Base64 | No / No |

This matters because the announcement also includes a general explanation of partner secrets. That explanation is not evidence that this particular pattern sends a notification to Cloudflare. Nor does a detection mean GitHub has confirmed that the credential is still usable. Investigate the finding without treating an absent validity result as reassurance.

Cloudflare support itself is not new: GitHub's [April pattern update](https://github.blog/changelog/2026-04-14-secret-scanning-pattern-updates-and-product-improvements/) already covered other Cloudflare credential types. November's addition should be understood at the service-token level.

[Secret scanning](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning) runs automatically for free on public repositories. For organization-owned private and internal repositories, GitHub documents GitHub Secret Protection enabled on GitHub Team or Enterprise Cloud as a requirement. Check the repository's ownership, plan and settings before assuming coverage; a public-repository feature does not establish a private-repository entitlement. Private coverage can therefore carry a licensing cost. This announcement does not establish a new price or a Cloudflare subscription change.

## Understand the access behind the secret

A [Cloudflare service token](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/) has a Client ID and Client Secret. It lets a service authenticate to an application protected by Cloudflare Access, with access determined by the application's policies. It is not interchangeable with a general Cloudflare administration API token, and broad permissions should not be assumed from its name.

Consider a hypothetical build job that calls an internal deployment endpoint protected by Access. The repository finding is one part of the incident. The application policy, token owner and consuming job determine the exposure and the operational impact of containment. Record those relationships before an incident, including an owner who can manage the service token and an owner who can update the job's secret store.

The new detector is useful evidence for that response. It does not replace least-privilege Access policies or keeping credentials outside source control. An empty alert list is also not proof that every credential format or every encoding has been covered.

## Contain the credential, then verify the dependent service

GitHub's [alert-resolution guidance](https://docs.github.com/en/code-security/how-tos/manage-security-alerts/manage-secret-scanning-alerts/resolving-alerts) says to treat a committed secret as compromised. A practical response needs both repository and issuer actions:

| Owner | Evidence to collect |
| --- | --- |
| Repository responder | Alert location, affected history and responsible workload, without copying the secret into an issue |
| Cloudflare credential owner | The containment decision and evidence that the exposed credential can no longer authenticate |
| Workload owner | Updated secret configuration and a successful authorized request using the replacement |
| Incident responder | Relevant access-log review, affected dependencies and the reason for closing the alert |

Cloudflare documents service-token management under **Zero Trust > Access controls > Service credentials > Service Tokens**. Its **Rotate secret** action can allow a grace period for the previous secret or revoke it immediately. A grace period supports a planned changeover, but leaves the old credential usable during that period. For an exposure, make that choice through the incident process rather than treating continuity as containment.

Deleting the service token revokes its access and can interrupt every dependent service. **Refresh** extends token lifetime; it does not substitute for replacing an exposed secret. There is another easy distinction to miss: **Revoke existing tokens** in an Access application revokes sessions, while a still-valid service-token Client ID and Client Secret can obtain a new session. Use the documented credential action appropriate to the incident, with an authorized administrator and the dependent-service impact understood.

## Make verification an explicit handover

As a suggested exercise, map one service-token consumer to its Access application, policy, secret store and accountable owners. Then document the expected checks: the replacement works for its intended purpose, the exposed credential is denied after containment, and the job has no remaining dependency on the old value. Use an approved test environment and avoid putting real secrets into test notes. This is a planning exercise, not a test carried out for this article.

Findings appear in the repository's **Security and quality** area. Closing an alert records a disposition; it does not revoke a Cloudflare credential. Removing the value from the latest file is likewise not credential containment. Keep the alert open until the response evidence supports resolution.

The adoption decision is modest: confirm coverage, assign the handover and add this pattern to the existing response process. [Push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection) remains a separate capability. Do not promise that this new detector blocks a push or automatically fails a build when its current support row says otherwise.

Cheers,

**Marcos Nogueira**  
[Connect on LinkedIn](https://www.linkedin.com/in/mdnoga/)
