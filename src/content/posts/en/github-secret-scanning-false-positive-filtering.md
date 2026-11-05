---
title: "GitHub secret scanning: review the new filters and your rotation runbook"
description: "Review GitHub’s detector improvements and SpaceX partnership with clear checks for credential validity, provider action and application recovery."
pubDate: "2026-11-05T20:27:08+00:00"
language: "en-CA"
category: "cloud-security"
tags: ["github-advanced-security", "secret-scanning", "github-secret-protection", "devsecops", "credential-security"]
translationKey: "github-secret-scanning-false-positive-filtering"
draft: false
---

A secret-scanning alert needs a clear next step: who can identify the credential, disable it and check that the application still works afterwards?

GitHub's [5 November update](https://github.blog/changelog/2026-11-05-secret-scanning-upgrades-detectors-adds-spacex-as-partner/) changes part of that detection process. Selected Alibaba, AWS and Google detectors suppress unpaired matches when dictionary filtering removes all qualifying companion values. The release also adds SpaceX as a partner and the `starlink_public_api_v2_secret` detector. These are useful reasons to review your coverage and your response runbook together.

[![GitHub’s original announcement graphic for updates to secret scanning.](/images/news/github-secret-scanning-20261105.jpg)](https://github.blog/changelog/2026-11-05-secret-scanning-upgrades-detectors-adds-spacex-as-partner/)

The practical opportunity is to spend less effort investigating unsuitable matches while keeping a reliable response for an actual exposed credential. The release note does not establish that your team will see a particular reduction in alerts or that any credential has already been revoked.

## Filtering and validity answer different questions

Consider a hypothetical repository containing a test fixture with a value shaped like a cloud credential identifier. Whether that text meets a detector's matching rules is one question. Whether a credential can still authenticate to its provider is another.

GitHub documents **validity checks** separately: for supported secrets, these checks contact the issuing service and can report an active, inactive or unknown status. Support depends on the secret type. [Validity-check documentation](https://docs.github.com/en/code-security/concepts/secret-security/validity-checks).

Keep those observations separate during triage. A filtering improvement can change which candidate matches are reported. It does not turn every remaining alert into a confirmed active credential, and an absence of alerts does not establish that the repository contains no secrets.

For the hypothetical fixture, ask the application owner what the value represents and why it exists. Record the explanation without copying credential values into a general ticket. If the provenance is uncertain, keep that uncertainty visible while the responsible team investigates it.

Avoid turning a detector update into a blanket decision to dismiss old findings. Review the evidence for each closure, including whether the underlying credential was real and what happened to it.

## A partner notification still needs an accountable response

GitHub's [partner-program documentation](https://docs.github.com/en/code-security/tutorials/secret-scanning-partner-program) describes sending matches found in public sources to a provider's endpoint. The provider implements the response, including revocation and user notification. That is a response path, not evidence that a particular credential has been disabled successfully.

For a team using Starlink APIs, the useful follow-up is to identify the credential owner and how the team would confirm provider action. Which application uses the credential? Who can replace it? How will operations know that the replacement is working and the exposed credential is no longer usable?

Those questions also matter when a provider takes action quickly. Disabling a credential can interrupt a legitimate integration. A response plan should connect the security decision to the application dependency, with the right people able to restore authorized operation.

Keep the provider confirmation and your application verification in the same incident record. A notification being delivered, a key being disabled and a service recovering are separate events to substantiate.

## Check which protection is actually enabled

Secret scanning and push protection address different points in the workflow. GitHub describes **push protection** as blocking supported secret types during a push attempt; it has its own enablement, supported patterns and bypass behaviour. [Push-protection guidance](https://docs.github.com/en/code-security/concepts/secret-security/push-protection).

For your repository, record which capabilities are enabled and who owns the exceptions. A detector announcement alone does not demonstrate that a push was blocked, that a bypass was reviewed or that a CI check ran. Use the actual configuration and events when explaining the control to the wider team.

For organization-owned private and internal repositories on GitHub.com, check the GitHub Team or Enterprise Cloud requirements and whether **GitHub Secret Protection** is enabled. [Availability](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning). Private-repository protection involves paid licensing based on active committers, so confirm the affected repository and contributor scope before enabling more coverage. [Licensing and billing](https://docs.github.com/en/billing/concepts/product-billing/github-advanced-security).

## Give the runbook a useful evidence checklist

The following is a suggested review worksheet. It has not been exercised against a repository or provider account for this article.

| Review point | Evidence to collect | Person to identify |
|---|---|---|
| Understand the finding | Detector, affected repository and explanation of the credential's purpose | Application or credential owner |
| Establish exposure and status | Relevant locations, available validity information and unresolved questions | Security investigator |
| Disable or replace the credential | Provider-side confirmation and an agreed replacement plan | Person authorized to manage the credential |
| Check the dependent service | A legitimate application operation using the approved replacement | Application or operations owner |
| Close the response | Recorded outcome, remaining exposure and any follow-up work | Incident coordinator |

For an Azure workload using stored credentials, Microsoft's [Key Vault secrets guidance](https://learn.microsoft.com/en-us/azure/key-vault/secrets/secure-secrets) recommends planned rotation and refreshing cached values when secrets change. Apply that dependency thinking to the runbook. Saving a new value in a vault and confirming that the issuer has disabled an exposed credential are separate checks.

Start with one integration whose credential owner is known. Walk through the worksheet with that owner, identify the missing evidence and agree who would act during an exposure. Better filtering helps the team find useful work; a clear, verifiable response is what lets it finish that work.

Cheers,  
**Marcos Nogueira**  
[Connect with me on LinkedIn](https://www.linkedin.com/in/mdnoga/)
