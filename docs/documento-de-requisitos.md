# Documento de Requisitos

**Projeto EmiteJá: Automação de Emissão de Nota Fiscal e Gestão de Venda de Motos**
Revisão 2.0

| Elaboração | Elaboração | Elaboração | Aprovação |
|---|---|---|---|
| Abraão Gomes da Silva Araújo | Ednaldo Guilherme Lima Cordeiro | Kayk Thierry Araujo Silva | Rita Mendes |
| Equipe de desenvolvimento (Grupo 04) | Equipe de desenvolvimento (Grupo 04) | Equipe de desenvolvimento (Grupo 04) | Cliente (fictícia), proprietária da Rota Motos |
| Data: 05/11/2026 | Data: 05/11/2026 | Data: 05/11/2026 | Data: 05/11/2026 |

## Registro de Alterações

| Versão | Responsável | Data | Alterações |
|---|---|---|---|
| 1.0 | Abraão, Ednaldo, Kayk | 05/11/2026 | Elaboração inicial do Documento de Requisitos do EmiteJá. |
| 2.0 | Abraão, Ednaldo, Kayk | 05/11/2026 | Adequação ao tema do Grupo 04: inclusão da gestão de venda de motos, emissão simulada, contrato de integração, estados de processamento, prevenção de emissão duplicada e política didática de cálculo de imposto. |

## 1. Introdução

Este documento reúne os requisitos de usuário do EmiteJá, tema do Grupo 04: automação de emissão de nota fiscal e gestão de venda de motos. A seção 2 descreve o propósito do sistema; a seção 3 apresenta o minimundo e declara o escopo adotado; a seção 4 lista os requisitos funcionais, as regras de negócio, os requisitos não funcionais e a política didática de cálculo; a seção 5 apresenta o modelo de casos de uso; a seção 6 traz os diagramas de atividades; a seção 7 descreve os estados de processamento e o contrato de integração simulado; e a seção 8 indica o protótipo.

## 2. Descrição do Propósito do Sistema

O EmiteJá é um sistema web para revendas de motos que une o controle de estoque e de vendas à emissão do documento fiscal da venda. Ao confirmar a venda de uma moto, o sistema gera automaticamente o documento fiscal com os dados da moto, do cliente e do pagamento, envia o documento a um autorizador por meio de um contrato de integração, acompanha cada estado do processamento e impede que a mesma venda gere dois documentos. Por ser um projeto acadêmico, a autorização é **simulada**: nenhum documento tem valor fiscal e nenhum serviço governamental é acessado.

## 3. Descrição do Minimundo

A Rota Motos é uma revenda de motos novas de propriedade de Rita Mendes. A loja tem três vendedores, uma gerente e um contador externo. O estoque fica em uma planilha, e cada moto é identificada pelo número do chassi.

Quando um cliente fecha negócio, o vendedor confere na planilha se a moto ainda está disponível, anota a venda em papel e depois digita a nota fiscal em outro programa, copiando chassi, modelo, cor e valores. Já aconteceu de duas vendas serem feitas para a mesma moto, porque a planilha não foi atualizada a tempo, e de a mesma venda gerar duas notas, porque o vendedor clicou de novo ao achar que o programa tinha travado. Erros de digitação no chassi provocam rejeição da nota, e o vendedor não sabe em que situação a nota está: se foi enviada, se foi aceita ou se precisa ser refeita. O cálculo do imposto é feito à mão pela gerente, e a loja quer comparar formas diferentes de calcular antes de padronizar uma.

### 3.1 Escopo Adotado e Relação entre os Elementos

O sistema trata dois elementos ligados por uma relação de dependência:

- **Gestão de venda de motos:** cadastro de motos no estoque, cadastro de clientes, registro e confirmação de vendas e controle da situação de cada moto (Disponível, Reservada, Vendida).
- **Emissão de documento fiscal:** geração, validação, envio ao autorizador, acompanhamento de estados, cancelamento e consulta dos documentos.

**Relação:** a venda é a origem do documento. Toda venda confirmada gera exatamente um documento fiscal, e o documento só pode existir vinculado a uma venda. O resultado da emissão volta para a venda e para o estoque: com o documento autorizado, a moto passa a Vendida; com o documento cancelado, a venda é cancelada e a moto volta a Disponível.

**Dentro do escopo:** emissão **simulada** de documento para venda válida; estados de processamento; prevenção de emissão duplicada; contrato de integração com respostas simuladas de sucesso e de falha; política de cálculo de imposto variável e explicitamente didática.

**Fora do escopo:** emissão fiscal real, certificado digital, comunicação com SEFAZ ou qualquer serviço governamental, financiamento, emplacamento, controle de peças e oficina.

## 4. Requisitos de Usuário

Tomando por base o minimundo e o escopo adotado, foram identificados os seguintes requisitos de usuário.

### Requisitos Funcionais

