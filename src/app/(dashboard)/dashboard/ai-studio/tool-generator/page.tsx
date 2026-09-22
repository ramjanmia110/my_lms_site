'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Code2,
  Settings2,
  Globe,
  Loader2,
  Check,
  Copy,
  Eye,
  FileCode,
  Cpu,
  Hash,
  Tag,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const mockGeneratedCode = `function QRCodeGenerator({ data, size = 256 }) {
  const [qrCode, setQrCode] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (data) {
      setLoading(true)
      generateQR(data).then((code) => {
        setQrCode(code)
        setLoading(false)
      })
    }
  }, [data])

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {loading ? (
        <div className="w-64 h-64 bg-muted animate-pulse rounded-xl" />
      ) : (
        qrCode && (
          <img
            src={qrCode}
            alt="QR Code"
            className="rounded-xl shadow-lg"
          />
        )
      )}
      <Input
        placeholder="Enter data..."
        value={data}
        onChange={(e) => setData(e.target.value)}
      />
      <Button onClick={downloadQR}>
        Download QR Code
      </Button>
    </div>
  )
}`

const seoFields = [
  { label: 'Meta Title', value: 'QR Code Generator - Free Online Tool' },
  { label: 'Meta Description', value: 'Generate custom QR codes for free. High-quality, customizable QR codes for URLs, text, and more.' },
  { label: 'Focus Keyword', value: 'QR code generator' },
  { label: 'Slug', value: 'qr-code-generator' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function ToolGeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    // Simulate generation
    await new Promise((r) => setTimeout(r, 2500))
    setGenerating(false)
    setGenerated(true)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(mockGeneratedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-space-grotesk">AI Tool Generator</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Describe the tool you need and AI will build it for you
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
                <FileCode className="w-5 h-5 text-purple-400" />
                Tool Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe the tool you want to generate...&#10;&#10;Example: 'A QR code generator that takes text input and generates a downloadable QR code image with customizable colors and size.'"
                className="min-h-[200px] resize-none bg-background/50"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="flex flex-wrap gap-2">
                {['QR Code', 'Image Editor', 'Calculator', 'Form Builder', 'Chart'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setPrompt(suggestion)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
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
                    Generating your tool...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Tool
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
                SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {seoFields.map((field) => (
                <div key={field.label}>
                  <label className="text-xs text-muted-foreground mb-1.5 block">{field.label}</label>
                  <Input
                    value={field.value}
                    readOnly
                    className="bg-background/50 text-sm cursor-default"
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                Auto-populated from generated tool
              </p>
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
                  Connect your WordPress site to publish generated tools directly as plugins or pages.
                </p>
              </div>
              <Button variant="glass" size="lg" className="w-full gap-2" disabled>
                <Globe className="w-4 h-4" />
                Publish to WordPress
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right - Preview */}
        <motion.div variants={item} className="space-y-6">
          {!generated ? (
            <Card className="border border-dashed border-white/10 h-full min-h-[400px]">
              <CardContent className="flex flex-col items-center justify-center h-full py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Your generated tool will appear here</p>
                <p className="text-muted-foreground text-xs mt-1">Describe a tool and click generate</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Tool Preview */}
              <Card className="border border-white/10 overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-purple-400" />
                      QR Code Generator
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="gap-1">
                        <Check className="w-3 h-3" />
                        Generated
                      </Badge>
                      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleCopy}>
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="code" className="w-full">
                    <div className="px-6 pt-4">
                      <TabsList className="w-full">
                        <TabsTrigger value="code" className="flex-1 gap-1.5">
                          <Code2 className="w-3.5 h-3.5" />
                          Code
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="flex-1 gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          Preview
                        </TabsTrigger>
                        <TabsTrigger value="readme" className="flex-1 gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Readme
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="code" className="mt-0">
                      <div className="relative">
                        <div className="flex items-center gap-2 px-6 pt-4 pb-2">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">QRCodeGenerator.tsx</span>
                        </div>
                        <pre className="p-6 pt-2 overflow-x-auto">
                          <code className="text-sm leading-relaxed font-mono text-foreground/80 whitespace-pre">
                            {mockGeneratedCode}
                          </code>
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-0 p-6">
                      <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-background/50 border border-white/5">
                        <div className="w-48 h-48 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                          <div className="text-center">
                            <div className="w-32 h-32 mx-auto bg-white/10 rounded-lg flex items-center justify-center">
                              <Code2 className="w-12 h-12 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">QR Preview</p>
                          </div>
                        </div>
                        <Input placeholder="Enter text or URL..." className="max-w-sm bg-background/50" />
                        <Button variant="gradient" size="sm">Download QR Code</Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="readme" className="mt-0 p-6">
                      <div className="space-y-4 text-sm">
                        <div>
                          <h4 className="font-semibold mb-1">QR Code Generator</h4>
                          <p className="text-muted-foreground">A simple, customizable QR code generator built with React and TypeScript.</p>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" />
                            Features
                          </h5>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>Generate QR codes from text or URLs</li>
                            <li>Customizable size and colors</li>
                            <li>Download as PNG or SVG</li>
                            <li>Responsive design</li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* WordPress Publish Card */}
              <Card className="border border-white/10 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Ready to Publish</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Push this tool directly to your WordPress site as a plugin.
                      </p>
                      <Button variant="glass" className="gap-2">
                        <Globe className="w-4 h-4" />
                        Publish to WordPress
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
