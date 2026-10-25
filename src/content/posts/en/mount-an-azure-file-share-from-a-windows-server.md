---
title: "Mount an Azure file share from a Windows server"
description: "Mount an Azure file share on Windows using SMB, covering prerequisites, key-based and identity-based methods, and verification steps."
pubDate: 2025-02-25
category: storage
tags: ["azure-files", "smb", "windows-server", "identity-based-auth", "networking"]
translationKey: mount-an-azure-file-share-from-a-windows-server
draft: false
---

You need to connect a Windows server to an Azure file share. The first decision is whether to use the storage account key or identity-based authentication. The key is straightforward but grants full administrative access to the storage account. Identity-based access is preferred for production workloads, provided the prerequisites are met.

## Prerequisites and network checks

[![Azure File Share Mount Decision Flow](/images/posts/2025/azc-151-checkpoints.svg)](/images/posts/2025/azc-151-checkpoints.svg)

Azure Files uses the Server Message Block (SMB) protocol over TCP port 445. If this port is blocked by a firewall or ISP, the connection will fail. You can verify connectivity before attempting to mount the share.

```powershell
Test-NetConnection -ComputerName Examplestorageaccountname.file.core.windows.net -Port 445
```

Ensure the Windows version supports SMB 3.x. Older versions that only support SMB 2.1 cannot mount Azure file shares via the public endpoint. For example, Windows Server 2012 R2 supports SMB 3.0 but not SMB Multichannel, which is available only on premium file shares. Windows Server 2016 and later versions support SMB Multichannel, provided the necessary updates are installed.

## Mounting with the storage account key

The Azure portal provides a PowerShell script to mount the share using the storage account key. This method is suitable for administrative access but should not be used for applications running under a dedicated service account without careful credential management.

1. Sign in to the Azure portal.
2. Navigate to the storage account containing the file share.
3. Select **File shares** and choose the share to mount.
4. Select **Connect**.
5. Choose a drive letter and copy the provided PowerShell script.
6. Run the script on the target Windows server.

The script maps the share and persists the credentials. If you need to dismount the share, right-click the entry under **Network locations** in File Explorer and select **Disconnect**.

Alternatively, you can use File Explorer. Open **This PC**, select **Map network drive**, and enter the UNC path in the format `\\<storageAccountName>.file.core.windows.net\<fileShareName>`. Check **Connect using different credentials** and use the storage account name as the username and the storage account key as the password.

## Mounting with identity-based authentication

For production workloads, identity-based authentication is the recommended approach. This requires the storage account to be joined to an Active Directory Domain Services (AD DS) or Microsoft Entra Domain Services domain. You must also assign share-level and file-level permissions to the identity.

### Domain-joined VMs

If the Windows server is domain-joined, you can mount the share without providing credentials explicitly. The following PowerShell script checks connectivity and maps the drive.

```powershell
$connectTestResult = Test-NetConnection -ComputerName Examplestorageaccountname.file.core.windows.net -Port 445
if ($connectTestResult.TcpTestSucceeded) {
    cmd.exe /C "cmdkey /add:`"Examplestorageaccountname.file.core.windows.net`" /user:`"localhost\Examplestorageaccountname`""
    New-PSDrive -Name Z -PSProvider FileSystem -Root "\\Examplestorageaccountname.file.core.windows.net\Examplefilesharename" -Persist -Scope global
} else {
    Write-Error -Message "Unable to reach the Azure storage account via port 445."
}
```

This code is an illustrative example. Ensure you replace the placeholder values with your specific storage account name and file share name. The script uses `cmdkey` to add the storage account name as a credential target. This prepares the SMB session setup, but the actual authentication relies on the domain-joined user's existing Kerberos ticket, not a cached key.

### Non-domain-joined VMs

If the server is not domain-joined, or is joined to a different domain, you must provide explicit credentials. The user must have an identity in the AD domain that the storage account is joined to. Use the notation `username@domainFQDN` for the username.

```powershell
net use Z: \\ExampleYourStorageAccountName.file.core.windows.net\ExampleFileShareName /user:ExampleusernamedomainFQDN
```

For Microsoft Entra Domain Services, you can also use `DOMAINNAME\username`. Ensure the client has unimpeded network connectivity to the domain controllers, which may require a VPN if the client is outside the managed network. For Microsoft Entra Domain Services, the user identity must be synced from Microsoft Entra ID to the managed domain.

## Verification and cleanup

After mounting, verify the connection by accessing files in the share. If you previously mounted the share using the storage account key, ensure you have disconnected it and removed the persistent credentials before switching to identity-based authentication. Cached credentials can cause authentication conflicts.

To remove cached credentials, use the following command:

```cmd
cmdkey /delete:<storage-account-name>.file.core.windows.net
```

Before removing cached credentials, disconnect any existing SMB sessions to ensure a clean state when switching authentication methods. You can do this by running:

```cmd
net use * /delete
```

If you encounter issues, check the SMB protocol version and ensure port 445 is open. For identity-based authentication failures, review the share-level permissions and ensure the identity has the necessary rights. The Azure portal provides a PowerShell script that can help troubleshoot connectivity issues.

For custom domain names, you can configure a CNAME record to route the new suffix to the storage account endpoint. This allows clients to mount the share using a custom domain name, such as `\\mystorageaccount.onpremad1.com`. This requires modifying the SPN of the storage account using the `setspn` tool and adding a CNAME entry in Active Directory DNS Manager.

If you need to access the share from Linux or UNIX-based applications, consider using NFS file shares instead, as SMB is not supported for those workloads. NFS shares are available only on premium file storage and do not support identity-based authentication, relying instead on network security rules and private endpoints for access control.

References for Mount an Azure file share from a Windows server: [Mount Azure file share on Windows](https://learn.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-windows), [Mount SMB Azure file share with identity-based access](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-mount-file-share), [NFS file shares in Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/files-nfs-protocol).
