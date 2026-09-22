'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search, Send, Phone, Video, MoreVertical, ArrowLeft, Loader2,
  Check, CheckCheck, Paperclip, MessageSquare, User as UserIcon,
  Hash, Users, Plus, Image as ImageIcon, FileText,
} from 'lucide-react'
import { cn, formatDateRelative } from '@/lib/utils'
import { messagesAPI, chatGroupsAPI } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import type { Conversation, Message, User, ChatGroup } from '@/types'

const POLL_INTERVAL = 3000
const TYPING_TIMEOUT = 1500

type ChatMode = 'dm' | 'group'
type SidebarTab = 'chats' | 'groups'

export function ChatTerminal() {
  const currentUser = useAuthStore((state) => state.user)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('chats')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [groups, setGroups] = useState<ChatGroup[]>([])
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null)
  const [chatMode, setChatMode] = useState<ChatMode>('dm')
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newConvUser, setNewConvUser] = useState<User | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const lastMsgIdRef = useRef<number>(0)

  // ---- Fetch conversations ----
  const fetchConversations = useCallback(async () => {
    try {
      const res = await messagesAPI.getConversations()
      if (res.data.status === 'success') setConversations(res.data.conversations || [])
    } catch {} finally { setLoadingConvs(false) }
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  // ---- Fetch groups ----
  const fetchGroups = useCallback(async () => {
    try {
      const res = await chatGroupsAPI.getAll()
      if (res.data.status === 'success') setGroups(res.data.groups || [])
    } catch {} finally { setLoadingGroups(false) }
  }, [])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  // ---- Fetch messages (DM or Group) ----
  const fetchMessages = useCallback(async (mode: ChatMode, id: number) => {
    try {
      setLoadingMsgs(true)
      if (mode === 'dm') {
        const res = await messagesAPI.getMessages(id)
        if (res.data.status === 'success') {
          const msgs = res.data.messages || []
          setMessages(msgs)
          if (msgs.length > 0) lastMsgIdRef.current = msgs[msgs.length - 1].id
          setConversations(prev => prev.map(c => c.id === id ? { ...c, unread_count: 0 } : c))
        }
      } else {
        const res = await chatGroupsAPI.getMessages(id)
        if (res.data.status === 'success') {
          const msgs = res.data.messages || []
          setMessages(msgs)
          if (msgs.length > 0) lastMsgIdRef.current = msgs[msgs.length - 1].id
        }
      }
    } catch {} finally { setLoadingMsgs(false) }
  }, [])

  useEffect(() => {
    if (chatMode === 'dm' && activeConvId) fetchMessages('dm', activeConvId)
    else if (chatMode === 'group' && activeGroupId) fetchMessages('group', activeGroupId)
  }, [activeConvId, activeGroupId, chatMode, fetchMessages])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // ---- Polling for new messages ----
  useEffect(() => {
    const activeId = chatMode === 'dm' ? activeConvId : activeGroupId
    if (!activeId) { if (pollRef.current) clearInterval(pollRef.current); return }
    pollRef.current = setInterval(async () => {
      try {
        if (chatMode === 'dm') {
          const res = await messagesAPI.getNewMessages(activeId, lastMsgIdRef.current)
          if (res.data.status === 'success') {
            const newMsgs: Message[] = res.data.messages || []
            if (newMsgs.length > 0) {
              setMessages(prev => {
                const existingIds = new Set(prev.map(m => m.id))
                const fresh = newMsgs.filter(m => !existingIds.has(m.id))
                if (!fresh.length) return prev
                lastMsgIdRef.current = fresh[fresh.length - 1].id
                return [...prev, ...fresh]
              })
            }
            setOtherTyping(res.data.is_typing === true)
          }
        } else {
          const res = await chatGroupsAPI.getMessages(activeId, { per_page: 50 })
          if (res.data.status === 'success') {
            const newMsgs: Message[] = res.data.messages || []
            if (newMsgs.length > 0) {
              setMessages(prev => {
                const existingIds = new Set(prev.map(m => m.id))
                const fresh = newMsgs.filter(m => !existingIds.has(m.id))
                if (!fresh.length) return prev
                lastMsgIdRef.current = fresh[fresh.length - 1].id
                return [...prev, ...fresh]
              })
            }
          }
        }
      } catch {}
    }, POLL_INTERVAL)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [activeConvId, activeGroupId, chatMode])

  // ---- Typing ----
  const handleTyping = useCallback((typing: boolean) => {
    if (chatMode !== 'dm' || !activeConvId) return
    messagesAPI.typing(activeConvId, typing).catch(() => {})
  }, [activeConvId, chatMode])

  const onInputChange = (val: string) => {
    setMessageInput(val)
    if (chatMode !== 'dm' || !activeConvId) return
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    handleTyping(true)
    typingTimeoutRef.current = setTimeout(() => handleTyping(false), TYPING_TIMEOUT)
  }

  // ---- File picker ----
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      setSelectedFilePreview(URL.createObjectURL(file))
    } else {
      setSelectedFilePreview(null)
    }
    if (e.target) e.target.value = ''
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    setSelectedFilePreview(null)
  }

  // ---- Send message (DM or Group) ----
  const handleSend = async () => {
    if ((!messageInput.trim() && !selectedFile) || !currentUser) return
    const content = messageInput.trim()

    if (chatMode === 'group' && activeGroupId) {
      try {
        setSending(true)
        const formData = new FormData()
        formData.append('content', content || '')
        if (selectedFile) formData.append('file', selectedFile)

        const res = await chatGroupsAPI.sendMessage(activeGroupId, formData)
        if (res.data.status === 'success') {
          setMessages(p => [...p, res.data.message])
          setMessageInput('')
          clearSelectedFile()
          lastMsgIdRef.current = res.data.message.id
        }
      } catch {} finally { setSending(false) }
      return
    }

    // New conversation flow
    if (newConvUser) {
      try {
        setSending(true)
        const formData = new FormData()
        formData.append('receiver_id', String(newConvUser.id))
        formData.append('content', content || '')
        if (selectedFile) formData.append('file', selectedFile)

        const res = await messagesAPI.send(formData)
        if (res.data.status === 'success') {
          setMessageInput(''); clearSelectedFile(); handleTyping(false)
          const target = newConvUser; setNewConvUser(null)
          const convRes = await messagesAPI.getConversations()
          if (convRes.data.status === 'success') {
            setConversations(convRes.data.conversations || [])
            const nc = (convRes.data.conversations || []).find((c: Conversation) => c.user.id === target.id)
            if (nc) { setActiveConvId(nc.id); setMessages([res.data.message]); lastMsgIdRef.current = res.data.message.id }
            else setMessages([res.data.message])
          }
        }
      } catch {} finally { setSending(false) }
      return
    }

    const activeConv = conversations.find(c => c.id === activeConvId)
    if (!activeConv) return
    try {
      setSending(true)
      const formData = new FormData()
      formData.append('receiver_id', String(activeConv.user.id))
      formData.append('content', content || '')
      if (selectedFile) formData.append('file', selectedFile)

      const res = await messagesAPI.send(formData)
      if (res.data.status === 'success') {
        setMessages(p => [...p, res.data.message]); setMessageInput(''); clearSelectedFile(); handleTyping(false)
        lastMsgIdRef.current = res.data.message.id
        setConversations((prev: Conversation[]) => prev.map(c =>
          c.id === activeConvId
            ? { ...c, last_message: { id: res.data.message.id, content, created_at: res.data.message.created_at, is_mine: true, sender_id: res.data.message.sender_id }, unread_count: 0 }
            : c))
      }
    } catch {} finally { setSending(false) }
  }

  // ---- Select conversation / group ----
  const startChat = (user: User) => {
    const existing = conversations.find(c => c.user.id === user.id)
    if (existing) { setActiveConvId(existing.id); setChatMode('dm'); setNewConvUser(null); setActiveGroupId(null); lastMsgIdRef.current = 0 }
    else { setNewConvUser(user); setActiveConvId(null); setActiveGroupId(null); setMessages([]) }
    setSearchQuery('')
  }

  const openGroup = (group: ChatGroup) => {
    setActiveGroupId(group.id); setChatMode('group'); setActiveConvId(null); setNewConvUser(null); lastMsgIdRef.current = 0
    setSearchQuery('')
  }

  // ---- Create group ----
  const handleCreateGroup = async () => {
    if (!groupName.trim()) return
    try {
      const res = await chatGroupsAPI.create({ name: groupName.trim(), description: groupDesc.trim() })
      if (res.data.status === 'success') {
        setShowCreateGroup(false); setGroupName(''); setGroupDesc('')
        fetchGroups()
      }
    } catch {}
  }

  // ---- Call / Video ----
  const startAudioCall = () => {
    if (!chatUser || (activeConvId === null && activeGroupId === null) || !currentUser) return
    const uid = currentUser.id
    const otherId = chatUser?.id || 0
    const room = `call-${Math.min(uid, otherId)}-${Math.max(uid, otherId)}`
    window.open(`https://meet.jit.si/LearnForge-${room}`, '_blank', 'width=900,height=650')
  }

  const startVideoCall = () => {
    if (!chatUser || (activeConvId === null && activeGroupId === null) || !currentUser) return
    const uid = currentUser.id
    const otherId = chatUser?.id || 0
    const room = `video-${Math.min(uid, otherId)}-${Math.max(uid, otherId)}`
    window.open(`https://meet.jit.si/LearnForge-${room}`, '_blank', 'width=900,height=650')
  }

  // ---- Filter out self-conversations ----
  const safeConversations = conversations.filter(c => c.user.id !== currentUser?.id)

  // Derive active object
  const activeConv = safeConversations.find(c => c.id === activeConvId)
  const activeGroup = groups.find(g => g.id === activeGroupId)
  const chatUser = activeConv?.user || newConvUser
  const activeTitle = chatMode === 'group' ? activeGroup?.name : chatUser?.name
  const activeSubtitle = chatMode === 'group'
    ? `${activeGroup?.members_count || 0} member${activeGroup?.members_count !== 1 ? 's' : ''}`
    : chatUser
      ? (chatUser as any).is_online ? 'Active now' : 'Offline'
      : ''

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const formatMsgTime = (dateStr: string) => {
    const d = new Date(dateStr); const now = new Date()
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const filteredConversations = searchQuery.trim()
    ? safeConversations.filter(c =>
        c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : safeConversations

  const filteredGroups = searchQuery.trim()
    ? groups.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : groups

  return (
    <div className="relative" style={{ background: '#0B3B24' }}>
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative flex h-[calc(100vh-120px)] max-w-6xl mx-auto p-4 gap-0">
        {/* ===== LEFT SIDEBAR ===== */}
        <div className="bg-white border-r border-slate-100 w-80 flex flex-col rounded-l-2xl shadow-sm shrink-0 overflow-hidden">
          {/* Header with tabs */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Terminal</h2>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0B3B24]/10 hover:bg-[#0B3B24]/20 text-[#0B3B24] transition-colors"
                title="Create group"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Tabs */}
            <div className="flex gap-1 mb-3 bg-slate-100 rounded-xl p-0.5">
              <button
                onClick={() => { setSidebarTab('chats'); setSearchQuery('') }}
                className={cn(
                  'flex-1 text-xs font-medium py-1.5 rounded-lg transition-all',
                  sidebarTab === 'chats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Chats
              </button>
              <button
                onClick={() => { setSidebarTab('groups'); setSearchQuery('') }}
                className={cn(
                  'flex-1 text-xs font-medium py-1.5 rounded-lg transition-all',
                  sidebarTab === 'groups' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Channels
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${sidebarTab === 'chats' ? 'conversations' : 'channels'}...`}
                className="bg-slate-50 text-xs text-slate-800 rounded-xl py-2 pl-8 pr-3 border border-slate-200 focus:border-[#0B3B24] focus:outline-none placeholder-slate-400 w-full transition-colors"
              />
            </div>
          </div>

          {/* Contact / Group List */}
          <div className="flex-1 overflow-y-auto space-y-0.5 p-2">
            {sidebarTab === 'chats' ? (
              loadingConvs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    {searchQuery.trim() ? 'No conversations found' : 'No conversations yet'}
                  </p>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const isSelected = activeConvId === conv.id && chatMode === 'dm'
                  return (
                    <button
                      key={`dm-${conv.id}`}
                      onClick={() => startChat(conv.user)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 text-left',
                        isSelected
                          ? 'bg-emerald-50/60 border-l-4 border-[#0B3B24] shadow-sm'
                          : 'hover:bg-slate-50 border-l-4 border-transparent'
                      )}
                    >
                      {/* Avatar with online dot */}
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#065F46] to-[#047857] flex items-center justify-center text-white text-xs font-semibold">
                          {getInitials(conv.user.name)}
                        </div>
                        {(conv.user as any).is_online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] border-2 border-white rounded-full" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={cn('text-sm truncate', isSelected ? 'font-semibold text-slate-900' : 'font-medium text-slate-800')}>
                            {conv.user.name}
                          </span>
                          {conv.last_message && (
                            <span className="text-[11px] text-slate-400 shrink-0">
                              {formatMsgTime(conv.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {conv.last_message?.is_mine && <span className="text-[10px] text-slate-400 shrink-0">You: </span>}
                          <p className={cn('text-xs truncate', isSelected ? 'text-slate-600' : 'text-slate-400')}>
                            {conv.last_message?.content || 'No messages yet'}
                          </p>
                        </div>
                        {conv.is_typing && (
                          <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">typing...</p>
                        )}
                      </div>

                      {/* Unread badge */}
                      {conv.unread_count > 0 && (
                        <span className="h-5 min-w-[20px] text-[10px] bg-[#0B3B24] text-white font-semibold rounded-full flex items-center justify-center shrink-0 px-1.5">
                          {conv.unread_count > 99 ? '99+' : conv.unread_count}
                        </span>
                      )}
                    </button>
                  )
                })
              )
            ) : (
              // Groups tab
              loadingGroups ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    {searchQuery.trim() ? 'No channels found' : 'No channels yet'}
                  </p>
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="mt-3 text-xs text-[#0B3B24] font-medium hover:underline"
                  >
                    Create your first channel
                  </button>
                </div>
              ) : (
                filteredGroups.map(group => {
                  const isSelected = activeGroupId === group.id && chatMode === 'group'
                  return (
                    <button
                      key={`grp-${group.id}`}
                      onClick={() => openGroup(group)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 text-left',
                        isSelected
                          ? 'bg-emerald-50/60 border-l-4 border-[#0B3B24] shadow-sm'
                          : 'hover:bg-slate-50 border-l-4 border-transparent'
                      )}
                    >
                      {/* Group avatar */}
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0B3B24] to-[#065F46] flex items-center justify-center text-white text-xs font-semibold">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {group.type === 'channel' ? (
                              <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                            ) : (
                              <Users className="w-3 h-3 text-slate-400 shrink-0" />
                            )}
                            <span className={cn('text-sm truncate', isSelected ? 'font-semibold text-slate-900' : 'font-medium text-slate-800')}>
                              {group.name}
                            </span>
                          </div>
                          {group.last_message && (
                            <span className="text-[11px] text-slate-400 shrink-0">
                              {formatMsgTime(group.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className={cn('text-xs truncate', isSelected ? 'text-slate-600' : 'text-slate-400')}>
                            {group.last_message?.content || group.description || `${group.members_count} members`}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })
              )
            )}
          </div>
        </div>

        {/* ===== RIGHT CHAT PANEL ===== */}
        <div className="bg-white/95 backdrop-blur-md flex-1 flex flex-col rounded-r-2xl shadow-sm overflow-hidden">
          {!activeTitle ? (
            // Empty state
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6">
                <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700 mb-1">Your Terminal</h3>
                <p className="text-xs text-slate-400 max-w-xs">Select a conversation, a channel, or start a new chat</p>
              </div>
            </div>
          ) : (
            <>
              {/* Contact / Group Context Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {chatMode === 'group' ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B3B24] to-[#065F46] flex items-center justify-center text-white text-sm font-semibold">
                        {activeGroup?.name?.charAt(0).toUpperCase() || 'G'}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#065F46] to-[#047857] flex items-center justify-center text-white text-sm font-semibold">
                        {getInitials(chatUser?.name || '')}
                      </div>
                    )}
                    {chatMode === 'dm' && (chatUser as any)?.is_online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{activeTitle}</h3>
                    <p className="text-[11px] text-slate-400">
                      {activeSubtitle}
                      {newConvUser ? ' · New conversation' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={startAudioCall} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors" title="Audio call">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button onClick={startVideoCall} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors" title="Video call">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Bubble Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                  </div>
                ) : messages.length === 0 && !newConvUser ? (
                  <div className="text-center py-12">
                    <p className="text-xs text-slate-400">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isMine = msg.is_mine ?? msg.sender_id === currentUser?.id
                      const showAvatar = chatMode === 'dm' ? !isMine : !isMine
                      const senderName = msg.sender?.name
                      return (
                        <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                          {chatMode === 'group' && !isMine && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#065F46] to-[#047857] flex items-center justify-center text-white text-[9px] font-semibold shrink-0 mr-2 mt-1">
                              {getInitials(msg.sender?.name || '?')}
                            </div>
                          )}
                          {chatMode === 'dm' && !isMine && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#065F46] to-[#047857] flex items-center justify-center text-white text-[9px] font-semibold shrink-0 mr-2 mt-1">
                              {getInitials(chatUser?.name || '?')}
                            </div>
                          )}
                          <div className="max-w-md">
                            {chatMode === 'group' && !isMine && senderName && (
                              <p className="text-[10px] font-medium text-slate-500 mb-0.5 ml-1">{senderName}</p>
                            )}
                            <div
                              className={cn(
                                'text-sm p-3 shadow-sm',
                                isMine
                                  ? 'bg-[#0B3B24] text-white rounded-2xl rounded-tr-none ml-auto'
                                  : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-none'
                              )}
                            >
                              {msg.file_url && (
                                <div className="mb-2">
                                  {msg.file_url.match(/\.(jpeg|jpg|png|gif|svg|webp)/i) ? (
                                    <img
                                      src={msg.file_url}
                                      alt="Shared image"
                                      className="max-w-full rounded-xl max-h-60 object-cover cursor-pointer"
                                      onClick={() => msg.file_url && window.open(msg.file_url, '_blank')}
                                    />
                                  ) : (
                                    <a
                                      href={msg.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl p-2.5 hover:bg-emerald-100 transition-colors"
                                    >
                                      <FileText className="w-4 h-4 shrink-0" />
                                      <span className="text-xs font-medium truncate">
                                        {msg.file_url.split('/').pop()}
                                      </span>
                                    </a>
                                  )}
                                </div>
                              )}
                              {msg.content && <div className="whitespace-pre-wrap break-words">{msg.content}</div>}
                            </div>
                            <div className={cn('flex items-center gap-1 mt-0.5', isMine ? 'justify-end' : 'justify-start')}>
                              <span className="text-[10px] text-slate-400">{formatMsgTime(msg.created_at)}</span>
                              {isMine && (
                                msg.read_at
                                  ? <CheckCheck className="w-3 h-3 text-emerald-500" />
                                  : <Check className="w-3 h-3 text-slate-300" />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {otherTyping && chatMode === 'dm' && (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#065F46] to-[#047857] flex items-center justify-center text-white text-[9px] font-semibold shrink-0">
                          {getInitials(chatUser?.name || '')}
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-2.5">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input Bar */}
              <div className="px-4 py-3 bg-white border-t border-slate-100">
                {selectedFile && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                    {selectedFilePreview ? (
                      <img src={selectedFilePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={clearSelectedFile}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.zip,.mp4,.webm"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <input
                    type="text"
                    value={messageInput}
                    onChange={e => onInputChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder={chatMode === 'group'
                      ? `Message #${activeGroup?.name || 'channel'}...`
                      : 'Write a secure message to your peer classmate...'}
                    className="flex-1 bg-slate-50 text-sm text-slate-800 rounded-xl py-2.5 px-4 border border-slate-200 focus:border-[#0B3B24] focus:outline-none placeholder-slate-400 transition-colors"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={(!messageInput.trim() && !selectedFile) || sending}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0B3B24] hover:bg-[#072416] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateGroup(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 mb-4">Create Channel</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Channel name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="e.g. project-alpha"
                  className="w-full bg-slate-50 text-sm text-slate-800 rounded-xl py-2.5 px-4 border border-slate-200 focus:border-[#0B3B24] focus:outline-none placeholder-slate-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Description (optional)</label>
                <textarea
                  value={groupDesc}
                  onChange={e => setGroupDesc(e.target.value)}
                  placeholder="What's this channel about?"
                  rows={3}
                  className="w-full bg-slate-50 text-sm text-slate-800 rounded-xl py-2.5 px-4 border border-slate-200 focus:border-[#0B3B24] focus:outline-none placeholder-slate-400 transition-colors resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim()}
                  className="flex-1 text-sm font-medium py-2.5 rounded-xl bg-[#0B3B24] text-white hover:bg-[#072416] transition-colors disabled:opacity-40"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
