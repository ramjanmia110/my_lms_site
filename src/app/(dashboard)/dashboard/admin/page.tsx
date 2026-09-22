'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Shield,
  UserCheck,
  UserX,
  BarChart3,
  Search,
  Filter,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ProfileAvatar } from '@/components/ui/profile-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface UserData {
  id: number
  name: string
  email: string
  role: string
  status: string
  created_at: string
  avatar?: string
  email_verified_at?: string | null
  courses_count?: number
}

interface ReportsData {
  total_users: number
  total_courses: number
  total_revenue: number
  recent_users: UserData[]
  users_by_role: Record<string, number>
  total_orders?: number
  total_enrollments?: number
}

interface UsersResponse {
  status: string
  users: UserData[]
  total: number
  per_page?: number
  current_page?: number
  last_page?: number
}

const roleGradients: Record<string, string> = {
  admin: 'from-red-500 to-rose-500',
  instructor: 'from-blue-500 to-brand-500',
  student: 'from-orange-500 to-amber-500',
  freelancer: 'from-indigo-500 to-blue-500',
  client: 'from-amber-500 to-orange-500',
}

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning'> = {
  admin: 'default',
  instructor: 'secondary',
  student: 'success',
  freelancer: 'warning',
  client: 'outline',
}

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'student', label: 'Student' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'client', label: 'Client' },
  { value: 'admin', label: 'Admin' },
]

const ROLE_EDIT_OPTIONS = ROLE_OPTIONS.filter((r) => r.value !== 'all')
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
]

