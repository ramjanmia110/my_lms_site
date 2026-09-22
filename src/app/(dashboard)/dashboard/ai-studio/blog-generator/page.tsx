'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  FileText,
  Settings2,
  Globe,
  Loader2,
  Check,
  Copy,
  Eye,
  Hash,
  Tag,
  MessageSquare,
  FileJson,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const mockArticle = {
  title: '10 Proven Strategies for Improving React Application Performance',
  excerpt:
    'Discover ten actionable techniques to optimize your React applications, from code splitting to memoization. Boost load times and enhance user experience with these expert tips.',
  content: `React has revolutionized the way we build user interfaces, but as applications grow, performance can become a challenge. Here are ten proven strategies to keep your React app fast and responsive.

## 1. Implement Code Splitting

Code splitting allows you to split your bundle into smaller chunks that load on demand. Use React.lazy() and Suspense to dynamically import components only when they're needed.

## 2. Use React.memo Wisely

React.memo prevents unnecessary re-renders by memoizing components. Apply it to pure components that receive the same props frequently.

## 3. Optimize with useMemo and useCallback

These hooks memoize expensive computations and callback functions, preventing them from being recreated on every render.

## 4. Virtualize Long Lists

For large lists, use windowing libraries like react-window to render only the visible items, dramatically reducing DOM nodes.

## 5. Avoid Anonymous Functions and Objects

Inline functions and objects create new references on every render, triggering unnecessary re-renders in child components.

## 6. Debounce Expensive Operations

Debounce search inputs, resize handlers, and other frequently firing events to reduce computation.

## 7. Properly Manage State

Keep state as local as possible. Avoid lifting state up unnecessarily and use context or state management libraries judiciously.

## 8. Image Optimization

Lazy load images below the fold, use modern formats like WebP, and implement responsive images with srcset.

## 9. Bundle Analysis

Regularly analyze your bundle with tools like webpack-bundle-analyzer to identify and remove duplicate dependencies.

## 10. Server-Side Rendering

Consider SSR or static generation with frameworks like Next.js for improved initial load performance and SEO.

By implementing these strategies, you can significantly improve the performance of your React applications, providing a smoother experience for your users.`,
  seo: {
    title: '10 React Performance Optimization Strategies - Expert Guide 2026',
    description:
      'Learn 10 proven strategies to optimize React app performance. From code splitting to memoization, boost your app speed with these expert techniques.',
    keyword: 'React performance optimization',
    slug: 'react-performance-optimization-strategies',
  },
  faq: [
    { q: 'What is the most effective React performance optimization?', a: 'Code splitting and lazy loading typically provide the biggest impact on initial load times.' },
    { q: 'When should I use React.memo?', a: 'Use React.memo for components that render frequently with the same props and are pure in nature.' },
    { q: 'Does React performance matter for small apps?', a: 'Yes, following performance best practices early prevents issues as your app scales.' },
  ],
  schema: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '10 Proven Strategies for Improving React Application Performance',
    description: 'Discover ten actionable techniques to optimize your React applications.',
    author: { '@type': 'Person', name: 'AI Content Studio' },
    datePublished: '2026-06-19',
  },
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function BlogGeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 2500))
    setGenerating(false)
    setGenerated(true)
    setActiveTab('preview')
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-space-grotesk">AI Blog Generator</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Generate SEO-optimized blog posts with AI in seconds
        </p>
      </motion.div>

      {/* Main Split Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left - Input */}
        <motion.div variants={item} className="space-y-6">
          {/* Prompt */}
          <Card className="border border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Blog Topic
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your blog topic or prompt...&#10;&#10;Example: 'Write a blog post about 10 tips for improving React performance, targeting intermediate developers.'"
                className="min-h-[180px] resize-none bg-background/50"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="flex flex-wrap gap-2">
                {['React Performance', 'Tailwind CSS Guide', 'Next.js Tips', 'AI Trends', 'Web Security'].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setPrompt(suggestion)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {suggestion}
                    </button>
                  ),
                )}
              </div>

              <Button
                variant="gradient"
                size="lg"
                className="w-full gap-2"
                disabled={!prompt.trim() || generating}
                onClick={handleGenerate}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating your blog post...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Blog
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* SEO Fields */}
          <Card className="border border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-400" />
                SEO Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generated ? (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Meta Title</label>
                    <Input value={mockArticle.seo.title} readOnly className="bg-background/50 text-sm cursor-default" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Meta Description</label>
                    <textarea
                      value={mockArticle.seo.description}
                      readOnly
                      className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm resize-none cursor-default"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Focus Keyword</label>
                      <Input value={mockArticle.seo.keyword} readOnly className="bg-background/50 text-sm cursor-default" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Slug</label>
                      <Input value={mockArticle.seo.slug} readOnly className="bg-background/50 text-sm cursor-default" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Auto-populated from generated content
                  </p>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">SEO fields will auto-populate after generation</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Publish to WordPress */}
          <Card className="border border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Publish to WordPress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input placeholder="WordPress site URL" className="bg-background/50" />
                <Button variant="outline">Connect</Button>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <Hash className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Publish directly to your WordPress site with SEO meta, schema markup, and featured images.
                </p>
              </div>
              <Button
                variant="glass"
                size="lg"
                className="w-full gap-2"
                disabled={!generated}
              >
                <Globe className="w-4 h-4" />
                {generated ? 'Publish to WordPress' : 'Generate content first'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right - Preview */}
        <motion.div variants={item} className="space-y-6">
          {!generated ? (
            <Card className="border border-dashed border-white/10 h-full min-h-[400px]">
              <CardContent className="flex flex-col items-center justify-center h-full py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Your generated article will appear here</p>
                <p className="text-muted-foreground text-xs mt-1">Enter a topic and click generate</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-white/10 overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    Article Preview
                  </CardTitle>
                  <Badge variant="success" className="gap-1">
                    <Check className="w-3 h-3" />
                    Generated
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="px-6 pt-4">
                    <TabsList className="w-full">
                      <TabsTrigger value="preview" className="flex-1 gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="content" className="flex-1 gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Content
                      </TabsTrigger>
                      <TabsTrigger value="faq" className="flex-1 gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        FAQ
                      </TabsTrigger>
                      <TabsTrigger value="schema" className="flex-1 gap-1.5">
                        <Hash className="w-3.5 h-3.5" />
                        Schema
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Preview Tab */}
                  <TabsContent value="preview" className="mt-0 p-6">
                    <div className="space-y-6">
                      {/* Article Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          June 19, 2026
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          AI Content Studio
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          8 min read
                        </Badge>
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl font-bold font-space-grotesk leading-tight">
                        {mockArticle.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-muted-foreground leading-relaxed">
                        {mockArticle.excerpt}
                      </p>

                      {/* Content Preview */}
                      <div className="prose prose-sm max-w-none text-foreground/80 space-y-4">
                        {mockArticle.content.split('\n\n').slice(0, 4).map((para, i) => (
                          <p key={i} className={para.startsWith('## ') ? 'font-semibold text-base mt-6 mb-2' : ''}>
                            {para.startsWith('## ') ? para.replace('## ', '') : para}
                          </p>
                        ))}
                      </div>

                      <Button variant="glass" size="sm" onClick={() => setActiveTab('content')}>
                        Read full article
                        <ArrowRight className="w-3 h-3 ml-1.5" />
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Full Content Tab */}
                  <TabsContent value="content" className="mt-0 p-6">
                    <div className="prose prose-sm max-w-none space-y-4">
                      {mockArticle.content.split('\n\n').map((para, i) => (
                        <p key={i} className={para.startsWith('## ') ? 'font-semibold text-base mt-6 mb-2 text-foreground' : 'text-foreground/80'}>
                          {para.startsWith('## ') ? para.replace('## ', '') : para}
                        </p>
                      ))}
                    </div>
                  </TabsContent>

                  {/* FAQ Tab */}
                  <TabsContent value="faq" className="mt-0 p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-semibold">Frequently Asked Questions</h3>
                      </div>
                      {mockArticle.faq.map((faq, i) => (
                        <div key={i} className="p-4 rounded-xl bg-background/50 border border-white/5">
                          <p className="font-medium text-sm mb-2 flex items-start gap-2">
                            <span className="text-emerald-400 shrink-0">Q:</span>
                            {faq.q}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-blue-400 shrink-0">A:</span>
                            {faq.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Schema Tab */}
                  <TabsContent value="schema" className="mt-0 p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold">JSON-LD Schema Markup</h3>
                      </div>
                      <pre className="p-4 rounded-xl bg-background/50 border border-white/5 overflow-x-auto">
                        <code className="text-xs font-mono text-foreground/80 whitespace-pre">
                          {JSON.stringify(mockArticle.schema, null, 2)}
                        </code>
                      </pre>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        Schema.org Article markup auto-generated
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
