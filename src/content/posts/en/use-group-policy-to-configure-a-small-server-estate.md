---
title: "Use group policy to configure a small server estate"
description: "Configure Windows Server 2025 servers using Group Policy Objects, OU structure, and GPMC with clear processing order and verification."
pubDate: 2025-08-20
category: windows-server
tags: ["group-policy", "windows-server", "gpmc", "server-management", "windows-server-2025", "active-directory"]
translationKey: use-group-policy-to-configure-a-small-server-estate
draft: false
---

You have a small estate of Windows Server 2025 machines and need to enforce configuration settings centrally. The most reliable way to do this is to use Group Policy Objects (GPOs) linked to Organizational Units (OUs) in Active Directory Domain Services (AD DS). This approach gives you a single source of truth for settings, allows you to scope changes to specific server roles, and provides a clear audit trail of what was changed and when.

The first thing to establish is the structure of your Active Directory. Group Policy settings are applied based on the hierarchy of sites, domains, and OUs. An OU is the lowest-level container to which you can assign GPO settings directly. If you place all your servers in a single OU, they will all receive the same policies. If you need different settings for, say, database servers versus web servers, you should create separate OUs for them. This separation prevents conflicts and makes it easier to delegate administrative control.

## Design the OU structure

Before creating any policies, map out your server roles. A common mistake is to create a flat structure with no OUs, forcing you to link GPOs to the domain root. This causes every policy to apply to every computer, which can lead to unexpected overrides and performance issues. Instead, create OUs that reflect the administrative or functional grouping of your servers.

For example:

- `Servers`
  - `WebServers`
  - `DatabaseServers`
  - `AppServers`

This structure allows you to link GPOs to the specific OUs where they are needed. GPOs linked to parent OUs are inherited by child OUs by default. This means you can define common security settings at the `Servers` level and then override or add specific settings at the `WebServers` or `DatabaseServers` levels.

## Create and edit the GPO

Once your OU structure is in place, you can create the GPO. You will need the Group Policy Management Console (GPMC), which is included with Windows Server and the Remote Server Administration Tools. You must have the necessary permissions to create and edit GPOs, which typically requires Domain Admin or Enterprise Admin rights, or delegated permissions to the specific GPO and OU.

1. Open **Group Policy Management** from the Start menu.
2. In the console tree, expand your domain and locate the **Group Policy Objects** container.
3. Right-click **Group Policy Objects** and select **New**.
4. Enter a descriptive name for the GPO, such as `WebServer Security Baseline`, and click **OK**.

Now you need to configure the settings. Right-click the new GPO and select **Edit**. This opens the Group Policy Management Editor. Navigate to the policy settings you want to configure. For example, to enforce a password policy or configure firewall rules, you would look under **Computer Configuration** or **User Configuration**.

It is important to note that GPOs contain both computer and user settings. If a GPO is only intended for servers, which are typically managed by computer settings, you can disable the User Configuration settings to reduce processing time. To do this, right-click the GPO in GPMC, go to **GPO Status**, and select **User configuration settings disabled**. This tells the client to skip evaluating user settings in this GPO, which can slightly reduce startup time by avoiding unnecessary evaluation [Group Policy Management Console in Windows](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-management-console).

## Link the GPO to the OU

Creating a GPO does not automatically apply it to any servers. You must link it to an OU. A GPO is a per-domain object, so it can be linked to any site, domain, or OU within the forest, but it is stored in the domain partition of Active Directory and its template is replicated to the SYSVOL folder on each domain controller [Group Policy overview for Windows Server](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-overview).

To link the GPO:

1. In GPMC, right-click the target OU (e.g., `WebServers`).
2. Select **Link an Existing GPO**.
3. Select the GPO you created earlier and click **OK**.

Once linked, the GPO will be applied to all computers in that OU and its children. The order of GPO processing is crucial. Group Policy is processed in the following order:

1. Local GPO
2. Site-linked GPOs
3. Domain-linked GPOs
4. OU-linked GPOs (parent to child)

Within each level, the link order determines precedence. The GPO with the lowest link number has the highest precedence. If you need a specific GPO to override others, you can move it to the top of the link order list in the GPMC. You can also use the **Enforced** option on a GPO link to prevent lower-level OUs from overriding it, or **Block Inheritance** on an OU to stop it from receiving policies from higher levels [Group Policy processing for Windows](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-processing).

## Verify the policy application

After linking the GPO, you need to verify that it is being applied correctly. Group Policy is applied at computer startup and user logon. By default, the system refreshes Group Policy every 90 minutes with a random offset of up to 30 minutes. You can trigger a manual refresh to test immediately.

On the target server, open a command prompt and run:

```powershell
gpupdate.exe /force
```

This command forces a refresh of both computer and user policies. However, it is important to note that not all extensions are processed during a background refresh. For example, script extensions run only when the computer starts and shuts down, and when a user logs on and logs off [Group Policy processing for Windows](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-processing). Therefore, while `gpupdate /force` forces reapplication of settings that support it, event-driven extensions (scripts, software installation) still require specific triggers (startup/logon) to execute.

To verify which GPOs were applied and which were ignored, you can use the **Group Policy Results** tool in GPMC or run `gpresult /h report.html` on the server to generate an HTML report. The **Group Policy Results** tool in GPMC is particularly useful for troubleshooting as it allows you to view GPO interaction and troubleshoot deployments [Group Policy Management Console in Windows](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-management-console). The report will show you the Resultant Set of Policy (RSoP), including the GPOs that were applied, the settings they contained, and any errors that occurred.

If a policy is not applying, check the following:

- Is the computer object in the correct OU?
- Are there any WMI filters linked to the GPO that might be excluding the server?
- Is the GPO linked to the correct OU, and is the link order correct?
- Are there any block inheritance settings on the OU?

## Manage and maintain

Group Policy is a powerful tool, but it requires careful management. As your estate grows, you may find that you have many GPOs linked to various OUs. To keep things manageable, consider combining smaller GPOs into consolidated ones where possible. This reduces the number of GPOs that need to be processed and makes troubleshooting easier [Group Policy processing for Windows](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-processing).

Always test GPO changes in a non-production environment first. Use the **Group Policy Modeling** tool in GPMC to simulate how policies will apply to specific users or computers before deploying them to production. This allows you to identify potential conflicts or unintended consequences before they affect your servers [Group Policy Management Console in Windows](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-management-console).

Finally, remember that GPOs are stored in both Active Directory and the SYSVOL folder. Changes to GPOs must replicate to all domain controllers before they take effect on all servers. Replication within a site typically takes less than a minute, but it can be slower across sites. Be patient when making changes, and allow time for replication to complete before verifying results [Group Policy processing for Windows](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-processing).
