package emiteja.teste;

import emiteja.modelo.Cliente;
import emiteja.notificacao.NotificadorEmail;
import emiteja.notificacao.NotificadorNulo;
import emiteja.observer.NotificadorCliente;
import emiteja.servico.Loja;

public class TesteNullObject extends SuiteDeTeste {

    @Override
    public String getNome() {
        return "Null Object (notificação do cliente)";
    }

    private static Loja lojaComCg160() {
        Loja loja = new Loja();
        loja.cadastrarMoto(Dados.cg160());
        return loja;
    }

    @Override
    protected void executar() {
        teste("cliente com e-mail recebe o aviso da autorização", () -> {
            NotificadorEmail email = new NotificadorEmail();
            Loja loja = lojaComCg160();
            loja.cadastrarObservador(new NotificadorCliente(email));
            loja.vender(Dados.CHASSI_160, Dados.cliente(), Dados.vendedor(), "PIX");
            verificarIgual(1, email.getEnviados().size());
            verificar(email.getEnviados().get(0).contains("joana@email.com"), "deveria ir para o e-mail da cliente");
            verificar(email.getEnviados().get(0).contains("Autorizado"), "deveria avisar que foi autorizado");
        });

        teste("cliente sem e-mail cai no Null Object e nada é enviado", () -> {
            NotificadorEmail email = new NotificadorEmail();
            Loja loja = lojaComCg160();
            loja.cadastrarObservador(new NotificadorCliente(email));
            Cliente semEmail = new Cliente("Pedro Lima", Dados.CPF_VALIDO, "Rua A, 1", "");
            loja.vender(Dados.CHASSI_160, semEmail, Dados.vendedor(), "PIX");
            verificar(email.getEnviados().isEmpty(), "não deveria enviar e-mail");
        });

        teste("notificador nulo no construtor vira Null Object, sem NullPointerException", () -> {
            Loja loja = lojaComCg160();
            loja.cadastrarObservador(new NotificadorCliente(null));
            loja.vender(Dados.CHASSI_160, Dados.cliente(), Dados.vendedor(), "PIX");
        });

        teste("o Null Object aceita a chamada e não faz nada", () ->
                new NotificadorNulo().enviar("ninguem@email.com", "mensagem ignorada"));
    }
}
