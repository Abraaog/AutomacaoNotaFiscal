package emiteja.app;

import emiteja.factory.CriadorNotificadorCliente;
import emiteja.factory.CriadorObservador;
import emiteja.factory.CriadorPainel;
import emiteja.modelo.Moto;
import emiteja.modelo.Usuario;
import emiteja.servico.Loja;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        Loja loja = new Loja();
        loja.cadastrarMoto(new Moto("9C2KC1670NR000123", "Honda", "CG 160 Fan", 160, 2026, "Vermelha", 15990.00));
        loja.cadastrarMoto(new Moto("9C6RG3150P0004567", "Yamaha", "Fazer 250", 250, 2026, "Azul", 22990.00));
        loja.cadastrarMoto(new Moto("9C2PC4000R0007890", "Honda", "CB 500F", 471, 2026, "Preta", 42990.00));

        List<Usuario> usuarios = List.of(
                new Usuario("Sandra Melo", "sandra", "Gerente"),
                new Usuario("Marcos Lima", "marcos", "Vendedor"),
                new Usuario("Fábio Costa", "fabio", "Contador"));

        CriadorObservador[] criadores = {new CriadorNotificadorCliente(), new CriadorPainel()};
        for (CriadorObservador criador : criadores) {
            criador.cadastrarNaLoja(loja);
        }

        new TelaVenda(loja, usuarios).abrir();
    }
}
