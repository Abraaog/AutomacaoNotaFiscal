package emiteja.factory;

import emiteja.observer.ObservadorDocumento;
import emiteja.servico.Loja;

/**
 * Factory Method: cada criador concreto decide qual observador fabricar;
 * o cadastro na Loja é sempre igual e fica aqui.
 */
public abstract class CriadorObservador {

    public abstract ObservadorDocumento criarObservador();

    public void cadastrarNaLoja(Loja loja) {
        loja.cadastrarObservador(criarObservador());
    }
}
