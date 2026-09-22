'use client'

import { WebhooksTab } from '@/components/finance/payments-tabs'
import { FinanceShell } from '@/components/finance/FinanceShell'
import { PageHeader } from '@/components/finance/ui'

export default function AdminWebhooksPage() {
  return (
    <FinanceShell>
      <PageHeader title="Webhooks" subtitle="Incoming gateway webhook / IPN events and delivery status" />
      <div className="mt-4">
        <WebhooksTab />
      </div>
    </FinanceShell>
  )
}
