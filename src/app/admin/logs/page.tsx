'use client'

import { LogsTab } from '@/components/finance/payments-tabs'
import { FinanceShell } from '@/components/finance/FinanceShell'
import { PageHeader } from '@/components/finance/ui'

export default function AdminLogsPage() {
  return (
    <FinanceShell>
      <PageHeader title="Logs & Audit" subtitle="Gateway activity logs and admin audit trail" />
      <div className="mt-4">
        <LogsTab />
      </div>
    </FinanceShell>
  )
}
