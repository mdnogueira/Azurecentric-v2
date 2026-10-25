---
title: "Use recovery evidence to refine an availability target"
description: "Use recovery evidence to refine availability targets, distinguishing high availability from disaster recovery based on risk classification."
pubDate: 2026-08-29
category: governance
tags: ["availability", "disaster-recovery", "high-availability", "business-continuity", "reliability"]
translationKey: use-recovery-evidence-to-refine-an-availability-target
draft: false
---

You have a target uptime percentage in mind, perhaps derived from a service level agreement or an internal business requirement. The first thing to check is whether that target is being driven by the frequency of the risks you face, or by the severity of the consequences if those risks materialise. High availability and disaster recovery are often conflated, but they address different classes of failure. Using evidence from actual recovery events is the most reliable way to decide which one your workload actually needs.

## Distinguish the risk class

[![Risk Classification and Availability Target Refinement](/images/posts/2026/azc-347-checkpoints.svg)](/images/posts/2026/azc-347-checkpoints.svg)

Business continuity planning starts with risk identification and classification. Microsoft’s reliability guidance defines high availability as designing a solution to be resilient to day-to-day issues, while disaster recovery is about planning for uncommon risks and catastrophic outages [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery).

Common risks include transient network issues, virtual machine reboots, and occasional hardware failures within a datacentre. These are frequent enough that your workload must handle them automatically to maintain uptime. Uncommon risks, such as a full datacentre outage or a region-wide disaster, are rare but severe. Your availability target should reflect the likelihood of these events. If your target is 99.99%, you are effectively demanding that the workload survive common failures without interruption. If you are also targeting survival of a region outage, you are entering disaster recovery territory, which requires a different set of controls.

A region outage is generally considered a disaster recovery risk for workloads confined to a single region. However, if you have already implemented an active-active configuration with full replication and automatic failover across regions, that same region outage becomes a high availability risk for that specific architecture [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery). The classification depends on your design, not just the event itself.

## Use recovery evidence to validate the target

An availability target is a promise to the business. To keep it, you need to know how long it takes to recover from the failures that actually occur. This is where recovery evidence comes in. You should look at historical data from your own workloads to estimate recovery time objectives (RTO) and recovery point objectives (RPO).

Consider a scenario where your workload relies on a single virtual machine in a datacentre. If that VM fails due to a hardware issue, how long does it take to provision a replacement and restore the state? If the answer is 30 minutes, your monthly downtime allowance for that specific failure mode is limited. If you have multiple such failures in a year, you might quickly exceed your 99.9% allowance, which permits roughly 43 minutes of downtime per month [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery).

Now consider a region outage. If your workload is not geo-redundant, the recovery time might be hours or days, depending on your disaster recovery plan. If your target is 99.99%, you cannot tolerate a region outage that takes more than approximately 4.3 minutes to recover from. If your evidence shows that recovery takes longer, you have two choices: improve your disaster recovery capabilities to meet the target, or accept that your target is unrealistic for that risk class and adjust it.

Recovery evidence also helps you identify whether your high availability controls are sufficient. If you are experiencing frequent transient failures that are not being handled by your application’s retry logic, your uptime will suffer regardless of your infrastructure’s redundancy. Microsoft’s reliability guidance notes that fault tolerance requires applications to handle transient faults, and some services provide built-in handling, but others require you to enable it yourself [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery).

## Align design elements with the refined target

Once you have a refined availability target based on evidence, you can select the appropriate design elements. Azure provides various redundancy options, including local redundancy within a datacentre, zone redundancy across availability zones, and geo-redundancy across regions [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery).

Availability zones are an important way to achieve reliability within a region. They are physically separated groups of datacentres with independent power, cooling, and networking. If one zone experiences an outage, the remaining zones can support regional services and high availability [Azure reliability documentation](https://learn.microsoft.com/en-us/azure/reliability/overview). For many workloads, zone redundancy is sufficient to handle common risks like hardware failures or datacentre outages. It is a high availability control.

Geo-redundancy, on the other hand, is a disaster recovery control. It protects against uncommon risks like region-wide disasters. Services like Azure Storage provide high availability by automatically replicating data at least three times, and you can distribute those replicas across availability zones or regions [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery). However, enabling geo-redundancy does not automatically guarantee that your application stays available. You still need a failover mechanism, which may involve manual intervention or automated scripts, depending on the service.

It is also important to remember that availability zones do not automatically guarantee that an application stays available. A region pair does not automatically replicate all application data. Asynchronous cross-region replication does not establish an RPO of zero. You must distinguish between the platform’s availability objective and your application’s actual resilience [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery).

## Verify the target with testing

The final step is to verify that your design meets the refined target. This involves testing your high availability and disaster recovery controls. Microsoft’s reliability guidance recommends rigorously testing your workloads in accordance with their criticality tier [What are business continuity, high availability, and disaster recovery?](https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery).

For high availability, you might test the failure of a single instance or zone. For disaster recovery, you might simulate a region outage and measure the time it takes to fail over to the secondary region. These tests provide recovery evidence that you can use to further refine your target or your design.

If your tests show that your recovery time exceeds your target, you need to revisit your design. This might involve adding more redundancy, improving your failover automation, or accepting a lower availability target. The goal is to ensure that your availability target is realistic and achievable, based on evidence, not just aspiration.

Start by documenting your current availability target, the risks you are protecting against, and the recovery evidence you have. Then, review your design to ensure it aligns with those risks. If you find gaps, address them before they become outages.
