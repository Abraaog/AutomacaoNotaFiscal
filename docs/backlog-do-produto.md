# Backlog do Produto (Histórias de Usuário)

> 🗓️ **Etapa 02** · Prazo: 24/10/2026

Histórias de usuário detalhadas e priorizadas conforme a necessidade da cliente.

## Visão geral

Backlog do produto do **EmiteJá**: sistema web para revendas de motos que une a gestão de vendas à emissão simulada do documento fiscal da venda.

- **Cliente:** Rita Mendes, proprietária da Rota Motos (cliente fictícia)
- **Data do backlog:** 22/10/2026 · **Entrevista:** 15/10/2026 ([roteiro](roteiro-de-entrevista.md))
- **Equipe:** Abraão Gomes da Silva Araújo; Ednaldo Guilherme Lima Cordeiro; Kayk Thierry Araujo Silva

## Pontos-chave da entrevista

- O estoque é controlado em planilha, que já ficou desatualizada e permitiu vender a mesma moto para duas pessoas.
- O vendedor anota a venda em papel e redigita chassi, modelo, cor e valores no programa da nota; erros no chassi causam rejeição.
- Um clique repetido no programa já gerou duas notas para a mesma venda.
- O vendedor não sabe se a nota foi enviada, aceita ou precisa ser refeita, nem o motivo de uma recusa.
- A loja tem três vendedores, uma gerente e um contador externo; cadastro de motos, cancelamento e configurações ficam só com a gerente, e o contador apenas consulta.
- O sistema deve ser web, acessível também fora da loja.
- O imposto é calculado à mão; a cliente quer comparar uma taxa única com uma taxa por cilindrada antes de padronizar.
- O cancelamento ocorre quando o cliente desiste logo após a compra, com justificativa, e a moto deve voltar ao estoque.
- Quando o serviço da nota cai, o vendedor tenta de novo manualmente; a cliente quer reenvio automático com aviso.
- A cliente quer um painel mensal e aceita a emissão simulada, sem valor fiscal, por se tratar de projeto acadêmico.

## Descrição do problema

### Visão geral

A Rota Motos vende motos novas usando uma planilha para o estoque e um programa separado para a nota fiscal. Como as duas ferramentas não se conversam, cada venda exige redigitação, o estoque fica desatualizado e a mesma moto pode ser vendida duas vezes. O programa da nota não impede envios repetidos, não mostra a situação de cada nota e não explica recusas. O cálculo do imposto é manual. A loja precisa de um sistema único em que a venda confirmada gere o documento fiscal automaticamente, com estados visíveis e sem duplicidade. Por ser um projeto acadêmico, a emissão é simulada: nenhum documento tem valor fiscal e nenhum serviço governamental é acessado.

### Objetivos

- Ligar a venda à emissão: toda venda confirmada gera exatamente um documento, sem redigitação.
- Manter o estoque sempre atualizado, com a situação de cada moto (Disponível, Reservada, Vendida).
- Impedir emissão duplicada e vendas da mesma moto para dois clientes.
- Mostrar o estado de cada documento e o motivo de rejeições, permitindo correção e reenvio.
- Calcular o imposto por uma política didática configurável, para comparar variantes.
- Integrar com um autorizador simulado por meio de um contrato com respostas de sucesso e de falha.
- Dar à gerente controle de cancelamento e um painel mensal, e ao contador acesso somente de leitura.

## Backlog do Produto

