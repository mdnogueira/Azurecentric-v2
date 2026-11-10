---
title: "Pausa do Dependabot por inatividade: verifique a cobertura antes de 8 de dezembro"
slug: "dependabot-alerts-inactive-repositories"
description: "O GitHub vai pausar alertas do Dependabot na maioria dos repositórios inativos a partir de 8 de dezembro. Reveja responsáveis, definições e cobertura."
pubDate: "2026-11-10T16:44:20+00:00"
language: "pt-PT"
category: "cloud-security"
tags: ["dependabot", "supply-chain-security", "github", "vulnerability-management", "devsecops"]
translationKey: "dependabot-alerts-inactive-repositories"
draft: false
---

Um repositório pode deixar de receber alterações enquanto a aplicação criada a partir dele continua em funcionamento. Esta distinção é importante para decidir onde deve manter-se a monitorização de dependências.

O [anúncio do GitHub de 10 de novembro](https://github.blog/changelog/2026-11-10-dependabot-alerts-will-pause-on-inactive-repositories) indica que, a partir de **8 de dezembro de 2026**, os alertas do Dependabot serão desativados na maioria dos repositórios sem atividade há um ano. Os alertas existentes serão arquivados, e não eliminados. Trata-se de uma alteração futura anunciada, pelo que não se deve assumir que um repositório inativo já perdeu hoje a cobertura de alertas.

[![Imagem do anúncio do GitHub: o Dependabot vai desativar alertas em repositórios inativos.](/images/news/dependabot-inactive-repositories-20261110.png)](https://github.blog/changelog/2026-11-10-dependabot-alerts-will-pause-on-inactive-repositories)

A abordagem operacional proposta é identificar os repositórios sem alterações que continuam a ser relevantes para um serviço em execução, um processo de recuperação ou uma futura implementação. A decisão sobre a monitorização deve estar associada a um responsável e ao ciclo de vida da carga de trabalho, em vez de se considerar a ausência de commits como prova de que o código deixou de ser importante.

## Compreenda a contagem e as exceções

O GitHub considera atividade um push para qualquer branch ou tag, a criação do repositório ou a ativação dos alertas do Dependabot. Um push volta a ativar os alertas automaticamente; os administradores também podem ativá-los nas definições do repositório. Ambas as opções restauram os alertas arquivados e reiniciam a contagem de um ano.

O anúncio identifica duas exceções: uma configuração de segurança imposta que ative os alertas do Dependabot e uma política empresarial do Dependabot que impeça os administradores dos repositórios de os ativarem ou desativarem. Confirme que os alertas estão efetivamente ativos; limitar quem pode alterar uma definição não demonstra, por si só, que essa definição tem o valor pretendido.

A alteração abrange todos os planos do GitHub.com e o GitHub Enterprise Cloud com residência de dados, onde os alertas arquivados permanecem na região da empresa. O GitHub Enterprise Server está excluído. O aviso não especifica uma hora de conclusão para todos os repositórios nem o comportamento detalhado das APIs e dos webhooks durante a transição.

## Organize o inventário em torno do serviço

Considere uma aplicação hipotética implementada no Azure a partir de um repositório cujo último push ocorreu há mais de um ano. A aplicação continua a servir utilizadores e o repositório mantém-se como fonte para a reconstruir. Um repositório sem alterações e uma aplicação descontinuada representam estados distintos do ciclo de vida.

Comece pelo responsável do serviço e confirme se esse código ainda pode chegar à produção, diretamente ou através de um procedimento de recuperação. Inclua scripts de implementação e dependências utilizados para reconstruir uma versão anterior. O resultado útil é um conjunto reduzido de decisões explícitas, e não um commit artificial de manutenção feito apenas para reiniciar uma contagem.

| Questão de análise | Evidência a conservar |
| --- | --- |
| Este código continua a ter relevância operacional? | Serviço em execução, dependência de implementação ou recuperação, confirmados por um responsável. |
| Qual é o estado do repositório? | Última atividade relevante, ativação dos alertas e indicação de que o próprio repositório está ou não arquivado. |
| O que mantém a monitorização ativa? | Configuração aplicada e respetiva imposição, ou política empresarial aplicável e estado atual dos alertas. |
| Quem trata de uma deteção? | Responsável identificado pela correção e processo de análise da dependência afetada. |
| Como verificaremos a decisão? | Verificação datada da cobertura e revisão após o início da alteração anunciada. |

Esta tabela é uma proposta de trabalho, e não um relatório de repositórios inspecionados ou um procedimento de migração testado. Deve também distinguir-se o arquivo de alertas ao abrigo da nova política do arquivo do próprio repositório: a [documentação do Dependabot](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-alerts) indica que os repositórios arquivados não são analisados.

## Verifique a configuração aplicada, não apenas o nome

A [orientação do GitHub sobre configurações de segurança personalizadas](https://docs.github.com/en/code-security/how-tos/secure-at-scale/configure-organization-security/establish-complete-coverage/create-custom-configuration) distingue a escolha das definições da sua imposição. Esta abrange as definições explicitamente ativadas ou desativadas; as que ficam por especificar não são impostas. Depois de criar uma configuração, é também necessário aplicá-la aos repositórios pretendidos.

Reveja este ponto com o administrador adequado da organização. Ao nível empresarial, o [GitHub documenta um controlo específico](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies/enforcing-policies-for-your-enterprise/enforcing-policies-for-code-security-and-analysis-for-your-enterprise#enforcing-a-policy-to-manage-the-use-of-dependabot-alerts-in-your-enterprise) sobre a possibilidade de os administradores dos repositórios gerirem os alertas do Dependabot. Os proprietários das organizações e os gestores de segurança mantêm autoridade própria, pelo que deve descrever a política efetiva, sem afirmar que ninguém pode alterar a definição.

O anúncio não introduz uma nova taxa de monitorização nem indica que todos os repositórios precisam de um produto Advanced Security pago. Contudo, uma configuração personalizada também pode ativar funcionalidades pagas do Code Security ou do Secret Protection em repositórios privados e internos. Reveja toda a configuração e as implicações de licenciamento antes de a aplicar em larga escala. Este artigo não ativa produtos, altera políticas ou gera encargos de serviço.

## Verifique a cobertura separadamente do número de alertas

Para as equipas que utilizam o Azure, a [documentação de segurança DevOps do Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-devops-introduction) descreve a visibilidade dos repositórios ligados, da ativação de segurança e das deteções relativas a dependências. A cobertura é, por isso, um elemento útil da análise, juntamente com as próprias deteções. Esta documentação não estabelece como esta transição específica do GitHub aparecerá em cada conector ou integração personalizada.

Se exporta dados do Dependabot para outra ferramenta, verifique o comportamento à luz da documentação aplicável e da configuração efetiva. Defina como distinguir alertas ativos sem deteções, alertas desativados e dados indisponíveis. Uma contagem inferior não comprova a correção de vulnerabilidades. Não baseie uma regra de deteção num evento de webhook presumido.

Antes de 8 de dezembro, acorde quais os repositórios que exigem monitorização contínua e verifique a configuração. Após o início da alteração, volte a verificar a cobertura e registe eventuais exceções com um responsável. A decisão deve continuar a ser compreensível para a próxima pessoa que assumir o serviço.

Marcos Nogueira  
[LinkedIn](https://www.linkedin.com/in/mdnoga/)
