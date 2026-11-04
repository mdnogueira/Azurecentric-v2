---
title: "Uma pontuação de segurança que conduz a ações, não apenas a uma percentagem semanal"
description: "Identifique o modelo de pontuação do Defender for Cloud, escolha uma recomendação com contexto de negócio e atribua uma tarefa com evidência para a sua conclusão."
pubDate: 2026-11-11T11:00:00-05:00
language: pt-PT
category: cloud-security
tags: [defender-for-cloud, cloud-security, cspm, security-posture]
translationKey: defender-for-cloud-series-02-secure-score-that-drives-action
thumbnailImageIndex: 2
draft: false
---

*Episódio 2 da série Segurança na Cloud – Microsoft Defender*

[Consultar a série](/pt/series/cloud-security-microsoft-defender)

A pontuação de segurança mudou desde a última reunião. Isso representa uma melhoria do ambiente, um âmbito diferente ou uma alteração do que está a ser avaliado?

Antes de lhe chamar progresso, confirme o que está a comparar. Depois, escolha uma recomendação que a equipa possa investigar e transforme-a numa tarefa com um responsável. O resultado útil de uma análise da postura é uma decisão que alguém consegue executar e verificar.

Vamos continuar com o **Orders Demo**, a aplicação hipotética apresentada no Episódio 1. Permite manter um exemplo coerente para discutir responsabilidades e evidência. As constatações, prioridades e tarefas abaixo são ilustrativas; não são medições de um ambiente real.

![Uma matriz ilustrativa de risco e esforço com três tarefas de remediação distintas, mantendo visível para planeamento a tarefa de risco elevado que exige mais esforço.](/images/series/defender-for-cloud/episode-02-risk-effort.pt.svg)

## Identifique a pontuação antes de registar uma referência

