'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, Banknote,
  Clock, CheckCircle, XCircle, Loader2, Plus, RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { walletAPI, ordersAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface Balance {
  balance: number
  total_earned: number
  total_spent: number
  pending: number
}

interface Transaction {
  id: number
  type: 'credit' | 'debit'
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending' | 'failed'
}

interface Order {
  id: number
  course?: { id: number; title: string }
  gig?: { id: number; title: string }
  amount: number
  status: string
  created_at: string
  updated_at?: string
  buyer?: { id: number; name: string; email: string }
  seller?: { id: number; name: string }
  description?: string
}

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="w-3 h-3" />,
  pending: <Clock className="w-3 h-3" />,
  failed: <XCircle className="w-3 h-3" />,
  processing: <Loader2 className="w-3 h-3 animate-spin" />,
}

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'outline'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'destructive',
  processing: 'outline',
  cancelled: 'destructive',
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function TransactionSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-4 w-20 shrink-0" />
        </div>
      ))}
    </div>
  )
}

function OrderSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-4 w-16 shrink-0" />
        </div>
      ))}
    </div>
  )
}

function WithdrawModal({
  open,
  onClose,
  amount,
  onAmountChange,
  description,
  onDescriptionChange,
  onWithdraw,
  withdrawing,
  balance,
}: {
  open: boolean
  onClose: () => void
  amount: string
  onAmountChange: (v: string) => void
  description: string
  onDescriptionChange: (v: string) => void
  onWithdraw: () => void
  withdrawing: boolean
  balance: number
}) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const parsedAmount = parseFloat(amount) || 0
  const isValid = parsedAmount > 0 && parsedAmount <= balance

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-primary" />
                    Withdraw Funds
                  </CardTitle>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-foreground transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Available balance: <span className="font-semibold text-foreground">{formatCurrency(balance)}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => onAmountChange(e.target.value)}
                      className="pl-7 text-lg font-semibold"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {parsedAmount > balance && (
                    <p className="text-xs text-red-400 mt-1">Amount exceeds available balance</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description (optional)</label>
                  <Textarea
                    placeholder="What is this withdrawal for?"
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    className="resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={onClose} disabled={withdrawing}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={onWithdraw}
                    disabled={!isValid || withdrawing}
                  >
                    {withdrawing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Banknote className="w-4 h-4" />
                        Withdraw
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function OrderDetailModal({
  order,
  onClose,
}: {
  order: Order | null
  onClose: () => void
}) {
  const open = !!order

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!order) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Order Details
                  </CardTitle>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-foreground transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Order ID</p>
                    <p className="text-sm font-medium">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Status</p>
                    <Badge variant={statusVariant[order.status] || 'outline'} className="gap-0.5">
                      {statusIcon[order.status] || null}
                      {formatStatus(order.status)}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-0.5">Item</p>
                    <p className="text-sm font-medium">
                      {order.course?.title || order.gig?.title || `Order #${order.id}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Amount</p>
                    <p className="text-sm font-semibold text-[#10B981]">
                      {order.amount != null ? `+${formatCurrency(order.amount)}` : '\u2014'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Date</p>
                    <p className="text-sm">{formatDate(order.created_at)}</p>
                  </div>
                  {order.buyer && (
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Buyer</p>
                      <p className="text-sm font-medium">{order.buyer.name || order.buyer.email}</p>
                    </div>
                  )}
                  {order.seller && (
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Seller</p>
                      <p className="text-sm font-medium">{order.seller.name}</p>
                    </div>
                  )}
                  {order.description && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400 mb-0.5">Description</p>
                      <p className="text-sm">{order.description}</p>
                    </div>
                  )}
                  {order.updated_at && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400 mb-0.5">Last Updated</p>
                      <p className="text-sm">{formatDate(order.updated_at)}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function WalletPage() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [transactionPage, setTransactionPage] = useState(1)
  const [transactionType, setTransactionType] = useState('')
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [transactionsLoadingMore, setTransactionsLoadingMore] = useState(false)
  const [balanceError, setBalanceError] = useState('')
  const [transactionError, setTransactionError] = useState('')
  const [ordersError, setOrdersError] = useState('')
  const [loadingSellerOrders, setLoadingSellerOrders] = useState(true)
  const [loadingBuyerOrders, setLoadingBuyerOrders] = useState(true)

  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawDescription, setWithdrawDescription] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)

  const [sellerOrders, setSellerOrders] = useState<Order[]>([])
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const hasMore = transactions.length < totalTransactions

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true)
    setBalanceError('')
    try {
      const res = await walletAPI.getBalance()
      setBalance(res.data.balance)
    } catch {
      setBalanceError('Failed to load balance')
      toast.error('Failed to load wallet balance')
    } finally {
      setLoadingBalance(false)
    }
  }, [])

  const fetchTransactions = useCallback(async (page = 1, append = false) => {
    if (append) {
      setTransactionsLoadingMore(true)
    } else {
      setLoadingTransactions(true)
    }
    setTransactionError('')
    try {
      const params: Record<string, unknown> = { page, per_page: 10 }
      if (transactionType) params.type = transactionType
      const res = await walletAPI.getTransactions(params)
      const data = res.data
      if (append) {
        setTransactions(prev => [...prev, ...(data.transactions || [])])
      } else {
        setTransactions(data.transactions || [])
      }
      setTotalTransactions(data.total || 0)
    } catch {
      setTransactionError('Failed to load transactions')
    } finally {
      setLoadingTransactions(false)
      setTransactionsLoadingMore(false)
    }
  }, [transactionType])

  const fetchSellerOrders = useCallback(async () => {
    setLoadingSellerOrders(true)
    setOrdersError('')
    try {
      const res = await ordersAPI.getAll({ role: 'seller', status: 'completed' })
      const data = res.data
      setSellerOrders(data.orders || data.data || [])
    } catch {
      setOrdersError('Failed to load seller orders')
      toast.error('Failed to load seller orders')
    } finally {
      setLoadingSellerOrders(false)
    }
  }, [])

  const fetchBuyerOrders = useCallback(async () => {
    setLoadingBuyerOrders(true)
    setOrdersError('')
    try {
      const res = await ordersAPI.getAll({ role: 'buyer' })
      const data = res.data
      setBuyerOrders(data.orders || data.data || [])
    } catch {
      setOrdersError('Failed to load purchase history')
      toast.error('Failed to load purchase history')
    } finally {
      setLoadingBuyerOrders(false)
    }
  }, [])

  useEffect(() => { fetchBalance() }, [fetchBalance])
  useEffect(() => { fetchTransactions() }, [fetchTransactions])
  useEffect(() => { fetchSellerOrders(); fetchBuyerOrders() }, [fetchSellerOrders, fetchBuyerOrders])

  const handleTabChange = (value: string) => {
    const typeMap: Record<string, string> = { all: '', credits: 'credit', debits: 'debit' }
    setTransactionType(typeMap[value] || '')
    setTransactionPage(1)
  }

  const handleLoadMore = () => {
    const nextPage = transactionPage + 1
    setTransactionPage(nextPage)
    fetchTransactions(nextPage, true)
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (balance && amount > balance.balance) {
      toast.error('Insufficient balance')
      return
    }
    setWithdrawing(true)
    try {
      await walletAPI.withdraw({ amount, description: withdrawDescription || 'Withdrawal' })
      toast.success('Withdrawal request submitted successfully')
      setWithdrawOpen(false)
      setWithdrawAmount('')
      setWithdrawDescription('')
      fetchBalance()
      fetchTransactions()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Withdrawal failed')
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-xl font-bold text-white tracking-tight">Wallet</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your earnings, withdrawals, and transactions.</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-xl border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF8A36]/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#E07328]/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <CardContent className="relative p-6">
            {loadingBalance ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl bg-white/10" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 bg-white/10" />
                    <Skeleton className="h-8 w-40 bg-white/10" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-28 bg-white/10" />
                  <Skeleton className="h-10 w-28 bg-white/10" />
                </div>
              </div>
            ) : balanceError ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <XCircle className="w-8 h-8 text-red-400 mb-2" />
                <p className="text-sm text-white/80 mb-3">{balanceError}</p>
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white" onClick={fetchBalance}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Retry
                </Button>
              </div>
            ) : balance ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Available Balance</p>
                      <p className="text-3xl font-bold text-white">{formatCurrency(balance.balance)}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                    <CreditCard className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    className="bg-gradient-to-r from-[#FF8A36] to-[#E07328] text-white hover:from-[#E07328] hover:to-[#cc6422] border-0 backdrop-blur-sm gap-2 shadow-lg"
                    onClick={() => setWithdrawOpen(true)}
                  >
                    <Banknote className="w-4 h-4" />
                    Withdraw
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/5 hover:bg-white/10 text-white border-white/20 backdrop-blur-sm gap-2"
                    onClick={() => { fetchBalance(); fetchTransactions() }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-xl">
          <CardContent className="p-4 text-center">
            {loadingBalance ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 mx-auto" />
                <Skeleton className="h-7 w-28 mx-auto" />
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-400">Total Earned</p>
                <p className="text-2xl font-bold text-[#10B981]">{formatCurrency(balance?.total_earned || 0)}</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-xl">
          <CardContent className="p-4 text-center">
            {loadingBalance ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 mx-auto" />
                <Skeleton className="h-7 w-28 mx-auto" />
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-400">Total Spent</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(balance?.total_spent || 0)}</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-xl">
          <CardContent className="p-4 text-center">
            {loadingBalance ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 mx-auto" />
                <Skeleton className="h-7 w-28 mx-auto" />
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-[#FF8A36]">{formatCurrency(balance?.pending || 0)}</p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg text-white">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" onValueChange={handleTabChange}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="credits">Credits</TabsTrigger>
                <TabsTrigger value="debits">Debits</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-0">{renderTransactions()}</TabsContent>
              <TabsContent value="credits" className="mt-0">{renderTransactions()}</TabsContent>
              <TabsContent value="debits" className="mt-0">{renderTransactions()}</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg text-white">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="seller">
              <TabsList className="mb-4">
                <TabsTrigger value="seller">Seller Earnings</TabsTrigger>
                <TabsTrigger value="buyer">Purchase History</TabsTrigger>
              </TabsList>
              <TabsContent value="seller" className="mt-0">{renderOrders('seller')}</TabsContent>
              <TabsContent value="buyer" className="mt-0">{renderOrders('buyer')}</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        amount={withdrawAmount}
        onAmountChange={setWithdrawAmount}
        description={withdrawDescription}
        onDescriptionChange={setWithdrawDescription}
        onWithdraw={handleWithdraw}
        withdrawing={withdrawing}
        balance={balance?.balance || 0}
      />

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </motion.div>
  )

  function renderTransactions() {
    if (loadingTransactions) return <TransactionSkeleton />
    if (transactionError) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <XCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-sm text-slate-400 mb-3">{transactionError}</p>
          <Button variant="outline" size="sm" onClick={() => fetchTransactions()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Retry
          </Button>
        </div>
      )
    }
    if (transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <Wallet className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-white">No transactions yet</p>
          <p className="text-xs text-slate-400 mt-1">Your transaction history will appear here</p>
        </div>
      )
    }
    return (
      <div className="space-y-1">
        {transactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                tx.type === 'credit' ? 'bg-emerald-500/10 text-[#10B981]' : 'bg-red-500/10 text-red-400',
              )}>
                {tx.type === 'credit'
                  ? <ArrowDownRight className="w-5 h-5" />
                  : <ArrowUpRight className="w-5 h-5" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{formatDate(tx.date)}</span>
                  <Badge variant={statusVariant[tx.status] || 'outline'} className="text-[10px] px-1.5 py-0 gap-0.5">
                    {statusIcon[tx.status] || null}
                    {formatStatus(tx.status)}
                  </Badge>
                </div>
              </div>
              <span className={cn(
                'text-sm font-semibold shrink-0',
                tx.type === 'credit' ? 'text-[#10B981]' : 'text-red-400',
              )}>
                {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
            {i < transactions.length - 1 && <Separator className="my-1" />}
          </motion.div>
        ))}
        {hasMore && (
          <div className="flex justify-center pt-3">
            <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={transactionsLoadingMore} className="gap-2">
              {transactionsLoadingMore ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              {transactionsLoadingMore ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    )
  }

  function renderOrders(tab: string) {
    const orders = tab === 'seller' ? sellerOrders : buyerOrders
    const loading = tab === 'seller' ? loadingSellerOrders : loadingBuyerOrders

    if (loading) return <OrderSkeleton />
    if (ordersError && orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <XCircle className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-sm text-slate-400">{ordersError}</p>
        </div>
      )
    }
    if (orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium">
            {tab === 'seller' ? 'No completed orders yet' : 'No purchases yet'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {tab === 'seller'
              ? 'Your completed orders and earnings will appear here'
              : 'Your purchased items will appear here'}
          </p>
        </div>
      )
    }
    return (
      <div className="space-y-1">
        {orders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <button
              type="button"
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {tab === 'seller' ? <DollarSign className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {order.course?.title || order.gig?.title || `Order #${order.id}`}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{formatDate(order.created_at)}</span>
                  {order.status && (
                    <Badge variant={statusVariant[order.status] || 'outline'} className="text-[10px] px-1.5 py-0 gap-0.5">
                      {statusIcon[order.status] || null}
                      {formatStatus(order.status)}
                    </Badge>
                  )}
                </div>
              </div>
              {order.amount != null && (
                <span className="text-sm font-semibold shrink-0 text-[#10B981]">
                  +{formatCurrency(order.amount)}
                </span>
              )}
            </button>
            {i < orders.length - 1 && <Separator className="my-1" />}
          </motion.div>
        ))}
      </div>
    )
  }
}
