import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useContacts(workspaceId?: string) {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId) { setLoading(false); return }
    supabase
      .from('contacts')
      .select('*, company:companies(name, sector)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setContacts(data || []); setLoading(false) })
  }, [workspaceId])

  return { contacts, loading }
}

export function useDeals(workspaceId?: string) {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId) { setLoading(false); return }
    supabase
      .from('deals')
      .select('*, contact:contacts(first_name, last_name), stage:pipeline_stages(name, color, position)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setDeals(data || []); setLoading(false) })
  }, [workspaceId])

  return { deals, loading }
}

export function useStats(workspaceId?: string) {
  const [stats, setStats] = useState({ contacts: 0, leads: 0, revenue: 0, proposals: 0 })

  useEffect(() => {
    if (!workspaceId) return
    Promise.all([
      supabase.from('contacts').select('id', { count: 'exact' }).eq('workspace_id', workspaceId),
      supabase.from('contacts').select('id', { count: 'exact' }).eq('workspace_id', workspaceId).eq('status', 'lead'),
      supabase.from('contacts').select('lifetime_value').eq('workspace_id', workspaceId),
      supabase.from('proposals').select('id', { count: 'exact' }).eq('workspace_id', workspaceId),
    ]).then(([c, l, r, p]) => {
      const revenue = (r.data || []).reduce((sum: number, c: any) => sum + (c.lifetime_value || 0), 0)
      setStats({ contacts: c.count || 0, leads: l.count || 0, revenue, proposals: p.count || 0 })
    })
  }, [workspaceId])

  return stats
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('workspace_members')
          .select('workspace:workspaces(*)')
          .eq('user_id', data.user.id)
          .single()
          .then(({ data: d }) => setWorkspace(d?.workspace))
      }
    })
  }, [])

  return { workspace, user }
}

export function useWAConversations(workspaceId?: string) {
  const [conversations, setConversations] = useState<any[]>([])

  useEffect(() => {
    if (!workspaceId) return
    supabase.from('wa_conversations')
      .select('*, contact:contacts(first_name, last_name, phone)')
      .eq('workspace_id', workspaceId)
      .eq('status', 'open')
      .order('last_message_at', { ascending: false })
      .then(({ data }) => setConversations(data || []))

    // Real-time subscription
    const channel = supabase.channel('wa_conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wa_conversations' },
        () => { supabase.from('wa_conversations').select('*').eq('workspace_id', workspaceId).then(({ data }) => setConversations(data || [])) }
      ).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [workspaceId])

  return { conversations }
}
