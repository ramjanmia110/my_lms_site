'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Globe,
  Plus,
  ExternalLink,
  Wrench,
  FileText,
  History,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Eye,
  Radio,
  Zap,
  BookOpen,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatDateRelative } from '@/lib/utils'
import type { WordPressSite, GeneratedTool, GeneratedBlog } from '@/types'

const mockSites: WordPressSite[] = [
  { id: 1, url: 'https://techblog.com', name: 'Tech Blog', username: 'admin', status: 'connected', last_sync: new Date(Date.now() - 1000 * 60 * 15).toISOString(), created_at: '2025-12-01T10:00:00Z' },
  { id: 2, url: 'https://startupnews.com', name: 'Startup News', username: 'shaila', status: 'connected', last_sync: new Date(Date.now() - 1000 * 60 * 45).toISOString(), created_at: '2026-01-15T08:30:00Z' },
  { id: 3, url: 'https://devdigest.org', name: 'Dev Digest', username: 'admin', status: 'error', last_sync: new Date(Date.now() - 1000 * 60 * 120).toISOString(), created_at: '2026-02-10T14:00:00Z' },
  { id: 4, url: 'https://designhub.io', name: 'Design Hub', username: 'shaila', status: 'disconnected', last_sync: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), created_at: '2026-03-05T09:00:00Z' },
  { id: 5, url: 'https://elearningpro.com', name: 'eLearning Pro', username: 'admin', status: 'connected', last_sync: new Date(Date.now() - 1000 * 60 * 5).toISOString(), created_at: '2026-04-01T11:00:00Z' },
]

const mockTools: GeneratedTool[] = [
  { id: 1, title: 'QR Code Generator', keyword: 'qr code generator', code: '...', shortcode: '[qr_code_generator]', seo_title: null, meta_description: null, site_id: 1, live_url: 'https://techblog.com/qr-generator', status: 'published', created_at: '2026-05-10T10:00:00Z' },
  { id: 2, title: 'BMI Calculator', keyword: 'bmi calculator', code: '...', shortcode: '[bmi_calculator]', seo_title: null, meta_description: null, site_id: 2, live_url: 'https://startupnews.com/bmi-calc', status: 'published', created_at: '2026-05-12T14:30:00Z' },
  { id: 3, title: 'Age Calculator', keyword: 'age calculator', code: '...', shortcode: '[age_calculator]', seo_title: null, meta_description: null, site_id: null, live_url: null, status: 'draft', created_at: '2026-05-18T09:00:00Z' },
  { id: 4, title: 'Password Generator', keyword: 'password generator', code: '...', shortcode: '[password_generator]', seo_title: null, meta_description: null, site_id: 1, live_url: 'https://techblog.com/password-gen', status: 'published', created_at: '2026-05-20T16:00:00Z' },
  { id: 5, title: 'Unit Converter', keyword: 'unit converter', code: '...', shortcode: '[unit_converter]', seo_title: null, meta_description: null, site_id: null, live_url: null, status: 'draft', created_at: '2026-06-01T08:00:00Z' },
  { id: 6, title: 'Loan Calculator', keyword: 'loan calculator', code: '...', shortcode: '[loan_calculator]', seo_title: null, meta_description: null, site_id: 5, live_url: 'https://elearningpro.com/loan-calc', status: 'published', created_at: '2026-06-05T12:00:00Z' },
]