| Identificador | Descrição | Prioridade | Depende de |
|---|---|---|---|
| US01 | Como vendedor, quero entrar no sistema com meu usuário e senha, para que minhas vendas fiquem registradas em meu nome. | Alta | - |
| US02 | Como gerente, quero cadastrar motos no estoque com chassi, marca, modelo, cilindrada, ano, cor e preço. | Alta | US01 |
| US03 | Como vendedor, quero consultar as motos disponíveis filtrando por modelo, cilindrada e preço. | Alta | US02 |
| US04 | Como vendedor, quero cadastrar o cliente com CPF ou CNPJ, nome, endereço e e-mail. | Alta | US01 |
| US05 | Como vendedor, quero registrar a venda de uma moto disponível para um cliente, informando a forma de pagamento. | Alta | US03, US04 |
| US06 | Como vendedor, quero que, ao confirmar a venda, o documento fiscal seja gerado e enviado automaticamente. | Alta | US05 |
| US07 | Como vendedor, quero ver em que estado está o documento (Rascunho, Processando, Autorizado, Rejeitado, Pendente, Cancelado). | Alta | US06 |
| US08 | Como vendedor, quero que clicar de novo em "Emitir" não gere um segundo documento para a mesma venda. | Alta | US06 |
| US09 | Como vendedor, quero ver o motivo de uma rejeição, corrigir os dados e reenviar o mesmo documento. | Alta | US07 |
| US10 | Como gerente, quero escolher qual política de cálculo de imposto está ativa, para comparar as variantes. | Alta | US06 |
| US11 | Como gerente, quero definir o cenário de resposta do autorizador simulado (sucesso, rejeição ou indisponível), para demonstrar cada caminho. | Alta | US06 |
| US12 | Como gerente, quero cancelar um documento autorizado informando a justificativa, devolvendo a moto ao estoque. | Alta | US07 |
| US13 | Como contador, quero consultar os documentos do mês e baixá-los em um único arquivo com resumo. | Média | US07 |
| US14 | Como gerente, quero ver no painel as vendas e os documentos do mês por estado e o total de imposto calculado. | Média | US07, US10 |

### Regras de Negócio

| Identificador | Descrição | Prioridade | Requisitos Relacionados |
|---|---|---|---|
| RN01 | Cada venda gera no máximo um documento fiscal não cancelado. A chave de idempotência do documento é o código da venda. | Alta | US06, US08 |
| RN02 | Uma nova solicitação de emissão para uma venda que já tem documento devolve o documento existente, sem novo envio ao autorizador. | Alta | US08 |
| RN03 | Só moto Disponível pode entrar em uma venda. Ao confirmar a venda, a moto passa a Reservada; com o documento Autorizado, passa a Vendida. | Alta | US05, US06 |
| RN04 | O chassi deve ter 17 caracteres alfanuméricos, sem as letras I, O e Q, e ser único no estoque. | Alta | US02 |
| RN05 | CPF e CNPJ devem ter os dígitos verificadores conferidos. | Alta | US04 |
| RN06 | O imposto é calculado pela política ativa no momento da emissão. O documento registra a política usada e não é recalculado se a política mudar depois. | Alta | US10 |
| RN07 | Se o autorizador não responder, o documento fica Pendente e o sistema tenta reenviar até 3 vezes, com intervalo de 1 minuto. Esgotadas as tentativas, o reenvio passa a ser manual. | Alta | US07, US11 |
| RN08 | Somente o perfil Gerente cancela documentos, em até 24 horas após a autorização e com justificativa de no mínimo 15 caracteres. | Alta | US12 |
| RN09 | O cancelamento do documento cancela a venda e devolve a moto a Disponível. | Alta | US12 |
| RN10 | O perfil Contador tem acesso somente de leitura. | Alta | US13 |

### Requisitos Não Funcionais

| Identificador | Descrição | Origem do requisito | Critérios de Aceitação | Categoria | Prioridade |
|---|---|---|---|---|---|
| RNF01 | O sistema não realiza emissão fiscal real. | Enunciado do tema | Todo documento exibe "SEM VALOR FISCAL - SIMULAÇÃO" e nenhuma requisição é feita a serviço governamental. | Legal e regulatório | Alta |
| RNF02 | A integração com o autorizador segue um contrato definido e substituível. | Enunciado do tema | Requisição e resposta seguem o contrato da seção 7.2; trocar o simulador não exige alterar as regras de negócio. | Manutenibilidade | Alta |
| RNF03 | Toda mudança de estado do documento é rastreável. | US07 | Cada transição é registrada com estado anterior, novo estado, data, hora e usuário. | Rastreabilidade | Alta |
| RNF04 | A emissão deve ser rápida para não atrasar a entrega da moto. | Minimundo | Da confirmação da venda até a resposta do simulador, no máximo 5 segundos. | Desempenho | Média |
| RNF05 | Senhas protegidas e acesso por conexão segura. | US01 | Senhas armazenadas apenas como hash; 100% das requisições via HTTPS. | Segurança | Alta |
| RNF06 | As regras de cálculo e as respostas da integração devem ser verificáveis. | US10, US11 | Testes automatizados cobrem as duas variantes da política e os três cenários do simulador. | Testabilidade | Alta |
| RNF07 | O vendedor deve emitir sem treinamento extenso. | Minimundo | Vendedor novo registra uma venda e emite o documento após no máximo 15 minutos de treinamento. | Usabilidade | Média |

### 4.1 Política Didática de Cálculo de Imposto

Para atender ao desafio de variar uma política de cálculo, o EmiteJá oferece duas variantes intercambiáveis. **As alíquotas são fictícias e têm finalidade exclusivamente didática**; não correspondem à legislação tributária.

| Variante | Regra | Exemplo: moto de 300 cc por R$ 25.000,00 |
|---|---|---|
| A: Alíquota única | 10% sobre o valor da venda, qualquer que seja a moto. | R$ 2.500,00 |
| B: Por cilindrada | Até 160 cc: 8%. De 161 a 500 cc: 12%. Acima de 500 cc: 18%. | R$ 3.000,00 |

A gerente escolhe a variante ativa (US10). A variante é aplicada no momento da emissão e fica gravada no documento (RN06), o que permite comparar o efeito de cada política sobre as mesmas vendas.

