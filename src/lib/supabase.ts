import { supabase, isDemoMode } from './supabaseClient'

const ACCOUNTS_KEY = 'aulalog_accounts'
const USER_KEY = 'aulalog_user'

type Account = { id: string; nome: string; email: string; password?: string }

type SignResult = {
  user?: { id: string; nome: string; email: string } | null
  error?: string
}

export async function signUp({ nome, email, password }: { nome: string; email: string; password: string }): Promise<SignResult> {
  if (isDemoMode) {
    const raw = localStorage.getItem(ACCOUNTS_KEY) || '[]'
    const accounts: Account[] = JSON.parse(raw)

    if (accounts.find(a => a.email === email)) {
      return { error: 'Já existe uma conta com este e-mail.' }
    }

    const newUser: Account = { id: Date.now().toString(), nome, email, password }
    accounts.push(newUser)
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))

    return { user: { id: newUser.id, nome: newUser.nome, email: newUser.email } }
  }

  // Real Supabase flow
  const res = await supabase.auth.signUp({ email, password })
  if (res.error) return { error: res.error.message }

  const user = res.data.user
  if (!user) return { user: null }

  // create profile row linked to auth.users
  try {
    await supabase.from('profiles').insert([{ id: user.id, nome, email }]);
  } catch (e) {
    // ignore profile creation errors here; auth succeeded
  }

  return { user: { id: user.id, nome: nome || '', email: user.email || '' } }
}

export async function signIn({ email, password }: { email: string; password: string }): Promise<SignResult> {
  if (isDemoMode) {
    const raw = localStorage.getItem(ACCOUNTS_KEY) || '[]'
    const accounts: Account[] = JSON.parse(raw)

    const matched = accounts.find(a => a.email === email)
    if (!matched) return { error: 'Conta não encontrada.' }
    if (matched.password !== password) return { error: 'Senha incorreta.' }

    const user = { id: matched.id, nome: matched.nome, email: matched.email }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return { user }
  }

  const res = await supabase.auth.signInWithPassword({ email, password })
  if (res.error) return { error: res.error.message }
  const user = res.data.user
  if (!user) return { user: null }

  // fetch profile
  const { data: profile, error: profileErr } = await supabase.from('profiles').select('nome,email').eq('id', user.id).single();
  const nome = profile && (profile as any).nome ? (profile as any).nome : (user.email || '')

  return { user: { id: user.id, nome, email: user.email || '' } }
}

export async function signOut(): Promise<void> {
  if (isDemoMode) {
    localStorage.removeItem(USER_KEY)
  } else {
    await supabase.auth.signOut()
  }
}
export async function getCurrentUser() {
  if (isDemoMode) {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from('profiles').select('nome,email').eq('id', user.id).single()
    const nome = profile && (profile as any).nome ? (profile as any).nome : (user.email || '')
    return { id: user.id, nome, email: user.email || '' }
  } catch {
    return null
  }
}
