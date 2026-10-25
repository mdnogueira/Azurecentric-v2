---
title: "Diagnose a VM boot problem using serial console evidence"
description: "Use Boot Diagnostics serial logs to diagnose VM boot failures when the guest OS is unreachable."
pubDate: 2025-12-30
category: compute
tags: ["azure-virtual-machines", "boot-diagnostics", "serial-console", "troubleshooting", "azure-monitor"]
translationKey: diagnose-a-vm-boot-problem-using-serial-console-evidence
draft: false
---

A virtual machine that fails to boot leaves you with a connection timeout or a black screen. Guest-level monitoring tools like the Azure Monitor Agent cannot report on a machine that never reaches the operating system. In these cases, you must rely on host-level diagnostics. Azure Boot Diagnostics provides serial log information and screenshots, capturing the state of the VM from the moment the hypervisor starts until the point where it stalls or crashes.

The first step is to confirm that Boot Diagnostics is enabled and accessible. When you create a VM in the Azure portal, Boot Diagnostics is enabled by default and uses a managed storage account. If you are troubleshooting a legacy VM or one created via a template that disabled this feature, you may need to enable it manually. The diagnostic data is stored in a storage container, and the serial log is the most reliable source for identifying early boot failures, such as missing bootloaders, kernel panics, or configuration errors in the guest OS.

## Enable and access Boot Diagnostics

Boot Diagnostics is a debugging feature for Azure VMs. It collects serial log information and screenshots as the VM boots up. You can access this data through the Azure portal.

1. Navigate to the virtual machine in the Azure portal.
2. In the left-hand menu, under the **Monitoring** section, select **Boot diagnostics**.
3. If Boot Diagnostics is not enabled, select **Enable** and choose a storage account. You can use a managed storage account or an existing one. Managed storage accounts are simpler for troubleshooting as they require no additional configuration.
4. Once enabled, wait a few minutes for the VM to restart or for the diagnostic data to refresh. The **Serial console** tab will display the text output from the VM's boot process.

The serial console output is a plain-text log. It shows the sequence of events as the VM initializes. Look for errors, warnings, or messages that indicate where the boot process stopped. Common issues include:

- **Missing bootloader:** The VM cannot find the boot sector or bootloader configuration.
- **Kernel panic:** The Linux kernel encountered a fatal error during initialization.
- **File system errors:** The guest OS detected corruption or inconsistencies in the disk.

## Interpreting the Serial Log

The serial log provides a chronological record of the boot process. Unlike guest metrics, which require the OS to be running, the serial log captures events from the very first instruction executed by the hypervisor. This makes it invaluable for diagnosing issues that occur before the operating system loads.

When reviewing the log, focus on the last few lines before the VM stops responding. If the VM is stuck, the log will likely show the last successful step and then hang. For example, if the VM is waiting for a disk to be mounted, the log might show a timeout error related to the disk device. If the kernel panics, the log will display the panic message and a stack trace, which can help identify the cause of the crash.

In some cases, the serial log may not show any errors. If the VM is stuck without any visible output, it could be a hardware-level issue or a problem with the hypervisor. In such cases, you may need to check the host metrics or contact Azure support for further assistance.

## Using Boot Diagnostics with Azure Monitor

Boot Diagnostics data is separate from Azure Monitor metrics and logs. While Azure Monitor provides detailed insights into the performance and health of running VMs, Boot Diagnostics is specifically designed for troubleshooting boot failures. You can use both tools together to get a complete picture of the VM's health.

For example, if you have Azure Monitor Agent installed and configured, you can collect guest metrics and logs. However, if the VM fails to boot, the agent will not be running, and no guest data will be available. In this scenario, Boot Diagnostics is your primary source of information. Once the VM is back online, you can use Azure Monitor to monitor its performance and detect any recurring issues.

## Limitations and Considerations

Boot Diagnostics has some limitations that you should be aware of:

- **Data retention:** Diagnostic data is stored in a storage account. You are responsible for managing the storage account and its retention policies. If you use a managed storage account, Azure manages the retention, but you should still be aware of any costs associated with storage.
- **Security:** The serial console output may contain sensitive information, such as passwords or configuration details. Ensure that your storage account is secured with appropriate access controls and encryption.
- **Compatibility:** Boot Diagnostics is supported for most Azure VM sizes and generations. However, some older VM sizes or specific configurations may not support all features. Check the [Azure documentation](https://learn.microsoft.com/en-us/azure/virtual-machines/boot-diagnostics) for compatibility details.

## Next Steps

If Boot Diagnostics does not provide enough information to resolve the issue, consider the following steps:

1. **Check host metrics:** Use Azure Monitor to check the host metrics for the VM. This can help identify if there are any issues with the underlying host hardware or hypervisor.
2. **Review activity logs:** Check the Azure Activity Log for any events related to the VM, such as restarts or failures.
3. **Contact support:** If you are unable to resolve the issue, create an Azure support request. Provide the serial console output and any other relevant diagnostic data to help the support team diagnose the problem.

By using Boot Diagnostics effectively, you can quickly identify and resolve VM boot failures, minimizing downtime and ensuring the stability of your Azure infrastructure.


References for Diagnose a VM boot problem using serial console evidence: [Monitor Azure Virtual Machines](https://learn.microsoft.com/en-us/azure/virtual-machines/monitor-vm), [VM Boot Optimization for Azure Compute Gallery Images with Azure VM Image Builder](https://learn.microsoft.com/en-us/azure/virtual-machines/vm-boot-optimization), [Azure Virtual Machine support and help options](https://learn.microsoft.com/en-us/azure/virtual-machines/vm-support-help).