function getInitials(name: string): string {
  return name
    ? name
        .split(' ')
        .map((n) => n?.[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const [reports, setReports] = useState<ReportsData | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [overviewError, setOverviewError] = useState(false)

  const [users, setUsers] = useState<UserData[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const perPage = 10

  const [editUser, setEditUser] = useState<UserData | null>(null)
  const [editRole, setEditRole] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  const [deleteUser, setDeleteUser] = useState<UserData | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setOverviewLoading(true)
    setOverviewError(false)
    adminAPI
      .getReports()
      .then((res) => {
        if (!cancelled) setReports(res.data.data as ReportsData)
      })
      .catch(() => {
        if (!cancelled) setOverviewError(true)
      })
      .finally(() => {
        if (!cancelled) setOverviewLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setSearchFilter(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (activeTab === 'users') setPage(1)
  }, [searchFilter])

  useEffect(() => {
    if (activeTab !== 'users') return
    let cancelled = false
    setUsersLoading(true)
    setUsersError(false)
    const params: Record<string, string | number> = { per_page: perPage, page }
    if (roleFilter !== 'all') params.role = roleFilter
    if (searchFilter.trim()) params.search = searchFilter.trim()
    adminAPI
      .getUsers(params)
      .then((res) => {
        if (!cancelled) {
          const data = res.data as UsersResponse
          setUsers(data.users || [])
          setTotalUsers(data.total || 0)
        }
      })
      .catch(() => {
        if (!cancelled) setUsersError(true)
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, roleFilter, searchFilter, page, perPage])

  const handleEditUser = async () => {
    if (!editUser) return
    setEditLoading(true)
    try {
      await adminAPI.manageUser(editUser.id, { role: editRole, status: editStatus })
      toast.success('User updated successfully')
      setEditUser(null)
      refetchUsers()
      refetchReports()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update user')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteUser) return
    setDeleteLoading(true)
    try {
      await adminAPI.manageUser(deleteUser.id, { status: 'suspended' })
      toast.success('User suspended successfully')
      setDeleteUser(null)
      refetchUsers()
      refetchReports()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to suspend user')
    } finally {
      setDeleteLoading(false)
    }
  }

  const refetchUsers = () => {
    const params: Record<string, string | number> = { per_page: perPage, page }
    if (roleFilter !== 'all') params.role = roleFilter
    if (searchFilter.trim()) params.search = searchFilter.trim()
    adminAPI.getUsers(params).then((res) => {
      const data = res.data as UsersResponse
      setUsers(data.users || [])
      setTotalUsers(data.total || 0)
    })
  }

  const refetchReports = () => {
    adminAPI.getReports().then((res) => {
      setReports(res.data.data as ReportsData)
    })
  }

  const totalPages = Math.ceil(totalUsers / perPage)
  const roleEntries = Object.entries(reports?.users_by_role || {})
  const maxRoleCount = Math.max(...roleEntries.map(([, c]) => c), 1)

  const statCards = reports
    ? [
        { label: 'Total Users', value: reports.total_users?.toLocaleString() || '0', icon: Users, color: 'from-blue-500 to-brand-500' },
        { label: 'Total Courses', value: reports.total_courses?.toLocaleString() || '0', icon: BookOpen, color: 'from-brand-500 to-indigo-500' },
        { label: 'Total Revenue', value: formatCurrency(reports.total_revenue || 0), icon: DollarSign, color: 'from-orange-500 to-amber-500' },
        { label: 'Total Orders', value: (reports.total_orders || 0).toLocaleString(), icon: TrendingUp, color: 'from-indigo-500 to-blue-500' },
        { label: 'New Users', value: (reports.recent_users?.length || 0).toLocaleString(), icon: UserCheck, color: 'from-amber-500 to-orange-500' },
        { label: 'Active Roles', value: roleEntries.length.toLocaleString(), icon: Shield, color: 'from-red-500 to-rose-500' },
      ]
    : []

  const renderStatSkeletons = () =>
    Array.from({ length: 6 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <Skeleton className="h-9 w-9 rounded-lg mb-3" />
          <Skeleton className="h-7 w-24 mb-1" />
          <Skeleton className="h-4 w-16" />
        </CardContent>
      </Card>
    ))

  const renderErrorCard = (onRetry: () => void, message?: string) => (
    <Card className="col-span-full">
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground mb-3">{message || 'Failed to load data'}</p>
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  )

  const renderPagination = () => {
    if (totalPages <= 1) return null
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('ellipsis')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i)
      }
      if (page < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }

    return (
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-muted-foreground">
          {totalUsers > 0
            ? `Showing ${(page - 1) * perPage + 1}-${Math.min(page * perPage, totalUsers)} of ${totalUsers}`
            : 'No results'}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e-${i}`} className="text-muted-foreground px-1">
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={page === p ? 'default' : 'outline'}
                size="sm"
                className="w-9"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ),
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  const renderRoleDistribution = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Users by Role</CardTitle>
      </CardHeader>
      <CardContent>
        {roleEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No role data available</p>
        ) : (
          <div className="space-y-4">
            {roleEntries.map(([role, count]) => (
              <div key={role}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm capitalize font-medium">{role}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${roleGradients[role] || 'from-gray-500 to-gray-400'}`}
                    style={{ width: `${(count / maxRoleCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderRecentSignups = (maxItems?: number) => {
    const usersList = reports?.recent_users || []
    const displayUsers = maxItems ? usersList.slice(0, maxItems) : usersList

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Signups</CardTitle>
        </CardHeader>
        <CardContent>
          {displayUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent signups</p>
          ) : (
            <div className="space-y-3">
              {displayUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar src={user.avatar || null} name={user.name} size="xs" />
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{formatDate(user.created_at)}</p>
                    <Badge
                      variant={roleBadgeVariant[user.role] || 'outline'}
                      className="capitalize text-xs mt-0.5"
                    >
                      {user.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-space-grotesk">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Platform management and oversight</p>
        </div>
        <Badge variant="success" className="gap-1">
          <Shield className="w-3 h-3" />
          Admin Access
        </Badge>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {overviewLoading
          ? renderStatSkeletons()
          : overviewError
            ? renderErrorCard(() => window.location.reload())
            : statCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}
                        >
                          <stat.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {overviewLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            </div>
          ) : overviewError ? (
            renderErrorCard(() => window.location.reload(), 'Failed to load overview data')
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {renderRoleDistribution()}
                {renderRecentSignups(5)}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">User Management</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select
                    value={roleFilter}
                    onValueChange={(v) => {
                      setRoleFilter(v)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-20 shrink-0" />
                      <Skeleton className="h-6 w-16 shrink-0" />
                      <Skeleton className="h-6 w-24 shrink-0" />
                      <Skeleton className="h-8 w-20 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : usersError ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-3">Failed to load users</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium mb-1">No users found</p>
                  <p className="text-sm text-muted-foreground/70 mb-4">
                    {searchFilter || roleFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'No users are registered yet'}
                  </p>
                  {(searchFilter || roleFilter !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('')
                        setSearchFilter('')
                        setRoleFilter('all')
                        setPage(1)
                      }}
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <ProfileAvatar src={user.avatar || null} name={user.name} size="xs" />
                              <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={roleBadgeVariant[user.role] || 'outline'}
                              className="capitalize text-xs"
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.status === 'active' ? 'success' : 'destructive'}
                              className="text-xs"
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(user.created_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditUser(user)
                                  setEditRole(user.role)
                                  setEditStatus(user.status)
                                }}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => setDeleteUser(user)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {renderPagination()}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {overviewLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-7 w-28" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : overviewError ? (
            renderErrorCard(() => window.location.reload(), 'Failed to load report data')
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">Total Users</p>
                    <p className="text-2xl font-bold">{reports?.total_users?.toLocaleString() || '0'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">Total Courses</p>
                    <p className="text-2xl font-bold">{reports?.total_courses?.toLocaleString() || '0'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(reports?.total_revenue || 0)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                    <p className="text-2xl font-bold">{reports?.total_orders?.toLocaleString() || '0'}</p>
                  </CardContent>
                </Card>
              </div>

              {renderRoleDistribution()}

              {renderRecentSignups()}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the role and status for <span className="font-medium text-foreground">{editUser?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_EDIT_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={editLoading}>
              {editLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend{' '}
              <span className="font-medium text-foreground">{deleteUser?.name}</span>?
              They will lose access to the platform until an admin reinstates them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteLoading}>
              {deleteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
