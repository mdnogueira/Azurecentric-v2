---
title: "Investigate a CodeQL alert before merging a pull request"
description: "Investigate a CodeQL alert in a pull request: locate the annotation, assess the data flow, and push a fix to pass the check."
pubDate: 2026-05-30
category: cloud-security
tags: ["alerts", "github-advanced-security", "codeql", "troubleshooting"]
translationKey: investigate-a-codeql-alert-before-merging-a-pull-request
draft: false
---

A pull request is blocked by a CodeQL check failure. The status box shows a red cross and indicates one or more new alerts with a severity of `error`, `critical`, or `high`. Before you can merge, you need to determine whether the alert flags a genuine vulnerability in your changes or a pattern that is safe in your specific context.

The first step is to locate the alert annotation. When CodeQL is configured as a pull request check, it posts a review that highlights the specific lines of code where the problem was detected. You can find these annotations on the **Conversation** tab or the **Files changed** tab of the pull request. The annotation appears directly on the line that triggered the alert. If the alert is inside the diff of your changes, the annotation will be visible there. If the alert is not in the diff, it may have been introduced by a previous commit or exist in a file not changed in this pull request, in which case you can click **View all branch alerts** to see the full set of alerts for the branch.

## Understanding the alert context

Clicking on the annotation or the **Show more details** link opens the alert view. This view provides the metadata you need to assess the risk. For CodeQL alerts, this includes the alert title, the severity level, and the nature of the problem. The severity level indicates how much risk the problem adds to your codebase. CodeQL uses two severity scales: the standard `Error`, `Warning`, or `Note` levels, and a `Security severity` level of `Critical`, `High`, `Medium`, or `Low` for security-related alerts. The security severity follows the Common Vulnerability Scoring System (CVSS) and is used in preference to the standard severity when determining check failures.

If the alert is related to a data-flow problem, such as using data insecurely or leaking sensitive information, the alert view may include a **Show paths** link. Clicking this link displays the full path from the source of the untrusted data to the sink where it is used. This is particularly useful for verifying whether the analysis correctly identified a sanitization step or if the data is genuinely untrusted in your context. For example, if the source is a user-provided value and the sink is a database query, the path shows whether the data passes through a sanitization function. If the path includes a sanitization step that you recognise as effective, the alert may be a false positive. If the path shows that the data is used directly, you need to fix the code.

## Fixing the alert

If the alert indicates a real problem, you can fix it by modifying the code in the pull request. Anyone with push access to the pull request can make these changes. Committing the fix triggers a new run of the pull request checks. If the fix resolves the issue, the alert is closed and the annotation is removed. 

In some cases, if you have access to Copilot Autofix, you may see a suggested fix generated automatically. Copilot Autofix is available for CodeQL alerts in private repositories and supports a subset of CodeQL queries. The suggestion is published as a comment on the alert. You can review the suggested changes and apply them if they are appropriate for your codebase. Note that Autofix operates on a best-effort basis and is not guaranteed to succeed for every alert. If a suggestion fails to generate, you will see a note on the alert prompting you to try pushing another commit or to contact support.

If the alert is not supported by Autofix or the suggestion is not suitable, you must fix the code manually. This might involve adding input validation, using parameterized queries, or escaping output. Once you have made the changes, push them to the branch associated with your pull request. CodeQL will automatically re-scan your changes and update the comments on your pull request accordingly.

## Verifying the resolution

After you have fixed the alert, you need to verify that the pull request check has passed. Navigate to the **Checks** tab of the pull request and look for the CodeQL results check. If the check shows a green tick, the alert has been resolved and you can proceed with merging. If the check still shows a failure, review the new check results to see if there are any additional alerts or if the original alert persists.

It is also worth checking the **Security** tab of the repository to see the full list of alerts for the branch. This can help you identify any other issues that may need attention before merging. By addressing CodeQL alerts promptly, you help maintain the security and quality of your codebase.

## Practical example: Investigating a data-flow alert

Consider a scenario where a CodeQL alert flags a potential SQL injection vulnerability in a pull request. The annotation appears on a line of code that constructs a SQL query using user input. To investigate this, you would click the **Show paths** link in the alert view. This reveals the data flow from the user input (source) to the SQL query (sink). If the path shows that the input is sanitized before being used in the query, the alert may be a false positive. You can then dismiss the alert with a comment explaining why it is safe. If the path shows that the input is used directly, you need to fix the code by implementing proper sanitization or parameterized queries.

This approach ensures that you are not just blindly fixing or dismissing alerts, but are making informed decisions based on the actual code changes and their potential impact.

tags: [codeql, code-scanning, pull-requests, github-actions, security]
diagram: {title: 

References for Investigate a CodeQL alert before merging a pull request: [Triaging code scanning alerts in pull requests](https://docs.github.com/en/code-security/code-scanning/managing-code-scanning-alerts/triaging-code-scanning-alerts-in-pull-requests), [About code scanning alerts](https://docs.github.com/en/code-security/code-scanning/managing-code-scanning-alerts/about-code-scanning-alerts), [Fixing code quality findings before merging your pull request](https://docs.github.com/en/code-security/code-quality/tutorials/fix-findings-in-prs).
