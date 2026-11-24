package emiteja.notificacao;

/** Canal que leva um aviso até o cliente. */
public abstract class Notificador {

    public abstract void enviar(String destino, String mensagem);
}
