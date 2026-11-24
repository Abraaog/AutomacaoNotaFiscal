package emiteja.observer;

import emiteja.modelo.Cliente;
import emiteja.modelo.DocumentoFiscal;
import emiteja.notificacao.Notificador;
import emiteja.notificacao.NotificadorNulo;

/** Observador que avisa o cliente quando o documento da compra dele muda de estado. */
public class NotificadorCliente implements ObservadorDocumento {

    private final Notificador canal;
    private final Notificador semCanal = new NotificadorNulo();

    public NotificadorCliente(Notificador canal) {
        if (canal == null) {
            this.canal = new NotificadorNulo();
        } else {
            this.canal = canal;
        }
    }

    @Override
    public void documentoAtualizado(DocumentoFiscal documento) {
        Cliente cliente = documento.getVenda().getCliente();
        String mensagem = "Olá, " + cliente.getNome() + ". O documento nº " + documento.getNumero()
                + " da sua compra (" + documento.getVenda().getCodigo() + ") está " + documento.getEstado() + ".";
        canalPara(cliente).enviar(cliente.getEmail(), mensagem);
    }

    private Notificador canalPara(Cliente cliente) {
        boolean temEmail = cliente.getEmail() != null && !cliente.getEmail().isBlank();
        return temEmail ? canal : semCanal;
    }
}
