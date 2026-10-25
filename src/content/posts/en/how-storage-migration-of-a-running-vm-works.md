---
title: "How does a storage migration of a running virtual machine in Windows Server 2012 (both through Hyper-V manager and through PowerShell) actually work?"
description: "The process followed by Hyper-V internally to perform a storage migration is actually quite simple to explain and is as follows:"
pubDate: 2012-07-02
category: hyper-v
tags: ["hyper-v", "migration", "powershell", "windows-server", "vhd"]
translationKey: how-storage-migration-of-a-running-vm-works
legacy: true
legacyUrl: /2012/07/how-does-a-storage-migration-of-a-running-virtual-machine-in-windows-server-2012-both-through-hyper-v-manager-and-through-powershell-actually-work.html
---

The process followed by Hyper-V internally to perform a storage migration is actually quite simple to explain and is as follows:

**Step 1:** Start with a virtual machine that is reading and writing to a virtual hard disk file (.VHDX in the diagram, but storage migration is supported for both .VHDX and .VHD files).

![Image1](../../../assets/old/posts/2012/07/1.png)

**Step 2:** After the user selects to perform a storage migration, immediately create a new virtual hard disk in the requested destination. Continue to read and write to the source virtual hard disk – but any new write operations are also mirrored to the new virtual hard disk.

![Image2](../../../assets/old/posts/2012/07/2.png)

**Step 3:** Perform a single pass operation to copy the data from the source virtual hard disk to the destination virtual hard disk. While this copy is happening, it still continues to mirror writes to both disks. It also keep track of uncopied blocks that have already been updated through a mirrored write – and make sure to not needlessly copy that data again.

![Image3](../../../assets/old/posts/2012/07/3.png)

**Step 4:** Once the copy operation is complete – it switch the virtual machine to be running only on the destination virtual hard disk.

![Image4](../../../assets/old/posts/2012/07/4.png)

**Step 5:** Delete the source virtual hard disk and the migration is now complete.

![Image5](../../../assets/old/posts/2012/07/5.png)

One important note to make here – Microsoft are very careful to not delete the source virtual hard disk until after the virtual machine is successfully running on the destination virtual hard disk. This way if there is an error at any point in the storage migration – we can always fail back to running off of the source virtual hard disk.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