| **ID** | **Funcionalidade** | **História (resumo)** | **Prioridade** |
| --- | --- | --- | --- |
| US01 | Acesso e Perfis | Login com Perfil de Acesso | Alta |
| US02 | Estoque e Clientes | Cadastro de Motos no Estoque | Alta |
| US03 | Estoque e Clientes | Consulta de Motos Disponíveis | Alta |
| US04 | Estoque e Clientes | Cadastro de Clientes | Alta |
| US05 | Venda e Emissão | Registro de Venda | Alta |
| US06 | Venda e Emissão | Emissão Automática na Confirmação | Alta |
| US07 | Venda e Emissão | Acompanhamento de Estados do Documento | Alta |
| US08 | Venda e Emissão | Bloqueio de Emissão Duplicada | Alta |
| US09 | Venda e Emissão | Correção e Reenvio após Rejeição | Alta |
| US10 | Configuração Didática | Política de Cálculo de Imposto | Alta |
| US11 | Configuração Didática | Cenário do Autorizador Simulado | Alta |
| US12 | Controle e Relatórios | Cancelamento de Documento | Alta |
| US13 | Controle e Relatórios | Exportação Mensal para o Contador | Média |
| US14 | Controle e Relatórios | Painel Mensal | Média |

## Detalhamento das Histórias de Usuário

### Acesso e Perfis

#### US01: Login com Perfil de Acesso · Alta

Como vendedor, quero entrar no sistema com meu usuário e senha, para que minhas vendas fiquem registradas em meu nome.

*Critérios de aceitação:*

- Acesso pelo navegador, somente via HTTPS (RNF05).
- Senhas armazenadas apenas como hash (RNF05).
- Três perfis: Vendedor, Gerente (herda as funções do Vendedor) e Contador (somente leitura, RN10).
- Funções restritas ficam ocultas e bloqueadas para perfis sem permissão.

### Estoque e Clientes

#### US02: Cadastro de Motos no Estoque · Alta

Como gerente, quero cadastrar motos no estoque com chassi, marca, modelo, cilindrada, ano, cor e preço, para que as vendas usem esses dados sem redigitação.

*Critérios de aceitação:*

- Chassi com 17 caracteres alfanuméricos, sem as letras I, O e Q, e único no estoque (RN04).
- Toda moto cadastrada entra como Disponível.
- Somente o perfil Gerente cadastra e altera motos.

#### US03: Consulta de Motos Disponíveis · Alta

Como vendedor, quero consultar as motos disponíveis filtrando por modelo, cilindrada e preço, para saber na hora o que posso vender.

*Critérios de aceitação:*

- Filtros por modelo, faixa de cilindrada e faixa de preço.
- Exibe a situação de cada moto (Disponível, Reservada, Vendida).
- Motos Reservadas ou Vendidas não podem ser selecionadas para venda.

#### US04: Cadastro de Clientes · Alta

Como vendedor, quero cadastrar o cliente com CPF ou CNPJ, nome, endereço e e-mail, para reutilizar seus dados na venda e no documento.

*Critérios de aceitação:*

- Dígitos verificadores de CPF e CNPJ conferidos (RN05).
- Documento do cliente único no cadastro.
- Busca por nome ou documento.

### Venda e Emissão

#### US05: Registro de Venda · Alta

Como vendedor, quero registrar a venda de uma moto disponível para um cliente, informando a forma de pagamento, para substituir a anotação em papel.

*Critérios de aceitação:*

- Só moto Disponível entra em uma venda (RN03).
- Resumo com moto, cliente, forma de pagamento e valor antes da confirmação.
- Ao confirmar, a moto passa a Reservada, impedindo que outro vendedor a venda (RN03).

#### US06: Emissão Automática na Confirmação · Alta

Como vendedor, quero que, ao confirmar a venda, o documento fiscal seja gerado e enviado automaticamente, para não redigitar dados no programa da nota.

*Critérios de aceitação:*

- Documento criado com os dados da venda, da moto e do cliente.
- Imposto calculado pela política ativa, que fica gravada no documento (RN06).
- Envio ao Autorizador Simulado conforme o contrato de integração (RNF02).
- Todo documento exibe "SEM VALOR FISCAL - SIMULAÇÃO" (RNF01).
- Da confirmação até a resposta do simulador, no máximo 5 segundos (RNF04).

#### US07: Acompanhamento de Estados do Documento · Alta

