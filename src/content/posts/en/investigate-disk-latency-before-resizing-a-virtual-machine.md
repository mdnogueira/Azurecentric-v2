---
title: "Investigate disk latency before resizing a virtual machine"
description: "Distinguish host saturation from guest latency using LUN mapping before resizing a VM."
pubDate: 2026-08-06
category: compute
tags: ["azure-virtual-machines", "troubleshooting", "disk-latency", "linux", "azure-monitor"]
translationKey: investigate-disk-latency-before-resizing-a-virtual-machine
draft: false
---

A virtual machine is slow. The instinct is often to resize it to a larger SKU with higher IOPS limits. Before you make that change, you need to determine whether the bottleneck is the host infrastructure, the guest operating system, or the application itself. Resizing a VM when the issue is guest-side latency or application misconfiguration will not help, and it will increase costs unnecessarily.

Start by checking the host-level metrics. These are available by default and require no additional setup. They show you the performance of the physical host managing the virtual machine. If the host is saturated, the VM will struggle regardless of its SKU. If the host is healthy, the issue likely lies within the guest or the application.

## Check host-level disk metrics

Host metrics for Azure VMs are collected automatically. You do not need to install any agents to see them. In the Azure portal, navigate to the virtual machine and open the **Monitoring** section. Select **Metrics**.

Choose the metric **Disk Read Bytes/sec** or **Disk Write Bytes/sec** for the data disks. You can also check **Disk Read Operations/sec** and **Disk Write Operations/sec**. These metrics reflect the activity on the host side. If you see high utilization or throughput here, it indicates that the underlying storage or the host is under pressure.

The host metrics give you a high-level view. They tell you that the disk is busy, but not which specific guest disk is causing the problem. To drill down, you need guest-level data.

## Map Azure disks to guest disks

Guest metrics require the Azure Monitor Agent (AMA) and a data collection rule. If you have VM Insights enabled, you already have a predefined rule collecting common performance counters. If not, you need to install the agent and configure a rule to collect guest disk performance counters.

Once you have guest metrics, you can see the performance of individual disks from inside the operating system. However, you need to know which guest disk corresponds to which Azure disk. This is where the Logical Unit Number (LUN) comes in.

### For Linux VMs

You can find the LUN of a guest disk using the `lsscsi` command or by listing block devices.

```bash
sudo lsscsi
```

The output will show the LUN in the format `[Host:Channel:Target:LUN]`. You can also use:

```bash
sudo ls -l /sys/block/*/device
```

The last column in the output contains the LUN.

### For Windows VMs

On Windows, you can use Disk Management. Right-click on a disk in the lower pane and select **Properties**. The **Location** property on the **General** tab shows the LUN.

If you are using Storage Spaces, you can find the LUN in Server Manager under **File and Storage Services**, **Volumes**, **Storage Pools**. The **Physical Disks** section lists the LUN for each disk.

## Correlate host and guest data

Now you can correlate the host metrics with the guest metrics using the LUN.

1. Identify the Azure disk with high host-level latency or utilization.
2. Find the LUN of that disk in the Azure portal or using Azure CLI.

```azurecli-interactive
az vm show -g myResourceGroup -n myVM --query "storageProfile.dataDisks"
```

3. Map the LUN to the guest disk using the methods described above.
4. Check the guest-level performance counters for that specific disk.

If the guest-level latency is high but the host-level latency is low, the issue is likely in the guest operating system or the application. If both are high, the issue is likely with the storage infrastructure or the host.

## Decide on resizing

Only after you have isolated the bottleneck should you consider resizing the VM.

*   **Host-level bottleneck:** If the host metrics show saturation, resizing might help if a larger SKU offers better host performance or more IOPS. However, check if the current SKU is already at its limit for the storage tier. If so, you might need to change the storage tier or add more disks.
*   **Guest-level bottleneck:** If the guest metrics show high latency but host metrics are healthy, resizing the VM will not help. You need to investigate the guest OS, drivers, or application configuration. For example, check for disk fragmentation, incorrect I/O scheduling, or application-specific issues.
*   **Application-level bottleneck:** If the guest metrics show high latency only for specific processes, the issue is likely application-specific. Optimize the application or adjust its configuration.

Resizing a VM is a significant change that can affect availability and performance. Use the data from host and guest metrics to make an informed decision. Do not resize based on a hunch.

## Verification

After making any changes, verify the impact by monitoring the same metrics. Compare the before-and-after values to ensure the issue is resolved. If the latency persists, revisit the correlation between host and guest metrics to identify any remaining bottlenecks.

The key is to use the available data to narrow down the cause. Host metrics give you the big picture, guest metrics give you the detail, and the LUN maps them together. This approach prevents unnecessary resizing and helps you address the root cause.



References for Investigate disk latency before resizing a virtual machine: [Monitor Azure Virtual Machines](https://learn.microsoft.com/en-us/azure/virtual-machines/monitor-vm), [How to map Azure Disks to Linux VM guest disks](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/azure-to-guest-disk-mapping), [How to map Azure Disks to Windows VM guest disks](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/azure-to-guest-disk-mapping).
