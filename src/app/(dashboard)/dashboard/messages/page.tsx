'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatDateRelative, getImageUrl } from '@/lib/utils'
import { ProfileAvatar } from '@/components/ui/profile-avatar'
import { messagesAPI, chatGroupsAPI, settingsAPI, chatAPI, adminAPI } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { useOnlineStore } from '@/store/useOnlineStore'
import { getEcho, disconnectEcho } from '@/lib/echo'
import { useTheme } from 'next-themes'
import type Echo from 'laravel-echo'
import type { Conversation, Message, User, ChatGroup, ChatGroupMember } from '@/types'

const POLL_INTERVAL = 3000
const TYPING_TIMEOUT = 1500

const ALL_EMOJIS = [
  '😊','😂','🥰','😍','🤩','😎','🤗','😇','😉','😅','🤣','😁','😋','🤔','🙄','😐',
  '😢','😭','😤','😡','🥺','😰','😱','🤯','👍','👎','👊','✊','🙌','👏','💪','🤝',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🔥','💯','✨','⭐','🌟','🎉','🎊','🎈',
  '💀','☠️','👋','✌️','🤞','🖖','🤙','💅','🐱','🐶','🐼','🐸','🐒','🦄','🐲','🌈',
]

function UserAvatar({ user, size = 'md', className }: { user: { name: string; avatar?: string | null; chat_avatar_url?: string | null }; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const src = (user as any).avatar_url || (user as any).photo || user.chat_avatar_url || user.avatar
  return <ProfileAvatar src={src || null} name={user.name} size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'} className={className} />
}

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-bold', className)}>{children}</span>
}