Como vendedor, quero ver em que estado está o documento (Rascunho, Processando, Autorizado, Rejeitado, Pendente, Cancelado), para saber se ele foi aceito ou precisa de ação.

*Critérios de aceitação:*

- Estado atual visível na venda e na lista de documentos.
- Cada transição registrada com estado anterior, novo estado, data, hora e usuário (RNF03).
- Com o documento Autorizado, a moto passa a Vendida (RN03).
- Sem resposta do autorizador, o documento fica Pendente e é reenviado até 3 vezes, com intervalo de 1 minuto; depois, o reenvio passa a ser manual (RN07).

#### US08: Bloqueio de Emissão Duplicada · Alta

Como vendedor, quero que clicar de novo em "Emitir" não gere um segundo documento para a mesma venda, para evitar notas repetidas.

*Critérios de aceitação:*

- Cada venda tem no máximo um documento não cancelado; o código da venda é a chave de idempotência (RN01).
- Nova solicitação para venda com documento devolve o documento existente, sem novo envio (RN02).
- O botão "Emitir" fica desabilitado enquanto o documento está Processando.

#### US09: Correção e Reenvio após Rejeição · Alta

Como vendedor, quero ver o motivo de uma rejeição, corrigir os dados e reenviar o mesmo documento, para resolver o problema sem perguntar à gerente.

*Critérios de aceitação:*

- Documento Rejeitado exibe o código e o motivo devolvidos pelo autorizador.
- Após a correção, o reenvio usa o mesmo documento, sem criar outro (RN01).

### Configuração Didática

#### US10: Política de Cálculo de Imposto · Alta

Como gerente, quero escolher qual política de cálculo de imposto está ativa, para comparar as variantes antes de padronizar uma.

*Critérios de aceitação:*

- Variante A: alíquota única de 10%. Variante B: por cilindrada (até 160 cc: 8%; 161 a 500 cc: 12%; acima de 500 cc: 18%).
- Alíquotas declaradas fictícias e de finalidade exclusivamente didática.
- Exemplo de cálculo exibido antes de confirmar a troca.
- Documentos já emitidos não são recalculados (RN06).
- Testes automatizados cobrem as duas variantes (RNF06).

#### US11: Cenário do Autorizador Simulado · Alta

Como gerente, quero definir o cenário de resposta do autorizador simulado (sucesso, rejeição ou indisponível), para demonstrar cada caminho da emissão.

*Critérios de aceitação:*

- Três cenários: sucesso (200), rejeição com código e motivo (422) e indisponível (503).
- O simulador não acessa nenhum serviço externo (RNF01).
- Toda alteração de configuração registrada com data e usuário.
- Testes automatizados cobrem os três cenários (RNF06).

### Controle e Relatórios

#### US12: Cancelamento de Documento · Alta

Como gerente, quero cancelar um documento autorizado informando a justificativa, para desfazer a venda quando o cliente desiste e devolver a moto ao estoque.

*Critérios de aceitação:*

- Somente o perfil Gerente cancela, em até 24 horas após a autorização e com justificativa de no mínimo 15 caracteres (RN08).
- O cancelamento cancela a venda e devolve a moto a Disponível (RN09).
- Se o autorizador estiver indisponível, o documento continua Autorizado e a gerente é avisada.

#### US13: Exportação Mensal para o Contador · Média

Como contador, quero consultar os documentos do mês e baixá-los em um único arquivo com resumo, para não receber as notas uma por uma.

*Critérios de aceitação:*

- Filtro por período.
- Download de todos os documentos do período em um único arquivo, com resumo de quantidade e valores.
- Perfil Contador sem permissão de alteração (RN10).

#### US14: Painel Mensal · Média

Como gerente, quero ver no painel as vendas e os documentos do mês por estado e o total de imposto calculado, para acompanhar a loja sem montar planilhas.

*Critérios de aceitação:*

- Quantidade e valor das vendas do mês.
- Quantidade de documentos em cada estado.
- Total de imposto calculado no mês, separado pela política usada.
