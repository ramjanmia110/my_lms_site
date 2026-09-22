'use client'

import { useEffect, useState } from 'react'
import { CreditCard, ShieldAlert, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { financeAPI } from '@/lib/api'
import { FinanceShell } from '@/components/finance/FinanceShell'
import { PageHeader, RefreshBtn, Panel, ErrorBlock, LoadingBlock } from '@/components/finance/ui'

type Gateway = any

function cardColor(name: string): string {
  switch (name) {
    case 'stripe': return 'from-[#635BFF]/15 to-[#635BFF]/5 text-[#635BFF] border-[#635BFF]/30'
    case 'sslcommerz': return 'from-[#E11D48]/15 to-[#E11D48]/5 text-[#E11D48] border-[#E11D48]/30'
    default: return 'from-[#6D3DF5]/15 to-[#6D3DF5]/5 text-[#6D3DF5] border-[#6D3DF5]/30'
  }
}

export default function AdminGatewaysPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadKey, setLoadKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError('')
    financeAPI.gateways.list()
      .then((res: any) => setData(res.data?.data))
      .catch(() => setError('Could not load payment gateways.'))
      .finally(() => setLoading(false))
  }, [loadKey])

  const toggle = async (g: Gateway, enabled: boolean) => {
    try {
      const res = await financeAPI.gateways.update({ gateway: g.name, enabled })
      toast.success(res.data?.message || `${g.label} updated.`)
      setLoadKey((k) => k + 1)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not update gateway.')
    }
  }

  const refresh = () => setLoadKey((k) => k + 1)

  if (loading) {
    return (
      <FinanceShell>
        <PageHeader title="Payment Gateways" subtitle="Manage provider connectivity and credentials" />
        <Panel><LoadingBlock rows={3} /></Panel>
      </FinanceShell>
    )
  }

  if (error) {
    return (
      <FinanceShell>
        <PageHeader title="Payment Gateways" subtitle="Manage provider connectivity and credentials" actions={<RefreshBtn onClick={refresh} loading={false} />} />
        <Panel><ErrorBlock message={error} onRetry={refresh} /></Panel>
      </FinanceShell>
    )
  }

  return (
    <FinanceShell>
      <PageHeader
        title="Payment Gateways"
        subtitle="Provider health, configuration and enable/disable controls"
        actions={<RefreshBtn onClick={refresh} loading={false} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {(data?.gateways || []).map((g: Gateway) => (
          <div key={g.name} className="bg-white border border-[#E9E7F5] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(15,27,61,0.04)]">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br border flex items-center justify-center ${cardColor(g.name)}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F1B3D] capitalize">{g.label}</p>
                    <p className="text-[10px] text-[#536078]">{g.name} · {g.mode}</p>
                  </div>
                </div>
                <span onClick={() => toggle(g, !g.enabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${g.enabled ? 'bg-[#18A878]' : 'bg-[#D5D9E6]'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${g.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#536078]">Adapter</span>
                  <span className={`font-semibold ${g.adapter ? 'text-[#18A878]' : 'text-[#B45309]'}`}>{g.adapter ? 'Integrated' : 'Not integrated'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#536078]">Configured</span>
                  <span className={`inline-flex items-center gap-1 font-semibold ${g.configured ? 'text-[#18A878]' : 'text-[#B45309]'}`}>
                    {g.configured ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    {g.configured ? 'Ready' : 'Needs credentials'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#536078]">Mode</span>
                  <span className="font-semibold capitalize text-[#0F1B3D]">{g.mode}{g.is_default ? ' · default' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Panel extra={<span className="text-[10px] text-[#A9B3C8]">Mode: {data?.mode} · Default: {data?.default_gateway}</span>}>
          <h3 className="text-sm font-semibold text-[#0F1B3D] mb-1">About Gateway Management</h3>
          <p className="text-[12px] text-[#536078] leading-relaxed">
            Provider adapters (demo, Stripe, SSLCommerz) are wired to the real gateway SDKs. Use the toggles above to enable or
            disable a provider at runtime — state is persisted and merges into checkout immediately. Credentials set in your
            environment (.env) always take precedence and are never echoed back.
          </p>
        </Panel>
      </div>
    </FinanceShell>
  )
}
