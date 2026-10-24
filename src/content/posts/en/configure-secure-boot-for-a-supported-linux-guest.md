---
title: "Configure Secure Boot for a supported Linux guest"
description: "Configure Secure Boot for a Linux guest on Hyper-V using the correct UEFI template and verify the setting."
pubDate: 2024-04-15
category: hyper-v
tags: ["hyper-v", "secure-boot", "linux", "generation-2", "virtual-machines"]
translationKey: configure-secure-boot-for-a-supported-linux-guest
draft: false
---

You have a Generation 2 virtual machine running Linux, and you want to ensure Secure Boot is active. It is enabled by default, but confirming the correct template is applied is the practical step that matters. If the template is wrong, the guest may not boot. If it is right, you have a baseline protection against unauthorized firmware and bootloaders.

Secure Boot in Hyper-V Generation 2 virtual machines verifies the integrity of the boot process using certificates. It prevents unauthorized firmware, operating systems, or UEFI drivers from running at boot time [Generation 2 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v). The feature is available for both Windows and Linux distribution operating systems [Generation 2 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v).

[![Secure Boot Configuration Flow](/images/posts/2024/azc-038-checkpoints.svg)](/images/posts/2024/azc-038-checkpoints.svg)

## Verify the Secure Boot template

The first thing to check is which Secure Boot template is assigned to the virtual machine. Hyper-V provides specific templates based on the operating system. For Linux, you must use the **Microsoft UEFI Certificate Authority** template [Generation 2 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v).

1. Open **Hyper-V Manager**.
2. Right-click the virtual machine and select **Settings**.
3. In the left pane, under **Security**, click **Secure Boot**.
4. Check the **Secure Boot Template** dropdown.

If the template is set to **Microsoft Windows**, the virtual machine is configured for Windows, not Linux. Change it to **Microsoft UEFI Certificate Authority** [Generation 2 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v). This template contains the certificates required to verify the Linux boot chain. Using the wrong template is a common reason for boot failures after enabling Secure Boot on a Linux guest.

## Confirm the setting is active

Secure Boot is enabled by default for new Generation 2 virtual machines [Generation 2 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v). However, if you are migrating an existing virtual machine or have previously modified security settings, you should confirm the state.

In the same **Security** settings pane, ensure the checkbox **Enable Secure Boot** is ticked [Generation 2 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v). If it is not ticked, Secure Boot is disabled, and the virtual machine will not enforce the certificate chain during boot. Ticking the box enables the feature immediately for the next restart.

## Prerequisites and limitations

Secure Boot only applies to Generation 2 virtual machines [Generation 2 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v). Generation 1 virtual machines do not support Secure Boot because they use BIOS-based firmware rather than UEFI. If you are using a Generation 1 virtual machine, you must convert it to Generation 2 or create a new Generation 2 virtual machine to use this feature.

The Linux distribution must be supported by Hyper-V. The documentation lists supported Linux distributions in the [Supported Linux and FreeBSD virtual machines for Hyper-V on Windows](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/Supported-Linux-and-FreeBSD-virtual-machines-for-Hyper-V-on-Windows) article [Generation 2 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v). Ensure your distribution is on that list. Unsupported distributions may not have the necessary UEFI binaries or certificates to boot with Secure Boot enabled.

## Troubleshooting boot failures

If you enable Secure Boot and the virtual machine fails to boot, the most likely cause is a mismatch between the Secure Boot template and the guest operating system. Ensure the template is set to **Microsoft UEFI Certificate Authority** [Generation 2 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v).

Another potential issue is kernel updates. If the Linux distribution uses a custom kernel or bootloader that is not signed with a certificate trusted by the **Microsoft UEFI Certificate Authority** template, the boot process may fail. In such cases, you may need to sign the kernel or bootloader with a trusted certificate, or temporarily disable Secure Boot to perform the update [Generation 2 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v).

## Verification

After making changes, restart the virtual machine. If it boots successfully, Secure Boot is active and configured correctly. You can verify the status inside the guest operating system by checking the UEFI variables, if the distribution provides tools to do so. However, the primary verification is that the virtual machine starts without errors and that the Secure Boot setting in Hyper-V remains as intended.

If you are using Shielded Virtual Machines, note that enabling Shielding enforces Secure Boot [Generation 2 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v). Shielding provides additional protection by restricting access to the virtual machine to authorized hosts. However, Shielding requires the Host Guardian Service or a local guardian key [Generation 2 virtual machine security settings for Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/learn-more/generation-2-virtual-machine-security-settings-for-hyper-v). If you are not using Shielding, Secure Boot alone provides the firmware-level protection.