const mockBlogs: GeneratedBlog[] = [
  { id: 1, title: '10 Best SEO Tools for 2026', content: '...', seo_title: 'Best SEO Tools 2026', meta_description: 'Discover the top SEO tools...', faq: null, schema: null, shortcode: '[blog_seo_tools]', site_id: 1, live_url: 'https://techblog.com/best-seo-tools', status: 'published', created_at: '2026-05-08T10:00:00Z' },
  { id: 2, title: 'How to Start a Blog in 2026', content: '...', seo_title: 'Start a Blog 2026 Guide', meta_description: 'Complete guide on starting a blog...', faq: null, schema: null, shortcode: '[blog_start_blog]', site_id: 2, live_url: 'https://startupnews.com/start-blog', status: 'published', created_at: '2026-05-15T14:00:00Z' },
  { id: 3, title: 'WordPress vs Headless CMS', content: '...', seo_title: 'WordPress vs Headless CMS Comparison', meta_description: 'Detailed comparison between WordPress...', faq: null, schema: null, shortcode: '[blog_wp_vs_headless]', site_id: null, live_url: null, status: 'draft', created_at: '2026-05-22T09:00:00Z' },
  { id: 4, title: 'Top 20 JavaScript Frameworks', content: '...', seo_title: 'Best JS Frameworks 2026', meta_description: 'Explore the most popular JavaScript...', faq: null, schema: null, shortcode: '[blog_js_frameworks]', site_id: 1, live_url: 'https://techblog.com/js-frameworks', status: 'published', created_at: '2026-05-28T11:00:00Z' },
  { id: 5, title: 'AI in Education: Future Trends', content: '...', seo_title: 'AI Education Trends 2026', meta_description: 'How AI is shaping the future...', faq: null, schema: null, shortcode: '[blog_ai_education]', site_id: 5, live_url: 'https://elearningpro.com/ai-education', status: 'published', created_at: '2026-06-02T15:00:00Z' },
]

const historyLog = [
  { id: 1, action: 'Published blog post', detail: '"10 Best SEO Tools for 2026" published to Tech Blog', time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), type: 'blog' },
  { id: 2, action: 'Tool synced', detail: 'QR Code Generator synced to Tech Blog', time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), type: 'tool' },
  { id: 3, action: 'Site connected', detail: 'eLearning Pro connected successfully', time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'site' },
  { id: 4, action: 'Blog post published', detail: '"How to Start a Blog" published to Startup News', time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), type: 'blog' },
  { id: 5, action: 'Tool generated', detail: 'Password Generator created in draft mode', time: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), type: 'tool' },
  { id: 6, action: 'Sync error', detail: 'Dev Digest sync failed - invalid credentials', time: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), type: 'error' },
  { id: 7, action: 'Site disconnected', detail: 'Design Hub was disconnected by user', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), type: 'site' },
  { id: 8, action: 'Blog post published', detail: '"AI in Education" published to eLearning Pro', time: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), type: 'blog' },
  { id: 9, action: 'Tool published', detail: 'Loan Calculator published to eLearning Pro', time: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), type: 'tool' },
  { id: 10, action: 'Blog created', detail: '"WordPress vs Headless CMS" saved as draft', time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), type: 'blog' },
]

const statusIcon: Record<string, React.ReactNode> = {
  connected: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  disconnected: <XCircle className="w-4 h-4 text-slate-400" />,
  error: <XCircle className="w-4 h-4 text-red-500" />,
}

const statusBadge: Record<string, 'success' | 'secondary' | 'destructive'> = {
  connected: 'success',
  disconnected: 'secondary',
  error: 'destructive',
}

const toolStatusBadge: Record<string, 'success' | 'secondary'> = {
  published: 'success',
  draft: 'secondary',
}

