CREATE TABLE public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero bigint,
  cliente_nome text NOT NULL,
  cliente_telefone text,
  endereco text,
  distancia_km numeric,
  itens jsonb NOT NULL DEFAULT '[]'::jsonb,
  pagamento text,
  entrega text,
  taxa_entrega numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'new',
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.pedidos TO anon;
GRANT INSERT ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode criar pedido" ON public.pedidos FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.configuracoes (
  id text PRIMARY KEY DEFAULT 'loja',
  delivery_mode text NOT NULL DEFAULT 'own',
  fee_short numeric NOT NULL DEFAULT 5,
  fee_mid numeric NOT NULL DEFAULT 7,
  fee_long numeric NOT NULL DEFAULT 10,
  store_address text NOT NULL DEFAULT 'Rua Projetada F, 11 A',
  force_closed boolean NOT NULL DEFAULT false,
  force_closed_date text,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.configuracoes TO anon;
GRANT SELECT ON public.configuracoes TO authenticated;
GRANT ALL ON public.configuracoes TO service_role;

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Configuracoes sao publicas para leitura" ON public.configuracoes FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.configuracoes (id) VALUES ('loja');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON public.configuracoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();