---
title: "CodeQL 2.27.4: o que verificar antes de fechar alertas"
description: "Reveja o anúncio do CodeQL 2.27.4: alterações nas consultas, relatórios CWE e verificações do pipeline antes de interpretar uma redução dos alertas."
pubDate: "2026-11-12T21:19:15+00:00"
language: "pt-PT"
category: "cloud-security"
tags: ["codeql", "github-advanced-security", "code-scanning", "devsecops"]
translationKey: "codeql-2-27-4-accuracy-metadata"
draft: false
---

Vale a pena olhar para o anúncio do GitHub de 4 de novembro sobre o CodeQL 2.27.4 se a sua equipa depende da análise de código. As alterações incluem uma análise mais precisa em determinadas consultas e uma correção nos metadados de vulnerabilidades. Segundo o GitHub, as novas versões do CodeQL são disponibilizadas automaticamente na análise de código em github.com. [Anúncio do GitHub](https://github.blog/changelog/2026-11-04-codeql-2-27-4-improves-accuracy-and-query-metadata/).

Há aqui duas datas: o anúncio tem a data de 4 de novembro; o [registo de alterações da CLI indica 2 de novembro como data da versão](https://codeql.github.com/docs/codeql-overview/codeql-changelog/codeql-cli-2.27.4/). É uma atualização a rever no seu processo de análise. Por si só, não justifica comunicar ao negócio que esta atualização corrigiu vulnerabilidades na aplicação.

A pergunta útil é o que mudou na evidência que sustenta um alerta. Uma lista menor de pendências pode refletir uma análise melhor, uma alteração nos relatórios ou uma correção efetiva no código. Cada resultado merece uma explicação diferente.

![Três verificações independentes antes de interpretar uma alteração num resultado do CodeQL: comportamento da análise, metadados dos relatórios e resultados do pipeline.](/images/news/codeql-2-27-4-review-lanes.pt.svg)

## Comece pelo alerta e depois olhe para a contagem

O anúncio descreve o reconhecimento de mais mecanismos de sanitização na análise de injeção em registos em Java/Kotlin e menos falsos positivos em determinadas consultas de Rust. São melhorias específicas, sem a promessa de maior precisão em todos os alertas dessas linguagens. [Alterações nas consultas](https://github.blog/changelog/2026-11-04-codeql-2-27-4-improves-accuracy-and-query-metadata/).

Considere um serviço Java hipotético que recebe um valor num pedido e o escreve num registo da aplicação. A equipa já aplica uma transformação entre a entrada e a escrita no registo. Depois de uma atualização da análise, um alerta desaparece.

Antes de fechar a tarefa de remediação, pergunte se alguém alterou a aplicação. Se foi analisado o mesmo commit, o resultado diferente pode dever-se ao analisador reconhecer um padrão que antes não identificava. Isso é útil, mas corresponde a um resultado diferente de um programador corrigir o código.

Depois, examine o fluxo de dados real. Que entrada chega a que operação de escrita no registo? Que transformação existe pelo meio? O seu comportamento responde ao risco específico, incluindo o formato esperado pelo sistema de destino? O reconhecimento por uma regra de análise não deve transformar-se numa aprovação generalizada de todas as utilizações dessa biblioteca.

Este é um exercício de revisão sugerido, não o resultado de um teste que tenha realizado num repositório. O objetivo é manter a explicação associada a cada alerta.

## Uma alteração na etiqueta CWE exige rever os relatórios

As notas da versão removem a etiqueta CWE-730 de determinadas consultas, mantendo as outras etiquetas CWE dessas consultas. [Alterações nos metadados](https://codeql.github.com/docs/codeql-overview/codeql-changelog/codeql-cli-2.27.4/).

A MITRE identifica a CWE-730 como um agrupamento de negação de serviço do OWASP Top Ten de 2004, cuja utilização no mapeamento de vulnerabilidades individuais é proibida. [Entrada da MITRE](https://cwe.mitre.org/data/definitions/730.html).

Para uma equipa que mantém um painel de vulnerabilidades, a preocupação prática é a continuidade. Se um relatório agrupar alertas apenas por essa etiqueta, os totais podem mudar sem uma alteração correspondente na aplicação. Verifique o identificador da consulta, o código afetado e a classificação que permanece antes de interpretar a tendência.

Junte uma nota curta ao relatório a explicar a alteração na classificação. Quem o lê deve conseguir distinguir uma mudança de etiqueta de uma tarefa de engenharia que eliminou uma exposição. Caso contrário, uma melhoria bem-intencionada nos relatórios pode levar a equipa a discutir o resultado errado na próxima revisão.

## Verifique também o pipeline

Dois detalhes da CLI merecem atenção: os diagnósticos da JVM passam para a saída de erro padrão, e o empacotamento ou a publicação de pacotes exclui, com um aviso, ficheiros cujas ligações simbólicas resolvidas apontem para fora da raiz do pacote. [Alterações na CLI](https://codeql.github.com/docs/codeql-overview/codeql-changelog/codeql-cli-2.27.4/).

Se mantém um wrapper personalizado, reveja como este captura os dados legíveis por máquina e os diagnósticos. Mantenha os erros visíveis para o operador, permitindo ao componente consumidor interpretar os dados pretendidos. A leitura bem-sucedida desses dados é apenas uma verificação; confirme que a análise e os resultados esperados foram efetivamente produzidos.

Nos pacotes de consultas personalizados, examine os avisos e o conteúdo resultante. Se faltar algo esperado, investigue a organização dos ficheiros antes de distribuir o pacote. Evite considerar um aviso inofensivo só porque o comando terminou.

## Uma pequena revisão antes da adoção

Num repositório representativo, a tabela seguinte oferece um ponto de partida razoável. São verificações sugeridas, não instruções oficiais do portal.

| Observação | Evidência a guardar | Decisão a tomar |
| --- | --- | --- |
| Um alerta desaparece | Commit, ID da consulta, configuração e fluxo de código relevante | Houve uma alteração no código, na análise ou no âmbito? |
| Uma categoria do relatório diminui | Metadados anteriores e atuais da regra | O painel precisa de uma nota explicativa ou de um ajuste no agrupamento? |
| Um wrapper comporta-se de forma diferente | Código de saída, dados de saída e diagnósticos capturados separadamente | O operador continua a conseguir detetar uma execução falhada ou incompleta? |
| Um pacote apresenta um aviso novo | Aviso e conteúdo do arquivo inspecionado | O pacote inclui o que os componentes consumidores precisam? |

Registe as versões do CodeQL e dos pacotes de consultas efetivamente utilizadas. Sempre que possível, mantenha comparáveis o commit, as linguagens abrangidas e a seleção de consultas. Se o fluxo de trabalho alojado não permitir uma execução controlada antes e depois da atualização, registe essa limitação em vez de construir uma comparação a partir de análises sem relação entre si.

A documentação SARIF do GitHub explica que identificadores de regras estáveis e caminhos de ficheiros consistentes são importantes para associar resultados entre execuções. Verifique esses dados antes de interpretar uma aparente substituição de alertas como um problema novo ou uma correção. [Suporte SARIF](https://docs.github.com/en/code-security/reference/code-scanning/sarif-files/sarif-support).

A disponibilidade também depende do repositório e da subscrição: o GitHub documenta a análise de código para repositórios públicos e repositórios elegíveis pertencentes a organizações com o GitHub Code Security ativado. [Requisitos dos repositórios](https://docs.github.com/en/code-security/reference/code-scanning/sarif-files/sarif-support). A utilização em repositórios privados exige licenciamento pago, medido pelos contribuidores ativos que efetuam commits. Verifique os repositórios e os contribuidores abrangidos antes de alargar a cobertura. [Licenciamento e faturação](https://docs.github.com/en/billing/concepts/product-billing/github-advanced-security).

Comece por uma revisão que alguém consiga explicar. Preserve as melhorias úteis na análise, ajuste os relatórios quando necessário e sustente cada decisão de remediação com evidência do código afetado. A próxima reunião de segurança terá assim algo mais útil para discutir do que um número mais baixo.

Até à próxima,  
**Marcos Nogueira**  
[Ligue-se a mim no LinkedIn](https://www.linkedin.com/in/mdnoga/)
