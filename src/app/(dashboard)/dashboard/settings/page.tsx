'use client'

import { useState, useEffect, useRef } from 'react'
import { profileAPI } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { getImageUrl } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  User, Camera, Mail, Globe, Github, Linkedin, Twitter,
  Plus, Trash2, Upload, Loader2, Save, Shield, Bell, Key, Palette,
  Briefcase, GraduationCap, Link, FolderOpen, ExternalLink, Clock,
  Calendar, Pencil, Eye, EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileAvatar } from '@/components/ui/profile-avatar'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  website?: string
}

interface Experience {
  id?: number
  title: string
  company: string
  start_date: string
  end_date: string
  description: string
  current?: boolean
}

interface Education {
  id?: number
  degree: string
  school: string
  year: string
  description?: string
}

interface Portfolio {
  id?: number
  title: string
  url: string
  description: string
}

interface ProfileData {
  name: string
  email: string
  bio: string
  avatar: string | null
  skills: string[]
  headline: string
  phone: string
  cover_photo: string | null
  social_links: SocialLinks
  experience: Experience[]
  education: Education[]
  portfolio: Portfolio[]
}

const defaultProfile: ProfileData = {
  name: '',
  email: '',
  bio: '',
  avatar: null,
  skills: [],
  headline: '',
  phone: '',
  cover_photo: null,
  social_links: {},
  experience: [],
  education: [],
  portfolio: [],
}

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData>(defaultProfile)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [skillInput, setSkillInput] = useState('')

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  const [savingPassword, setSavingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const res = await profileAPI.get()
      const data = res.data
      console.log('[Settings] loadProfile response:', data)
      if (data.status === 'success') {
        const u = data.user
        console.log('[Settings] User avatar from API:', u.avatar)
        const p = u.profile || {}
        // Safely parse fields that may come as JSON strings from the API
        const parseArray = (v: any): any[] => {
          if (Array.isArray(v)) return v
          if (typeof v === 'string') try { return JSON.parse(v) } catch { return [] }
          return []
        }
        const parseObject = (v: any): any => {
          if (v && typeof v === 'object' && !Array.isArray(v)) return v
          if (typeof v === 'string') try { return JSON.parse(v) } catch { return {} }
          return {}
        }
        setProfile({
          name: u.name || '',
          email: u.email || '',
          bio: u.bio || '',
          avatar: u.avatar || null,
          skills: parseArray(u.skills),
          headline: p.headline || '',
          phone: p.phone || '',
          cover_photo: p.cover_photo || null,
          social_links: parseObject(p.social_links),
          experience: parseArray(p.experience),
          education: parseArray(p.education),
          portfolio: parseArray(p.portfolio),
        })
        if (u.avatar) setAvatarPreview(u.avatar)
        if (p.cover_photo) setCoverPreview(p.cover_photo)
      }
    } catch {
      // Fall back to auth store user data so the form is never blank
      if (user) {
        const parseArray = (v: any): any[] => {
          if (Array.isArray(v)) return v
          if (typeof v === 'string') try { return JSON.parse(v) } catch { return [] }
          return []
        }
        setProfile({
          name: user.name || '',
          email: user.email || '',
          bio: user.bio || '',
          avatar: user.avatar || null,
          skills: parseArray(user.skills),
          headline: '',
          phone: '',
          cover_photo: null,
          social_links: {},
          experience: [],
          education: [],
          portfolio: [],
        })
        if (user.avatar) setAvatarPreview(user.avatar)
      }
      toast.error('Could not load full profile — showing basic info')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field: keyof ProfileData, value: any) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  function handleSocialChange(platform: keyof SocialLinks, value: string) {
    setProfile((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value },
    }))
  }

  function addSkill() {
    const s = skillInput.trim()
    if (s && !profile.skills.includes(s)) {
      setProfile((prev) => ({ ...prev, skills: [...prev.skills, s] }))
    }
    setSkillInput('')
  }

  function removeSkill(skill: string) {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be under 10MB')
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be under 10MB')
        return
      }
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      const fd = new FormData()
      fd.append('name', profile.name || '')
      fd.append('bio', profile.bio || '')
      fd.append('headline', profile.headline || '')
      fd.append('phone', profile.phone || '')
      fd.append('skills', JSON.stringify(profile.skills || []))
      fd.append('social_links', JSON.stringify(profile.social_links || {}))
      fd.append('experience', JSON.stringify(profile.experience || []))
      fd.append('education', JSON.stringify(profile.education || []))
      fd.append('portfolio', JSON.stringify(profile.portfolio || []))
      if (avatarFile) fd.append('avatar', avatarFile)
      if (coverFile) fd.append('cover_photo', coverFile)

      console.log('[Settings] Saving profile, avatarFile:', avatarFile ? avatarFile.name : null, 'coverFile:', coverFile ? coverFile.name : null)

      const res = await profileAPI.update(fd)
      console.log('[Settings] Save response:', res.data)
      if (res.data?.status === 'success') {
        toast.success('Profile updated successfully')
        if (res.data.user) {
          const u = res.data.user
          console.log('[Settings] Updated user avatar:', u.avatar)
          setUser(u)
          const p = u.profile || {}
          const parseArray = (v: any): any[] => {
            if (Array.isArray(v)) return v
            if (typeof v === 'string') try { return JSON.parse(v) } catch { return [] }
            return []
          }
          const parseObject = (v: any): any => {
            if (v && typeof v === 'object' && !Array.isArray(v)) return v
            if (typeof v === 'string') try { return JSON.parse(v) } catch { return {} }
            return {}
          }
          setProfile({
            name: u.name || '',
            email: u.email || '',
            bio: u.bio || '',
            avatar: u.avatar || null,
            skills: parseArray(u.skills),
            headline: p.headline || '',
            phone: p.phone || '',
            cover_photo: p.cover_photo || null,
            social_links: parseObject(p.social_links),
            experience: parseArray(p.experience),
            education: parseArray(p.education),
            portfolio: parseArray(p.portfolio),
          })
          if (u.avatar) setAvatarPreview(u.avatar)
          if (p.cover_photo) setCoverPreview(p.cover_photo)
        }
        setAvatarFile(null)
        setCoverFile(null)
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error: any) {
      console.error('[Settings] Profile save error:', error?.response?.data || error)
      const data = error?.response?.data
      const msg = data?.message
        ?? (data?.errors ? Object.values(data.errors).flat().join(', ') : null)
        ?? 'Failed to update profile'
      toast.error(typeof msg === 'string' ? msg : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange() {
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    if (!passwordData.current_password || !passwordData.password) {
      toast.error('Please fill in all password fields')
      return
    }
    try {
      setSavingPassword(true)
      await profileAPI.update({
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      })
      toast.success('Password updated successfully')
      setPasswordData({ current_password: '', password: '', password_confirmation: '' })
    } catch {
      toast.error('Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  function addExperience() {
    setProfile((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: '', company: '', start_date: '', end_date: '', description: '' },
      ],
    }))
  }

  function updateExperience(index: number, field: keyof Experience, value: any) {
    setProfile((prev) => {
      const exp = [...prev.experience]
      exp[index] = { ...exp[index], [field]: value }
      return { ...prev, experience: exp }
    })
  }

  function removeExperience(index: number) {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }))
  }

  function addEducation() {
    setProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', school: '', year: '', description: '' },
      ],
    }))
  }

  function updateEducation(index: number, field: keyof Education, value: any) {
    setProfile((prev) => {
      const edu = [...prev.education]
      edu[index] = { ...edu[index], [field]: value }
      return { ...prev, education: edu }
    })
  }

  function removeEducation(index: number) {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  function addPortfolio() {
    setProfile((prev) => ({
      ...prev,
      portfolio: [
        ...prev.portfolio,
        { title: '', url: '', description: '' },
      ],
    }))
  }

  function updatePortfolio(index: number, field: keyof Portfolio, value: any) {
    setProfile((prev) => {
      const port = [...prev.portfolio]
      port[index] = { ...port[index], [field]: value }
      return { ...prev, portfolio: port }
    })
  }

  function removePortfolio(index: number) {
    setProfile((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[#EEF1F8] rounded" />
        <div className="h-4 w-72 bg-[#EEF1F8] rounded" />
        <div className="h-12 w-full bg-[#EEF1F8] rounded-lg" />
        <div className="h-64 bg-[#EEF1F8] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="relative space-y-6">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#6D3DF5]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#6D3DF5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <h1 className="text-2xl font-bold text-[#0F1B3D] tracking-tight">Settings</h1>
        <p className="text-[#536078] mt-1">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="relative space-y-6">
        <TabsList className="bg-white border border-[#E9E7F5] p-1 gap-1">
          <TabsTrigger value="profile" className="gap-2 text-[#536078] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6D3DF5] data-[state=active]:to-[#3478F6] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#6D3DF5]/20">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="experience" className="gap-2 text-[#536078] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6D3DF5] data-[state=active]:to-[#3478F6] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#6D3DF5]/20">
            <Briefcase className="w-4 h-4" /> Experience & Education
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2 text-[#536078] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6D3DF5] data-[state=active]:to-[#3478F6] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#6D3DF5]/20">
            <Shield className="w-4 h-4" /> Account
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-2 text-[#536078] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6D3DF5] data-[state=active]:to-[#3478F6] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#6D3DF5]/20">
            <FolderOpen className="w-4 h-4" /> Portfolio
          </TabsTrigger>
        </TabsList>

        {/* ==================== PROFILE TAB ==================== */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-white border border-[#E9E7F5] shadow-sm text-[#0F1B3D] overflow-hidden">
            <div className="relative h-44 sm:h-52 bg-gradient-to-br from-[#F3EEFF] via-[#F7F5FF] to-[#EEF4FF] overflow-hidden">
              {coverPreview ? (
                <img
                  src={getImageUrl(coverPreview)}
                  alt="Cover"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget).style.display = 'none' }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/80 border border-[#E9E7F5] shadow-sm flex items-center justify-center">
                    <Camera className="w-5 h-5 text-[#6D3DF5]" />
                  </div>
                  <span className="text-sm font-medium text-[#536078]">Add a cover image</span>
                  <span className="text-xs text-[#A6AFBF]">JPG, PNG or GIF · Recommended 1600 x 400</span>
                </div>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute bottom-3 right-3 z-10 gap-2 bg-white/90 backdrop-blur-sm border border-[#E4E8F2] text-[#0F1B3D] shadow-sm hover:bg-white hover:border-[#6D3DF5]/40 transition-colors"
                onClick={() => coverInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" /> Change Cover
              </Button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>

            <CardContent className="relative pt-0">
              <div className="flex flex-col sm:flex-row items-start gap-5 -mt-12 mb-6">
                <div className="relative group">
                  <ProfileAvatar src={avatarPreview || user?.avatar} name={profile.name} size="xl" className="w-24 h-24" ringClassName="ring-4 ring-white" />
                  <div
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ring-4 ring-white"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="pt-12 sm:pt-14">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white border border-[#E4E8F2] text-[#536078] shadow-sm hover:bg-[#EEF4FF] hover:text-[#6D3DF5] hover:border-[#6D3DF5]/30"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" /> Change Photo
                  </Button>
                  <p className="text-xs text-[#7A86A3] mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <Separator className="mb-6 bg-[#E9E7F5]" />

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-[#33415C]" htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#33415C]" htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    className="bg-[#F8FAFC] border border-[#E4E8F2] text-[#536078] placeholder:text-[#A5AEC2] focus-visible:ring-0 focus-visible:ring-offset-0 opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-[#33415C]" htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={profile.headline}
                    onChange={(e) => handleChange('headline', e.target.value)}
                    placeholder="e.g. Full-stack Developer & Educator"
                    className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#33415C]" htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <Label className="text-[#33415C]" htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200 resize-none"
                />
              </div>

              <div className="space-y-2 mb-4">
                <Label className="text-[#33415C]">Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-[#ECFBF5] text-[#18A878] border border-[#18A878]/25"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-destructive transition-colors"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSkill()
                      }
                    }}
                    placeholder="Type a skill and press Enter"
                    className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addSkill}
                    disabled={!skillInput.trim()}
                    className="bg-white border border-[#E4E8F2] text-[#536078] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:bg-[#F3F0FF] hover:text-[#6D3DF5] hover:border-[#6D3DF5]/30 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator className="my-6 bg-[#E9E7F5]" />

              <div className="space-y-4 mb-6">
                <Label className="text-[#33415C]">Social Links</Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A86A3]" />
                    <Input
                      value={profile.social_links.github || ''}
                      onChange={(e) => handleSocialChange('github', e.target.value)}
                      placeholder="GitHub URL"
                      className="pl-10 bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                    />
                  </div>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A86A3]" />
                    <Input
                      value={profile.social_links.linkedin || ''}
                      onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                      placeholder="LinkedIn URL"
                      className="pl-10 bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                    />
                  </div>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A86A3]" />
                    <Input
                      value={profile.social_links.twitter || ''}
                      onChange={(e) => handleSocialChange('twitter', e.target.value)}
                      placeholder="Twitter URL"
                      className="pl-10 bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                    />
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A86A3]" />
                    <Input
                      value={profile.social_links.website || ''}
                      onChange={(e) => handleSocialChange('website', e.target.value)}
                      placeholder="Website URL"
                      className="pl-10 bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-lg shadow-[#6D3DF5]/25 hover:shadow-xl hover:shadow-[#6D3DF5]/30 hover:brightness-110 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== EXPERIENCE & EDUCATION TAB ==================== */}
        <TabsContent value="experience" className="space-y-6">
          <Card className="bg-white border border-[#E9E7F5] shadow-sm text-[#0F1B3D]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-lg text-[#0F1B3D]">Work Experience</CardTitle>
                <CardDescription className="text-[#536078]">Add your professional experience.</CardDescription>
              </div>
              <Button type="button" size="sm" className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-lg shadow-[#6D3DF5]/25 gap-2" onClick={addExperience}>
                <Plus className="w-4 h-4" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.experience.length === 0 && (
                <p className="text-sm text-[#7A86A3] text-center py-8">
                  No experience added yet. Click "Add" to get started.
                </p>
              )}
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="relative p-4 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] hover:border-[#6D3DF5]/25 transition-colors">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeExperience(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[#33415C]">Title</Label>
                      <Input
                        value={exp.title}
                        onChange={(e) => updateExperience(idx, 'title', e.target.value)}
                        placeholder="Job Title"
                        className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#33415C]">Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                        placeholder="Company Name"
                        className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#33415C]">Start Date</Label>
                      <Input
                        type="date"
                        value={exp.start_date}
                        onChange={(e) => updateExperience(idx, 'start_date', e.target.value)}
                        className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#33415C]">End Date</Label>
                      <Input
                        type="date"
                        value={exp.end_date}
                        onChange={(e) => updateExperience(idx, 'end_date', e.target.value)}
                        className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <Label className="text-[#33415C]">Description</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                      rows={2}
                      placeholder="Describe your role and achievements"
                      className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#E9E7F5] shadow-sm text-[#0F1B3D]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-lg text-[#0F1B3D]">Education</CardTitle>
                <CardDescription className="text-[#536078]">Add your educational background.</CardDescription>
              </div>
              <Button type="button" size="sm" className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-lg shadow-[#6D3DF5]/25 gap-2" onClick={addEducation}>
                <Plus className="w-4 h-4" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.education.length === 0 && (
                <p className="text-sm text-[#7A86A3] text-center py-8">
                  No education added yet. Click "Add" to get started.
                </p>
              )}
              {profile.education.map((edu, idx) => (
                <div key={idx} className="relative p-4 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] hover:border-[#6D3DF5]/25 transition-colors">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeEducation(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[#33415C]">Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                        placeholder="B.Sc. Computer Science"
                        className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#33415C]">School</Label>
                      <Input
                        value={edu.school}
                        onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                        placeholder="University Name"
                        className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#33415C]">Year</Label>
                      <Input
                        value={edu.year}
                        onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                        placeholder="2024"
                        className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <Label className="text-[#33415C]">Description (optional)</Label>
                    <Textarea
                      value={edu.description || ''}
                      onChange={(e) => updateEducation(idx, 'description', e.target.value)}
                      rows={1}
                      placeholder="Additional details"
                      className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-lg shadow-[#6D3DF5]/25 hover:shadow-xl hover:shadow-[#6D3DF5]/30 hover:brightness-110 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* ==================== ACCOUNT TAB ==================== */}
        <TabsContent value="account" className="space-y-6">
          <Card className="bg-white border border-[#E9E7F5] shadow-sm text-[#0F1B3D]">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-lg text-[#0F1B3D]">
                <Mail className="w-5 h-5" /> Email
              </CardTitle>
              <CardDescription className="text-[#536078]">Your email address on file.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={profile.email}
                readOnly
                className="bg-[#F8FAFC] border border-[#E4E8F2] text-[#536078] placeholder:text-[#A5AEC2] max-w-md focus-visible:ring-0 focus-visible:ring-offset-0 opacity-70 cursor-not-allowed"
              />
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#E9E7F5] shadow-sm text-[#0F1B3D]">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-lg text-[#0F1B3D]">
                <Key className="w-5 h-5" /> Change Password
              </CardTitle>
              <CardDescription className="text-[#536078]">Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label className="text-[#33415C]" htmlFor="current">Current Password</Label>
                  <div className="relative max-w-md">
                    <Input
                      id="current"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData((prev) => ({ ...prev, current_password: e.target.value }))
                      }
                      className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200 pr-10"
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A86A3] hover:text-[#0F1B3D] transition-colors">
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#33415C]" htmlFor="new">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.password}
                      onChange={(e) =>
                        setPasswordData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200 pr-10"
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A86A3] hover:text-[#0F1B3D] transition-colors">
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#33415C]" htmlFor="confirm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.password_confirmation}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          password_confirmation: e.target.value,
                        }))
                      }
                      className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200 pr-10"
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A86A3] hover:text-[#0F1B3D] transition-colors">
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={savingPassword}
                  className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-lg shadow-[#6D3DF5]/25 hover:shadow-xl hover:shadow-[#6D3DF5]/30 hover:brightness-110 gap-2"
                >
                  {savingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== PORTFOLIO TAB ==================== */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card className="bg-white border border-[#E9E7F5] shadow-sm text-[#0F1B3D]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-2 text-lg text-[#0F1B3D]">
                  <Link className="w-5 h-5" /> Portfolio Projects
                </CardTitle>
                <CardDescription className="text-[#536078]">Add links to your projects and work.</CardDescription>
              </div>
              <Button type="button" size="sm" className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-lg shadow-[#6D3DF5]/25 gap-2" onClick={addPortfolio}>
                <Plus className="w-4 h-4" /> Add Project
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.portfolio.length === 0 && (
                <p className="text-sm text-[#7A86A3] text-center py-8">
                  No portfolio items yet. Click "Add Project" to showcase your work.
                </p>
              )}
              {profile.portfolio.map((item, idx) => (
                <div key={idx} className="relative p-4 rounded-lg bg-[#F8FAFC] border border-[#E9E7F5] hover:border-[#6D3DF5]/25 transition-colors">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removePortfolio(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[#33415C]">Project Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => updatePortfolio(idx, 'title', e.target.value)}
                        placeholder="My Awesome Project"
                        className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#33415C]">Project URL</Label>
                      <Input
                        value={item.url}
                        onChange={(e) => updatePortfolio(idx, 'url', e.target.value)}
                        placeholder="https://github.com/..."
                        className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <Label className="text-[#33415C]">Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => updatePortfolio(idx, 'description', e.target.value)}
                      rows={2}
                      placeholder="Brief description of the project"
                      className="bg-white border border-[#E4E8F2] text-[#0F1B3D] placeholder:text-[#A5AEC2] shadow-[0_1px_2px_rgba(15,27,61,0.05)] hover:border-[#C8D0E2] focus:border-[#6D3DF5]/60 focus-visible:ring-2 focus-visible:ring-[#6D3DF5]/15 focus-visible:ring-offset-0 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-[#6D3DF5] to-[#3478F6] text-white shadow-lg shadow-[#6D3DF5]/25 hover:shadow-xl hover:shadow-[#6D3DF5]/30 hover:brightness-110 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
