package emiteja.notificacao;

import java.util.ArrayList;
import java.util.List;

/** Envio simulado de e-mail: escreve no console e guarda o que foi enviado. */
public class NotificadorEmail extends Notificador {

    private final List<String> enviados = new ArrayList<>();

    @Override
    public void enviar(String destino, String mensagem) {
        String linha = "[E-mail para " + destino + "] " + mensagem;
        enviados.add(linha);
        System.out.println(linha);
    }

    public List<String> getEnviados() {
        return List.copyOf(enviados);
    }
}