A [documentação da pontuação de segurança da Microsoft](https://learn.microsoft.com/en-us/azure/defender-for-cloud/secure-score-security-controls) distingue a pontuação clássica Secure Score, no portal do Azure, da Cloud Secure Score baseada no risco, no portal Defender. Os cálculos são diferentes. O modelo baseado no risco incorpora fatores de risco e a criticidade dos recursos, enquanto a experiência clássica utiliza o seu próprio cálculo baseado em controlos.

Uma percentagem de um modelo não serve como referência diretamente comparável à do outro. Registe a experiência do portal, o modelo, o ambiente selecionado e a hora da observação juntamente com o valor. Se um relatório anterior omitiu esse contexto, deixe a comparação em aberto até conseguir confirmá-lo.

O âmbito também importa. Acrescentar recursos avaliados ou alterar o conjunto de recomendações pode mudar o resultado sem que a equipa da aplicação tenha alterado a configuração. A documentação da Microsoft descreve como o alargamento da cobertura das avaliações pode afetar as pontuações. É um motivo para confirmar o contexto da avaliação antes de atribuir mérito ou responsabilidade.

Para o Orders Demo, a primeira nota de análise poderia simplesmente dizer: «Portal do Azure, Secure Score clássica, subscrição da aplicação selecionada, observação recolhida antes desta análise.» Deixámos deliberadamente o número de fora: este exemplo centra-se na informação a registar, em vez de inventar um valor de referência.

![Exemplo da pontuação de segurança clássica apresentado na documentação do produto; os valores são do exemplo da documentação, não são medições do Orders Demo.](/images/series/defender-for-cloud/episode-02-classic-secure-score-learn.png)

## Encontre uma preocupação que pertença à aplicação

As [orientações sobre recomendações](https://learn.microsoft.com/en-us/azure/defender-for-cloud/review-security-recommendations) descrevem a análise das constatações e dos respetivos detalhes de remediação. Utilize a experiência documentada para o portal em que está a trabalhar; os ecrãs e os formatos das recomendações podem variar à medida que o serviço evolui.

No nosso exemplo, suponha que a equipa está a investigar uma constatação sobre um recurso de armazenamento utilizado pelo Orders Demo. Comece pelo recurso afetado e pela preocupação que a constatação descreve. Esse recurso ainda serve a aplicação? Que informação guarda? Que identidade ou percurso de rede é relevante? Quem pode confirmar o desenho pretendido?

A recomendação é um ponto de partida para essa investigação. Ler uma instrução de remediação não confirma que aplicá-la imediatamente seja seguro para a aplicação. A alteração pode exigir um teste, uma janela de manutenção acordada ou coordenação com o responsável por uma dependência.

Mantenha as dúvidas visíveis. Se o responsável pelos dados ainda não confirmou a finalidade do recurso, registe isso na tarefa. Uma investigação curta atribuída à pessoa certa é mais útil do que encaminhar uma constatação ambígua para uma fila geral de operações.

## Utilize o contexto de risco sem esconder o trabalho difícil

A [priorização de riscos](https://learn.microsoft.com/en-us/azure/defender-for-cloud/risk-prioritization) do Defender for Cloud considera o contexto do recurso e o impacto potencial. A documentação identifica o **Defender CSPM** como pré-requisito destas funcionalidades avançadas. A existência de recomendações não significa que todas as capacidades avançadas de priorização estejam ativas.

Para a discussão, utilize a informação de risco que realmente possui. Se uma funcionalidade não estiver disponível, registe essa limitação e utilize contexto confirmado sobre a aplicação. Não preencha a ausência de uma avaliação do produto com uma pontuação de risco inventada.

A matriz que acompanha o artigo é uma ferramenta de planeamento sugerida. As suas etiquetas são apreciações ilustrativas, não valores produzidos pelo Defender for Cloud. Coloque uma tarefa importante e exequível na próxima janela de alteração, mas mantenha também no plano uma tarefa importante que exija mais trabalho de engenharia.

Este último ponto importa. Se a equipa escolher apenas trabalho de baixo esforço todas as semanas, uma exposição difícil pode continuar por resolver enquanto cresce o número de tarefas concluídas. Atribua à tarefa maior um responsável, uma próxima decisão de desenho e uma data de análise. Divida-a em passos seguros quando a aplicação permitir essa abordagem.

## Escreva uma tarefa que possa ser concluída com evidência

Uma tarefa chamada «Melhorar a pontuação de segurança» não diz à equipa que a recebe o que deve alterar. Para o Orders Demo, utilize antes a estrutura de passagem de trabalho sugerida abaixo.

| Campo da tarefa | O que registar |
|---|---|
| Âmbito | A constatação, o recurso afetado e a relação com a aplicação |
| Preocupação | A exposição a investigar, distinguindo contexto confirmado de dúvidas |
| Responsável | A pessoa que coordena a investigação e a alteração proposta |
| Plano de alteração | Configuração pretendida, dependências, aprovação e considerações de reversão |
| Verificação | Como serão verificadas depois a aplicação e a preocupação de segurança |
| Momento de análise | Quando examinar os resultados da reavaliação e eventuais exceções pendentes |

Numa tarefa ilustrativa sobre acesso ao armazenamento, a verificação poderia incluir confirmar o percurso de acesso pretendido, verificar se a aplicação continua a executar a sua operação legítima e analisar a constatação depois da reavaliação. São verificações propostas. Não afirmam que uma alteração de acesso específica tenha sido executada, nem que uma constatação tenha desaparecido.

Acorde estas verificações antes da implementação. Caso contrário, é fácil chegar ao fim de uma janela de alteração com uma configuração diferente e sem uma definição comum de sucesso.

## Faça uma análise curta com um resultado concreto

A sequência seguinte é uma rotina de trabalho sugerida, não um procedimento oficial do produto.

1. **Registe a observação.** Recolha o modelo de pontuação, o portal, o âmbito e a hora, bem como alterações da avaliação que afetem a comparação.
2. **Selecione uma constatação.** Leia os detalhes do recurso afetado e da remediação; confirme depois como o recurso apoia a aplicação.
3. **Acorde a próxima ação.** Escolha investigação ou implementação em função do que está confirmado. Identifique um responsável e uma data de análise.
4. **Defina a verificação.** Descreva as verificações da aplicação, a evidência de segurança e a informação da reavaliação que apoiarão a conclusão da tarefa.
5. **Volte ao mesmo âmbito.** Depois de uma alteração aprovada, compare observações numa base coerente e explique o que continua por resolver.

A atualização da pontuação pode seguir um calendário diferente do de uma alteração de configuração. Mantenha separados o registo da alteração e a observação da avaliação até estar disponível a reavaliação relevante. Um movimento tardio da pontuação não apaga o trabalho, e uma percentagem superior, por si só, não confirma que foi alcançado o resultado pretendido para a aplicação.

Na próxima análise, traga uma investigação concluída ou uma proposta de alteração bem definida. **No Episódio 3, vamos analisar o Foundational CSPM e o Defender CSPM**, para que a equipa possa escolher capacidades em função do trabalho que precisa de realizar.

Até à próxima,  
**Marcos Nogueira**  
[Ligue-se a mim no LinkedIn](https://www.linkedin.com/in/mdnoga/)
