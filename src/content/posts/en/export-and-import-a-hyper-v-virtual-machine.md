---
title: "Export and import a Hyper-V virtual machine"
description: "How to export and import Hyper-V virtual machines using PowerShell or Hyper-V Manager, covering import types and version compatibility."
pubDate: 2025-07-02
category: hyper-v
tags: ["hyper-v", "virtual-machines", "export-import", "windows-server", "virtualization"]
translationKey: export-and-import-a-hyper-v-virtual-machine
draft: false
---

You need to move a virtual machine to a new host or back it up. Exporting and importing is the standard way to do this without the complexity of Failover Clustering. The process gathers the virtual hard disk, configuration, and checkpoint files into a portable unit. You can perform this while the virtual machine is running or stopped, but the import step requires careful selection of the import type to avoid ID conflicts or data loss.

## Check configuration version compatibility

Before exporting, verify that the destination host supports the virtual machine's configuration version. Hyper-V configurations have specific version numbers. You can typically import a virtual machine to a host running a newer version of Hyper-V, but you cannot import a virtual machine created on a newer version to an older version [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines). If you are moving a virtual machine to a host running Windows Server 2012 R2, you must ensure the configuration version is 5 or lower, as newer versions are not supported [Create a virtual machine in Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/create-a-virtual-machine-in-hyper-v). You cannot change the virtual machine configuration version after it is created, so this check is critical before you start [Create a virtual machine in Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/create-a-virtual-machine-in-hyper-v).

## Export the virtual machine

An export gathers all required files into one unit. You can do this on a virtual machine that is in either a started or stopped state [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

### Using Hyper-V Manager

1. Open **Hyper-V Manager**.
2. Right-click the virtual machine and select **Export**.
3. Choose a location to store the exported files and click **Export**.

When the export is done, you will see all exported files under the export location [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

### Using PowerShell

Open a PowerShell session as Administrator. Run the `Export-VM` cmdlet, replacing `<vm name>` and `<path>` with your values:

```powershell
Export-VM -Name Examplevmname -Path Examplepath
```

This command exports the virtual machine to the specified path [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

## Import the virtual machine

Importing a virtual machine registers it with the Hyper-V host. You can import it back into the same host or to a new host. If you are importing to the same host, you do not need to export the virtual machine first, because Hyper-V tries to recreate the virtual machine from available files [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

### Import types

Hyper-V offers three import types, each with different implications for the virtual machine's ID and file locations [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines):

- **Register in-place**: Assumes export files are in the location where you store and run the virtual machine. The imported virtual machine has the same ID as it did at the time of export. If the virtual machine is already registered with Hyper-V, it needs to be deleted before the import works. The export files become the running state files and cannot be removed [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).
- **Restore**: Imports the virtual machine to a location you choose, or uses the default Hyper-V location. This import type creates a copy of the exported files and moves them to the selected location. The imported virtual machine has the same ID as it did at the time of export. If the virtual machine is already running in Hyper-V, it needs to be deleted before the import can be completed. The exported files remain intact and can be removed or imported again [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).
- **Copy**: Similar to restore, but the imported virtual machine has a new unique ID. This means you can import the virtual machine to the same host multiple times [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

### Using Hyper-V Manager

1. From the **Actions** menu in Hyper-V Manager, select **Import Virtual Machine**.
2. Click **Next**.
3. Select the folder that contains the exported files and click **Next**.
4. Select the virtual machine to import.
5. Choose the import type and click **Next**.
6. Click **Finish** [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

### Using PowerShell

#### Register in-place

This type of import uses the files where they're stored at the time of import and retains the virtual machine's ID. Run a similar command with your own values:

```powershell
Import-VM -Path 'C:\Examplevmexportpath\2B91FEB3-F1E0-4FFF-B8BE-29CED892A95A.vmcx'
```

#### Restore

To import the virtual machine specifying your own path for the virtual machine files, run a command like this, replacing the examples with your values:

```powershell
Import-VM -Path 'C:\Examplevmexportpath\2B91FEB3-F1E0-4FFF-B8BE-29CED892A95A.vmcx' -VhdDestinationPath 'D:\Virtual Machines\WIN10DOC' -VirtualMachinePath 'D:\Virtual Machines\WIN10DOC'
```

#### Import as a copy

To complete a copy import and move the virtual machine files to the default Hyper-V location, run a command like this, replacing the examples with your values:

```powershell
Import-VM -Path 'C:\Examplevmexportpath\2B91FEB3-F1E0-4FFF-B8BE-29CED892A95A.vmcx' -Copy -GenerateNewId
```

For details, see the `Import-VM` cmdlet documentation [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

## Verify the import

After importing, check that the virtual machine appears in Hyper-V Manager and that its configuration matches your expectations. If you are importing to a new host, ensure that the virtual switches configured on the destination host match the network requirements of the virtual machine. Hyper-V's import wizard helps fix incompatibilities that can exist when moving from one host to another, such as differences in physical hardware, memory, virtual switches, and virtual processors [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

If you encounter issues, check the event logs on the destination host for detailed error messages. Common issues include missing files, permission problems, or version incompatibilities. Ensure that the destination host has sufficient resources to run the virtual machine, including memory and storage space [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).

If you need to move a running virtual machine without exporting, consider using live migration. This requires setting up constrained delegation and ensuring that the source and destination hosts are compatible [Use live migration without Failover Clustering to move a VM](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/use-live-migration-without-failover-clustering-to-move-a-virtual-machine). However, for most scenarios involving moving virtual machines between hosts or creating backups, exporting and importing is the recommended approach [Export and import virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines).