const typeIcons: Record<string, React.ReactNode> = {
  site: <Globe className="w-4 h-4" />,
   tool: <Wrench className="w-4 h-4" />,
  blog: <FileText className="w-4 h-4" />,
  error: <XCircle className="w-4 h-4 text-red-500" />,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

function SitesTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{mockSites.length} connected sites</p>
        </div>
        <Button className="bg-gradient-to-r from-[#FF8A36] to-[#E07328] text-white border-0 hover:from-[#E07328] hover:to-[#cc6422]" size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Connect New Site
        </Button>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4"
      >
        {mockSites.map((site) => (
          <motion.div key={site.id} variants={itemVariants}>
            <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF8A36]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5 relative">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF8A36]/20 to-[#E07328]/20 flex items-center justify-center shrink-0 border border-brand-500/10">
                    <Globe className="w-5 h-5 text-[#FF8A36]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{site.name}</h3>
                      <Badge variant={statusBadge[site.status]} className="gap-1">
                        {statusIcon[site.status]}
                        {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="truncate">{site.url}</span>
                      <span>·</span>
                      <span>@{site.username}</span>
                      {site.last_sync && (
                        <>
                          <span>·</span>
                          <span>Synced {formatDateRelative(site.last_sync)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      Sync
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      Visit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function ToolsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{mockTools.length} generated tools</p>
        <Button className="bg-gradient-to-r from-[#FF8A36] to-[#E07328] text-white border-0 hover:from-[#E07328] hover:to-[#cc6422]" size="sm">
          <Zap className="w-4 h-4 mr-1.5" />
          Generate New Tool
        </Button>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4"
      >
        {mockTools.map((tool) => (
          <motion.div key={tool.id} variants={itemVariants}>
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF8A36]/20 to-[#E07328]/20 flex items-center justify-center shrink-0 border border-purple-500/10">
                    <Wrench className="w-5 h-5 text-[#FF8A36]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{tool.title}</h3>
                      <Badge variant={toolStatusBadge[tool.status]}>
                        {tool.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="font-mono text-[#FF8A36]">{tool.shortcode}</span>
                      <span>·</span>
                      <span>Keyword: {tool.keyword}</span>
                      {tool.live_url && (
                        <>
                          <span>·</span>
                          <a href={tool.live_url} target="_blank" rel="noopener noreferrer" className="text-[#FF8A36] hover:underline inline-flex items-center gap-0.5">
                            <ExternalLink className="w-3 h-3" />
                            Live URL
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {tool.status === 'draft' && (
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4 mr-1.5" />
                        Edit
                      </Button>
                    )}
                    {tool.status === 'published' && (
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1.5" />
                        Preview
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function BlogsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{mockBlogs.length} generated blogs</p>
        <Button className="bg-gradient-to-r from-[#FF8A36] to-[#E07328] text-white border-0 hover:from-[#E07328] hover:to-[#cc6422]" size="sm">
          <BookOpen className="w-4 h-4 mr-1.5" />
          Generate New Blog
        </Button>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4"
      >
        {mockBlogs.map((blog) => (
          <motion.div key={blog.id} variants={itemVariants}>
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF8A36]/20 to-[#E07328]/20 flex items-center justify-center shrink-0 border border-amber-500/10">
                    <FileText className="w-5 h-5 text-[#FF8A36]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{blog.title}</h3>
                      <Badge variant={toolStatusBadge[blog.status]}>
                        {blog.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="font-mono text-[#FF8A36]">{blog.shortcode}</span>
                      <span>·</span>
                      <span className="truncate max-w-[200px]">{blog.seo_title}</span>
                      {blog.live_url && (
                        <>
                          <span>·</span>
                          <a href={blog.live_url} target="_blank" rel="noopener noreferrer" className="text-[#FF8A36] hover:underline inline-flex items-center gap-0.5">
                            <ExternalLink className="w-3 h-3" />
                            Live URL
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {blog.status === 'draft' && (
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4 mr-1.5" />
                        Edit
                      </Button>
                    )}
                    {blog.status === 'published' && (
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1.5" />
                        Preview
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function HistoryTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">{historyLog.length} recent activities</p>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-1"
      >
        {historyLog.map((entry) => (
          <motion.div key={entry.id} variants={itemVariants}>
            <Card className="group hover:shadow-md transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {typeIcons[entry.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="text-xs text-slate-400 truncate">{entry.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {formatDateRelative(entry.time)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default function WordPressPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">WordPress Automation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your connected WordPress sites, tools, and content
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="sites" className="space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger value="sites" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Connected Sites</span>
              <span className="sm:hidden">Sites</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Generated Tools</span>
              <span className="sm:hidden">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="blogs" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Generated Blogs</span>
              <span className="sm:hidden">Blogs</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Publishing History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
          </TabsList>

          <Card className="bg-gradient-to-b from-[#042718] to-[#000B05] backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <TabsContent value="sites">
                <SitesTab />
              </TabsContent>
              <TabsContent value="tools">
                <ToolsTab />
              </TabsContent>
              <TabsContent value="blogs">
                <BlogsTab />
              </TabsContent>
              <TabsContent value="history">
                <HistoryTab />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </motion.div>
    </div>
  )
}
