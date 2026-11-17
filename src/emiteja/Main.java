package emiteja;

public class Main {

    public static void main(String[] args) {
        Moto moto = new Moto("9C2KC1670NR000123", "Honda", "CG 160 Fan", 160, 2026, "Vermelha", 15990.00);
        Cliente cliente = new Cliente("Maria Souza", "52998224725", "Rua das Flores, 100 - Rio Tinto/PB", "maria@email.com");
        Usuario vendedor = new Usuario("Marcos Lima", "marcos", "Vendedor");

        Venda venda = new Venda("V-0001", moto, cliente, vendedor, "PIX");

        System.out.println("==== EmiteJá - Parte 1: Classe, Construtor e Variáveis ====");
        System.out.println("Venda: " + venda.codigo + " (" + venda.situacao + ")");
        System.out.println("Moto: " + venda.moto.marca + " " + venda.moto.modelo + " " + venda.moto.cilindrada + "cc, chassi " + venda.moto.chassi);
        System.out.println("Cliente: " + venda.cliente.nome + " - documento " + venda.cliente.documento);
        System.out.println("Vendedor: " + venda.vendedor.nome + " (" + venda.vendedor.perfil + ")");
        System.out.println("Pagamento: " + venda.formaPagamento);
        System.out.printf("Valor: R$ %.2f%n", venda.valor);
    }
}
