---
title: "How to delegate access in Hyper-V"
description: "In some medium/large organizations, it is common practice to have different access levels for systems, such as administrator, help desk, support and auditor. When implementing…"
pubDate: 2013-10-17
category: hyper-v
tags: [azman, rbac, powershell, security]
translationKey: how-to-delegate-access-in-hyper-v
legacy: true
legacyUrl: /2013/10/how-to-delegate-access-in-hyper-v.html
---

In some medium/large organizations, it is common practice to have different access levels for systems, such as administrator, help desk, support and auditor. When implementing virtual machine using Hyper-V Servers, it is also important to reflect these access levels as well.

Since Hyper-V 2012 makes this task easier when you need to specify particular users or groups to be Hyper-V Administrators, but you also might face scenarios where different levels are required. During the task, to add advanced permissions to a user, you will need to use groups (and recommended). You can create and use local groups or Active Directory groups.
    **NOTE:** Make sure you have created them before you start.

## How to do it

The following steps show how to delegate control for a user by using the local Hyper-V Administrators group and by using Authorization Manager (AzMan) for advanced delegations:
1. To add users or groups as members of the local Hyper-V Administrators, open the Start menu and type computer. From Search Results, click on **Computer Management**.
2. In the **Computer Management** console, expand **System Tools** > **Local Users and Groups** and click on **Groups**.
3. In the group list, double-click on the **Hyper-V Administrators** group:
4. In the **Hyper-V Administrators Properties** window, click on **Add,** type the groups or users you want to add into the group, and click on **OK** twice.
5. To add advanced permissions for a group in Hyper-V, open the Start menu and type **_AzMan.msc_** to open the **Authorization Manager** console.
6. In the **Authorization Manager** console, right-click on **Authorization Manager** and select **Open Authorization Store**.
7. In the **Open Authorization Store** option, under **Store Name**, type the path **_C:ProgramDataMicrosoftWindowsHyper-VInitialStore._****xml **and click on **OK**.
8. Under the **Authorization Manager** console, expand **Hyper-V services** > **Definitions**, right-click on **Role Definitions**, and select **New Role Definition**.
9. In the **New Role Definition** window, specify the name of the role you want to use.
10. Then, under **Description**, specify the role description and click on **OK**. Role Definitions will be listed:
11. In the **Authorization Manager** console, right-click on **Task Definitions** and select **New Task Definition**.
12. In the **New Task Definition** window, under **Name**, specify the task name.
13. Then, under **Description**, add a description for your task and click on **OK**. The tasks will be listed in the right-hand pane:
14. To add a definition into a task, click on **Task Definition** and double-click on a task.
15. Click on the **Definition** tab and select **Add**.
16. In the **Add Definition** window, select the **Operations** tab.
17. Select the operations you want from the list, and click on **OK**:
18. To add a Task Definition into a Role Definition, click on **Role Definitions** and select the role you want to change.
19. In the **Role Definition** properties, click on the **Definition** tab.
20. Under the **Definition** tab, click on **Add**.
21. In the **Add Definition** window, select the **Tasks** tab, select the tasks you want to link to the **Role Definition**, and click on **OK**.
22. To assign a role, right-click on **Role Assignments** and select **New Role Assignment**.
23. In the **Add Role** window, select the **Role Definition** you want to add, and click on **OK**.
24. To assign a user or a group to a role, right-click on the group you want, select **Assign Users and Groups**, and click on **From Windows and Active Directory**:
25. In the **Select Users or Groups** window, enter the object names and click on **OK**.

After that, you can log in to Hyper-V as a user who is member of a group that was assigned to a role, to check the permissions that have been added.

>**IMPORTANT:** In Windows Server 2008, 2008 R2 and 2008 R2 SP1, there is no local group to administer Hyper-V. Normally, to be able to manage Hyper-V, users are added into the local administrator group.

## Summary

Since Windows Server 2012, during Hyper-V installation, a new group is created, named Hyper-V Administrators. When a user is added to this group, they can do anything regarding Hyper-V, but they don't have any other rights on the local server.

Even with the local Hyper-V group, sometimes different access levels are required. For those scenarios, you have to use Authorization Manager (AzMan). AzMan is a framework that is used to manage the authorization policy that allows applications to perform access control. Hyper-V uses AzMan to grant access based on roles and tasks. Hyper-V authorization policies are stored in a file named InitialStore.xml, located by the path **C:ProgramDataMicrosoftWindowsHyper-V**. Once loaded through AzMan, you can create and delete the access policies or apply them to groups and users.

The first things to be created on AzMan are Role Definitions. These are roles that are used to receive access policies named Operations. Hyper-V has 34 operations used to grant permissions, such as to create virtual machines, allow virtual machine snapshots, and stop virtual machines. Applying these policies to many groups can be a tough job, that's why AzMan uses Task Definitions.

Tasks Definitions can group operations in common, so that you can apply them to more than one Role Definition, making the modifications easier to make.

Using the operations and tasks, you can grant only the necessary access for users to access Hyper-V with more security and control.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
