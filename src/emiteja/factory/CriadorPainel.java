package emiteja.factory;

import emiteja.observer.ObservadorDocumento;
import emiteja.singleton.PainelDocumentos;

public class CriadorPainel extends CriadorObservador {

    @Override
    public ObservadorDocumento criarObservador() {
        return PainelDocumentos.getInstancia();
    }
}
