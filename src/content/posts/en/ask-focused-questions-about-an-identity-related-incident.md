---
title: "Ask focused questions about an identity-related incident"
description: "Use Security Copilot prompts to investigate Entra risky users systematically."
pubDate: 2025-12-22
category: governance
tags: ["entra-id", "security-copilot", "incident-response", "threat-intelligence", "identity-security"]
translationKey: ask-focused-questions-about-an-identity-related-incident
draft: true
---

When Microsoft Entra flags a user as risky, the immediate task is to determine whether the account is compromised or if the signal is a false positive. The quality of your investigation depends on the precision of the questions you ask and the evidence you gather. A scattered approach often misses the link between a suspicious login and a broader threat actor campaign.

Microsoft Security Copilot provides a structured way to gather this evidence using specific plugins. The [Entra Risky User investigation](https://github.com/Azure/Security-Copilot/blob/9207edc6d06f62481f5afe714e5a4b6482d0ee91/Promptbook samples/Entra Risky User investigation.md) promptbook outlines a workflow that moves from identity status to behavioural evidence, then to context, and finally to remediation. This is not an automated agent; it is a set of instructions you use to guide the Copilot interface and the underlying plugins.

[![Entra Risky User Investigation Flow](/images/posts/2025/azc-258-checkpoints.svg)](/images/posts/2025/azc-258-checkpoints.svg)

## Establish the identity risk status

The starting point is to confirm the user’s risk level and understand why the system flagged them. You need to know if the risk is based on a single anomalous event or a pattern of behaviour.

Using the Microsoft Entra plugin in Security Copilot, you can generate a report on the user’s risk status. This prompt confirms whether the user is currently considered risky and lists the specific reasons for that assessment. This is not just a binary yes or no; it provides the initial hypothesis for your investigation.

```
Generate a report based on Entra plugin, Is the user <userupn> considered risky? If yes, list the reasons.
```

This step establishes the scope. If the user is not flagged as risky, the investigation may need to pivot to other signals. If they are, the reasons provided (for example, "impossible travel," "anonymous IP," or "malicious IP") dictate the next lines of inquiry.

## Map authentication methods and recent activity

Once the risk status is confirmed, you need to understand the user’s authentication posture and recent activity. This helps determine if the attacker has access to the user’s credentials and how they are using them.

First, identify the authentication methods enabled for the user. This reveals the potential attack surface. If the user relies solely on a password and no multi-factor authentication (MFA), the risk is significantly higher than if they use a hardware key or Microsoft Authenticator.

```
What authentication methods are enabled for the user <userupn>?
```

Next, retrieve all login attempts made by the user within the past 30 days. This includes the IP addresses used. This historical context is crucial for identifying patterns. For example, a sudden spike in logins from different geographic locations or a series of failed attempts followed by a success can indicate a brute-force attack or credential stuffing.

```
Retrieve and list all login attempts made by the user within the past 30 days, along with the corresponding IP addresses used for each login attempt.
```

## Validate IP reputation and threat actor association

The IP addresses identified in the login attempts are your primary leads. You need to determine if these IPs are benign, malicious, or associated with known threat actors. This is where Microsoft Defender Threat Intelligence (MDTI) becomes essential.

For each IP address found in the login attempts, check its reputation. MDTI can provide context on whether the IP is known for malicious activity, such as hosting phishing sites, distributing malware, or acting as a command-and-control server.

```
Provide the reputation of any IPs or hostnames found
```

If an IP is flagged as malicious, the next step is to validate its association with any known threat actors. This helps you understand the sophistication of the attack and whether it is part of a broader campaign targeting your organisation or industry.

```
If any IP address is found, validate its association with any known Threat actor?
```

This step transforms raw IP data into actionable intelligence. Knowing that an IP is associated with a specific threat actor group can help you prioritise the incident and alert other security teams.

## Assess group membership and recommend remediation

The final phase of the investigation involves understanding the user’s permissions and recommending immediate actions. If the user is a member of high-privilege groups, the potential impact of a compromise is greater.

List all the groups that the user is a member of. This helps you assess the blast radius of the incident. If the user is a member of the "Global Administrators" group, for example, the incident requires immediate and aggressive remediation.

```
List the groups user <username> is part of
```

Based on the findings from the previous steps, recommend remediation steps to mitigate the risk. This might include resetting the user’s password, enforcing MFA, disabling the account, or revoking active sessions. The recommendations should be tailored to the specific risks identified.

```
Recommend remediation steps to mitigate the user risk
```

## Generate an executive summary

To communicate the findings to stakeholders, generate an executive report. This summary should include metadata about the user, such as their User Principal Name (UPN), suspected country of origin, configured authentication method, and any recorded failed login attempts. It should also outline key areas requiring remediation and provide a coherent paragraph elucidating mitigation strategies.

```
Generate an executive report summarizing insights on a potentially risky user. Commence with metadata details for the user, encompassing their User Principal Name (UPN), suspected country of origin, configured authentication method, and any recorded failed login attempts. Follow this with a bullet-point list outlining key areas requiring remediation to address the identified risks. Subsequently, craft a coherent paragraph elucidating mitigation strategies aimed at ameliorating the highlighted concerns
```

## Verification

Review the generated report and ensure that all recommended remediation steps have been implemented. Monitor the user’s account for any further suspicious activity. If the risk persists, consider escalating the incident to a higher level of security review.

The investigation is complete when the user’s risk status is resolved, and the account is secured against further compromise. This may involve additional steps, such as reviewing and updating security policies or conducting user training.

References for Ask focused questions about an identity-related incident: [Entra Risky User investigation](https://github.com/Azure/Security-Copilot/blob/9207edc6d06f62481f5afe714e5a4b6482d0ee91/Promptbook samples/Entra Risky User investigation.md).
