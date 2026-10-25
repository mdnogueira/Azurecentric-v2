---
title: "Build an incident triage workbook for the operations team"
description: "Build a Microsoft Sentinel incident triage workbook using the workbook editor and gallery template export."
pubDate: 2026-04-13
category: siem-xdr
tags: ["microsoft-sentinel", "incident-triage", "kql"]
translationKey: build-an-incident-triage-workbook-for-the-operations-team
draft: false
---

How do you give your operations team a consistent way to triage incidents without guessing which data sources matter or how to record decisions? Microsoft Sentinel workbooks provide that structure by combining queries, visualisations, and interactive controls into a single view. The key is to build a workbook that reflects the actual triage workflow: identify the incident, check the entities, and record the outcome.

## Prerequisites and permissions

Before creating a workbook, confirm the scope and permissions. You need access to the Microsoft Sentinel workspace where the workbook will live. The [Microsoft Sentinel Responder](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles#microsoft-sentinel-responder) role is sufficient for investigating incidents and viewing data. If your team uses guest users who need to assign incidents, those users also require the Directory Reader role in the Microsoft Entra tenant.

Ensure the workspace has the relevant data connectors enabled. A triage workbook is only as useful as the data it can query. If the workspace does not ingest the logs required for your triage steps, the workbook will return empty results. Check the [Data collection health monitoring](https://learn.microsoft.com/en-us/azure/sentinel/top-workbooks) workbook to confirm ingestion is active for the sources you intend to visualise.

## Designing the triage view

Start by defining the triage steps your team follows. A typical flow involves:

1. Selecting an incident from a list.
2. Viewing the entities involved (users, IPs, hosts).
3. Checking the alert history and similar incidents.
4. Recording the triage decision (status, severity, comments).

Microsoft Sentinel already provides an [Incident Overview](https://learn.microsoft.com/en-us/azure/sentinel/top-workbooks) workbook that covers many of these steps. However, custom workbooks allow you to tailor the queries and layout to your specific environment. For example, you might want to prioritise certain entity types or include custom tags that your team uses for categorisation.

To build a custom workbook, navigate to **Microsoft Sentinel** in the Azure portal, select **Workbooks**, and choose **+ New**. You can start from a blank canvas or use a template. The [Content hub](https://learn.microsoft.com/en-us/azure/sentinel/sentinel-solutions-deploy) offers prebuilt templates that you can adapt. If you start from scratch, you will need to add queries using Kusto Query Language (KQL) to fetch incident data, entity information, and related alerts.

## Adding queries and visualisations

Workbooks aggregate data from various sources. Use the **Add query** option to bring in data from connected data sources. For a triage workbook, you might include:

- A query to list recent incidents, filtered by status or severity.
- A query to retrieve entity details for a selected incident.
- A query to show similar incidents or related alerts.

Once you have the data, add visualisations such as charts, tables, or graphs. Adjust the settings to match your requirements. For example, you might use a table to display incident details and a chart to show the distribution of severities. Make sure the visualisations are interactive, so users can drill down into specific incidents or entities.

After designing the workbook, save it to your workspace. Test it with real incident data to ensure the queries return the expected results and the visualisations are clear. If the workbook is too slow or returns too much data, refine the KQL queries to limit the scope.

## Publishing as a gallery template

If you want to share the workbook with your team or publish it to the Microsoft Sentinel gallery, you need to create a gallery template. This involves exporting the workbook configuration as a JSON file and adding specific metadata.

1. Open the workbook in **Edit** mode and select **Advanced editor**.
2. Go to the **Gallery Template** tab and copy the JSON content.



3. Add the following properties to identify the workbook:

   ```json
   "styleSettings": {},
   "fromTemplateId": "sentinel-TriageWorkbook",
   "$schema": "https://github.com/Microsoft/Application-Insights-Workbooks/blob/master/schema/workbook.json"
   ```

4. Save the JSON file and upload it to the **Workbooks** folder in your solution repository on GitHub.
5. Capture screenshots of the workbook in both dark and light themes. Name the files to include *black* for dark theme and *white* for light theme. Upload these to the [Preview images folder](https://github.com/Azure/Azure-Sentinel/tree/master/Workbooks/Images/Preview) in the Azure-Sentinel repository.
6. Optionally, add a logo in SVG format to the [Logos folder](https://github.com/Azure/Azure-Sentinel/tree/master/Workbooks/Images/Logos).
7. Update the [WorkbooksMetadata.json](https://github.com/Azure/Azure-Sentinel/blob/master/Workbooks/WorkbooksMetadata.json) file with the workbook's metadata, including the title, description, and data type dependencies.

This process ensures the workbook is discoverable and usable by others. If you are publishing internally, you can skip the GitHub steps and simply share the workbook JSON file with your team.

## Verification and next steps

To verify the workbook, open it in the Microsoft Sentinel workspace and check that the queries return the expected data. Test the interactive elements, such as filtering by incident status or selecting an entity. Ensure that the layout is clear and that the triage steps are easy to follow.

If the workbook is part of a larger solution, consider adding automation rules to handle common triage actions, such as assigning ownership or updating status. This can reduce the manual effort required by your operations team. For more information on automation, see the automation rules documentation.

The workbook is now ready for use. Encourage your team to provide feedback on the layout and queries, and refine the workbook as needed. A well-designed triage workbook can significantly improve the efficiency of your incident response process.
