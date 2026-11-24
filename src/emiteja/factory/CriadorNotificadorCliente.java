package emiteja.factory;

import emiteja.notificacao.NotificadorEmail;
import emiteja.observer.NotificadorCliente;
import emiteja.observer.ObservadorDocumento;

public class CriadorNotificadorCliente extends CriadorObservador {

    @Override
    public ObservadorDocumento criarObservador() {
        return new NotificadorCliente(new NotificadorEmail());
    }
}
