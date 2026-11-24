package emiteja.notificacao;

/**
 * Null Object: ocupa o lugar de um notificador que não existe.
 * Recebe a chamada e não faz nada, então quem usa não precisa testar null.
 */
public class NotificadorNulo extends Notificador {

    @Override
    public void enviar(String destino, String mensagem) {
        // cliente sem canal de contato: nenhuma mensagem é enviada
    }
}
