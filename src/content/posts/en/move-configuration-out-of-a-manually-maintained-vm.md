---
title: "Move configuration out of a manually maintained VM"
description: "Move Linux VM configuration from manual scripts to declarative cloud-init for reproducible first-boot provisioning."
pubDate: 2026-06-14
category: compute
tags: ["azure-virtual-machines", "cloud-init", "linux", "infrastructure-as-code", "automation"]
translationKey: move-configuration-out-of-a-manually-maintained-vm
draft: false
---

You have a Linux virtual machine where configuration is managed by running scripts manually or via ad-hoc automation. This approach works for a single machine but breaks down when you need consistency, auditability, or rapid scaling. The practical solution is to move that configuration into a declarative cloud-init file and bake it into the deployment process.

Cloud-init runs on first boot, applying configuration before user login. This ensures the VM is in the desired state immediately after provisioning, without requiring a separate post-deployment step or remote access. It is supported on Linux VMs and flexible scale sets in Azure.

## Why cloud-init over other script execution methods?

Azure provides several ways to run scripts in a Linux VM, each with different trade-offs. Understanding these helps you choose the right tool for the job.

The **Custom Script Extension** is designed for post-deployment configuration and software installation. It can download scripts from Azure storage or GitHub, or accept scripts provided from your PC via the Azure portal. It is useful for tasks that need to run after the VM is up and running, but it requires the VM to be reachable and the extension to be installed. It is not a first-boot configuration mechanism.

**Run Command** allows you to run scripts in a VM even when it is unreachable, such as when the guest firewall blocks SSH or RDP. It is excellent for troubleshooting or quick management tasks, but it is interactive and does not provide persistent, declarative configuration. It is not suitable for ensuring a VM starts in a known state.

**Hybrid Runbook Worker** from Azure Automation provides general machine management with scripts stored in an Automation account. It supports PowerShell, Python, and graphical runbooks, with no time limit on run time and full job history. However, it requires manual installation on the VM and is more complex to set up for simple first-boot configuration. It is better suited for ongoing, scheduled, or complex automation tasks across hybrid environments.

**Serial console** provides direct access to the VM, similar to having a keyboard connected. It is useful for troubleshooting when network or OS state prevents other access, but it is not a configuration management tool.

Cloud-init, by contrast, is a standard industry tool that Azure supports natively. It runs on first boot, applies configuration declaratively, and is included in the VM image or provided at creation time. This makes it ideal for ensuring reproducibility and consistency.

## Prepare the cloud-init configuration file

A cloud-init file is a YAML document that specifies the configuration you want to apply. For this example, we will set the hostname, a common first-step configuration task.

Create a file named `cloud_init_hostname.txt` with the following content:

```yaml
#cloud-config
fqdn: myhostname
```

The `#cloud-config` header is essential; it tells cloud-init to process the file as a configuration document. The `fqdn` key sets the fully qualified domain name of the VM. You can replace `myhostname` with your desired hostname.

Cloud-init supports many other configuration modules, such as adding users, installing packages, and updating configuration files. For more examples, refer to the [cloud-init overview](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/using-cloud-init) and specific how-to guides like [Add an additional Linux user](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/cloudinit-add-user) or [Install an application package](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/tutorial-automate-vm-deployment).

## Deploy the VM with cloud-init

To use the cloud-init file, you must provide it to the VM at creation time using the `--custom-data` switch with the Azure CLI.

First, create a resource group to contain the VM:

```azurecli-interactive
az group create --name myResourceGroup --location eastus
```

Next, create the VM, specifying the cloud-init file:

```azurecli-interactive
az vm create \
  --resource-group myResourceGroup \
  --name vmName \
  --image imageCIURN \
  --custom-data cloud_init_hostname.txt \
  --generate-ssh-keys
```

Replace `myResourceGroup`, `vmName`, and `imageCIURN` with your specific values. Ensure that `imageCIURN` is an image that supports cloud-init; Azure provides several such images, often marked with "CI" in the name. The `--generate-ssh-keys` switch creates SSH keys for authentication if you do not have existing keys.

After the VM is created, you can verify the configuration by SSHing into the VM and checking the hostname:

```bash
ssh <user>@<publicIpAddress>
sudo hostname
```

The output should show `myhostname`, confirming that cloud-init applied the configuration on first boot.

## Verification and next steps

Cloud-init runs only on first boot. If you need to reapply configuration, you must either recreate the VM or use another mechanism, such as the Custom Script Extension, for post-deployment changes. This is a key distinction: cloud-init is for initial configuration, not ongoing management.

For more complex scenarios, you can combine multiple cloud-init modules in a single file or use multiple files. You can also use ARM templates or Bicep to deploy VMs with cloud-init, providing a fully declarative infrastructure-as-code approach.

If you need to manage configuration after the VM is running, consider using Azure Automation State Configuration or Azure Machine Configuration for ongoing compliance and drift detection. These tools complement cloud-init by providing continuous management, whereas cloud-init handles the initial state.

By moving your configuration into cloud-init, you gain reproducibility, auditability, and a clear separation between initial setup and ongoing management. This reduces manual errors and makes your infrastructure more predictable and scalable.

To explore further, review the [cloud-init documentation](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/using-cloud-init) for supported modules and best practices, and consider integrating cloud-init into your CI/CD pipelines for automated VM provisioning.


References for Move configuration out of a manually maintained VM: [Run scripts in an Azure Linux VM](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/run-scripts-in-vm), [Desired State Configuration for Azure overview](https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/dsc-overview), [Use cloud-init to set hostname for a Linux VM](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/cloudinit-update-vm-hostname).
