import { createFileRoute } from '@tanstack/react-router'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

export const Route = createFileRoute('/api/public/admin')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env['ADMIN_PASSWORD']
        if (!expected) return json({ error: 'ADMIN_PASSWORD nao configurada' }, 500)

        let body: { password?: string; action?: string; id?: string; status?: string; config?: Record<string, unknown> }
        try {
          body = await request.json()
        } catch {
          return json({ error: 'JSON invalido' }, 400)
        }

        const given = String(body.password ?? '')
        if (given.length !== expected.length) return json({ error: 'Senha incorreta' }, 401)
        let diff = 0
        for (let i = 0; i < expected.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i)
        if (diff !== 0) return json({ error: 'Senha incorreta' }, 401)

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

        switch (body.action) {
          case 'login':
            return json({ ok: true })
          case 'listOrders': {
            const { data, error } = await supabaseAdmin
              .from('pedidos')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(500)
            if (error) return json({ error: error.message }, 500)
            return json({ ok: true, orders: data })
          }
          case 'deleteOrder': {
            if (!body.id) return json({ error: 'id obrigatorio' }, 400)
            const { error } = await supabaseAdmin.from('pedidos').delete().eq('id', body.id)
            if (error) return json({ error: error.message }, 500)
            return json({ ok: true })
          }
          case 'deleteAllOrders': {
            const { error } = await supabaseAdmin.from('pedidos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            if (error) return json({ error: error.message }, 500)
            return json({ ok: true })
          }
          case 'updateStatus': {
            if (!body.id || !body.status) return json({ error: 'id e status obrigatorios' }, 400)
            const { error } = await supabaseAdmin.from('pedidos').update({ status: body.status }).eq('id', body.id)
            if (error) return json({ error: error.message }, 500)
            return json({ ok: true })
          }
          case 'saveConfig': {
            const c = body.config ?? {}
            const { error: cfgError } = await supabaseAdmin
              .from('configuracoes')
              .update({
                delivery_mode: String(c['deliveryMode'] ?? 'own'),
                fee_short: Number(c['feeShort'] ?? 5),
                fee_mid: Number(c['feeMid'] ?? 7),
                fee_long: Number(c['feeLong'] ?? 10),
                store_address: String(c['storeAddress'] ?? 'Rua Projetada F, 11 A'),
                force_closed: Boolean(c['forceClosed']),
                force_closed_date: (c['forceClosedDate'] as string | null) ?? null,
                extra: (c['extra'] ?? {}) as never,
              })
              .eq('id', 'loja')
            if (cfgError) return json({ error: cfgError.message }, 500)
            return json({ ok: true })
          }
          default:
            return json({ error: 'Acao desconhecida' }, 400)
        }
      },
    },
  },
})
