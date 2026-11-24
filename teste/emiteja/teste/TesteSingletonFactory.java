package emiteja.teste;

import emiteja.factory.CriadorNotificadorCliente;
import emiteja.factory.CriadorObservador;
import emiteja.factory.CriadorPainel;
import emiteja.modelo.DocumentoFiscal;
import emiteja.observer.NotificadorCliente;
import emiteja.servico.Loja;
import emiteja.singleton.PainelDocumentos;

public class TesteSingletonFactory extends SuiteDeTeste {

    @Override
    public String getNome() {
        return "Singleton (painel único) e Factory Method (criadores de observador)";
    }

    private static Loja lojaComCg160() {
        Loja loja = new Loja();
        loja.cadastrarMoto(Dados.cg160());
        return loja;
    }

    @Override
    protected void executar() {
        teste("getInstancia devolve sempre o mesmo painel", () ->
                verificar(PainelDocumentos.getInstancia() == PainelDocumentos.getInstancia(),
                        "deveria existir um único painel"));

        teste("cada criador fabrica o seu tipo de observador", () -> {
            verificar(new CriadorNotificadorCliente().criarObservador() instanceof NotificadorCliente,
                    "deveria criar um NotificadorCliente");
            verificar(new CriadorPainel().criarObservador() == PainelDocumentos.getInstancia(),
                    "o criador do painel deveria devolver o Singleton");
        });

        teste("cadastrado pelo criador, o painel mostra o estado atual de cada documento", () -> {
            PainelDocumentos painel = PainelDocumentos.getInstancia();
            painel.limpar();
            Loja loja = lojaComCg160();
            CriadorObservador criador = new CriadorPainel();
            criador.cadastrarNaLoja(loja);
            DocumentoFiscal documento = loja.vender(Dados.CHASSI_160, Dados.cliente(), Dados.vendedor(), "PIX");
            verificar(painel.getLinhas().get(0).endsWith(DocumentoFiscal.AUTORIZADO), "deveria mostrar Autorizado");
            loja.cancelar(documento, Dados.gerente(), Dados.JUSTIFICATIVA);
            verificarIgual(1, painel.getLinhas().size());
            verificar(painel.getLinhas().get(0).endsWith(DocumentoFiscal.CANCELADO), "deveria atualizar para Cancelado");
            painel.limpar();
        });

        teste("painel vazio avisa que não há documentos", () -> {
            PainelDocumentos.getInstancia().limpar();
            verificar(PainelDocumentos.getInstancia().montarPainel().contains("nenhum documento"),
                    "deveria avisar que está vazio");
        });
    }
}
