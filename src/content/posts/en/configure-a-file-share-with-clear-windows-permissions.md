---
title: "Configure a file share with clear Windows permissions"
description: "Fix DFS visibility by switching from inherited to explicit permissions and enforce SMB encryption on Windows Server 2022."
pubDate: 2024-09-16
category: windows-server
tags: ["dfs-namespaces", "smb-encryption", "windows-server-2022", "file-sharing", "security"]
translationKey: configure-a-file-share-with-clear-windows-permissions
draft: true
---

A domain-based DFS namespace often feels too open because every folder is visible to every domain user. This usually happens because the namespace relies on inherited permissions from the local file system of the namespace server. Even with Access-Based Enumeration (ABE) enabled, users can see all folders because the underlying namespace permissions grant them Read access.

To restrict visibility, you must switch from inherited permissions to explicit permissions. This allows you to set specific Access Control Lists (ACLs) on the namespace folders that are stored in the DFS namespace metadata. Once visibility is controlled, you should protect the data moving between the client and the file server. Windows Server 2022 supports SMB 3.1.1, which includes mandatory preauthentication integrity and advanced encryption suites. Enabling SMB encryption ensures end-to-end privacy and integrity, protecting data from eavesdropping on untrusted networks.

[![DFS Namespace Permission and Encryption Flow](/images/posts/2024/azc-093-checkpoints.svg)](/images/posts/2024/azc-093-checkpoints.svg)

## Control visibility with explicit permissions

Inherited permissions are not replicated to other namespace servers. If you rely on them, you must implement a third-party replication system to keep the Access Control Lists (ACLs) on all namespace servers synchronized. This makes inherited permissions inappropriate for most domain-based environments.

To limit which users can view a DFS folder, you must set explicit permissions. DFS Management and `Dfsutil` can view and modify these explicit permissions. However, they cannot manage the underlying file system ACLs that generate inherited permissions. You must use Windows Explorer or the `Icacls` command to modify the permissions of the local file system if you are still using inheritance.

### Prerequisites

*   A domain-based DFS namespace already created.
*   Access to the DFS Management console on a server hosting the namespace.
*   Administrative privileges on the namespace server.

### Steps to set explicit permissions

1.  Open **DFS Management**.
2.  In the console tree, expand **Namespaces** and locate your domain-based namespace.
3.  Right-click the folder you wish to restrict and select **Properties**.
4.  Navigate to the **Advanced** tab.
5.  If the folder is currently using inherited permissions, click **Disable inheritance** and choose **Convert inherited permissions into explicit permissions**. This removes the inherited NTFS permissions from the local file system and allows you to set specific ACLs on the namespace folder.
6.  Once in explicit mode, you can remove the default `DOMAIN\Users` Read permission and add specific groups or users with the required access levels (e.g., Read, Change).

> **Note:** When using inherited permissions, it is simplest to set permissions on namespace roots and folders without targets. Then use inherited permissions on folders with targets so that they inherit all permissions from their parents. If you set permissions on a folder with targets while using inherited permissions, the ACL that you set on the folder with targets combines with inherited permissions from the folder's parent in the file system. You must examine both sets of permissions to determine what the net permissions are.

## Protect data in transit with SMB Encryption

SMB Encryption provides SMB data end-to-end encryption and protects data from eavesdropping occurrences on untrusted networks. It has no requirements for Internet Protocol security (IPsec) or WAN accelerators. You can consider SMB Encryption for any scenario in which sensitive data needs to be protected from interception attacks.

Windows Server 2022 and Windows 11 introduce AES-256-GCM and AES-256-CCM cryptographic suites for SMB 3.1.1 encryption. Windows automatically negotiates this more advanced cipher method when connecting to another computer that supports it. You can also mandate this method through Group Policy. Windows still supports AES-128-GCM and AES-128-CCM. By default, AES-128-GCM is negotiated with SMB 3.1.1, bringing the best balance of security and performance.

### Enable SMB Encryption

You can enable SMB Encryption for the entire file server or only for specific file shares. The following PowerShell examples illustrate how to configure this.

**Illustrative Example: Enable encryption for a specific share**

```powershell
# This command enables encryption for the share named 'DataShare'
# Prerequisite: The share must already exist.
Set-SmbShare –Name 'DataShare' -EncryptData $true
```

**Illustrative Example: Enable encryption for the entire server**

```powershell
# This command requires the SMB Server service to be restarted.
Set-SmbServerConfiguration –EncryptData $true
```

### Considerations for deployment

*   **Client Compatibility:** By default, when SMB Encryption is enabled for a file share or server, only SMB 3.0, 3.02, and 3.1.1 clients are allowed to access the specified file shares. Clients that do not support SMB 3.x will receive an **Access denied** error (Event ID 1003 in the Microsoft-Windows-SmbServer/Operational log). You should not allow unencrypted access (`RejectUnencryptedAccess $false`) unless you are in a transition period, as this weakens security.
*   **Performance:** There is a notable performance operating cost with any end-to-end encryption protection when compared to non-encrypted. However, Windows Server 2022 supports AES instructions on modern CPUs, and SMB Direct now supports encryption with relatively minor performance degradation.
*   **SMB 1.0:** You must disable the SMB 1.0 server. SMB 1.0 does not support encryption and is vulnerable to downgrade attacks. Preauthentication integrity in SMB 3.1.1 protects against downgrades to SMB 2.x, but not to SMB 1.0.

## Verify the configuration

To verify that permissions are explicit, check the namespace folder properties in DFS Management. The **Advanced** tab should show explicit permissions that you have set, rather than inherited ones.

To verify encryption, attempt to connect to the share from a client that supports SMB 3.x. You can check the connection details using PowerShell:

```powershell
Get-SmbConnection
```

Look for the `EncryptData` column. If it is `True`, the connection is encrypted. If you attempt to connect from an older client that does not support SMB 3.x, the connection will fail, which is the expected behaviour when `RejectUnencryptedAccess` is set to `$true`.

Remember that namespace permissions control visibility (ABE), while NTFS and Share permissions on the target server control actual data access. Both layers must be configured for full security.

References for Configure a file share with clear Windows permissions: [Add Namespace Servers to a Domain-based DFS Namespace](https://learn.microsoft.com/en-us/windows-server/storage/dfs-namespaces/add-namespace-servers-to-a-domain-based-dfs-namespace), [Using Inherited Permissions with Access-based Enumeration](https://learn.microsoft.com/en-us/windows-server/storage/dfs-namespaces/using-inherited-permissions-with-access-based-enumeration), [SMB security enhancements](https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-security).
