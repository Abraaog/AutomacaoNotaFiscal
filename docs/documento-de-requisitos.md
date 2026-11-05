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

