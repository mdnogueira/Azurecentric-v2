---
title: "Plan backup coverage for a Hyper-V workload"
description: "Plan backup coverage for a Hyper-V workload by distinguishing between VSS-based backups and Hyper-V Replica, and verifying recovery points."
pubDate: 2026-09-08
category: hyper-v
tags: ["hyper-v", "backup", "replication", "windows-server-2025", "disaster-recovery"]
translationKey: plan-backup-coverage-for-a-hyper-v-workload
draft: true
---

You are running a Hyper-V workload on Windows Server 2025 and need to define a recovery strategy. The first step is to separate two capabilities that are often conflated: backup and replication. A backup preserves a copy of data at a specific point in time, protecting against corruption or accidental deletion. Replication maintains a copy of the virtual machine on a secondary host, protecting against site failure. Confusing the two leaves gaps in your disaster recovery plan.

## Understand the backup approaches

[![Hyper-V Workload Protection Decision Flow](/images/posts/2026/azc-351-checkpoints.svg)](/images/posts/2026/azc-351-checkpoints.svg)

Hyper-V provides two distinct backup methods, each with different implications for what you can restore.

A **VM backup** captures the entire virtual machine. This includes the configuration files (`.VMCX`), the guest state (`.VMGS`), and the runtime state (`.VMRS`) [Hyper-V Backup Approaches](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/backup-approaches). This approach is necessary if you intend to restore the virtual machine to its exact previous state. You must ensure all associated files are copied; missing any of them means the virtual machine state is not fully captured [Hyper-V Backup Approaches](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/backup-approaches).

A **data-only backup** captures only the data stored on the virtual hard disks. To restore from a data-only backup, you create a new virtual machine and restore the data to it [Hyper-V Backup Approaches](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/backup-approaches). This is simpler but does not preserve the virtual machine configuration or state.

For both approaches, you can use the Hyper-V Volume Shadow Copy Service (VSS) writer. This allows backup software to back up virtual machines without running custom software inside the guest operating system [Hyper-V Backup Approaches](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/backup-approaches). However, the VSS writer is designed for small-scale backup operations where all virtual machines on a server are backed up simultaneously [Hyper-V Backup Approaches](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/backup-approaches). If you have many virtual machines, this method may not scale efficiently.

Starting with Windows Server 2016, you can use the Hyper-V WMI-based backup. This method uses VSS inside the virtual machine but not on the host. It relies on reference points and Resilient Change Tracking (RCT) to efficiently track changes [Hyper-V Backup Approaches](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/backup-approaches). This approach is more scalable than using VSS in the host, and it is available on Windows Server 2016 and later [Hyper-V Backup Approaches](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/backup-approaches).

## When to use replication instead

Hyper-V Replica is primarily designed for disaster recovery. It replicates a live virtual machine to a secondary host, creating an offline replica [Set up Hyper-V Replica](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/set-up-hyper-v-replica). It is not a substitute for backup, as it replicates changes asynchronously. If data corruption occurs on the primary host, that corruption is eventually replicated to the secondary host.

However, Hyper-V Replica does offer some protection against data corruption if configured correctly. By default, it stores only the latest recovery point. If you configure additional recovery points, you can recover data to an earlier point in time, up to 24 hourly points [Set up Hyper-V Replica](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/set-up-hyper-v-replica). This allows you to recover from a corruption event that occurred before the most recent replication cycle, provided the corruption has not propagated to the stored recovery points [Set up Hyper-V Replica](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/set-up-hyper-v-replica).

Replication uses change tracking to maintain a log of changes on the primary virtual hard disk. These changes are played in reverse order to the replica virtual hard disk based on your replication frequency (30 seconds, 5 minutes, or 15 minutes) [Set up Hyper-V Replica](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/set-up-hyper-v-replica). This means the latest changes are stored and replicated asynchronously [Set up Hyper-V Replica](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/set-up-hyper-v-replica).

You can extend replication to a third host. This adds robustness, allowing you to fail over to the extended replica if both primary and secondary locations fail. However, the extended replica does not support application-consistent replication and must use the same virtual hard disks as the secondary replica [Set up Hyper-V Replica](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/set-up-hyper-v-replica).

## Plan your coverage

The Best Practices Analyzer recommends backing up virtual machines at least once every week [Virtual machines should be backed up at least once every week](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/virtual-machines-should-be-backed-up-at-least-once-every-week). This is a baseline recommendation; the actual frequency should be determined by your Recovery Point Objective (RPO). If your RPO requires more frequent backups, you should schedule them accordingly. This rule applies unless the virtual machine is a replica and its primary is being backed up, or vice versa [Virtual machines should be backed up at least once every week](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/virtual-machines-should-be-backed-up-at-least-once-every-week).

To plan your coverage, consider these factors:

1.  **Recovery Point Objective (RPO):** How much data can you afford to lose? Replication with 5-minute intervals offers a lower RPO than weekly backups. However, replication does not protect against data corruption that has already been replicated, unless you retain multiple recovery points.
2.  **Recovery Time Objective (RTO):** How quickly do you need the virtual machine back? Replication allows for faster failover than restoring from a backup, which involves copying data from storage.
3.  **Storage and Network:** Replication consumes network bandwidth and storage on the secondary host. Backups consume storage on the backup target.
4.  **Application Consistency:** If your virtual machine runs applications with VSS writers, you can create app-consistent recovery points with Hyper-V Replica. This requires selecting the Volume Shadow Copy Service (VSS) frequency in the replication settings [Set up Hyper-V Replica](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/set-up-hyper-v-replica).

## Verify your setup

After configuring your backup or replication strategy, verify it works.

For backups, check that the backup software reports success and that you can restore a test virtual machine from the backup. Ensure all virtual machine files (`.VMCX`, `.VMGS`, `.VMRS`) are included if you are doing a VM backup [Hyper-V Backup Approaches](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/backup-approaches).

For replication, perform a test failover. This creates a duplicate test virtual machine on the secondary site, allowing you to verify that the virtual machine starts and functions correctly. You should run test failovers at least once a month [Set up Hyper-V Replica](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/set-up-hyper-v-replica). After testing, stop the test failover to clean up the duplicate virtual machine [Set up Hyper-V Replica](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/set-up-hyper-v-replica).

Do not assume replication replaces backups. Use both if your requirements demand protection against both site failure and data corruption. Ensure your backup schedule meets the weekly minimum unless you have a specific reason to deviate [Virtual machines should be backed up at least once every week](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/virtual-machines-should-be-backed-up-at-least-once-every-week).

If you are using Hyper-V Replica, ensure your firewall rules are correctly configured for HTTP (port 80) or HTTPS (port 443) traffic between the primary and secondary hosts [Set up Hyper-V Replica](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/set-up-hyper-v-replica). Verify that the replication frequency and recovery point settings align with your RPO and storage constraints [Set up Hyper-V Replica](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/set-up-hyper-v-replica).

The key is to understand the limitations of each tool. Backups protect against data loss. Replication protects against site failure. Plan accordingly.
