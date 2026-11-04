---
title: "The CIA triad: three questions to ask about the same service"
description: "Use confidentiality, integrity and availability to review one customer portal, choose useful evidence, and understand where security controls leave gaps."
pubDate: 2026-11-06T11:00:00-05:00
language: en-CA
category: cloud-security
tags: [cybersecurity, cloud-security, data-protection, security-architecture]
translationKey: cybersecurity-in-practice-02-cia-triad
draft: false
---

*Episode 2 of the series Cybersecurity in Practice*

[View the series](/series/cybersecurity-in-practice)

A customer can sign in to your application, open a request and get a response. Everything looks healthy. Then you discover that the same customer can open somebody else's request by changing an identifier in the address.

The application was available. The information was not kept within its intended audience. Those are two different observations, and that difference is why the CIA triad is useful.

Here, CIA means **confidentiality, integrity and availability**. It gives us three questions to ask about the same service: who can read the information, who can change it, and whether the right people can use it when needed. Microsoft's [security design principles](https://learn.microsoft.com/en-us/azure/well-architected/security/principles) place these concerns together in a secure workload. For our review, the important step is to give each concern its own evidence.

![Three distinct failure scenarios around a fictional customer portal: a record disclosed to the wrong person, an unauthorized change to a request and a service that cannot be restored.](/images/series/cybersecurity-in-practice/episode-02-cia-triad.svg)

## Keep one application in view

We will continue with the **fictional customer portal** from Episode 1. Customers submit requests, staff process them, and an operations team keeps the service running. The examples in this article are illustrative; they are not findings from a real deployment.

The portal holds names, contact details, request descriptions and a history of changes. It depends on identity, application code, a data store and recovery arrangements. We can use that small scope to make the three concerns concrete without trying to review an entire organization at once.

Before discussing controls, agree which information the service holds and where it flows. Microsoft's [data classification guidance](https://learn.microsoft.com/en-us/azure/well-architected/security/data-classification) explains why sensitivity and organizational requirements should influence protection. For this exercise, use your organization's classification scheme. Creating a convenient new label just for the application would leave the wider team guessing what it means.

## Confidentiality: who should be able to read it?

Imagine that a customer opens another customer's request. The service may still return a successful response, but the audience for that information is wrong.

The useful review question is specific: can a customer read only the requests they are allowed to see? Follow the request from sign-in to the decision about the individual record. A valid account does not, by itself, answer that second question.

For the fictional portal, a suggested test would use two synthetic customer accounts and separate synthetic requests in an authorized test environment. The expected result is that each account can read its own permitted records and cannot read the other account's records. This is a proposed verification, not a test performed for this article. Avoid using real customer data to demonstrate the point.

Also consider staff access, exports and support workflows. Restricting the customer interface would leave a gap if an unrelated staff role could download the same records through an administrative function.

## Integrity: can we trust what the record says?

Now consider a different failure. A request says that the customer approved a change, but someone altered that status without permission. No information needed to leave the portal for the record to become untrustworthy.

For our review, separate permission to read a record from permission to change it. Then ask how an approved change is associated with the identity that made it. An activity trail can support an investigation, but simply having logs does not prove that every required action was authorized or that the logs are protected adequately.

A practical evidence request is to trace one permitted update using synthetic data: who requested it, which role allowed it, what changed and how the event can be found afterwards. Add a corresponding attempt by a role that should not be able to make that update. Agree the expected results before running either check.

There is a recovery question here too. Restoring an old copy of a request might remove an unauthorized alteration, but it could also remove legitimate changes made since that copy. The team needs to understand what it is restoring and how it decides that the recovered information is trustworthy.

## Availability: can the service return safely?

The third failure is easier to see: the portal is unavailable when customers need it. Still, “the web page opens” is a narrow definition of recovery. Can a customer sign in, read the right request and submit a valid update? Can staff process it afterwards?

For the fictional portal, a recovery exercise should define that usable outcome before selecting the technical steps. A database backup on its own does not describe how application hosting, identity dependencies and the people performing recovery will work together.

Security controls also belong in that discussion. Microsoft's [security tradeoff guidance](https://learn.microsoft.com/en-us/azure/well-architected/security/tradeoffs) describes how added dependencies, configuration complexity and recovery access can affect reliability. The response is to include those dependencies in the design and recovery exercise. Disabling a control during an incident without an agreed decision process introduces another uncertainty when the team is already under pressure.

## Put the three questions on one review sheet

Use the following as an illustrative worksheet. The evidence column describes what you would collect; it does not claim that these checks have passed.

| Concern | Question for the portal | Suggested evidence |
|---|---|---|
| Confidentiality | Can one customer read another customer's request? | Authorized synthetic-account checks and the record-access design |
| Integrity | Can an unsuitable staff role change an approval status? | Allowed and denied update checks, plus the associated audit events |
| Availability | Can the team restore a usable service with trustworthy records? | A recovery exercise record covering application dependencies and business checks |

Assign an owner to each unanswered question. The application team may investigate record access, a data owner may define the intended audience, and operations may coordinate recovery. Write down the actual responsibilities for your service rather than assuming those example assignments fit every team.

Then choose one concern to investigate first. Explain why it matters for this service, what evidence is missing and when the team will review it. A concern can remain open while evidence is being collected; an empty box is more useful than a confident answer nobody can substantiate.

In my working phases, this exercise belongs mainly to **Assess** and feeds **Plan**. It also tells us what protection, detection, response and recovery must demonstrate. Those activities overlap, as we discussed in Episode 1.

Before the next article, add all three questions to the service you selected. **Next Friday, we will separate authentication from authorization** and follow the access decision from identifying a user to permitting an action on a particular resource.

Cheers,  
**Marcos Nogueira**  
[Connect with me on LinkedIn](https://www.linkedin.com/in/mdnoga/)
