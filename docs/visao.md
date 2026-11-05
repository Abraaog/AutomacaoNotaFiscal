# Documento de Visão: EmiteJá

> Responsável: Abraão Gomes da Silva Araújo (issue #1)

## 1. Problema

A Elétrica Ponto Certo (cliente fictício) é uma loja de materiais elétricos de bairro com três vendedores, um gerente e um contador externo. Hoje cada nota fiscal é preenchida manualmente no emissor gratuito do estado, digitando de novo os dados do cliente e dos produtos já vendidos no balcão. Isso causa:

- notas rejeitadas por NCM ou CFOP errado;
- fila no balcão enquanto o vendedor digita a nota;
- XMLs espalhados em pastas, dificultando o envio mensal ao contador.

## 2. Objetivo

Emitir a NF-e diretamente a partir da venda registrada, reaproveitando cadastros, validando os dados obrigatórios antes do envio à SEFAZ e mantendo todas as notas organizadas para consulta e fechamento mensal.

## 3. Stakeholders e usuários

| Papel | Descrição | Interesse principal |
|---|---|---|
| Vendedor | Atende o balcão e registra vendas | Emitir a nota rápido, sem redigitar dados |
| Gerente | Responsável pela loja | Controlar cancelamentos, usuários e faturamento |
| Contador | Profissional externo | Receber os XMLs do mês completos e no prazo |
| SEFAZ | Sistema externo | Receber e autorizar as notas |

## 4. Escopo

**Dentro:** cadastro de clientes e produtos, registro de venda, emissão e cancelamento de NF-e (modelo 55), consulta do histórico, pacote mensal para o contador, controle de usuários por perfil.

**Fora:** NFS-e (serviços), controle de estoque, emissão de boletos e integração bancária, aplicativo mobile.

## 5. Restrições

- Uso de certificado digital A1 da loja.
- Ambiente de homologação da SEFAZ durante o desenvolvimento.
- Interface web acessada pelos computadores do balcão.
