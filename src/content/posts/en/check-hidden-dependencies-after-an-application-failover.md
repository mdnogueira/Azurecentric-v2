---
title: "Check hidden dependencies after an application failover"
description: "Verify hidden dependencies after a failover to avoid partial recovery and data loss."
pubDate: 2026-05-11
category: governance
tags: ["failover", "disaster-recovery", "azure-reliability", "troubleshooting", "business-continuity"]
translationKey: check-hidden-dependencies-after-an-application-failover
draft: false
---

You have just triggered a failover. The primary region is unreachable, traffic is routing to the secondary, and the database replica is active. The application is responding. It is tempting to declare victory and stop investigating. That is usually when the next failure happens.

Failover is rarely a single event. It is a chain of dependencies. If you only check the component that failed, you will miss the services that are still pointing at the dead region. This article explains how to verify those hidden dependencies and why a partial failover is often worse than no failover at all.

## The illusion of a successful failover

A common mistake is to assume that if the main application tier is running in the secondary region, the solution is healthy. This is not true. Your architecture likely contains other components that were not configured for automatic failover. These are the hidden dependencies.

Consider a typical multi-region setup. You have an application gateway in the primary and secondary regions. You have a database with geo-replication. You have a storage account with geo-redundant storage. You have a key vault for secrets. You have a DNS record pointing to the application gateway.

When the primary region fails, the database replica is promoted. The storage account is still accessible via its secondary endpoint. The key vault is still accessible. But the application gateway in the secondary region might not be receiving traffic. The DNS record might still point to the primary. The application might still be trying to write logs to a storage account that is not yet configured for secondary writes. The key vault might not have the correct access policies for the new secondary application identity.

The first thing to check is not whether the application is up. It is whether every component that the application needs is reachable and correctly configured in the secondary region.

## Verify the control plane and data plane

Failover involves two distinct planes. The control plane manages the configuration and routing. The data plane handles the actual traffic and data. A failure in one can mask a failure in the other.

Start with the control plane. Check your global traffic manager or front door configuration. Are the health probes passing for the secondary region? If you are using DNS, has the TTL expired and the record updated? If you are using a custom domain, has the certificate been deployed to the secondary endpoint? These are often automated, but they can fail silently. A health probe might be configured to check the wrong path. A DNS record might be cached by a resolver for hours.

Next, check the data plane. This is where the hidden dependencies usually live. If your application uses a message queue, is the queue in the secondary region active? If it uses a cache, is the cache warmed up? If it uses a search index, is the index rebuilt? These components often have their own replication mechanisms. They might not fail over at the same time as the database.

For example, if you are using Azure SQL Database with geo-replication, the failover is usually automatic. But if your application also uses Azure Blob Storage with geo-redundant storage, the storage account might not automatically switch to the secondary region for writes. You might need to update the connection string or the application configuration to point to the secondary storage endpoint. If you do not, the application might crash when it tries to write logs or upload files.

## Check the identity and access layer

Identity is another common source of hidden dependencies. When you fail over to a secondary region, the application identity might change. The managed identity of the secondary application might not have the same permissions as the primary. The key vault might not have the correct access policies for the new identity. The service principal might not have the correct role assignments in the secondary subscription.

Check the access policies in your key vault. Ensure that the secondary application identity has read access to the secrets it needs. Check the role assignments in your secondary subscription. Ensure that the secondary application has the necessary permissions to manage resources in the secondary region. If you are using Azure Active Directory, check the conditional access policies. They might be blocking access from the secondary region if they are configured to only allow access from the primary region's IP range.

This is not just about permissions. It is about trust. The secondary application must be trusted by the services it needs to access. If the trust relationship is broken, the application will fail, even if all the other components are healthy.

## Verify data consistency and replication

Data consistency is the final and most critical check. During a failover, there is often a period of time where the secondary region is not fully synchronized with the primary. This is known as the recovery point objective (RPO). If you fail over too early, you might lose data. If you wait too long, you might lose availability.

Check the replication lag of your database. If you are using Azure SQL Database, you can check the replication lag using the Azure portal or PowerShell. If the lag is too high, you might want to wait before failing over. If you have already failed over, check the data consistency. Are there any missing records? Are there any duplicate records? Are there any conflicts?

For storage accounts, check the replication status. If you are using geo-redundant storage, the secondary region might be in a read-only state. You might need to promote the secondary to read-write. This is usually an automatic process, but you should verify it. If you are using locally redundant storage, you might need to restore from a backup. This is a more complex process and should be planned in advance.

## Document the failover and plan the failback

Once you have verified all the dependencies, document the failover. Record the time of the failover, the components that were affected, the steps taken to resolve the issues, and the current state of the solution. This documentation is crucial for the post-incident review and for planning the failback.

Failback is often more complex than failover. You need to ensure that the primary region is fully healthy and that the data is synchronized. You need to update the DNS record or the traffic manager configuration to point back to the primary. You need to verify that the primary region can handle the traffic. You need to ensure that the data is consistent across both regions.

Do not rush the failback. Take the time to verify that everything is working correctly. A failed failback can cause more damage than the original outage.


Reference: [What to do during an Azure service disruption](https://learn.microsoft.com/en-us/azure/reliability/incident-response).
