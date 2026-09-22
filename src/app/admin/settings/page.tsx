'use client'

import { SettingsTab } from '@/components/finance/payments-tabs'
import { FinanceShell } from '@/components/finance/FinanceShell'
import { PageHeader } from '@/components/finance/ui'

export default function AdminSettingsPage() {
  return (
    <FinanceShell>
      <PageHeader title="Payment Settings" subtitle="Configure runtime payment behaviour across checkout" />
      <div className="mt-4">
        <SettingsTab />
      </div>
    </FinanceShell>
  )
}
