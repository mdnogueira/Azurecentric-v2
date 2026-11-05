---
title: "Authentication and authorization: follow the decision past sign-in"
description: "Follow one customer-portal access decision through sign-in, record permissions, API identity and Azure RBAC, with a worksheet for allowed and denied cases."
pubDate: "2026-11-13T11:00:00-05:00"
language: "en-CA"
category: "identity-access"
tags: ["cybersecurity", "authentication", "authorization", "microsoft-entra-id", "rbac"]
translationKey: "cybersecurity-in-practice-03-authentication-vs-authorization"
draft: false
---

*Episode 3 of the series Cybersecurity in Practice*

[View the series](/series/cybersecurity-in-practice)

Your customer signs in successfully, completes MFA and opens the portal. That tells you something useful about the sign-in. You still need to establish whether that customer can read a particular request, change its status or download an attachment.

Authentication and authorization answer different questions. Authentication verifies a claimed identity; authorization determines which actions that identity is allowed to perform. Microsoft makes this distinction in its [identity platform guidance](https://learn.microsoft.com/en-us/entra/identity-platform/authentication-vs-authorization).

In Episode 2, we used confidentiality, integrity and availability to examine a fictional customer portal. This week, we will follow one access decision inside that same portal. The accounts, records and expected outcomes below are illustrative, not findings from a deployment.

![A fictional customer passes authentication, then the portal separately checks permission for a specific request and operation. Successful sign-in does not bypass the authorization decision.](/images/series/cybersecurity-in-practice/episode-03-access-decision.svg)

## Follow the decision to the individual record

Suppose Customer A owns request A, while Customer B owns request B. Both are legitimate users. Both should be able to sign in. The portal's proposed rule is that each customer can read their own request and cannot read the other customer's request.

The interesting check comes after sign-in. If Customer A changes the request identifier in an address or API call, what stops the portal returning request B? Hiding a link in the interface leaves that question unanswered. The service handling the request needs to enforce the access rule before returning the protected information.

Microsoft's [resource-based authorization guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resource-based?view=aspnetcore-10.0) demonstrates evaluating a user against a particular resource and policy. It also explains why an authenticated-user attribute alone is insufficient for that resource-specific decision. The implementation depends on the application framework; the review question remains the same: where is this identity's permission for this record checked?

Keep the operation explicit. Permission to read a request does not automatically mean permission to approve it, delete it or export its attachments. For our fictional portal, write a separate expected outcome for each operation that matters to the business.

## Know which identity is making the next call

The portal might call another API after the customer signs in. That introduces another access decision, and potentially another identity.

Microsoft distinguishes **delegated access**, where an application acts on behalf of a signed-in user, from **app-only access**, where the application acts without a signed-in user. Delegated permissions and application permissions serve those different scenarios. [Permissions and consent overview](https://learn.microsoft.com/en-us/entra/identity-platform/permissions-consent-overview).

For the portal review, draw that next call on the dependency map. Does the receiving API see the customer's delegated context, or does it see the portal's application identity? Who is responsible for limiting which customer record can be requested? Do not assume the customer restriction follows automatically because the first screen required sign-in.

A token also needs the right interpretation at the receiving API. Microsoft's [claims-validation guidance](https://learn.microsoft.com/en-us/entra/identity-platform/claims-validation) calls for checking the intended audience, tenant, subject and calling application. A token being present is not sufficient evidence of permission. Use the supported validation approach for your application rather than treating a decoded token as a completed security check.

For the exercise, collect configuration and the application team's explanation of that boundary. You do not need to copy live tokens into a ticket to describe it.

## An Azure role answers a particular access question

The same distinction matters when someone reports that they can see an Azure resource but cannot use its data.

An Azure RBAC assignment combines a **security principal, role definition and scope**. It grants permissions for the actions and resources covered by that assignment. [Azure RBAC overview](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview).

For Blob Storage, Microsoft documents that using Microsoft Entra credentials to access data through the Azure portal requires a suitable data role and at least Azure Resource Manager Reader access. Seeing the storage account is therefore a different question from reading its blobs. [Blob data access requirements](https://learn.microsoft.com/en-us/azure/storage/blobs/assign-azure-role-data-access).

When investigating that situation, record the operation, identity, access method and scope before proposing a role change. A portal session, an application call and a background process may be using different identities or credentials. Adding a broad role before establishing those facts makes the access design harder to explain afterwards.

For our portal, keep the customer-to-record decision separate from the application's permission to its storage. The application being allowed to read a container does not describe which customer should receive a particular attachment.

## Write the allowed and denied cases together

Use the following suggested worksheet in an authorized test environment with synthetic accounts and synthetic records. Agree the expected results with the service owner before running it. These checks have not been executed for this article.

| Scenario | Proposed expected outcome | Evidence to collect |
|---|---|---|
| Customer A reads request A | Allow under the agreed ownership rule | Request identifier, relevant identity and server-side decision |
| Customer A attempts to read request B | Deny without returning B's protected content | Denial behaviour and the rule that was evaluated |
| Customer A attempts a staff-only approval | Deny even after successful sign-in | Operation-level policy and the decision |
| An authorized staff role performs an assigned action | Allow only within its agreed remit | Role, resource scope and associated audit event |

The successful cases matter as much as the denied cases. A control that blocks every request can look restrictive while preventing the service from doing its job. Verification needs to demonstrate that the intended work still functions within the agreed boundaries.

Keep authentication evidence and authorization evidence distinct in the review notes. A sign-in event may help establish the identity context. The application decision and its audit trail are needed to understand why an operation on a record was permitted or refused. Decide who can investigate each part when a customer reports a problem.

## Give the unanswered question an owner

For the fictional portal, the identity team can explain sign-in configuration. The application team can explain record and operation rules. The platform team can explain access to the underlying Azure resources. Your actual responsibilities may be arranged differently; record them explicitly.

In my working phases, this starts with **Assess** and **Plan**, then gives **Protect** and **Detect** concrete decisions to enforce and observe. Those phases overlap, with governance and learning across the work. They are my practical working model, rather than official Microsoft phase names.

Before next Friday, choose one permitted action and one denied action for the same service. Write down the identity, resource, operation, rule and evidence you expect. **Next, we will build on that distinction with the basics of identity and access management**, including how access changes as people join, move and leave.

Cheers,  
**Marcos Nogueira**  
[Connect with me on LinkedIn](https://www.linkedin.com/in/mdnoga/)
