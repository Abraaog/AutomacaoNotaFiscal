package emiteja.teste;

import emiteja.modelo.DocumentoFiscal;
import emiteja.observer.ObservadorDocumento;
import emiteja.servico.Loja;

import java.util.ArrayList;
import java.util.List;

public class TesteObserver extends SuiteDeTeste {

    @Override
    public String getNome() {
        return "Observer (a Loja avisa quem observa os documentos)";
    }

    /** Observador de teste: só anota o estado que recebeu. */
    private static class ObservadorQueAnota implements ObservadorDocumento {
        private final List<String> estados = new ArrayList<>();

        @Override
        public void documentoAtualizado(DocumentoFiscal documento) {
            estados.add(documento.getEstado());
        }
    }

    private static Loja lojaComCg160() {
        Loja loja = new Loja();
        loja.cadastrarMoto(Dados.cg160());
        return loja;
    }

    private static DocumentoFiscal venderCg160(Loja loja) {
        return loja.vender(Dados.CHASSI_160, Dados.cliente(), Dados.vendedor(), "PIX");
    }

    @Override
    protected void executar() {
        teste("observador cadastrado é avisado quando a venda é autorizada", () -> {
            Loja loja = lojaComCg160();
            ObservadorQueAnota observador = new ObservadorQueAnota();
            loja.cadastrarObservador(observador);
            venderCg160(loja);
            verificarIgual(List.of(DocumentoFiscal.AUTORIZADO), observador.estados);
        });

        teste("avisa de novo no reenvio do pendente e no cancelamento", () -> {
            Loja loja = lojaComCg160();
            ObservadorQueAnota observador = new ObservadorQueAnota();
            loja.cadastrarObservador(observador);
            loja.setCenarioAutorizador("Indisponível");
            DocumentoFiscal documento = venderCg160(loja);
            loja.setCenarioAutorizador("Sucesso");
            loja.reenviarPendentes();
            loja.cancelar(documento, Dados.gerente(), Dados.JUSTIFICATIVA);
            verificarIgual(List.of(DocumentoFiscal.PENDENTE, DocumentoFiscal.AUTORIZADO, DocumentoFiscal.CANCELADO),
                    observador.estados);
        });

        teste("o mesmo observador não é cadastrado duas vezes", () -> {
            Loja loja = lojaComCg160();
            ObservadorQueAnota observador = new ObservadorQueAnota();
            loja.cadastrarObservador(observador);
            loja.cadastrarObservador(observador);
            venderCg160(loja);
            verificarIgual(1, observador.estados.size());
        });

        teste("observador removido não recebe mais avisos", () -> {
            Loja loja = lojaComCg160();
            ObservadorQueAnota observador = new ObservadorQueAnota();
            loja.cadastrarObservador(observador);
            loja.removerObservador(observador);
            venderCg160(loja);
            verificar(observador.estados.isEmpty(), "não deveria ter recebido aviso");
        });

        teste("recusa observador nulo", () ->
                verificarErro(IllegalArgumentException.class, () -> new Loja().cadastrarObservador(null)));
    }
}
