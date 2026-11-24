package emiteja.app;

import emiteja.factory.CriadorNotificadorCliente;
import emiteja.factory.CriadorPainel;
import emiteja.modelo.Cliente;
import emiteja.modelo.DocumentoFiscal;
import emiteja.modelo.Moto;
import emiteja.modelo.Pessoa;
import emiteja.modelo.PorCilindrada;
import emiteja.modelo.Usuario;
import emiteja.servico.Loja;
import emiteja.singleton.PainelDocumentos;

public class Demonstracao {

    public static void main(String[] args) {
        Loja loja = new Loja();
        loja.cadastrarMoto(new Moto("9C2KC1670NR000123", "Honda", "CG 160 Fan", 160, 2026, "Vermelha", 15990.00));
        loja.cadastrarMoto(new Moto("9C6RG3150P0004567", "Yamaha", "Fazer 250", 250, 2026, "Azul", 22990.00));
        loja.cadastrarMoto(new Moto("9C2PC4000R0007890", "Honda", "CB 500F", 471, 2026, "Preta", 42990.00));

        Cliente maria = new Cliente("Maria Souza", "529.982.247-25", "Rua das Flores, 100 - Rio Tinto/PB", "maria@email.com");
        Cliente empresa = new Cliente("Auto Peças Rio Tinto LTDA", "11.222.333/0001-81", "Av. Brasil, 50", "contato@autopecas.com");
        Usuario vendedor = new Usuario("Marcos Lima", "marcos", "Vendedor");
        Usuario gerente = new Usuario("Sandra Melo", "sandra", "Gerente");

        new CriadorNotificadorCliente().cadastrarNaLoja(loja);
        new CriadorPainel().cadastrarNaLoja(loja);

        System.out.println("==== Estoque inicial: " + loja.getMotosDisponiveis() + " motos disponíveis ====");

        System.out.println("\n==== Venda autorizada ====");
        DocumentoFiscal doc1 = loja.vender("9C2KC1670NR000123", maria, vendedor, "PIX");
        System.out.println(doc1);
        System.out.println("Motos disponíveis: " + loja.getMotosDisponiveis());

        System.out.println("\n==== Mesma venda pedida de novo (não duplica) ====");
        DocumentoFiscal repetido = loja.emitir(doc1.getVenda());
        System.out.println("Mesmo documento? " + (repetido == doc1) + " - total de documentos: " + loja.getDocumentos().size());

        System.out.println("\n==== Autorizador indisponível ====");
        loja.setCenarioAutorizador("Indisponível");
        DocumentoFiscal doc2 = loja.vender("9C6RG3150P0004567", empresa, vendedor, "Boleto");
        System.out.println(doc2);
        loja.reenviarPendentes();
        System.out.println(doc2);
        loja.setCenarioAutorizador("Sucesso");
        loja.reenviarPendentes();
        System.out.println(doc2);
        System.out.println("Histórico: " + doc2.getHistorico());

        System.out.println("\n==== Vendedor tenta cancelar ====");
        try {
            loja.cancelar(doc1, vendedor, "Cliente desistiu da compra");
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
        }

        System.out.println("\n==== Cancelamento pela gerente ====");
        loja.cancelar(doc1, gerente, "Cliente desistiu da compra");
        System.out.println(doc1);
        System.out.println("Motos disponíveis: " + loja.getMotosDisponiveis());

        System.out.println("\n==== Justificativa curta ====");
        try {
            loja.cancelar(doc2, gerente, "desistiu");
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }

        System.out.println("\n==== Variante B: imposto por cilindrada ====");
        loja.setPoliticaAtiva(new PorCilindrada());
        DocumentoFiscal doc3 = loja.vender("9C2PC4000R0007890", maria, vendedor, "Financiamento");
        System.out.println(doc3);

        System.out.println("\n==== Herança: Cliente e Usuario são Pessoa ====");
        Pessoa[] pessoas = {maria, empresa, vendedor, gerente};
        for (Pessoa pessoa : pessoas) {
            System.out.println(pessoa);
        }

        System.out.println("\n==== Singleton: o painel é um só ====");
        System.out.println("Mesmo painel? " + (PainelDocumentos.getInstancia() == PainelDocumentos.getInstancia()));
        PainelDocumentos.getInstancia().exibirPainel();
    }
}
