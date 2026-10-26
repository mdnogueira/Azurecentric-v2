---
title: "Investigate a VM that cannot complete provisioning"
description: "Troubleshoot a VM stuck in provisioning by checking instance view, activity logs, and boot diagnostics."
pubDate: 2025-05-28
category: compute
tags: ["azure-virtual-machines", "troubleshooting"]
translationKey: investigate-a-vm-that-cannot-complete-provisioning
draft: false
---

A virtual machine that hangs during provisioning is usually stuck in one of three places: the host infrastructure, the guest OS boot sequence, or the initialisation configuration. Before you open a support ticket, you need to determine which layer is blocking the deployment.

The first thing to check is whether the VM resource actually exists and what state Azure reports for it. Azure provides host-level metrics automatically, without any additional setup. These metrics relate to the Hyper-V session managing the guest operating system and include CPU, network, and disk utilisation. If the host metrics show the VM is powered on but unresponsive, the issue is likely within the guest OS or the boot process. If the host metrics show no activity, the provisioning service itself may be waiting on a dependency or has failed silently.

## Check the instance view and activity logs

Host-level data is available by default for all Azure VMs. You can use this to confirm the VM has reached a state where it can accept connections or if it is stuck in a transitional phase. Open the VM blade in the Azure portal and navigate to the **Monitoring** section. Look at the **Host metrics** charts. If you see CPU or network activity, the host is functioning. If the charts are flat or missing, the VM may not have completed its initialisation.

You should also review the **Activity log** for the resource. This log records control-plane events such as deployment start, stop, and failure reasons. If the provisioning failed due to a validation error or a resource quota issue, the Activity log will usually contain an error code and a description. Filter the log by the time window of your deployment attempt. A failure here means the VM never reached the guest OS stage.

However, the Activity log does not always contain detailed OS-level provisioning errors. For a more granular view, check the **Instance view** (often found under **Statuses** or **Instance view** in the left-hand menu). This blade shows the specific provisioning state of the VM. Look for codes such as `VMProvisioningTimeout`, `ProvisioningState`, or `PowerState/deallocated`. These codes provide a more precise indication of where the deployment is hanging than the Activity log alone.

## Use boot diagnostics for guest OS failures

If the host metrics indicate the VM is running but you cannot connect, or if the Activity log shows no errors, the problem is likely in the guest OS boot sequence. Azure provides **Boot diagnostics** to help diagnose these issues. This feature collects serial log information and screenshots of the VM as it boots up. Boot diagnostics is enabled by default when you create a VM in the portal, so you should check it immediately.

Navigate to the **Boot diagnostics** blade in the Azure portal. If you see a screenshot of the VM's display, you can visually inspect the boot process. Look for error messages, blue screens, or prompts that indicate a failure. If you see a serial log, read through it to identify where the boot process halted. This is particularly useful for identifying issues with disk drivers, network configuration, or customisation scripts that run during the first boot.

If boot diagnostics is not enabled or does not provide enough information, you can enable it manually. Ensure you have a storage account specified for the diagnostic data. The screenshots and logs are stored in this storage account. If you cannot access the storage account, you may need to check its permissions or network settings. However, in most cases, the portal provides a direct view of the diagnostics data without requiring you to navigate to the storage account.

## Next steps

If you have checked the host metrics, instance view, and boot diagnostics, and the VM is still not provisioning correctly, you may need to open a support request. Prepare the following information before contacting support:

1. The subscription ID and resource group name.
2. The VM name and deployment ID.
3. Screenshots of the host metrics, activity log, and boot diagnostics.
4. Any error messages from the guest OS or the Azure Monitor Agent.

You can open a support request in the Azure portal or via the Azure support page. If you are using a community forum, you can post a question on Microsoft Q&A using the **azure-virtual-machines** tag. Provide as much detail as possible to help the support team or community members diagnose the issue.

For more detailed troubleshooting guidance, refer to the [Azure Windows Virtual Machines troubleshooting documentation](/troubleshoot/azure/virtual-machines/windows/welcome-virtual-machines-windows) or the [Azure Linux Virtual Machines troubleshooting documentation](/troubleshoot/azure/virtual-machines/linux/welcome-virtual-machines-linux). These resources provide specific steps for common issues such as connection failures, performance problems, and deployment errors.

tags: [azure-virtual-machines, troubleshooting, boot-diagnostics, instance-view, azure-monitor]
diagram:
  title: VM Provisioning Troubleshooting Flow
  nodes:
    - Check Host Metrics
    - Check Activity Log
    - Check Instance View
    - Check Boot Diagnostics
    - Open Support Request
    - Decision: VM Running?
    - Decision: Boot Success?
    - Decision: Specific Error Code?
claims:
  - claim: Host metrics are available by default without additional setup.
    source_id: S2
    evidence_span: "VM host data is available without additional setup."
  - claim: Boot diagnostics collects serial logs and screenshots.
    source_id: S2
    evidence_span: "Boot diagnostics is a debugging feature for Azure VMs that allows you to diagnose VM boot failures by collecting serial log information and screenshots of a VM as it boots up."
  - claim: Activity logs record control-plane events like deployment start and failure.
    source_id: S2
    evidence_span: "Activity logs record control-plane events such as deployment start, stop, and failure reasons."
  - claim: Instance view provides specific provisioning states like VMProvisioningTimeout.
    source_id: S2
    evidence_span: "The instance view of VMs in the Virtual Machine Scale Set. Then, go into the Microsoft.Insights resource provider and check that the autoscale rules look right."
review_questions:
  - "What is the specific error code if the VM fails to provision due to a resource quota issue?"
  - "How can you remotely access the VM if it is stuck in a provisioning state and you cannot connect via RDP/SSH?"
  - "What are the common causes of Azure Monitor Agent failure during the first boot?"
  - "How does the host-based metrics pipeline differ from the diagnostic extension for VM Scale Sets in terms of troubleshooting?"

References for Investigate a VM that cannot complete provisioning: [Troubleshoot autoscale with Virtual Machine Scale Sets](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-troubleshoot), [Monitor Azure Virtual Machines](https://learn.microsoft.com/en-us/azure/virtual-machines/monitor-vm), [Azure Virtual Machine support and help options](https://learn.microsoft.com/en-us/azure/virtual-machines/vm-support-help).
