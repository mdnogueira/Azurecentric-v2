---
title: "Add validation before deploying a Bicep change"
description: "Use the Bicep linter to catch best practice violations before deployment, configuring rules via bicepconfig.json."
pubDate: 2025-06-07
category: automation
tags: ["bicep", "linter", "azure-resource-manager"]
translationKey: add-validation-before-deploying-a-bicep-change
draft: false
---

You have a Bicep file that looks correct in your editor, but you are about to deploy it to a production subscription. The first thing to check is not the deployment command, but the file itself. The Bicep linter runs before the Azure Resource Manager engine ever sees your code, catching best practice violations that would otherwise create suboptimal resources or expose sensitive data.

The linter is integrated into the Bicep CLI and the Bicep extension for Visual Studio Code. To use it, you must have version 0.4 or later installed [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter).

## How the linter works

The linter checks your Bicep files against a set of default rules. These rules are taken from the ARM Template Test Cases (arm-ttk) and are set to the warning level by default [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter). This means that violations will appear in your editor and build output, but they will not stop the build unless you change the level to `error`.

The default rules cover a wide range of issues, from using literal admin usernames to hardcoding environment URLs. A full list of the default rules is available in the Bicep documentation [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter). For example, the `no-hardcoded-location` rule warns you if you hardcode a region, which makes your template less portable. The `outputs-should-not-contain-secrets` rule prevents you from accidentally exposing sensitive data in deployment outputs.

In Visual Studio Code, the linter results appear in the **PROBLEMS** pane. You can hover over a warning to see details, and select the light bulb to see a quick fix. The Bicep CLI `lint` command and the `build` command also show any rule violations in the command line [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter).

## Configuring the linter

The default rules are a good starting point, but you will likely want to customise them for your team. You can do this by creating a `bicepconfig.json` file in your project root. This file allows you to enable or disable the linter, supply rule-specific values, and set the level of rules [Linter settings for Bicep config](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-config-linter).

For example, if your team agrees that hardcoding a location is acceptable for a specific project, you can suppress that warning by setting the rule level to `off`:

```json
{
  "analyzers": {
    "core": {
      "rules": {
        "no-hardcoded-location": {
          "level": "off"
        }
      }
    }
  }
}
```

You can also set a rule to `error` if you want the build to fail when that rule is violated. This is useful for critical security rules like `use-secure-value-for-secure-inputs` [Linter settings for Bicep config](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-config-linter).

The `bicepconfig.json` file also allows you to customise the `no-hardcoded-env-urls` rule. By default, it checks against a list of disallowed hosts, but you can add your own hosts to the `disallowedhosts` or `excludedhosts` lists [Linter settings for Bicep config](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-config-linter).

## Handling false positives

Sometimes a rule will flag a valid use case. For example, you might need to include a link to a blob storage directly without using the `environment()` function. In this case, you can disable the warning for one line only by adding `#disable-next-line <rule name>` before the line with the warning [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter):

```bicep
#disable-next-line no-hardcoded-env-urls //Direct download link to my toolset
scriptDownloadUrl: 'https://mytools.blob.core.windows.net/...'
```

It is good practice to add a comment explaining why the rule doesn't apply to this line. If you want to suppress a linter rule for the entire document, you can change the level of the rule to `Off` in `bicepconfig.json` [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter).

## Integrating into CI/CD

You can integrate these checks as part of your CI/CD pipelines. You can use a GitHub action to attempt a Bicep build. Errors will fail the pipelines, ensuring that only validated templates are deployed [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter).

To do this, you can use the `bicep build` command in your pipeline. If the build fails due to linter errors, the pipeline will stop. This ensures that your team adheres to the coding standards defined in your `bicepconfig.json` file.

## Verification

To verify that the linter is working, create a Bicep file with a known violation, such as a hardcoded location. Run the `bicep lint` command or check the **PROBLEMS** pane in Visual Studio Code. You should see a warning for the `no-hardcoded-location` rule. If you set the rule level to `error` in your `bicepconfig.json` file, the `bicep build` command should fail.

Once you are confident that the linter is catching the issues you care about, you can integrate it into your CI/CD pipeline. This ensures that your templates are validated before they are deployed, reducing the risk of deployment failures and suboptimal resource configurations.

## Cleanup

If you need to disable the linter for a specific project, you can set the `enabled` property to `false` in your `bicepconfig.json` file [Linter settings for Bicep config](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-config-linter). However, this is not recommended for production workloads.

If you need to remove the linter from your CI/CD pipeline, you can simply remove the `bicep lint` or `bicep build` step from your pipeline configuration. However, this is also not recommended, as it removes a critical validation step.

## Next steps

For more information about customizing the linter rules, see the Bicep documentation [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter). For more information about using Visual Studio Code and the Bicep extension, see the Bicep quickstart [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter).