export default function MessagesPage() {
  const currentUser = useAuthStore(s => s.user)
  const [showMobileList, setShowMobileList] = useState(true)
  const [navModule, setNavModule] = useState<'chats' | 'groups'>('chats')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)

  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null)
  const [newConvUser, setNewConvUser] = useState<User | null>(null)

  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [sending, setSending] = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [delMsgId, setDelMsgId] = useState<number | null>(null)
  const [delConvTargetId, setDelConvTargetId] = useState<number | null>(null)
  const [openMenuMsgId, setOpenMenuMsgId] = useState<number | null>(null)
  const [replyToMsg, setReplyToMsg] = useState<Message | null>(null)
  const [pinnedIds, setPinnedIds] = useState<Set<number>>(new Set())
  const [callModal, setCallModal] = useState<'audio' | 'video' | null>(null)
  const [groupChatMsgs, setGroupChatMsgs] = useState<any[]>([])

  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)
  const [confirmDeleteConv, setConfirmDeleteConv] = useState(false)
  const [deletingConv, setDeletingConv] = useState(false)
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(false)
  const [deletingUser, setDeletingUser] = useState(false)
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [pinnedConvIds, setPinnedConvIds] = useState<Set<number>>(new Set())
  const [mutedConvIds, setMutedConvIds] = useState<Record<number, string | null>>({})
  const [archivedConvIds, setArchivedConvIds] = useState<Set<number>>(new Set())
  const [showArchived, setShowArchived] = useState(false)
  const [inThreadSearch, setInThreadSearch] = useState('')
  const [inThreadResults, setInThreadResults] = useState<Message[]>([])
  const [searchingInThread, setSearchingInThread] = useState(false)
  const [showSharedMedia, setShowSharedMedia] = useState(false)
  const [sharedMedia, setSharedMedia] = useState<any[]>([])
  const [loadingSharedMedia, setLoadingSharedMedia] = useState(false)
  const [blockedUserIds, setBlockedUserIds] = useState<Set<number>>(new Set())
  const [showMuteOptions, setShowMuteOptions] = useState(false)
  const [exportingChat, setExportingChat] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState<number | null>(null)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [groupMembers, setGroupMembers] = useState<ChatGroupMember[]>([])
  const [loadingGroupMembers, setLoadingGroupMembers] = useState(false)
  const [showGroupMenu, setShowGroupMenu] = useState(false)
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [deletingGroup, setDeletingGroup] = useState(false)
  const [confirmLeaveGroup, setConfirmLeaveGroup] = useState(false)
  const [leavingGroup, setLeavingGroup] = useState(false)
  const [createGroupError, setCreateGroupError] = useState('')
  const [groupListMenuGroupId, setGroupListMenuGroupId] = useState<number | null>(null)
  const groupListMenuRef = useRef<HTMLDivElement>(null)

  const [msgNotifications, setMsgNotifications] = useState(() => localStorage.getItem('msg_notifications') !== 'false')
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('msg_sound') !== 'false')
  const [readReceipts, setReadReceipts] = useState(() => localStorage.getItem('msg_read_receipts') !== 'false')
  const [showOnlineStatus, setShowOnlineStatus] = useState(() => localStorage.getItem('msg_online_status') !== 'false')
  const { theme: themeMode, setTheme: setThemeMode } = useTheme()

  const msgEndRef = useRef<HTMLDivElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const typingRef = useRef<NodeJS.Timeout | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const headerMenuRef = useRef<HTMLDivElement>(null)
  const groupMenuRef = useRef<HTMLDivElement>(null)
  const lastMsgIdRef = useRef<number>(0)
  const echoRef = useRef<Echo<any> | null>(null)
  const notifSoundRef = useRef<HTMLAudioElement | null>(null)
  const soundEnabledRef = useRef(soundEnabled)
  const readReceiptsRef = useRef(readReceipts)
  const msgNotificationsRef = useRef(msgNotifications)
  const mutedConvIdsRef = useRef(mutedConvIds)

  const safeConvs = conversations.filter(c => c.user?.id !== currentUser?.id)
  const rawOnlineUserIds = useOnlineStore(s => s.onlineUserIds)
  const onlineUserIds = showOnlineStatus ? rawOnlineUserIds : new Set<number>()

  useEffect(() => {
    settingsAPI.get().then(r => {
      const s = r.data?.settings
      if (!s) return
      setMsgNotifications(s.notifications_enabled)
      setSoundEnabled(s.sound_enabled)
      setReadReceipts(s.read_receipts_enabled)
      setShowOnlineStatus(s.show_online_status)
      setThemeMode(s.theme || 'light')
    }).catch(() => {})
  }, [])

  useEffect(() => { if (toastMsg) { const t = setTimeout(() => setToastMsg(''), 2000); return () => clearTimeout(t) } }, [toastMsg])

  const updateSetting = (key: string, value: boolean | string, label?: string) => {
    setToastMsg(label ? `${label} ${value === true || value === 'light' ? 'enabled' : value === 'dark' ? 'dark mode' : 'disabled'}` : 'Saved')
    if (key === 'show_online_status') {
      localStorage.setItem('msg_online_status', String(value))
      settingsAPI.update({ show_online_status: value }).catch(() => setToastMsg('Failed to save'))
    } else if (key === 'theme') {
      localStorage.setItem('msg_theme', value as string)
      settingsAPI.update({ theme: value }).catch(() => setToastMsg('Failed to save'))
    } else {
      localStorage.setItem(`msg_${key}`, String(value))
      settingsAPI.update({ [`${key}_enabled`]: value }).catch(() => setToastMsg('Failed to save'))
    }
  }

  const playNotificationSound = () => {
    if (msgNotificationsRef.current && soundEnabledRef.current && notifSoundRef.current) {
      notifSoundRef.current.currentTime = 0
      notifSoundRef.current.play().catch(() => {})
    }
  }

  soundEnabledRef.current = soundEnabled
  readReceiptsRef.current = readReceipts
  msgNotificationsRef.current = msgNotifications
  mutedConvIdsRef.current = mutedConvIds

  useEffect(() => {
    notifSoundRef.current = new Audio('/sounds/notification.mp3')
    return () => { notifSoundRef.current = null }
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuMsgId(null)
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) setShowHeaderMenu(false)
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target as Node)) setShowGroupMenu(false)
      if (groupListMenuRef.current && !groupListMenuRef.current.contains(e.target as Node)) setGroupListMenuGroupId(null)
    }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  const fetchConversations = useCallback(async () => {
    try { const r = await messagesAPI.getConversations(); if (r.data.status === 'success') setConversations(r.data.conversations || []) } catch {} finally { setLoadingConvs(false) }
  }, [])

  const fetchAllUsers = useCallback(async () => {
    try {
      setLoadingUsers(true)
      const r = await messagesAPI.getEligibleUsers()
      const users: User[] = r.data?.users || []
      const seen = new Set<string>()
      setAllUsers(users.filter((u: User) => {
        if (u?.id === currentUser?.id) return false
        const key = u.name.toLowerCase().trim()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      }))
    } catch {} finally { setLoadingUsers(false) }
  }, [currentUser])

  const fetchGroups = useCallback(async () => {
    try {
      setLoadingGroups(true)
      const r = await chatGroupsAPI.getAll()
      setChatGroups(r.data?.groups || r.data?.data || [])
    } catch {} finally { setLoadingGroups(false) }
  }, [])

  useEffect(() => { fetchConversations(); fetchAllUsers(); fetchGroups() }, [fetchConversations, fetchAllUsers, fetchGroups])

  const fetchMessages = useCallback(async (convId: number) => {
    try {
      setLoadingMsgs(true)
      const r = await messagesAPI.getMessages(convId, { mark_read: readReceipts ? '1' : '0' })
      if (r.data.status === 'success') {
        const msgs = r.data.messages || []
        setMessages(msgs)
        if (msgs.length > 0) lastMsgIdRef.current = msgs[msgs.length - 1].id
        setConversations(p => p.map(c => c.id === convId ? { ...c, unread_count: 0 } : c))
      }
    } catch {} finally { setLoadingMsgs(false) }
  }, [readReceipts])

  const fetchGroupMessages = useCallback(async (gid: number) => {
    try {
      setLoadingMsgs(true)
      const r = await chatGroupsAPI.getMessages(gid)
      setGroupChatMsgs(r.data?.messages || r.data?.data || [])
    } catch {} finally { setLoadingMsgs(false) }
  }, [])

  const fetchGroupMembers = useCallback(async (gid: number) => {
    try {
      setLoadingGroupMembers(true)
      const r = await chatGroupsAPI.getOne(gid)
      setGroupMembers(r.data?.group?.members || r.data?.data?.members || [])
    } catch {} finally { setLoadingGroupMembers(false) }
  }, [])

  useEffect(() => { if (activeConvId) { fetchMessages(activeConvId); setShowMobileList(false) } }, [activeConvId, fetchMessages])
  useEffect(() => { if (activeGroupId) { fetchGroupMessages(activeGroupId); setShowMobileList(false) } }, [activeGroupId, fetchGroupMessages])
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, groupChatMsgs])

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    try { echoRef.current = getEcho(token) } catch { return }
    const { setOnline, addOnline, removeOnline } = useOnlineStore.getState()
    const presenceChannel = echoRef.current.join('online')
    presenceChannel.here((users: any[]) => { setOnline(users.map((u: any) => u.id)) })
    presenceChannel.joining((user: any) => { addOnline(user.id) })
    presenceChannel.leaving((user: any) => { removeOnline(user.id) })
    return () => { try { disconnectEcho() } catch {} }
  }, [])

  useEffect(() => {
    const echo = echoRef.current
    if (!echo) return

    if (activeConvId) {
      const channel = echo.channel(`conversation.${activeConvId}`)
      channel.listen('.MessageSent', (e: any) => {
        const msg = e.message || e
        if (msg.sender_id !== currentUser?.id) {
          setMessages((prev: Message[]) => {
            if (prev.some(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          lastMsgIdRef.current = msg.id
          msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          const muted = mutedConvIdsRef.current
          const isMuted = activeConvId && (activeConvId in muted) && (!muted[activeConvId] || new Date(muted[activeConvId]) > new Date())
          if (!isMuted) playNotificationSound()
        }
      })
      channel.listen('.MessageRead', () => {
        if (!readReceiptsRef.current) return
        setMessages((prev: Message[]) => prev.map(m => m.read_at ? m : { ...m, read_at: new Date().toISOString() }))
      })
      channel.listen('.MessageDeleted', (e: any) => {
        const msgId = e.message_id || e.id
        if (msgId) setMessages((prev: Message[]) => prev.map(m => m.id === msgId ? { ...m, content: null, file_url: null, deleted_at: new Date().toISOString() } : m))
      })
      const typingChannel = echo.channel(`typing.${activeConvId}`)
      typingChannel.listen('.Typing', (e: any) => {
        if (e.user_id !== currentUser?.id) setOtherTyping(e.is_typing === true)
      })
    }

    if (activeGroupId) {
      const channel = echo.channel(`group.${activeGroupId}`)
      channel.listen('.GroupMessageSent', (e: any) => {
        const msg = e.message || e
        if (msg.sender_id !== currentUser?.id) {
          setGroupChatMsgs((prev: any[]) => {
            if (prev.some(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          const muted = mutedConvIdsRef.current
          const isGroupMuted = activeGroupId && (activeGroupId in muted) && (!muted[activeGroupId] || new Date(muted[activeGroupId]) > new Date())
          if (!isGroupMuted) playNotificationSound()
        }
      })
      channel.listen('.GroupDeleted', (e: any) => {
        setChatGroups((prev: ChatGroup[]) => prev.filter(g => g.id !== e.group_id))
        setActiveGroupId(null)
        setGroupChatMsgs([])
        setShowMobileList(true)
      })
      channel.listen('.MemberLeft', (e: any) => {
        setChatGroups((prev: ChatGroup[]) => prev.map(g => g.id === e.group_id ? { ...g, members_count: Math.max(0, (g.members_count || 1) - 1) } : g))
      })
      channel.listen('.GroupMessageDeleted', (e: any) => {
        const msgId = e.id
        if (msgId) setGroupChatMsgs((prev: any[]) => prev.map(m => m.id === msgId ? { ...m, content: null, file_url: null, deleted_at: new Date().toISOString() } : m))
      })
    }

    return () => {
      if (activeConvId) {
        try { echo.leave(`conversation.${activeConvId}`); echo.leave(`typing.${activeConvId}`) } catch {}
      }
      if (activeGroupId) {
        try { echo.leave(`group.${activeGroupId}`) } catch {}
      }
    }
  }, [activeConvId, activeGroupId])

  useEffect(() => {
    if (!activeConvId) { if (pollRef.current) clearInterval(pollRef.current); return }
    pollRef.current = setInterval(async () => {
      try {
        const r = await messagesAPI.getNewMessages(activeConvId, lastMsgIdRef.current)
        if (r.data.status === 'success') {
          const newMsgs = r.data.messages || []
          if (newMsgs.length > 0) {
            setMessages((prev: Message[]) => {
              const ids = new Set(prev.map(m => m.id))
              const fresh = newMsgs.filter((m: Message) => !ids.has(m.id))
              if (!fresh.length) return prev
              lastMsgIdRef.current = fresh[fresh.length - 1].id
              return [...prev, ...fresh]
            })
              const muted = mutedConvIdsRef.current
              const isMuted = activeConvId && (activeConvId in muted) && (!muted[activeConvId] || new Date(muted[activeConvId]) > new Date())
              if (!isMuted) playNotificationSound()
            }
            setOtherTyping(r.data.is_typing === true)
        }
      } catch {}
    }, POLL_INTERVAL)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [activeConvId])

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const t = setTimeout(async () => {
      try {
        setSearching(true)
        const r = await messagesAPI.getEligibleUsers(searchQuery.trim())
        const users: User[] = r.data?.users || []
        setSearchResults(users.filter((u: User) => u?.id !== currentUser?.id))
      } catch {} finally { setSearching(false) }
    }, 400)
    return () => clearTimeout(t)
  }, [searchQuery, currentUser])

  const safeSearchResults = searchResults.filter(u => u.id !== currentUser?.id)

  const selectConv = (c: Conversation) => { setActiveConvId(c.id); setNewConvUser(null); setActiveGroupId(null); lastMsgIdRef.current = 0; setShowHeaderMenu(false); setOpenMenuMsgId(null); setReplyToMsg(null) }
  const startChat = (u: User) => {
    if (u.id === currentUser?.id) return
    const ex = conversations.find(c => c.user?.id === u.id)
    if (ex) selectConv(ex)
    else { setNewConvUser(u); setActiveConvId(null); setActiveGroupId(null); setMessages([]) }
    setSearchQuery(''); setSearchResults([]); setReplyToMsg(null)
  }
  const selectGroup = (g: ChatGroup) => { setActiveGroupId(g.id); setActiveConvId(null); setNewConvUser(null); setMessages([]); setGroupChatMsgs([]); setShowMobileList(false); setOpenMenuMsgId(null); setReplyToMsg(null) }

  const handleTyping = useCallback((t: boolean) => { if (activeConvId) messagesAPI.typing(activeConvId, t).catch(() => {}) }, [activeConvId])
  const onInputChange = (val: string) => {
    setMessageInput(val)
    if (!activeConvId) return
    if (typingRef.current) clearTimeout(typingRef.current)
    handleTyping(true)
    typingRef.current = setTimeout(() => handleTyping(false), TYPING_TIMEOUT)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setSelectedFile(f); setSelectedFilePreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null)
    if (e.target) e.target.value = ''
  }
  const clearFile = () => { setSelectedFile(null); setSelectedFilePreview(null) }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const u = useAuthStore.getState().user
    if (!u) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData(); fd.append('avatar', f)
      const res = await chatAPI.updateAvatar(fd)
      const returnedUser = res.data?.user
      if (returnedUser?.chat_avatar_url) {
        useAuthStore.getState().setUser({ ...u, chat_avatar_url: returnedUser.chat_avatar_url })
      }
      setLoadingUsers(true)
      const [r, cr] = await Promise.all([messagesAPI.getEligibleUsers(), messagesAPI.getConversations()])
      setAllUsers((r.data?.users || []).filter((x: User) => x.id !== u.id))
      if (cr.data?.status === 'success') setConversations(cr.data.conversations || [])
    } catch {} finally { setUploadingAvatar(false); if (e.target) e.target.value = '' }
  }

  const handleSend = async () => {
    if ((!messageInput.trim() && !selectedFile && !replyToMsg) || !currentUser) return
    const content = messageInput.trim()
    const replyToId = replyToMsg?.id || undefined
    const existingConv = activeConvId ? conversations.find(c => c.id === activeConvId) : null

    const optimisticId = -Date.now()
    const optimisticMsg = {
      id: optimisticId,
      sender_id: currentUser.id,
      receiver_id: newConvUser?.id || existingConv?.user?.id || 0,
      content,
      file_url: null,
      created_at: new Date().toISOString(),
      read_at: null,
      deleted_at: null,
      reply_to_id: replyToId || null,
      reply_to: replyToMsg ? { id: replyToMsg.id, content: replyToMsg.content, sender: replyToMsg.sender || { id: replyToMsg.sender_id, name: replyToMsg.sender_id === currentUser.id ? currentUser.name : (existingConv?.user?.name || '') } } : null,
    }
    setMessageInput(''); setReplyToMsg(null); clearFile(); handleTyping(false)

    if (newConvUser) {
      setMessages([optimisticMsg])
      try {
        setSending(true)
        const fd = new FormData(); fd.append('receiver_id', String(newConvUser.id)); fd.append('content', content || '')
        if (replyToId) fd.append('reply_to_id', String(replyToId))
        if (selectedFile) fd.append('file', selectedFile)
        const r = await messagesAPI.send(fd)
        if (r.data.status === 'success') {
          const target = newConvUser; setNewConvUser(null)
          const cr = await messagesAPI.getConversations()
          if (cr.data.status === 'success') {
            setConversations(cr.data.conversations || [])
            const nc = (cr.data.conversations || []).find((c: Conversation) => c.user?.id === target.id)
            if (nc) { setActiveConvId(nc.id); setMessages([r.data.message]); lastMsgIdRef.current = r.data.message.id }
            else setMessages([r.data.message])
          }
        } else { setMessages([]) }
      } catch { setMessages([]) } finally { setSending(false) }
      return
    }

    if (activeGroupId) {
      setGroupChatMsgs((prev: any[]) => [...prev, optimisticMsg])
      try {
        setSending(true)
        const fd = new FormData(); fd.append('content', content || '')
        if (replyToId) fd.append('reply_to_id', String(replyToId))
        if (selectedFile) fd.append('file', selectedFile)
        const r = await chatGroupsAPI.sendMessage(activeGroupId, fd)
        if (r.data?.status === 'success') {
          const real = r.data.message || r.data.data
          setGroupChatMsgs((prev: any[]) => prev.map(m => m.id === optimisticId ? real : m))
        } else { setGroupChatMsgs((prev: any[]) => prev.filter(m => m.id !== optimisticId)) }
      } catch { setGroupChatMsgs((prev: any[]) => prev.filter(m => m.id !== optimisticId)) } finally { setSending(false) }
      return
    }

    if (!existingConv) return
    setMessages((prev: Message[]) => [...prev, optimisticMsg as any])
    try {
      setSending(true)
      const fd = new FormData(); fd.append('receiver_id', String(existingConv.user.id)); fd.append('content', content || '')
      if (replyToId) fd.append('reply_to_id', String(replyToId))
      if (selectedFile) fd.append('file', selectedFile)
      const r = await messagesAPI.send(fd)
      if (r.data.status === 'success') {
        const real = r.data.message
        setMessages((prev: Message[]) => prev.map(m => m.id === optimisticId ? real : m))
        lastMsgIdRef.current = real.id
        setConversations((prev: Conversation[]) => prev.map(c => c.id === activeConvId ? { ...c, last_message: { id: real.id, content, created_at: real.created_at, is_mine: true, sender_id: real.sender_id }, unread_count: 0 } : c))
      } else { setMessages((prev: Message[]) => prev.filter(m => m.id !== optimisticId)) }
    } catch { setMessages((prev: Message[]) => prev.filter(m => m.id !== optimisticId)) } finally { setSending(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  const handleDelete = async (id: number) => {
    setDelMsgId(id)
    setOpenMenuMsgId(null)
    setMessages((prev: Message[]) => prev.map(m => m.id === id ? { ...m, content: null, file_url: null, deleted_at: new Date().toISOString() } : m))
    setGroupChatMsgs((prev: any[]) => prev.map(m => m.id === id ? { ...m, content: null, file_url: null, deleted_at: new Date().toISOString() } : m))
    try { await messagesAPI.delete(id) } catch {} finally { setDelMsgId(null) }
  }

  const handleDeleteConversation = async () => {
    if (!delConvTargetId) return
    setDeletingConv(true)
    try {
      await messagesAPI.deleteConversation(delConvTargetId)
      setConversations((prev: Conversation[]) => prev.filter(c => c.id !== delConvTargetId))
      if (activeConvId === delConvTargetId) { setActiveConvId(null); setNewConvUser(null); setMessages([]); setShowMobileList(true) }
    } catch {} finally { setDeletingConv(false); setConfirmDeleteConv(false); setShowHeaderMenu(false); setDelConvTargetId(null) }
  }

  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return
    setDeletingUser(true)
    try {
      await adminAPI.deleteUser(deleteUserTarget.id)
      setAllUsers((prev: User[]) => prev.filter(u => u.id !== deleteUserTarget.id))
      setConversations((prev: Conversation[]) => prev.filter(c => c.user?.id !== deleteUserTarget.id))
      if (activeConvId) {
        const active = conversations.find(c => c.id === activeConvId)
        if (active?.user?.id === deleteUserTarget.id) { setActiveConvId(null); setNewConvUser(null); setMessages([]); setShowMobileList(true) }
      }
      setToastMsg('User deleted')
    } catch (e) { console.error('delete user fail', e); setToastMsg('Failed to delete user') } finally { setDeletingUser(false); setConfirmDeleteUser(false); setDeleteUserTarget(null) }
  }

  const togglePin = (id: number) => { setPinnedIds(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n }); setOpenMenuMsgId(null) }
  const handleReply = (m: Message) => { setReplyToMsg(m); setOpenMenuMsgId(null) }
  const cancelReply = () => setReplyToMsg(null)

  const startAudio = () => { if (chatUser && (activeConvId !== null || newConvUser)) setCallModal('audio') }
  const startVideo = () => { if (chatUser && (activeConvId !== null || newConvUser)) setCallModal('video') }
  const launchJitsi = (t: 'audio' | 'video') => {
    if (!chatUser) return
    const room = `${t === 'audio' ? 'call' : 'video'}-${Math.min(currentUser!.id, chatUser.id)}-${Math.max(currentUser!.id, chatUser.id)}`
    window.open(`https://meet.jit.si/LearnForge-${room}`, '_blank', 'width=900,height=650')
    setCallModal(null)
  }

  const creatingRef = useRef(false)

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || creatingRef.current) return
    creatingRef.current = true
    setCreatingGroup(true)
    try {
      setCreateGroupError('')
      await chatGroupsAPI.create({ name: newGroupName, description: newGroupDesc, member_ids: selectedMembers })
      setShowCreateGroup(false); setNewGroupName(''); setNewGroupDesc(''); setSelectedMembers([])
      await fetchGroups()
    } catch (e: any) {
      const msg = e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(', ') : e?.response?.data?.message || 'Failed to create group'
      setCreateGroupError(msg)
    } finally { setCreatingGroup(false); creatingRef.current = false }
  }

  const handleDeleteGroup = async () => {
    if (!activeGroup) return
    setDeletingGroup(true)
    try {
      await chatGroupsAPI.delete(activeGroup.id)
      setChatGroups((p: ChatGroup[]) => p.filter(g => g.id !== activeGroup.id))
      setActiveGroupId(null); setShowMobileList(true)
    } catch {} finally { setDeletingGroup(false); setConfirmDeleteGroup(false); setShowGroupMenu(false) }
  }

  const handleLeaveGroup = async () => {
    if (!activeGroup) return
    setLeavingGroup(true)
    try {
      await chatGroupsAPI.leave(activeGroup.id)
      setChatGroups((p: ChatGroup[]) => p.filter(g => g.id !== activeGroup.id))
      setActiveGroupId(null); setShowMobileList(true)
    } catch {} finally { setLeavingGroup(false); setConfirmLeaveGroup(false); setShowGroupMenu(false) }
  }

  const handleAddMember = async (uid: number) => {
    if (!activeGroup) return
    try {
      await chatGroupsAPI.addMember(activeGroup.id, uid)
      if (showGroupInfo) await fetchGroupMembers(activeGroup.id)
    } catch {}
  }

  const handleRemoveMember = async (uid: number) => {
    if (!activeGroup) return
    try {
      await chatGroupsAPI.removeMember(activeGroup.id, uid)
      setGroupMembers((p: ChatGroupMember[]) => p.filter(m => m.id !== uid))
      await fetchGroups()
    } catch {}
  }

  const toggleMemberSelect = (id: number) => {
    setSelectedMembers((p: number[]) => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  // ── New feature handlers ──

  const handlePinConvToggle = async (convId: number) => {
    const wasPinned = pinnedConvIds.has(convId)
    setPinnedConvIds(p => { const n = new Set(p); if (n.has(convId)) n.delete(convId); else n.add(convId); return n })
    setShowHeaderMenu(false)
    try {
      if (wasPinned) await messagesAPI.unpinConversation(convId)
      else await messagesAPI.pinConversation(convId)
    } catch { setPinnedConvIds(p => { const n = new Set(p); if (wasPinned) n.add(convId); else n.delete(convId); return n }); setToastMsg('Failed to update pin') }
  }

  const handleMuteConv = async (convId: number, duration: string | null) => {
    setMutedConvIds(p => ({ ...p, [convId]: duration === 'forever' ? null : new Date(Date.now() + (duration === '1h' ? 3600000 : 28800000)).toISOString() }))
    setShowMuteOptions(false); setShowHeaderMenu(false)
    try {
      if (duration === 'forever') await messagesAPI.muteConversation(convId, 'forever')
      else await messagesAPI.muteConversation(convId, duration || '8h')
    } catch { setMutedConvIds(p => { const n = { ...p }; delete n[convId]; return n }); setToastMsg('Failed to mute') }
  }

  const handleUnmuteConv = async (convId: number) => {
    setMutedConvIds(p => { const n = { ...p }; delete n[convId]; return n })
    setShowHeaderMenu(false)
    try { await messagesAPI.unmuteConversation(convId) } catch { setToastMsg('Failed to unmute') }
  }

  const handleMarkUnread = async (convId: number) => {
    setConversations(p => p.map(c => c.id === convId ? { ...c, unread_count: Math.max(c.unread_count, 1) || 1 } : c))
    setShowHeaderMenu(false)
    try { await messagesAPI.markUnread(convId) } catch { setToastMsg('Failed to mark unread') }
  }

  const handleInThreadSearch = useCallback(async (query: string) => {
    setInThreadSearch(query)
    if (!query.trim() || !activeConvId) { setInThreadResults([]); return }
    setSearchingInThread(true)
    try {
      const r = await messagesAPI.searchInConversation(activeConvId, query)
      setInThreadResults(r.data?.messages || r.data?.results || [])
    } catch {} finally { setSearchingInThread(false) }
  }, [activeConvId])

  const handleOpenSharedMedia = async (convId: number) => {
    setShowSharedMedia(true); setShowHeaderMenu(false); setLoadingSharedMedia(true)
    try {
      const r = await messagesAPI.getSharedMedia(convId)
      setSharedMedia(r.data?.media || r.data?.files || r.data?.data || [])
    } catch {} finally { setLoadingSharedMedia(false) }
  }

  const handleExportChat = async (convId: number) => {
    setShowHeaderMenu(false); setExportingChat(true)
    try {
      const r = await messagesAPI.exportChat(convId)
      const blob = new Blob([r.data], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `chat-${convId}-export.txt`; a.click()
      window.URL.revokeObjectURL(url)
      setToastMsg('Chat exported')
    } catch { setToastMsg('Failed to export chat') } finally { setExportingChat(false) }
  }

  const handleArchiveToggle = async (convId: number) => {
    const wasArchived = archivedConvIds.has(convId)
    setArchivedConvIds(p => { const n = new Set(p); if (n.has(convId)) n.delete(convId); else n.add(convId); return n })
    setShowHeaderMenu(false)
    if (activeConvId === convId && !wasArchived) { setActiveConvId(null); setMessages([]); setShowMobileList(true) }
    try {
      if (wasArchived) await messagesAPI.unarchiveConversation(convId)
      else await messagesAPI.archiveConversation(convId)
    } catch { setArchivedConvIds(p => { const n = new Set(p); if (wasArchived) n.add(convId); else n.delete(convId); return n }); setToastMsg('Failed to update archive') }
  }

  const handleBlockUser = async (userId: number) => {
    setBlockedUserIds(p => { const n = new Set(p); n.add(userId); return n })
    setShowBlockConfirm(false); setShowHeaderMenu(false)
    try { await messagesAPI.blockUser(userId) } catch { setBlockedUserIds(p => { const n = new Set(p); n.delete(userId); return n }); setToastMsg('Failed to block user') }
  }

  const handleUnblockUser = async (userId: number) => {
    setBlockedUserIds(p => { const n = new Set(p); n.delete(userId); return n })
    try { await messagesAPI.unblockUser(userId); setToastMsg('User unblocked') } catch { setToastMsg('Failed to unblock user') }
  }

  const isConvMuted = (convId: number) => {
    const expiry = mutedConvIds[convId]
    if (!expiry) return convId in mutedConvIds
    return new Date(expiry) > new Date()
  }

  const sortedConvs = (() => {
    const convs = safeConvs.filter(c => !archivedConvIds.has(c.id))
    return [...convs].sort((a, b) => {
      const aPinned = pinnedConvIds.has(a.id)
      const bPinned = pinnedConvIds.has(b.id)
      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1
      const aTime = a.last_message?.created_at || a.created_at
      const bTime = b.last_message?.created_at || b.created_at
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
  })()
  const archivedConvs = safeConvs.filter(c => archivedConvIds.has(c.id))

  const isConvBlocked = (convId: number) => {
    const conv = safeConvs.find(c => c.id === convId)
    return conv?.user?.id ? blockedUserIds.has(conv.user.id) : false
  }

  // When fetching conversations, also fetch blocked users
  useEffect(() => {
    messagesAPI.getBlockedUsers().then(r => {
      const blocked = r.data?.users || r.data?.blocked || []
      setBlockedUserIds(new Set(blocked.map((u: any) => u.id || u)))
    }).catch(() => {})
  }, [])

  const activeConv = safeConvs.find(c => c.id === activeConvId)
  const chatUser = activeConv?.user || newConvUser
  const activeGroup = chatGroups.find(g => g.id === activeGroupId)

  const formatTime = (d: string) => {
    const dt = new Date(d)
    const h = dt.getHours(), m = dt.getMinutes(), ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  const formatDateSeparator = (d: string) => {
    const dt = new Date(d)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return dt.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: dt.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }

  const isSameDay = (a: string, b: string) => {
    if (!a || !b) return false
    return new Date(a).toDateString() === new Date(b).toDateString()
  }

  const goBack = () => { setShowMobileList(true); setActiveConvId(null); setActiveGroupId(null); setNewConvUser(null); setShowHeaderMenu(false); setReplyToMsg(null) }

  const filteredConvs = sortedConvs.filter(c => !searchQuery || c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredGroups = chatGroups.filter(g => !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // ──────────────────────────────────────────────
  // RENDER HELPERS
  // ──────────────────────────────────────────────

  const renderSidebarHeader = () => (
    <div className="bg-gradient-to-b from-emerald-50/80 via-emerald-50/30 to-white px-3 pt-3 pb-2 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col items-center gap-1.5">
        {/* Avatar with gradient ring */}
        <button onClick={() => setShowProfile(true)} className="relative group">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-[2px] shadow-md group-hover:shadow-lg transition-shadow duration-200">
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              {currentUser && <UserAvatar user={currentUser} size="sm" className="w-full h-full text-sm" />}
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-[2px] border-white shadow-sm animate-pulse" />
        </button>
        {/* Name & label */}
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[180px]">{currentUser?.name || 'User'}</p>
          <p className="text-[8px] text-gray-400 leading-snug tracking-widest uppercase">Messages</p>
        </div>
        {/* Settings + Segmented control */}
        <div className="flex items-center gap-1.5 w-full">
          <button onClick={() => setShowSettings(true)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shrink-0" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <div className="flex-1 relative h-[32px] bg-gray-100/80 rounded-xl">
            <motion.div
              className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] bg-white rounded-lg shadow-sm z-0"
              animate={{ x: navModule === 'groups' ? 'calc(100% + 3px)' : '0' }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
            <div className="absolute inset-0 flex z-10">
              <button onClick={() => setNavModule('chats')} className={cn('flex-1 flex items-center justify-center rounded-lg text-xs font-medium transition-colors', navModule === 'chats' ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700')}>Chats</button>
              <button onClick={() => setNavModule('groups')} className={cn('flex-1 flex items-center justify-center rounded-lg text-xs font-medium transition-colors', navModule === 'groups' ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700')}>Groups</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContactSidebar = () => (
    <div className={cn('w-[280px] border-r border-gray-200 flex flex-col h-full bg-white shrink-0', showMobileList ? 'flex' : 'hidden md:flex')}>
      {renderSidebarHeader()}
      <div className="px-2 pb-1.5 pt-1.5">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search people or groups..." className="bg-gray-50 text-[11px] text-gray-800 rounded-lg py-1.5 px-2 pl-8 border border-gray-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder-gray-400 w-full outline-none transition-all" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>}
        </div>
      </div>

      {navModule === 'groups' ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2 space-y-0.5">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.05em]">Groups</h2>
            <button onClick={() => { setShowCreateGroup(true); setCreateGroupError('') }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:scale-95 transition-all" title="Create Group">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
          {loadingGroups ? (
            <div className="flex justify-center py-8"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12"><p className="text-xs text-gray-400">No groups yet</p><button onClick={() => { setShowCreateGroup(true); setCreateGroupError('') }} className="text-xs text-emerald-600 mt-2 hover:underline">Create one</button></div>
          ) : filteredGroups.map(g => {
            const isOwnerOrAdmin = g.owner?.id === currentUser?.id
            const showMenu = groupListMenuGroupId === g.id
            return (
              <div key={g.id} className="relative group/item">
                <button onClick={() => selectGroup(g)} className={cn('w-full text-left flex items-center gap-2 p-1.5 rounded-lg transition-all', activeGroupId === g.id ? 'bg-emerald-50' : 'hover:bg-gray-50')}>
                  <div className="relative shrink-0">
                    <ProfileAvatar src={g.avatar || null} name={g.name} size="sm" className="rounded-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-gray-900 truncate leading-tight">{g.name}</span>
                      <span className="text-[9px] text-gray-400 shrink-0 leading-none">{g.last_message ? formatDateRelative(g.last_message.created_at) : ''}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate leading-snug">{g.last_message?.content || g.description || 'No messages'}</p>
                    <p className="text-[9px] text-gray-400 leading-snug">{g.members_count} members</p>
                  </div>
                </button>
                <button onClick={e => { e.stopPropagation(); setGroupListMenuGroupId(showMenu ? null : g.id) }} className="absolute right-1.5 top-2 w-5 h-5 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
                <AnimatePresence>{showMenu && (
                  <motion.div ref={groupListMenuRef} initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute right-2 top-full z-[70] bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[160px] overflow-hidden">
                    <button onClick={() => { setGroupListMenuGroupId(null); selectGroup(g); setShowGroupInfo(true); if (g.id) fetchGroupMembers(g.id) }} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-700 hover:bg-gray-50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Group Info
                    </button>
                    {isOwnerOrAdmin ? (
                      <button onClick={() => { setGroupListMenuGroupId(null); setActiveGroupId(g.id); setConfirmDeleteGroup(true) }} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-500 hover:bg-red-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        Delete
                      </button>
                    ) : (
                      <button onClick={() => { setGroupListMenuGroupId(null); setActiveGroupId(g.id); setConfirmLeaveGroup(true) }} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-orange-500 hover:bg-orange-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        Leave
                      </button>
                    )}
                  </motion.div>
                )}</AnimatePresence>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin pb-2">
          {searchQuery.trim() ? (
            <div className="px-2">
              {searching ? (
                <div className="flex justify-center py-8"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>
              ) : safeSearchResults.length === 0 ? (
                <div className="text-center py-12"><p className="text-xs text-gray-400">No users match &ldquo;{searchQuery}&rdquo;</p></div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.05em] mb-1.5">Results</p>
                  {safeSearchResults.map(u => (
                    <button key={u.id} onClick={() => startChat(u)} className="w-full text-left flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="relative shrink-0">
                        <UserAvatar user={u} size="sm" className="w-8 h-8 text-[9px]" />
                        <span className={cn('absolute -bottom-0.5 -right-0.5 w-2 h-2 border-2 border-white rounded-full', onlineUserIds.has(u.id) ? 'bg-[#10B981]' : 'bg-gray-300')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate leading-tight">{u.name}</p>
                        <p className="text-[10px] text-gray-500 truncate leading-snug">{u.email}</p>
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {filteredConvs.length > 0 && (
                <div className="px-2">
                  <div className="flex items-center gap-1.5 mb-1.5 px-1">
                    <div className="w-4 h-4 rounded-md bg-emerald-50 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.05em]">Conversations</p>
                    <span className="text-[9px] text-gray-400 ml-auto">{filteredConvs.length}</span>
                  </div>
                  <div className="h-px bg-gray-100 mx-1 mb-1.5" />
                  {filteredConvs.map(c => (
                    <div key={c.id} className="relative group/item">
                      <button onClick={() => selectConv(c)}
                        className={cn(
                          'w-full text-left flex items-center gap-2 p-2 rounded-lg transition-all duration-150',
                          activeConvId === c.id
                            ? 'bg-emerald-50/80 border-l-2 border-emerald-400 pl-[calc(0.5rem-2px)]'
                            : 'hover:bg-gray-50/80 active:scale-[0.99]'
                        )}
                      >
                        <div className="relative shrink-0">
                          <div className="transition-transform duration-150 group-hover/item:scale-105">
                            <UserAvatar user={c.user} size="sm" className="w-9 h-9 text-[10px]" />
                          </div>
                          <span className={cn(
                            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full',
                            c.user?.id && onlineUserIds.has(c.user.id)
                              ? 'bg-[#10B981] shadow-[0_0_4px_rgba(16,185,129,0.6)]'
                              : 'bg-gray-300'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="flex items-center gap-1 min-w-0">
                              <span className={cn('text-xs truncate leading-tight', activeConvId === c.id ? 'font-bold text-gray-900' : 'font-semibold text-gray-800')}>{c.user?.name || 'Unknown'}</span>
                              {pinnedConvIds.has(c.id) && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="#10B981" stroke="none" className="shrink-0" aria-label="Pinned"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
                              )}
                              {c.user?.id && blockedUserIds.has(c.user.id) && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-label="Blocked"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                              )}
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
                              {isConvMuted(c.id) && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Muted"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                              )}
                              <span className="text-[9px] text-gray-400 leading-none">{c.last_message ? formatDateRelative(c.last_message.created_at) : ''}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[11px] truncate leading-snug flex-1 min-w-0 text-gray-500">
                              {c.last_message?.is_mine && <span className="text-gray-400">You: </span>}
                              {c.last_message?.content || 'No messages'}
                            </p>
                            {c.unread_count > 0 && (
                              <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-sm">
                                {c.unread_count > 99 ? '99+' : c.unread_count}
                              </span>
                            )}
                          </div>
                          {c.is_typing && <p className="text-[9px] text-emerald-500 leading-snug">typing...</p>}
                        </div>
                      </button>
                      {/* Hover action buttons */}
                      <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); handlePinConvToggle(c.id) }}
                          className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all" title={pinnedConvIds.has(c.id) ? 'Unpin' : 'Pin'}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill={pinnedConvIds.has(c.id) ? '#10B981' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
                        </button>
                        <button onClick={e => { e.stopPropagation(); setDelConvTargetId(c.id); setConfirmDeleteConv(true) }}
                          className="w-5 h-5 flex items-center justify-center rounded text-red-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="px-2 mt-0.5">
                <div className="flex items-center gap-1.5 mb-1.5 px-1">
                  <div className="w-4 h-4 rounded-md bg-amber-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.05em]">People</p>
                  {!loadingUsers && <span className="text-[9px] text-gray-400 ml-auto">{allUsers.length}</span>}
                </div>
                <div className="h-px bg-gray-100 mx-1 mb-1.5" />
                {loadingUsers ? (
                  <div className="flex justify-center py-6"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>
                ) : allUsers.length === 0 ? (
                  <div className="text-center py-6"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><p className="text-xs text-gray-400">No users found</p></div>
                ) : (
                  <div className="max-h-[180px] overflow-y-auto scrollbar-thin space-y-0.5">
                    {allUsers.slice(0, 20).map(u => (
                    <div key={u.id} className="relative group/item">
                      <button onClick={() => startChat(u)}
                        className="w-full text-left flex items-center gap-2 p-1.5 rounded-lg transition-all duration-150 hover:bg-amber-50/40 active:scale-[0.99]"
                      >
                        <div className="relative shrink-0">
                          <div className="transition-transform duration-150 group-hover/item:scale-105">
                            <UserAvatar user={u} size="sm" className="w-8 h-8 text-[9px]" />
                          </div>
                          <span className={cn(
                            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full',
                            onlineUserIds.has(u.id)
                              ? 'bg-[#10B981] shadow-[0_0_4px_rgba(16,185,129,0.6)]'
                              : 'bg-gray-300'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{u.name}</p>
                          <p className="text-[10px] text-gray-500 truncate leading-snug">{u.email}</p>
                        </div>
                        <div className="shrink-0 w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 opacity-0 group-hover/item:opacity-100 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </div>
                      </button>
                      {currentUser?.role === 'admin' && (
                        <button onClick={e => { e.stopPropagation(); setDeleteUserTarget(u); setConfirmDeleteUser(true) }}
                          className="absolute right-2 top-2 w-5 h-5 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center rounded text-red-400 hover:text-red-500 hover:bg-red-50">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                  </div>
                )}
              </div>
              {archivedConvs.length > 0 && (
                <div className="px-2 mt-2">
                  <button onClick={() => setShowArchived(!showArchived)}
                    className="flex items-center gap-1.5 w-full px-1 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.05em]">Archived</span>
                    <span className="text-[9px] text-gray-400 ml-auto">{archivedConvs.length}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('text-gray-400 transition-transform', showArchived && 'rotate-180')}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {showArchived && (
                    <div className="mt-1 space-y-0.5">
                      {archivedConvs.map(c => (
                        <div key={c.id} className="relative group/item">
                          <button onClick={() => selectConv(c)}
                            className="w-full text-left flex items-center gap-2 p-2 rounded-lg transition-all duration-150 hover:bg-gray-50/80 active:scale-[0.99]">
                            <div className="relative shrink-0">
                              <UserAvatar user={c.user} size="sm" className="w-8 h-8 text-[9px]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-gray-800 truncate block leading-tight">{c.user?.name || 'Unknown'}</span>
                              <p className="text-[10px] text-gray-400 truncate leading-snug">{c.last_message?.content || 'No messages'}</p>
                            </div>
                          </button>
                          <button onClick={() => setShowUnarchiveConfirm(c.id)}
                            className="absolute right-2 top-2 w-5 h-5 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center rounded text-gray-400 hover:text-emerald-500 hover:bg-emerald-50" title="Unarchive">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )

  const renderChatViewport = () => {
    if (!chatUser && !activeGroup) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
          <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <p className="text-sm text-gray-400">Select a conversation to start messaging</p>
        </div>
      )
    }

    const displayName = activeGroup ? activeGroup.name : chatUser?.name || 'Unknown'
    const displayAvatar = activeGroup ? null : chatUser
    const isOnline = activeGroup ? false : (chatUser?.id ? onlineUserIds.has(chatUser.id) : false)
    const isGroup = !!activeGroup
    const currentMsgs = activeGroup ? groupChatMsgs : messages

    return (
      <div className="flex-1 flex flex-col justify-between h-full bg-gray-50/50">
        {/* ── HEADER ── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0 min-h-[64px]">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={goBack} className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            {displayAvatar ? (
              <div className="relative">
                <UserAvatar user={displayAvatar} size="sm" className="w-9 h-9 text-[11px]" />
                <span className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full', isOnline ? 'bg-[#10B981] shadow-[0_0_4px_rgba(16,185,129,0.6)]' : 'bg-gray-300')} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#065F46] to-[#047857] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {activeGroup?.name?.charAt(0) || 'G'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate leading-tight">{displayName}</p>
              <p className="text-[11px] text-gray-500 leading-snug">
                {isGroup ? `${activeGroup?.members_count || 0} members` : (isOnline ? 'Online' : 'Offline')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={startAudio} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Audio call">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </button>
            <button onClick={startVideo} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Video call">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </button>
            <div className="relative">
              <button onClick={() => setShowHeaderMenu(!showHeaderMenu)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
              <AnimatePresence>{showHeaderMenu && !showMuteOptions && (
                <motion.div ref={headerMenuRef} initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 z-[70] bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[200px] overflow-hidden">
                  {/* Organisation */}
                  {!isGroup && activeConvId && <>
                    <button onClick={() => handlePinConvToggle(activeConvId)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={pinnedConvIds.has(activeConvId) ? '#10B981' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
                      {pinnedConvIds.has(activeConvId) ? 'Unpin conversation' : 'Pin conversation'}
                    </button>
                    {isConvMuted(activeConvId) ? (
                      <button onClick={() => handleUnmuteConv(activeConvId)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        Unmute notifications
                      </button>
                    ) : (
                      <button onClick={() => setShowMuteOptions(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        Mute notifications
                      </button>
                    )}
                    <button onClick={() => handleMarkUnread(activeConvId)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      Mark as unread
                    </button>
                  </>}
                  <div className="h-px bg-gray-100 mx-2 my-0.5" />
                  {/* Actions */}
                  <button onClick={() => { setShowHeaderMenu(false); setInThreadSearch(''); setInThreadResults([]) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    Search in conversation
                  </button>
                  {!isGroup && activeConvId && <>
                    <button onClick={() => handleOpenSharedMedia(activeConvId)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Shared media
                    </button>
                    <button onClick={() => handleExportChat(activeConvId)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      {exportingChat ? 'Exporting...' : 'Export chat'}
                    </button>
                  </>}
                  <div className="h-px bg-gray-100 mx-2 my-0.5" />
                  {/* Destructive */}
                  {!isGroup && activeConvId && <>
                    <button onClick={() => handleArchiveToggle(activeConvId)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                      Archive
                    </button>
                    {chatUser?.id && !blockedUserIds.has(chatUser.id) ? (
                      <button onClick={() => { setShowBlockConfirm(true); setShowHeaderMenu(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-red-500 hover:bg-red-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        Block user
                      </button>
                    ) : (chatUser?.id && blockedUserIds.has(chatUser.id)) ? (
                      <button onClick={() => { handleUnblockUser(chatUser.id); setShowHeaderMenu(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-emerald-600 hover:bg-emerald-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 10 14 16 8"/></svg>
                        Unblock user
                      </button>
                    ) : null}
                    <div className="h-px bg-gray-100 mx-2 my-0.5" />
                    <button onClick={() => { setShowHeaderMenu(false); setConfirmDeleteConv(true); setDelConvTargetId(activeConvId) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-red-500 hover:bg-red-50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Delete conversation
                    </button>
                  </>}
                  {isGroup && <button onClick={() => { setShowHeaderMenu(false); setShowGroupInfo(true); if (activeGroupId) fetchGroupMembers(activeGroupId) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Group info
                  </button>}
                </motion.div>
              )}</AnimatePresence>
              {/* Mute options sub-menu */}
              <AnimatePresence>{showMuteOptions && activeConvId && (
                <motion.div ref={headerMenuRef} initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 z-[70] bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[180px] overflow-hidden">
                  <div className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Mute duration</div>
                  <button onClick={() => handleMuteConv(activeConvId, '1h')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50">1 hour</button>
                  <button onClick={() => handleMuteConv(activeConvId, '8h')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50">8 hours</button>
                  <button onClick={() => handleMuteConv(activeConvId, 'forever')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50">Until turned on</button>
                  <div className="h-px bg-gray-100 mx-2 my-0.5" />
                  <button onClick={() => setShowMuteOptions(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-gray-500 hover:bg-gray-50">Back</button>
                </motion.div>
              )}</AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── IN-THREAD SEARCH ── */}
        {(inThreadSearch !== '' || inThreadResults.length > 0 || searchingInThread) && (
          <div className="shrink-0 px-3 py-2 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  value={inThreadSearch} onChange={e => handleInThreadSearch(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full bg-gray-50 text-[11px] text-gray-800 rounded-lg py-1.5 pl-7 pr-2 border border-gray-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder-gray-400 outline-none transition-all"
                  autoFocus
                />
              </div>
              <button onClick={() => { setInThreadSearch(''); setInThreadResults([]) }}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            {searchingInThread && <p className="text-[10px] text-gray-400 mt-1">Searching...</p>}
            {!searchingInThread && inThreadResults.length > 0 && (
              <p className="text-[10px] text-emerald-600 mt-1 font-medium">{inThreadResults.length} result{inThreadResults.length > 1 ? 's' : ''} found</p>
            )}
            {!searchingInThread && inThreadSearch && inThreadResults.length === 0 && (
              <p className="text-[10px] text-gray-400 mt-1">No results for &ldquo;{inThreadSearch}&rdquo;</p>
            )}
          </div>
        )}

        {/* ── MESSAGES ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
          {loadingMsgs ? (
            <div className="flex justify-center py-12"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>
          ) : currentMsgs.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px]"><p className="text-xs text-gray-400">No messages yet. Say hello!</p></div>
          ) : (
            currentMsgs.map((m, idx) => {
              const isMine = m.sender_id === currentUser?.id
              const isDeleted = !!m.deleted_at
              const isPinned = pinnedIds.has(m.id)
              const isReply = !!m.reply_to
              const prev = idx > 0 ? currentMsgs[idx - 1] : null
              const showDateSep = !prev || !isSameDay(prev.created_at, m.created_at)

              return (
                <div key={m.id} className="flex flex-col items-center group/msg hover:z-10">
                  {showDateSep && (
                    <div className="flex items-center gap-3 mb-3 mt-1 w-full">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-[11px] text-gray-400 font-medium shrink-0">{formatDateSeparator(m.created_at)}</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}
                  <div className="relative max-w-[65%] w-full mb-1.5">
                    {!isMine && isGroup && m.sender && (
                      <p className="text-[8px] text-gray-400 truncate text-center mb-[1px] leading-none">{m.sender.name}</p>
                    )}
                    {isReply && m.reply_to && (
                      <div className="mb-[3px] px-2 py-1 rounded-md text-[11px] border-l-[2px] text-gray-500 bg-gray-100/60 border-gray-300">
                        <span className="text-[9px] text-gray-400">{m.reply_to.sender?.name || 'Unknown'}</span>
                        <p className="truncate">{m.reply_to.content || 'Message deleted'}</p>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className={cn(
                        'text-[13px] px-3 py-1.5 break-words leading-tight text-center',
                        isDeleted
                          ? 'bg-gray-50/60 border border-dashed border-gray-300 text-gray-400 italic rounded-[18px]'
                          : 'bg-gray-50/80 border border-gray-200 text-emerald-700 rounded-[18px] shadow-sm'
                      )}>
                        {isDeleted ? 'Message deleted' : (
                          <>
                            {m.content && <p>{m.content}</p>}
                            {m.file_url && (
                              <div className="mt-1">
                                {m.file_url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) ? (
                                  <img src={getImageUrl(m.file_url)} alt="attachment" className="max-w-[180px] rounded-lg mx-auto" />
                                ) : (
                                  <a href={getImageUrl(m.file_url)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 hover:underline text-[11px] text-emerald-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    View file
                                  </a>
                                )}
                              </div>
                            )}
                            {isPinned && <span className="text-[9px] flex items-center justify-center gap-1 mt-1 text-gray-400 font-medium">
                              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
                              Pinned
                            </span>}
                          </>
                        )}
                      </div>
                    </motion.div>
                    <div className="flex items-center justify-center gap-1 mt-[2px]">
                      <span className="text-[8px] text-gray-400">{formatTime(m.created_at)}</span>
                      {isMine && (
                        <span className="text-[8px]">
                          {m.read_at ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 6 7 17 2 12"/><polyline points="22 6 11 17 8 14"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </span>
                      )}
                    </div>
                    {!isDeleted && (
                      <div className="absolute -right-2.5 top-0 -translate-y-1 translate-x-full opacity-0 group-hover/msg:opacity-100 transition-opacity z-10">
                        <button onClick={() => setOpenMenuMsgId(openMenuMsgId === m.id ? null : m.id)} className="w-5 h-5 rounded-md flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all" title="More actions">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        </button>
                      </div>
                    )}
                    <AnimatePresence>{openMenuMsgId === m.id && (
                      <motion.div ref={menuRef} initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        className="absolute right-0 top-0 z-[1000] bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[150px] mt-7">
                        <button onClick={() => { handleReply(m); setOpenMenuMsgId(null) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] text-gray-700 hover:bg-gray-50">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                          Reply
                        </button>
                        <button onClick={() => { togglePin(m.id); setOpenMenuMsgId(null) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] text-gray-700 hover:bg-gray-50">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
                          {isPinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(m.content || ''); setOpenMenuMsgId(null) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] text-gray-700 hover:bg-gray-50">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          Copy Text
                        </button>
                        <div className="h-px bg-gray-100 my-0.5" />
                        {isMine && (
                          <button onClick={() => { handleDelete(m.id); setOpenMenuMsgId(null) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] text-red-500 hover:bg-red-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            Delete
                          </button>
                        )}
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                </div>
              )
            })
          )}
          {otherTyping && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-500 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              typing<span className="animate-pulse">...</span>
            </div>
          )}
          <div ref={msgEndRef} />
        </div>

        {/* ── REPLY INDICATOR ── */}
        {replyToMsg && (
          <div className="px-4 py-2 bg-emerald-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
              <div className="min-w-0">
                <span className="text-xs text-emerald-700 font-medium">Replying to {replyToMsg.sender?.name || replyToMsg.sender_id === currentUser?.id ? 'yourself' : 'message'}</span>
                <p className="text-[11px] text-gray-500 truncate">{replyToMsg.content || 'Media message'}</p>
              </div>
            </div>
            <button onClick={cancelReply} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        )}

        {/* ── INPUT TOOLBAR ── */}
        <div className="px-2.5 py-2.5 border-t border-gray-200 bg-white shadow-[0_-1px_3px_-1px_rgba(0,0,0,0.04)]">
          {selectedFile && (
            <div className="mb-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
              {selectedFilePreview ? <img src={selectedFilePreview} alt="preview" className="w-8 h-8 rounded object-cover" />
              : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
              <span className="text-[11px] text-gray-600 flex-1 truncate">{selectedFile.name}</span>
              <button onClick={clearFile} className="w-5 h-5 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Attach file">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <button onClick={() => fileRef.current?.click()} className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Send image">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </button>
            <div className="relative">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Emoji">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </button>
              <AnimatePresence>{showEmojiPicker && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-3 z-[60] bg-white border border-gray-200 rounded-2xl shadow-xl p-5 w-[340px]">
                  <p className="text-xs font-semibold text-gray-500 tracking-[0.05em] mb-3">EMOJIS</p>
                  <div className="grid grid-cols-8 gap-x-2 gap-y-2.5">
                    {ALL_EMOJIS.map(e => (
                      <button key={e} onClick={() => { setMessageInput(prev => prev + e); setShowEmojiPicker(false) }}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl text-2xl transition-all active:scale-110">{e}</button>
                    ))}
                  </div>
                </motion.div>
              )}</AnimatePresence>
            </div>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} />
            <input
              value={messageInput}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-gray-800 text-xs focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 placeholder-gray-400 transition-all"
            />
            <button onClick={handleSend} disabled={sending || (!messageInput.trim() && !selectedFile)} className="shrink-0 w-[42px] h-[42px] flex items-center justify-center bg-emerald-500 text-white rounded-xl transition-all duration-200 active:scale-90 hover:bg-emerald-600 hover:scale-105 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/></svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────
  // MODALS
  // ──────────────────────────────────────────────

  const renderCallModal = () => {
    if (!callModal || !chatUser) return null
    const isAudio = callModal === 'audio'
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50" onClick={() => setCallModal(null)}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl p-8 w-[380px] text-center shadow-xl border border-gray-200" onClick={e => e.stopPropagation()}>
          <div className="relative mx-auto mb-5 w-fit">
            <div className={cn('w-24 h-24 rounded-full flex items-center justify-center mx-auto', isAudio ? 'ring-4 ring-emerald-100' : 'ring-4 ring-sky-100')}>
              <UserAvatar user={chatUser} size="lg" className="w-24 h-24 text-2xl" />
            </div>
            <span className={cn('absolute -bottom-0.5 -right-0.5 w-4 h-4 border-[3px] border-white rounded-full', isAudio ? 'bg-emerald-500' : 'bg-sky-500')}>
              <span className={cn('absolute inset-0 rounded-full animate-ping', isAudio ? 'bg-emerald-400' : 'bg-sky-400')} />
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-1">{chatUser.name}</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className={cn('w-2 h-2 rounded-full', isAudio ? 'bg-emerald-500' : 'bg-sky-500')} />
            <p className="text-sm text-gray-500">{isAudio ? 'Audio call' : 'Video call'} &middot; Secure</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setCallModal(null)} className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-sm font-medium">Cancel</button>
            <button onClick={() => launchJitsi(callModal)} className={cn('px-6 py-3 rounded-2xl text-white transition-all text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-lg active:scale-95', isAudio ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-sky-500 hover:bg-sky-600')}>
              {isAudio ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              )}
              Call Now
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-4">End-to-end encrypted</p>
        </motion.div>
      </motion.div>
    )
  }

  const renderSettingsModal = () => (
    <AnimatePresence>{showSettings && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50" onClick={() => setShowSettings(false)}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-[400px] shadow-xl border border-gray-200 overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Chat Settings</h2>
                <p className="text-[10px] text-gray-400">Customize your messaging experience</p>
              </div>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
          </div>
          <div className="p-5 space-y-1">
            {[
              { key: 'notifications', label: 'Message Notifications', desc: 'Get notified of new messages', icon: 'bell', value: msgNotifications, set: setMsgNotifications },
              { key: 'sound', label: 'Sound Effects', desc: 'Play sounds for incoming messages', icon: 'volume', value: soundEnabled, set: setSoundEnabled },
              { key: 'read_receipts', label: 'Read Receipts', desc: 'Let others know you\'ve read their messages', icon: 'check', value: readReceipts, set: setReadReceipts },
              { key: 'show_online_status', label: 'Show Online Status', desc: 'Display when you\'re active', icon: 'eye', value: showOnlineStatus, set: setShowOnlineStatus },
            ].map((item, idx) => (
              <div key={item.key} className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { const nv = !item.value; item.set(nv); updateSetting(item.key, nv, item.label) }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors', item.value ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400')}>
                    {item.icon === 'bell' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    ) : item.icon === 'volume' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    ) : item.icon === 'check' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-medium transition-colors', item.value ? 'text-gray-900' : 'text-gray-600')}>{item.label}</p>
                    <p className="text-[10px] text-gray-400 truncate">{item.desc}</p>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); const nv = !item.value; item.set(nv); updateSetting(item.key, nv, item.label) }}
                  className={cn('relative shrink-0 w-[44px] h-[24px] rounded-full transition-all duration-200', item.value ? 'bg-emerald-500' : 'bg-gray-200')}>
                  <span className={cn('absolute top-[2px] w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200', item.value ? 'left-[22px]' : 'left-[2px]')} />
                </button>
              </div>
            ))}
          </div>
          <div className="px-5 pb-5">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <span className="text-xs font-semibold text-gray-700">App Theme</span>
              </div>
              <div className="flex gap-2">
                {['light', 'dark', 'system'].map(t => (
                  <button key={t} onClick={() => { setThemeMode(t); updateSetting('theme', t, t) }}
                    className={cn('flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all', themeMode === t ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50')}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  )

  const renderProfileModal = () => (
    <AnimatePresence>{showProfile && currentUser && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowProfile(false)}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl w-[380px] max-h-[85vh] shadow-2xl border border-gray-200 flex flex-col" onClick={e => e.stopPropagation()}>
          {/* Sticky header section */}
          <div className="shrink-0">
            {/* Decorative gradient header */}
            <div className="relative h-28 bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 rounded-t-3xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)] rounded-t-3xl" />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
              <button onClick={() => setShowProfile(false)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors backdrop-blur-sm z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <span className="absolute top-3 left-4 px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-white/90 backdrop-blur-sm tracking-wide uppercase">Profile</span>
            </div>
            {/* Avatar overlap */}
            <div className="flex justify-center -mt-14 relative z-20">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full ring-4 ring-white shadow-lg overflow-hidden">
                  <UserAvatar user={currentUser} size="lg" className="w-full h-full text-3xl" />
                </div>
                <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[2px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <span className="absolute -bottom-5 text-[10px] text-white font-medium whitespace-nowrap">Change photo</span>
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-400 rounded-full border-[3px] border-white shadow-sm" />
              </div>
            </div>
            {uploadingAvatar && <p className="text-center text-xs text-emerald-600 mt-2 font-medium animate-pulse">Uploading...</p>}
            {/* Name and role */}
            <div className="text-center px-6 mt-3">
              <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <span className="text-sm text-gray-500">{currentUser.email}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 capitalize">{currentUser.role}</span>
              </div>
            </div>
            {/* Quick actions */}
            <div className="flex items-center justify-center gap-2 px-6 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all text-xs font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Message
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all text-xs font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Audio
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all text-xs font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                Video
              </button>
            </div>
          </div>
          {/* Scrollable details section */}
          <div className="overflow-y-auto px-6 pb-5 mt-4 space-y-2.5 scrollbar-thin">
            <div className="bg-gray-50/80 rounded-2xl border border-gray-100 divide-y divide-gray-100">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Email</p>
                    <p className="text-sm text-gray-700">{currentUser.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Role</p>
                    <p className="text-sm text-gray-700 capitalize">{currentUser.role}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 capitalize">{currentUser.role}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Joined</p>
                    <p className="text-sm text-gray-700">{currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Status */}
            <div className="bg-gray-50/80 rounded-2xl border border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Status</p>
                    <p className="text-sm text-emerald-600 font-medium">Active now</p>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  )

  const renderCreateGroupModal = () => (
    <AnimatePresence>{showCreateGroup && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50" onClick={() => setShowCreateGroup(false)}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl w-[440px] shadow-xl border border-gray-200 max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 py-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-white">Create Group</h2>
              <p className="text-xs text-white/70">Start a group conversation</p>
            </div>
            <button onClick={() => setShowCreateGroup(false)} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
          </div>
          <div className="p-5 overflow-y-auto max-h-[calc(85vh-80px)] space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Group Name</label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder-gray-400 transition-colors" placeholder="Enter group name" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Description</label>
              <textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder-gray-400 resize-none transition-colors" placeholder="Group description (optional)" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-500">Add Members</label>
                <span className="text-[10px] text-gray-400">{selectedMembers.length} selected</span>
              </div>
              <div className="max-h-[180px] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 divide-y divide-gray-100">
                {allUsers.filter(u => u.id !== currentUser?.id).slice(0, 30).map(u => (
                  <button key={u.id} onClick={() => toggleMemberSelect(u.id)} className={cn('w-full text-left flex items-center gap-3 px-3 py-2.5 transition-colors', selectedMembers.includes(u.id) ? 'bg-emerald-50' : 'hover:bg-white')}>
                    <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all', selectedMembers.includes(u.id) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white')}>
                      {selectedMembers.includes(u.id) && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <UserAvatar user={u} size="sm" />
                    <span className="text-sm text-gray-800 flex-1 font-medium">{u.name}</span>
                    <span className="text-[10px] text-gray-400">{u.email}</span>
                  </button>
                ))}
              </div>
            </div>
            {createGroupError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{createGroupError}</p>}
            <button onClick={handleCreateGroup} disabled={creatingGroup || !newGroupName.trim() || selectedMembers.length === 0}
              className="w-full py-3 bg-emerald-500 text-white rounded-2xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2">
              {creatingGroup ? (
                <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Creating...</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg> Create Group ({selectedMembers.length} members)</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  )

  const renderGroupInfoModal = () => (
    <AnimatePresence>{showGroupInfo && activeGroup && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50" onClick={() => setShowGroupInfo(false)}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl w-[420px] shadow-xl border border-gray-200 max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 pt-8 pb-10 text-center relative">
            <button onClick={() => setShowGroupInfo(false)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 text-white text-3xl font-bold ring-4 ring-white/30 backdrop-blur-sm">{activeGroup.name.charAt(0)}</div>
            <p className="text-xl font-bold text-white">{activeGroup.name}</p>
            <p className="text-sm text-white/70">{activeGroup.description || 'No description'}</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-xs text-white/60 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {activeGroup.members_count} members
              </span>
              {activeGroup.owner?.id === currentUser?.id && <span className="text-xs text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full font-medium">Owner</span>}
            </div>
          </div>
          <div className="px-5 pb-5 -mt-4 relative z-10">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  Members
                </p>
                <span className="text-[10px] text-gray-400">{groupMembers.length} total</span>
              </div>
              {loadingGroupMembers ? (
                <div className="flex justify-center py-4"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>
              ) : groupMembers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No members loaded</p>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[200px] overflow-y-auto">
                  {groupMembers.map(m => (
                    <div key={m.id} className="flex items-center justify-between py-2.5 px-1 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <UserAvatar user={m} size="sm" />
                          <span className={cn('absolute -bottom-0.5 -right-0.5 w-2 h-2 border-2 border-white rounded-full', onlineUserIds.has(m.id) ? 'bg-emerald-500' : 'bg-gray-300')} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{m.name}</p>
                          <div className="flex items-center gap-1.5">
                            <span className={cn('text-[10px] capitalize', m.role === 'owner' ? 'text-amber-600 font-semibold' : 'text-gray-500')}>{m.role}</span>
                            {m.id === currentUser?.id && <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">you</span>}
                          </div>
                        </div>
                      </div>
                      {activeGroup.owner?.id === currentUser?.id && m.role !== 'owner' && (
                        <button onClick={() => handleRemoveMember(m.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Remove member">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {activeGroup.owner?.id === currentUser?.id && !loadingGroupMembers && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-500 mb-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    Add member
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {allUsers.filter(u => !groupMembers.some(m => m.id === u.id) && u.id !== currentUser?.id).slice(0, 6).map(u => (
                      <button key={u.id} onClick={() => handleAddMember(u.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all font-medium shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                        {u.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  )

  const renderConfirmModals = () => (
    <>
      <AnimatePresence>{confirmDeleteConv && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50" onClick={() => setConfirmDeleteConv(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-[340px] shadow-xl border border-gray-200 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">Delete conversation?</p>
            <p className="text-xs text-gray-500 mb-5">All messages will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteConv(false)} className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-sm font-medium">Cancel</button>
              <button onClick={handleDeleteConversation} disabled={deletingConv} className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all text-sm font-medium disabled:opacity-40 shadow-sm">
                {deletingConv ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
      <AnimatePresence>{confirmDeleteUser && deleteUserTarget && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50" onClick={() => setConfirmDeleteUser(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-[340px] shadow-xl border border-gray-200 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">Delete user</p>
            <p className="text-xs text-gray-500 mb-1">&ldquo;{deleteUserTarget.name}&rdquo; will be permanently removed.</p>
            <p className="text-xs text-gray-400 mb-5">All their messages and data will be lost.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteUser(false)} className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-sm font-medium">Cancel</button>
              <button onClick={handleDeleteUser} disabled={deletingUser} className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all text-sm font-medium disabled:opacity-40 shadow-sm">
                {deletingUser ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
      <AnimatePresence>{confirmDeleteGroup && activeGroup && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50" onClick={() => setConfirmDeleteGroup(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-[340px] shadow-xl border border-gray-200 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">Delete &ldquo;{activeGroup.name}&rdquo;?</p>
            <p className="text-xs text-gray-500 mb-5">The group will be removed for everyone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteGroup(false)} className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-sm font-medium">Cancel</button>
              <button onClick={handleDeleteGroup} disabled={deletingGroup} className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all text-sm font-medium disabled:opacity-40 shadow-sm">
                {deletingGroup ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
      <AnimatePresence>{showBlockConfirm && chatUser && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50" onClick={() => setShowBlockConfirm(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-[340px] shadow-xl border border-gray-200 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">Block {chatUser.name}?</p>
            <p className="text-xs text-gray-500 mb-5">They won't be able to send you messages.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowBlockConfirm(false)} className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-sm font-medium">Cancel</button>
              <button onClick={() => chatUser?.id && handleBlockUser(chatUser.id)} className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all text-sm font-medium shadow-sm">Block</button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
      <AnimatePresence>{showUnarchiveConfirm !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50" onClick={() => setShowUnarchiveConfirm(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-[340px] shadow-xl border border-gray-200 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">Unarchive conversation?</p>
            <p className="text-xs text-gray-500 mb-5">It will reappear in your main list.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowUnarchiveConfirm(null)} className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-sm font-medium">Cancel</button>
              <button onClick={() => { if (showUnarchiveConfirm !== null) handleArchiveToggle(showUnarchiveConfirm); setShowUnarchiveConfirm(null) }} className="flex-1 py-2.5 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all text-sm font-medium shadow-sm">Unarchive</button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
      <AnimatePresence>{confirmLeaveGroup && activeGroup && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50" onClick={() => setConfirmLeaveGroup(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-[340px] shadow-xl border border-gray-200 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">Leave &ldquo;{activeGroup.name}&rdquo;?</p>
            <p className="text-xs text-gray-500 mb-5">Other members can re-add you later.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmLeaveGroup(false)} className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-sm font-medium">Cancel</button>
              <button onClick={handleLeaveGroup} disabled={leavingGroup} className="flex-1 py-2.5 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 transition-all text-sm font-medium disabled:opacity-40 shadow-sm">
                {leavingGroup ? 'Leaving...' : 'Leave'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </>
  )

  const renderSharedMediaPanel = () => (
    <AnimatePresence>{showSharedMedia && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50" onClick={() => setShowSharedMedia(false)}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-[480px] max-h-[80vh] shadow-xl border border-gray-200 overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <h2 className="text-sm font-bold text-gray-900">Shared Media</h2>
            </div>
            <button onClick={() => setShowSharedMedia(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
          </div>
          <div className="p-5 overflow-y-auto max-h-[calc(80vh-64px)]">
            {loadingSharedMedia ? (
              <div className="flex justify-center py-12"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>
            ) : sharedMedia.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <p className="text-xs text-gray-400">No shared media yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {sharedMedia.map((item: any, i: number) => (
                  item.file_url?.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) ? (
                    <a key={i} href={getImageUrl(item.file_url)} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100 hover:opacity-80 transition-opacity">
                      <img src={getImageUrl(item.file_url)} alt="" className="w-full h-full object-cover" />
                    </a>
                  ) : (
                    <a key={i} href={getImageUrl(item.file_url)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center aspect-square rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span className="text-[9px] text-gray-400 mt-1 truncate px-1">{item.file_url?.split('/').pop() || 'File'}</span>
                    </a>
                  )
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  )

  // ──────────────────────────────────────────────
  // MAIN RENDER
  // ──────────────────────────────────────────────

  return (
    <div className="max-w-[1000px] max-h-[600px] h-[600px] w-full mx-auto my-6 flex rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg">
      {renderContactSidebar()}
      <div className={cn('flex-1 flex', !showMobileList ? 'flex' : 'hidden md:flex')}>
        {renderChatViewport()}
      </div>

      {renderCallModal()}
      {renderSettingsModal()}
      {renderProfileModal()}
      {renderCreateGroupModal()}
      {renderGroupInfoModal()}
      {renderConfirmModals()}
      {renderSharedMediaPanel()}

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm shadow-xl bg-white border border-gray-200 text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {toastMsg}
        </div>
      )}
    </div>
  )
}
