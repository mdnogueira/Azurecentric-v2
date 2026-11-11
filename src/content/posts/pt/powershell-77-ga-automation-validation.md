---
title: "PowerShell 7.7 em disponibilidade geral: valide a tarefa antes de atualizar o servidor"
slug: "powershell-77-ga-automation-validation"
description: "O PowerShell 7.7 traz .NET 11 e alterações nos scripts. Reveja resultados, políticas de segurança, pacotes Windows e um plano prático de validação."
pubDate: "2026-11-11T00:16:31+00:00"
language: "pt-PT"
category: "powershell"
tags: ["powershell", "powershell-7-7", "automation", "scripting", "change-management"]
translationKey: "powershell-77-ga-automation-validation"
draft: false
---

Uma atualização da automação está pronta quando a tarefa continua a produzir o resultado esperado pelos sistemas que o consomem, com a identidade e o ambiente de execução previstos. Iniciar uma nova shell com sucesso responde apenas à primeira questão.

A Microsoft [anunciou a disponibilidade geral do PowerShell 7.7 a 10 de novembro](https://devblogs.microsoft.com/powershell/announcing-powershell-7-7/). A versão utiliza .NET 11 e tem suporte Standard Term Support (STS). Inclui melhorias nos comandos, reforço da segurança e alterações que podem afetar scripts existentes. A abordagem proposta é testar primeiro as tarefas cujos resultados, tratamento de erros ou pacotes de implementação dependem dessas alterações, antes de atualizar um servidor de automação partilhado.

![Etapas de validação propostas para o PowerShell 7.7: identificar o runtime, comparar os contratos dos scripts, testar com a identidade prevista e manter uma via de recuperação.](/images/news/powershell-77-validation-pt.svg)

## Reveja primeiro os contratos dos scripts

O anúncio altera o resultado predefinido de `New-Guid`: passa de UUIDs de versão 4 para UUIDs de versão 7, ordenáveis por tempo. O formato textual continua familiar, pelo que verificar apenas se o identificador parece um GUID não deteta a alteração semântica. Reveja os validadores, os sistemas de armazenamento que o consomem e os pressupostos sobre a geração de identificadores. A Microsoft indica `[guid]::NewGuid()` como opção para GUIDs de versão 4; nenhuma das versões deve substituir um gerador especificamente concebido para segredos.

A formatação e o tratamento de erros também merecem atenção. `Format-Table`, `Format-List` e `Format-Custom` rejeitam valores nulos ou vazios em `-Property`. A versão altera a validação de argumentos nulos ou vazios para lançar `System.ArgumentException`. Um wrapper que captura um tipo de exceção anterior específico pode, por isso, precisar de revisão, mesmo que o percurso sem erros continue a funcionar.

Os valores explicitamente falsos nos switches afetados passam a ser respeitados, incluindo os switches de operadores de `Where-Object`. Teste entradas verdadeiras e falsas nos wrappers que passam switches a outros comandos. Um teste que abrange apenas o caso habitual de sucesso não demonstra que a lógica de filtragem continua correta.

Nas tarefas que produzem CSV, reveja a combinação agora inválida de `Export-Csv -Append` com `-NoHeader` e o aviso de descontinuação de `-NoTypeInformation`. Verifique o ficheiro resultante e o processo que o lê, incluindo se os avisos são tratados como falha da tarefa. São alterações documentadas da versão, e não falhas observadas num ambiente de cliente.

## Mantenha os controlos de segurança no piloto

A versão também altera comportamentos relacionados com linguagem restrita, remoting, extração de ajuda e referências de esquemas JSON. Por exemplo, `Test-Json` exige a opção explícita `-FetchExternalReference` para resolver referências externas de esquemas. Confirme se uma tarefa de validação depende dessas referências e reveja as localizações e a respetiva confiança antes de ativar esse comportamento.

A [orientação da Microsoft sobre modos de linguagem](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_language_modes?view=powershell-7.6) explica a relação entre Constrained Language Mode e o controlo de aplicações. Uma sessão restringida manualmente não demonstra que a fronteira de controlo de aplicações da produção foi reproduzida. Teste com as políticas e a identidade previstas; não as enfraqueça apenas para obter um resultado positivo no piloto.

As novas facilidades podem esperar até esta base estar compreendida. `New-TemporaryDirectory` reduz o trabalho necessário para criar um diretório temporário com nome único, enquanto `Join-Path -Extension` acrescenta outra forma de construir caminhos. Uma tarefa que adota um novo comando passa também a ter um requisito mínimo de runtime. Mantenha explícitas as expectativas de implementação e compatibilidade.

## Escolha o pacote e o ciclo de suporte conscientemente

Os [ficheiros da versão 7.7.0](https://github.com/PowerShell/PowerShell/releases/tag/v7.7.0) estão disponíveis, mas a documentação ainda está a ser atualizada. Na altura desta revisão, a [página de novidades](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/what-s-new-in-powershell-77) ainda descrevia uma pré-visualização e a [página do ciclo de suporte](https://learn.microsoft.com/en-us/powershell/scripting/install/powershell-support-lifecycle) ainda apresentava o 7.7 como pré-visualização, sem datas finais de suporte. O anúncio de disponibilidade geral estabelece o estado da versão; essas indicações desatualizadas não devem servir para inventar uma data de fim de suporte STS ou um inventário final das versões dos módulos.

No Windows, os pacotes exigem atenção especial. A [orientação de instalação atual](https://learn.microsoft.com/en-us/powershell/scripting/install/install-powershell-on-windows) indica que o 7.7.0 não tem pacote MSI, e os ficheiros da versão incluem pacotes MSIX e ZIP. Trata-se de uma alteração dos pacotes do 7.7, e não de uma afirmação de que os MSI desapareceram de todas as versões do PowerShell 7. Verifique as limitações do método escolhido para tarefas não assistidas, remoting e sistema operativo do servidor antes de substituir um procedimento de implementação existente.

O PowerShell utiliza a licença MIT. O orçamento prático corresponde ao tempo de engenharia e à infraestrutura necessários para validar; o suporte pago e eventuais recursos Azure usados num piloto são considerações separadas. Este artigo não recomenda uma implementação com custos nem promete melhorias de desempenho ou redução de custos operacionais.

## Torne a evidência da implementação reproduzível

Numa tarefa agendada hipotética que exporta um ficheiro de inventário, compare o runtime existente com o 7.7 usando entradas representativas. Conserve o resultado, os avisos, o comportamento de saída e o resultado do processo que lê o ficheiro. Inclua uma entrada vazia e outra inválida e execute depois com a identidade de serviço e as políticas previstas.

| Etapa | Evidência a conservar |
| --- | --- |
| Runtime | Executável, versão, arquitetura, módulos e método de instalação exatos. |
| Contrato | Comportamento esperado dos resultados e erros, incluindo pressupostos sobre GUIDs, filtros e CSV. |
| Ambiente | Identidade, permissões, modo de linguagem, remoting e dependências externas relevantes. |
| Recuperação | Artefacto de implementação anterior, procedimento de reposição e critérios para parar a implementação. |

Este é um plano de validação proposto, e não um relatório de testes executados no PowerShell 7.7. Fixe o runtime candidato no piloto, confirme o pacote e a informação de suporte da sua plataforma e alargue a implementação apenas quando o responsável da tarefa conseguir explicar a evidência. A versão traz melhorias úteis; a adoção deve manter compreensíveis o comportamento da automação e a sua via de recuperação.

Marcos Nogueira  
[LinkedIn](https://www.linkedin.com/in/mdnoga/)
