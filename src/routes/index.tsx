import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Doceria Sweet by Lolô | Bolos de pote, brownies e doces" },
      {
        name: "description",
        content:
          "Cardápio digital da Doceria Sweet by Lolô: bolos de pote, brownies e copo da felicidade. Retirada na loja ou entrega em Rua Projetada F, 11 A.",
      },
      { property: "og:title", content: "Doceria Sweet by Lolô" },
      {
        property: "og:description",
        content:
          "Peça bolos de pote, brownies e copo da felicidade. Retirada ou entrega com nosso entregador.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <iframe
      src="./loja/index.html"
      title="Doceria Sweet by Lolô"
      allow="clipboard-write"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
      }}
    />
  );
}
