import React, { useEffect, useMemo, useState } from 'react'
import QuotaPage from './QuotaPage'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Banknote, Box, BriefcaseBusiness,
  CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Crown, DollarSign, FileClock, HandCoins,
  History, LayoutDashboard, LogOut, Menu, Package, Plus, Search, Settings,
  Shield, ShoppingCart, Sparkles, Users, UserRoundPlus, X, Pencil, Trash2, BadgeCheck
} from 'lucide-react'
import './style.css'

const env = import.meta.env
const supabase = env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY
  ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
  : null

const ranks = [
  '👑・EL PATRÓN', '🥇・MANO DERECHA', '🥈・MANO DE IZQUIERDA', '💀・JEFE DE PLAZA',
  '🤝・ASSISTANT JEFE DE PLAZA', '🔫・JEFE D’ARSENAL', '🤝・ASSISTANT ARSENAL',
  '💊・JEFE DE DROGUE', '🤝・ASSISTANT DROGUE', '🎯・JEFE D’OPÉRATIONS',
  '🤝・ASSISTANT OPÉRATIONS', '✉️・JEFE RECRUTEMENT', '🤝・ASSISTANT RECRUTEMENT',
  '📦・JEFE REECEL', '🤝・ASSISTANT REECEL', '🔫・SICARIO', '🪖・SOLDADO', '👤・RECRUE'
]
const MOD_RANKS = [ranks[0], ranks[1], ranks[2]]
const rankIs = (rank, names) => names.includes(rank)
const isModerator = rank => MOD_RANKS.includes(rank)
const RECRUIT_RANKS = [ranks[11]]
const REECEL_RANKS = [ranks[13]]
const REECEL_CATALOG_RANKS = [ranks[13], ranks[14]]
const INVENTORY_RANKS = [ranks[5], ranks[6]]
const CASH_RANKS = [ranks[3], ranks[4]]
const OPERATIONS_RANKS = [ranks[9], ranks[10]]
const DRUG_RANKS = [ranks[7], ranks[8]]
const seed = {
  members: [
    { id: 1, name: 'El Patrón', rank: ranks[0], online: true },
    { id: 2, name: 'El Comandante', rank: ranks[1], online: true },
    { id: 3, name: 'La Sombra', rank: ranks[9], online: false },
    { id: 4, name: 'El Fantasma', rank: ranks[10], online: true },
    { id: 5, name: 'La Bestia', rank: ranks[10], online: true }
  ],
  inventory: [
    { id: 1, name: 'AK-47', category: 'Arme', quantity: 8, icon: '🔫' },
    { id: 2, name: 'Gilets pare-balles', category: 'Protection', quantity: 12, icon: '🦺' },
    { id: 3, name: 'Graines de weed', category: 'Divers', quantity: 35, icon: '🌿' },
    { id: 4, name: 'Cocaïne', category: 'Divers', quantity: 17, icon: '📦' },
    { id: 5, name: 'Chargeurs', category: 'Accessoire', quantity: 26, icon: '🔋' }
  ],
  applicants: [
    { id: 1, name: 'Carlos M.', reason: 'Motivation : rejoindre la famille…', status: 'En attente' },
    { id: 2, name: 'Miguel R.', reason: 'Expérience et disponibilité…', status: 'En attente' },
    { id: 3, name: 'Javier L.', reason: 'Sérieux et disponible…', status: 'En attente' }
  ],
  sales: [
    { id: 1, name: 'Vente de graines', quantity: 10, amount: 25000, status: 'Validée', created_by_name: 'El Patrón', created_at: new Date().toISOString() },
    { id: 2, name: 'Vente de matériel', quantity: 2, amount: 12000, status: 'En attente', created_by_name: 'El Comandante', created_at: new Date().toISOString() }
  ],
  catalog: [],
  transactions: [],
  operations: [],
  drugRequests: [],
  activities: [
    { type: 'Vente', text: '10 × Graines', amount: '+ 25 000 $', time: 'Aujourd’hui 21:45', by: 'El Patrón' },
    { type: 'Achat', text: '5 × Gilets pare-balles', amount: '− 15 000 $', time: 'Aujourd’hui 18:22', by: 'El Comandante' },
    { type: 'Recrutement', text: 'Nouvelle candidature', amount: '', time: 'Aujourd’hui 16:37', by: 'El Jefe' },
    { type: 'Membre', text: 'Nuevo a rejoint la famille', amount: '', time: 'Aujourd’hui 14:12', by: 'El Jefe' },
    { type: 'Inventaire', text: 'Ajout de 3 × AK-47', amount: '', time: 'Aujourd’hui 12:04', by: 'El Comandante' }
  ]
}
const emptyData = { members: [], inventory: [], applicants: [], sales: [], catalog: [], transactions: [], operations: [], drugRequests: [], activities: [], quotas: {} }
const navItems = [
  ['Tableau de bord', LayoutDashboard], ['Caisse familiale', HandCoins], ['REECEL & Ventes', ShoppingCart],
  ['Inventaire', Package], ['Drogue', Sparkles], ['Membres', Users], ['Quotas', BadgeCheck], ['Recrutements', UserRoundPlus],
  ['Opérations', CalendarDays], ['Centre de veille', Activity], ['Hiérarchie', Crown], ['Modération', Shield], ['Historique', History], ['Paramètres', Settings]
]
const money = n => `${Number(n).toLocaleString('fr-FR')} $`
const categoryIcon = category => ({ Arme:'🔫', Protection:'🦺', Accessoire:'🔩', Divers:'📦' }[category] || '📦')

function AccessGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => { try { return sessionStorage.getItem('sinaloa-access-granted') === '1' } catch { return false } })
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    const code = new FormData(event.currentTarget).get('accessCode').toString().replace(/[\s-]/g, '')
    if (code !== '304010') { setError('Code incorrect. Vérifie les chiffres et réessaie.'); event.currentTarget.reset(); return }
    try { sessionStorage.setItem('sinaloa-access-granted', '1') } catch {}
    setUnlocked(true)
  }
  if (unlocked) return children
  return <main className="access-gate"><style>{`.access-gate{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at 50% 12%,#302719,transparent 48%),linear-gradient(145deg,#080909,#0c0b09 55%,#080909);color:#f4f0e8}.access-card{width:min(440px,100%);padding:42px 34px 30px;text-align:center;border:1px solid rgba(218,174,89,.4);border-radius:14px;background:linear-gradient(145deg,#191815,#0b0c0c);box-shadow:0 30px 100px #000a;animation:access-rise .4s ease}.access-crown{font-size:40px;color:#efd18a;text-shadow:0 0 24px #d8b16755}.access-overline{display:block;margin-top:18px;font:9px Arial,sans-serif;letter-spacing:3px;color:#c5a65e}.access-card h1{margin:12px 0 8px;font:500 38px Georgia,serif;color:#f0d48f}.access-welcome{margin:0;color:#e1ddd4;font:16px/1.7 Georgia,serif}.access-divider{margin:24px auto;color:#d9b86e;letter-spacing:12px}.access-instruction{font:12px Arial,sans-serif;color:#c9c2b4;margin:0 0 14px}.access-card input{width:100%;height:54px;border:1px solid rgba(218,174,89,.38);border-radius:8px;background:#0c0d0d;color:#f2dfac;text-align:center;font:20px Arial,sans-serif;letter-spacing:8px;outline:none}.access-card input:focus{border-color:#d8b167;box-shadow:0 0 0 3px #d8b16722}.access-card input::placeholder{color:#756b56;letter-spacing:5px}.access-submit{width:100%;height:47px;margin-top:12px;border:1px solid #eac36d77;border-radius:8px;background:linear-gradient(110deg,#9f7630,#d2ab5f 52%,#a47b35);color:#17130c;font-weight:700;cursor:pointer}.access-error{color:#f18e83;font:11px Arial,sans-serif}.access-foot{margin:28px 0 0;color:#81745a;font:8px Arial,sans-serif;letter-spacing:3px}@keyframes access-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@media(max-width:520px){.access-card{padding:34px 22px}.access-card h1{font-size:33px}}`}</style><section className="access-card"><div className="access-crown" aria-hidden="true">♛</div><span className="access-overline">LOS SINALOA’S · ESPACE PRIVÉ</span><h1>Bienvenue</h1><p className="access-welcome">Bienvenue dans le site officiel<br/>du cartel de Los Sinaloa’s.</p><div className="access-divider">── ⚜ ──</div><p className="access-instruction">🔒 Saisis le code d’accès pour continuer</p><form onSubmit={submit}><label className="sr-only" htmlFor="site-access-code">Code d’accès</label><input id="site-access-code" name="accessCode" type="password" inputMode="numeric" autoComplete="one-time-code" placeholder="•• •• ••" autoFocus required/><button className="access-submit" type="submit">Entrer dans l’espace　→</button>{error&&<p className="access-error" role="alert">{error}</p>}</form><p className="access-foot">FAMILLE · HONNEUR · LOYAUTÉ</p></section></main>
}

function App() {
  const [data, setData] = useState(() => {
    if (supabase) return emptyData
    try { return { ...seed, ...JSON.parse(localStorage.getItem('sinaloa-demo') || '{}') } } catch { return seed }
  })
  const [page, setPage] = useState('Tableau de bord')
  const [drawer, setDrawer] = useState(false)
  const [modal, setModal] = useState('')
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')
  const [cash, setCash] = useState(() => supabase ? { propre: 0, sale: 0 } : { propre: 235450, sale: 487300 })
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) localStorage.setItem('sinaloa-demo', JSON.stringify(data))
  }, [data])
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data: d }) => { setSession(d.session); setLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, current) => { setSession(current); if(!current){setProfile(null);setProfiles([])} })
    return () => listener.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!supabase || !session) return
    let live = true
    ;(async () => {
      setLoading(true)
      const [memberRes, inventoryRes, appRes, activityRes, ledgerRes, profileRes, salesRes, operationRes, drugRes, catalogRes, transactionRes, quotaRes] = await Promise.all([
        supabase.from('members').select('*, profile:profiles(display_name,rank,active)').order('created_at'),
        supabase.from('inventory_items').select('*').order('name'),
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('cash_ledger').select('account,amount'),
        supabase.from('profiles').select('display_name,rank,active').eq('id', session.user.id).maybeSingle(),
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('operations').select('*').order('scheduled_at'),
        supabase.from('drug_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('reecel_products').select('*, item:inventory_items(id,name,category,quantity,icon)').eq('active',true).order('name'),
        supabase.from('reecel_transactions').select('*').order('created_at',{ascending:false}).limit(12),
        supabase.from('member_quotas').select('member_id,respected')
      ])
      if (!live) return
      if (profileRes.data?.active === false) { setLoading(false); notify('Ce compte a été désactivé par un modérateur.'); await supabase.auth.signOut(); return }
      if (!memberRes.error && memberRes.data) setData(d => ({ ...d, members: memberRes.data.filter(m => m.profile?.active !== false).map(m => ({ ...m, online: Boolean(m.online), name: m.profile?.display_name || m.name, rank: m.profile?.rank || m.rank })) }))
      if (!inventoryRes.error && inventoryRes.data) setData(d => ({ ...d, inventory: inventoryRes.data }))
      if (!appRes.error && appRes.data) setData(d => ({ ...d, applicants: appRes.data }))
      if (!activityRes.error && activityRes.data) setData(d => ({ ...d, activities: activityRes.data.map(a => ({ type: a.type, text: a.description, amount: a.amount ? `${a.amount > 0 ? '+' : '−'} ${money(Math.abs(a.amount))}` : '', time: new Date(a.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }), by: a.actor_name || 'Membre' })) }))
      if (!ledgerRes.error && ledgerRes.data) setCash({ propre: ledgerRes.data.filter(x => x.account === 'propre').reduce((n, x) => n + Number(x.amount), 0), sale: ledgerRes.data.filter(x => x.account === 'sale').reduce((n, x) => n + Number(x.amount), 0) })
      if (!profileRes.error && profileRes.data) setProfile(profileRes.data)
      if (!salesRes.error && salesRes.data) setData(d => ({ ...d, sales: salesRes.data }))
      if (!operationRes.error && operationRes.data) setData(d => ({ ...d, operations: operationRes.data }))
      if (!drugRes.error && drugRes.data) setData(d => ({ ...d, drugRequests: drugRes.data }))
      if (!catalogRes.error && catalogRes.data) setData(d => ({ ...d, catalog: catalogRes.data }))
      if (!transactionRes.error && transactionRes.data) setData(d => ({ ...d, transactions: transactionRes.data }))
      if (!quotaRes.error && quotaRes.data) setData(d => ({ ...d, quotas: Object.fromEntries(quotaRes.data.map(q => [String(q.member_id), q.respected])) }))
      if (!profileRes.error && profileRes.data && isModerator(profileRes.data.rank)) {
        const { data: allProfiles } = await supabase.from('profiles').select('id,display_name,rank,active,created_at').order('created_at')
        if (allProfiles) setProfiles(allProfiles)
      }
      setLoading(false)
    })()
    return () => { live = false }
  }, [session])

  const notify = text => { setToast(text); setTimeout(() => setToast(''), 2800) }
  const update = (key, value) => setData(d => ({ ...d, [key]: value }))
  const setMemberQuota = async (member, respected) => {
    if (supabase && session) {
      const { error } = await supabase.from('member_quotas').upsert({ member_id: member.id, respected, updated_by: session.user.id }, { onConflict: 'member_id' })
      if (error) { notify(error.message); return }
    }
    setData(d => ({ ...d, quotas: { ...d.quotas, [String(member.id)]: respected } }))
    notify(`Quota de ${member.name} ${respected ? 'respecté' : 'non respecté'}.`)
  }
  const addActivity = async (type, description, amount = 0) => {
    const item = { type, text: description, amount: amount ? `${amount > 0 ? '+' : '−'} ${money(Math.abs(amount))}` : '', time: 'À l’instant', by: profile?.display_name || session?.user?.email?.split('@')[0] || 'El Patrón' }
    update('activities', [item, ...data.activities].slice(0, 12))
    if (supabase && session) await supabase.from('activities').insert({ type, description, amount, actor_id: session.user.id, actor_name: item.by })
  }
  const onSubmit = async e => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (modal === 'login') {
      if (!supabase) { notify('Configure Supabase pour activer la connexion.'); return }
      const { error } = await supabase.auth.signInWithPassword({ email: f.get('email'), password: f.get('password') })
      if (error) notify(error.message); else { setModal(''); notify('Connexion réussie.') }
    } else if (modal === 'signup') {
      if (!supabase) { notify('Configure Supabase pour activer la création de compte.'); return }
      const { data: result, error } = await supabase.auth.signUp({ email: f.get('email'), password: f.get('password') })
      if (error) notify(error.message)
      else if (result.session) { setModal(''); notify('Compte créé. Ton grade initial est Recrue.') }
      else { setModal(''); notify('Compte créé. Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter.') }
    } else if (modal === 'member') {
      if (session && !canModerate) { notify('Réservé à l’espace modérateur.'); return }
      const row = { name: f.get('name'), rank: f.get('rank'), online: false }
      if (supabase && session) { const { data: inserted, error } = await supabase.from('members').insert({ ...row, created_by: session.user.id }).select().single(); if (error) { notify(error.message); return } update('members', [inserted, ...data.members]) }
      else update('members', [{ ...row, id: Date.now() }, ...data.members])
      await addActivity('Membre', `${row.name} a rejoint la famille`); setModal(''); notify('Membre ajouté.')
    } else if (modal === 'applicant') {
      if (session && !canManageRecruitment) { notify('Seul le jefe de recrutement peut ajouter une candidature.'); return }
      const row = { name: f.get('name'), email: f.get('email'), reason: f.get('reason'), status: 'En attente' }
      if (supabase && session) { const { data: inserted, error } = await supabase.from('applications').insert({ ...row, created_by: session.user.id }).select().single(); if (error) { notify(error.message); return } update('applicants', [inserted, ...data.applicants]) }
      else update('applicants', [{ ...row, id: Date.now() }, ...data.applicants])
      await addActivity('Recrutement', `Candidature de ${row.name}`); setModal(''); notify('Candidature enregistrée.')
    } else if (modal === 'item') {
      if (session && !canManageInventory) { notify('Action réservée aux responsables de l’inventaire.'); return }
      const row = { name: f.get('name'), category: f.get('category'), quantity: Number(f.get('quantity')), icon: categoryIcon(f.get('category')) }
      if (supabase && session) { const { data: inserted, error } = await supabase.from('inventory_items').insert({ ...row, created_by: session.user.id }).select().single(); if (error) { notify(error.message); return } update('inventory', [inserted, ...data.inventory]) }
      else update('inventory', [{ ...row, id: Date.now() }, ...data.inventory])
      await addActivity('Inventaire', `Ajout de ${row.quantity} × ${row.name}`); setModal(''); notify('Article ajouté au stock.')
    } else if (modal === 'cash') {
      if (session && !canManageCash) { notify('Action réservée aux modérateurs et au responsable de la caisse.'); return }
      const account = f.get('account'), amount = Number(f.get('amount')), note = f.get('note')
      if (supabase && session) { const { error } = await supabase.from('cash_ledger').insert({ account, amount, note, created_by: session.user.id }); if (error) { notify(error.message); return } }
      setCash(c => ({ ...c, [account]: c[account] + amount })); await addActivity(amount >= 0 ? 'Vente' : 'Achat', note || 'Mouvement de caisse', amount); setModal(''); notify('Mouvement enregistré.')
    } else if (modal === 'product') {
      if (session && !canManageReecelCatalog) { notify('Ajout au catalogue réservé au REECEL et au haut commandement.'); return }
      const name=f.get('name').trim(), unit_price=Number(f.get('unit_price')), category=f.get('category')
      if (supabase && session) {
        const {data:created,error}=await supabase.rpc('create_reecel_product',{product_name:name,unit_price,category})
        if(error){notify(error.message);return}
        update('catalog',[created,...data.catalog].sort((a,b)=>a.name.localeCompare(b.name)))
        if(created.item) update('inventory',[created.item,...data.inventory.filter(i=>i.id!==created.item.id)].sort((a,b)=>a.name.localeCompare(b.name)))
      } else {
        let item=data.inventory.find(i=>i.name.toLowerCase()===name.toLowerCase())
        if(!item){item={id:Date.now(),name,category,quantity:0,icon:categoryIcon(category)};update('inventory',[item,...data.inventory])}
        const created={id:Date.now()+1,name,unit_price,inventory_item_id:item.id,item,active:true,created_at:new Date().toISOString()}
        update('catalog',[created,...data.catalog].sort((a,b)=>a.name.localeCompare(b.name)))
      }
      await addActivity('REECEL',`Article ajouté au catalogue · ${name} · ${money(unit_price)}`);setModal('');notify(`${name} ajouté au catalogue REECEL.`)
    } else if (modal === 'sale') {
      if (session && !canManageReecel) { notify('Seul le jefe de REECEL peut enregistrer une vente.'); return }
      const row = { name: f.get('name'), quantity: Number(f.get('quantity')), amount: Number(f.get('amount')), status: 'En attente', created_by_name: me, created_by: session?.user?.id }
      if (supabase && session) { const { data: inserted, error } = await supabase.from('sales').insert(row).select().single(); if(error){notify(error.message);return} update('sales',[inserted,...data.sales]) }
      else update('sales',[{...row,id:Date.now(),created_at:new Date().toISOString()},...data.sales])
      await addActivity('Vente', `${row.quantity} × ${row.name}`, row.amount); setModal(''); notify('Vente enregistrée, en attente de validation.')
    } else if (modal === 'operation') {
      if (session && !canManageOperations) { notify('Seuls les responsables des opérations peuvent modifier le calendrier.'); return }
      const row = { title:f.get('title'), scheduled_at:new Date(f.get('scheduled_at')).toISOString(), location:f.get('location'), summary:f.get('summary'), details:f.get('details'), created_by:session?.user?.id }
      if (supabase && session) { const {data:inserted,error}=await supabase.from('operations').insert(row).select().single(); if(error){notify(error.message);return} update('operations',[...data.operations,inserted].sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at))) }
      else update('operations',[...data.operations,{...row,id:Date.now()}].sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at)))
      setModal(''); notify('Opération ajoutée au calendrier.')
    } else if (modal === 'drug') {
      if (session && !canManageDrug) { notify('Seuls les responsables Drogue peuvent publier une demande.'); return }
      const row = { name:f.get('name'), quantity:Number(f.get('quantity')), unit:f.get('unit'), notes:f.get('notes'), status:'Demandée', created_by:session?.user?.id, created_by_name:me }
      if (supabase && session) { const {data:inserted,error}=await supabase.from('drug_requests').insert(row).select().single(); if(error){notify(error.message);return} update('drugRequests',[inserted,...data.drugRequests]) }
      else update('drugRequests',[{...row,id:Date.now(),created_at:new Date().toISOString()},...data.drugRequests])
      await addActivity('Drogue', `${row.quantity.toLocaleString('fr-FR')} ${row.unit} de ${row.name} réclamé`); setModal(''); notify('Demande publiée sur le tableau de bord.')
    } else if (modal === 'account') {
      const display_name = f.get('display_name')
      if (supabase && session) {
        const { error } = await supabase.from('profiles').update({ display_name }).eq('id', session.user.id)
        if (error) { notify(error.message); return }
        const newPassword = f.get('password')
        if (newPassword) { const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword }); if(passwordError){notify(passwordError.message);return} }
      }
      setProfile(p=>({...p,display_name})); setModal(''); notify('Profil mis à jour.')
    }
  }
  const setSaleStatus = async (sale, status) => {
    if (session && !canManageReecel) { notify('Seul le jefe de REECEL peut valider ou refuser une vente.'); return }
    if (sale.status === 'Validée' && status !== 'Validée') { notify('Une vente déjà validée ne peut pas être annulée automatiquement.'); return }
    if (supabase && session) {
      const {error}=await supabase.from('sales').update({status,reviewed_by:session.user.id}).eq('id',sale.id); if(error){notify(error.message);return}
      if(status==='Validée' && sale.status!=='Validée') setCash(c=>({...c,sale:c.sale+Number(sale.amount)}))
    } else if(status==='Validée' && sale.status!=='Validée') setCash(c=>({...c,sale:c.sale+Number(sale.amount)}))
    if(status==='Validée' && sale.status!=='Validée') await addActivity('Vente',`Vente REECEL validée · ${sale.quantity} × ${sale.name}`,Number(sale.amount))
    update('sales',data.sales.map(s=>s.id===sale.id?{...s,status}:s)); notify(`Vente ${status.toLowerCase()}.`)
  }
  const setDrugStatus = async (request, status) => {
    if (session && !canManageDrug) { notify('Action réservée aux responsables Drogue.'); return }
    if (supabase && session) { const {error}=await supabase.from('drug_requests').update({status}).eq('id',request.id); if(error){notify(error.message);return} }
    update('drugRequests',data.drugRequests.map(r=>r.id===request.id?{...r,status}:r)); notify(`Demande ${status.toLowerCase()}.`)
  }
  const deleteDrugRequest = async request => {
    if (session && !canManageDrug) { notify('Suppression réservée aux responsables Drogue.'); return }
    if (request.status!=='Terminée') { notify('Une demande doit être terminée avant sa suppression.'); return }
    if (supabase && session) { const {error}=await supabase.from('drug_requests').delete().eq('id',request.id); if(error){notify(error.message);return} }
    update('drugRequests',data.drugRequests.filter(r=>r.id!==request.id)); notify('Demande Drogue terminée supprimée.')
  }
  const deleteReecelProduct = async product => {
    if (!canModerate) { notify('Seul le haut commandement peut supprimer un article fixé.'); return }
    if (supabase && session) { const {error}=await supabase.from('reecel_products').delete().eq('id',product.id); if(error){notify(error.message);return} }
    update('catalog',data.catalog.filter(p=>p.id!==product.id)); notify(`${product.name} retiré du catalogue.`)
  }
  const checkoutReecelCart = async (kind,cart) => {
    const lines=Object.entries(cart).filter(([,quantity])=>quantity>0).map(([id,quantity])=>({product_id:Number(id),quantity:Number(quantity)}))
    if(!lines.length){notify('Ajoute au moins un article au panier.');return false}
    if(supabase&&session){
      const {data:result,error}=await supabase.rpc('checkout_reecel_cart',{transaction_kind:kind,cart_items:lines})
      if(error){notify(error.message);return false}
      const transaction=result.transaction
      setCash(c=>({...c,sale:c.sale+(kind==='Vente'?1:-1)*Number(transaction.total)}))
      setData(d=>({...d,inventory:d.inventory.map(item=>result.inventory.find(i=>i.id===item.id)||item),catalog:d.catalog.map(p=>({...p,item:result.inventory.find(i=>i.id===p.inventory_item_id)||p.item})),transactions:[transaction,...d.transactions].slice(0,12)}))
      await addActivity(kind==='Vente'?'Vente':'Achat',`REECEL · ${kind} · ${transaction.items.map(i=>`${i.quantity} × ${i.name}`).join(', ')}`,kind==='Vente'?Number(transaction.total):-Number(transaction.total))
    }else{
      const receipt=lines.map(line=>{const product=data.catalog.find(p=>p.id===line.product_id);return product?{product_id:product.id,inventory_item_id:product.inventory_item_id,name:product.name,quantity:line.quantity,unit_price:Number(product.unit_price),subtotal:Number(product.unit_price)*line.quantity}:null}).filter(Boolean)
      if(receipt.length!==lines.length){notify('Un article du panier n’est plus disponible.');return false}
      if(kind==='Vente'){const insufficient=receipt.find(line=>Number(data.inventory.find(i=>i.id===line.inventory_item_id)?.quantity||0)<line.quantity);if(insufficient){notify(`Stock insuffisant pour ${insufficient.name}.`);return false}}
      const total=receipt.reduce((sum,line)=>sum+line.subtotal,0)
      if(kind==='Rachat'&&cash.sale<total){notify(`Fonds insuffisants : ${money(cash.sale)} disponibles dans la caisse sale.`);return false}
      const inventory=data.inventory.map(i=>{const line=receipt.find(r=>r.inventory_item_id===i.id);return line?{...i,quantity:Number(i.quantity)+(kind==='Rachat'?line.quantity:-line.quantity)}:i})
      const transaction={id:Date.now(),kind,total,items:receipt,buyer_name:me,created_at:new Date().toISOString()}
      update('inventory',inventory);update('catalog',data.catalog.map(p=>({...p,item:inventory.find(i=>i.id===p.inventory_item_id)||p.item})));update('transactions',[transaction,...data.transactions].slice(0,12));setCash(c=>({...c,sale:c.sale+(kind==='Vente'?total:-total)}))
      await addActivity(kind==='Vente'?'Vente':'Achat',`REECEL · ${kind} · ${receipt.map(i=>`${i.quantity} × ${i.name}`).join(', ')}`,kind==='Vente'?total:-total)
    }
    notify(kind==='Vente'?'Vente effectuée : stock diminué et caisse sale créditée.':'Rachat effectué : caisse sale débitée et stock augmenté.')
    return true
  }
  const deleteOperation = async operation => {
    if (session && !canManageOperations) { notify('Action réservée aux responsables des opérations.'); return }
    if (supabase && session) { const {error}=await supabase.from('operations').delete().eq('id',operation.id); if(error){notify(error.message);return} }
    update('operations',data.operations.filter(o=>o.id!==operation.id)); notify('Opération supprimée du calendrier.')
  }
  const adjustInventory = async (item, delta) => {
    if (session && !canManageInventory) { notify('Action réservée aux responsables de l’inventaire.'); return }
    const quantity = Math.max(0,Number(item.quantity)+delta)
    if (supabase && session) { const {error}=await supabase.from('inventory_items').update({quantity}).eq('id',item.id); if(error){notify(error.message);return} }
    update('inventory',data.inventory.map(i=>i.id===item.id?{...i,quantity}:i)); notify(`Stock de ${item.name} mis à jour.`)
  }
  const deleteInventory = async item => {
    if (session && !canModerate) { notify('Suppression réservée aux modérateurs.'); return }
    if (supabase && session) { const {error}=await supabase.from('inventory_items').delete().eq('id',item.id); if(error){notify(error.message);return} }
    update('inventory',data.inventory.filter(i=>i.id!==item.id)); notify(`${item.name} supprimé du stock.`)
  }
  const removeMember = async member => {
    if (!canModerate) { notify('Retrait réservé aux modérateurs.'); return }
    if (member.user_id) {
      const account=profiles.find(p=>p.id===member.user_id)
      if(account){await setAccountActive(account,false);return}
    }
    if (supabase && session) { const {error}=await supabase.from('members').delete().eq('id',member.id); if(error){notify(error.message);return} }
    update('members',data.members.filter(m=>m.id!==member.id)); notify(`${member.name} retiré du roster.`)
  }
  const updateAccountRank = async (account, rank) => {
    if (!canModerate) { notify('Réservé à l’espace modérateur.'); return }
    if (supabase && session) { const {error}=await supabase.from('profiles').update({rank}).eq('id',account.id); if(error){notify(error.message);return} }
    setProfiles(ps=>ps.map(p=>p.id===account.id?{...p,rank}:p)); if(session?.user?.id===account.id)setProfile(p=>({...p,rank})); update('members',data.members.map(m=>m.user_id===account.id?{...m,rank}:m)); notify(`Grade de ${account.display_name} mis à jour.`)
  }
  const setAccountActive = async (account, active) => {
    if (!canModerate) { notify('Réservé à l’espace modérateur.'); return }
    if (supabase && session) { const {error}=await supabase.from('profiles').update({active}).eq('id',account.id); if(error){notify(error.message);return} }
    let restoredMember=null
    if(active&&supabase&&session){const {data:member,error}=await supabase.from('members').select('*').eq('user_id',account.id).maybeSingle();if(error){notify(error.message);return}restoredMember=member}
    setData(d=>{
      const linked=d.members.find(m=>m.user_id===account.id)
      if(!active) return {...d,members:d.members.filter(m=>m.user_id!==account.id)}
      if(linked) return {...d,members:d.members.map(m=>m.user_id===account.id?{...m,name:account.display_name,rank:account.rank}:m)}
      return {...d,members:[{...(restoredMember||{}),id:restoredMember?.id||account.id,user_id:account.id,name:account.display_name,rank:account.rank,online:false},...d.members]}
    })
    setProfiles(ps=>ps.map(p=>p.id===account.id?{...p,active}:p)); notify(active?`Compte de ${account.display_name} réactivé.`:`Compte de ${account.display_name} désactivé.`)
    if(!active&&session?.user?.id===account.id)await supabase?.auth.signOut()
  }
  const decideApplication = async (applicant,status) => {
    if (session && !canManageRecruitment) { notify('La décision est réservée au jefe de recrutement et aux modérateurs.'); return }
    let newMember = null
    if (supabase && session && status === 'Acceptée') {
      const {data:result,error}=await supabase.rpc('approve_application',{application_id:applicant.id})
      if(error){notify(error.message);return}
      newMember=result?.member||null
    } else if (supabase && session) {
      const {error}=await supabase.from('applications').update({status}).eq('id',applicant.id)
      if(error){notify(error.message);return}
    }
    update('applicants',data.applicants.map(a=>a.id===applicant.id?{...a,status}:a))
    if(status==='Acceptée') {
      if(!newMember)newMember={id:Date.now(),name:applicant.name,rank:ranks[ranks.length-1],online:false,created_at:new Date().toISOString()}
      update('members',[newMember,...data.members.filter(m=>m.id!==newMember.id)])
    }
    notify(status==='Acceptée'?`${applicant.name} accepté et ajouté aux membres comme recrue.`:`${applicant.name} : candidature refusée.`)
  }
  const deleteApplication = async applicant => {
    if (!canModerate) { notify('Suppression réservée au haut commandement.'); return }
    if (supabase && session) { const {error}=await supabase.from('applications').delete().eq('id',applicant.id); if(error){notify(error.message);return} }
    update('applicants',data.applicants.filter(a=>a.id!==applicant.id)); notify(`Candidature de ${applicant.name} supprimée.`)
  }
  const filteredMembers = useMemo(() => data.members.filter(m => `${m.name} ${m.rank}`.toLowerCase().includes(query.toLowerCase())), [data.members, query])
  const total = cash.propre + cash.sale
  const me = profile?.display_name || session?.user?.email?.split('@')[0] || 'El Patrón'
  const currentRank = profile?.rank || (supabase ? ranks[ranks.length - 1] : ranks[0])
  const demoMode = !supabase
  const canModerate = demoMode || isModerator(currentRank)
  const canManageRecruitment = demoMode || canModerate || rankIs(currentRank, RECRUIT_RANKS)
  const canManageReecel = demoMode || canModerate || rankIs(currentRank, REECEL_RANKS)
  const canManageReecelCatalog = demoMode || canModerate || rankIs(currentRank, REECEL_CATALOG_RANKS)
  const canManageInventory = demoMode || canModerate || rankIs(currentRank, INVENTORY_RANKS)
  const canManageCash = demoMode || canModerate || rankIs(currentRank, CASH_RANKS)
  const canManageOperations = demoMode || canModerate || rankIs(currentRank, OPERATIONS_RANKS)
  const canManageDrug = demoMode || canModerate || rankIs(currentRank, DRUG_RANKS)

  if (supabase && loading && !session) return <div className="loading-screen"><div className="loader-mark"><Crown size={28}/></div><span>Ouverture de l’espace…</span></div>
  return <div className="app-shell">
    <header className="topbar">
      <div className="top-image" />
      <button className="mobile-menu icon-button" aria-label="Ouvrir le menu" onClick={() => setDrawer(!drawer)}><Menu size={20}/></button>
      <div className="brand"><div className="brand-crown"><Crown size={27}/></div><div className="brand-name">LOS <b>SINALOA’S</b></div><div className="brand-rule"><span/> FAMILLE · HONNEUR · LOYAUTÉ <span/></div></div>
      <div className="top-quote">« LE RESPECT FAIT LA FAMILLE,<br/> LA LOYAUTÉ FAIT LA FORCE. »<small>LOS SINALOA’S</small></div>
      <div className="account-actions">
        {session ? <><button className="user-chip" onClick={() => setModal('account')}><span className="avatar avatar-main">{me.slice(0,1).toUpperCase()}</span><span className="chip-copy"><b>{me}</b><small>{currentRank.replace(/^.*・/, '')}</small></span><Crown size={15} className="gold"/><ChevronDown size={16}/></button><button className="logout" onClick={async () => { await supabase.auth.signOut(); notify('Déconnexion réussie.') }}><LogOut size={17}/><span>Déconnexion</span></button></> : <button className="login-button" onClick={() => setModal('login')}><Shield size={16}/><span>Connexion</span></button>}
      </div>
    </header>
    <aside className={`sidebar ${drawer ? 'open' : ''}`}>
      <div className="sidebar-scroll">
        <div className="side-group-label">ESPACE FAMILIAL</div>
        <nav>{navItems.filter(([name]) => (name !== 'Modération' || canModerate) && (name !== 'Centre de veille' || canModerate)).map(([name, Icon]) => <button key={name} className={`nav-item ${page === name ? 'active' : ''}`} onClick={() => { setPage(name); setDrawer(false) }}><Icon size={20}/><span>{name}</span>{name === 'Recrutements' && data.applicants.length > 0 && <i>{data.applicants.length}</i>}</button>)}</nav>
        <div className="sidebar-spacer"/><div className="map-card"><div className="map-art">⚜</div><div className="map-caption"><span>TIERRA SINALOENSE</span><i/><small>HASTA LA MUERTE</small></div></div>
        <div className="sidebar-foot"><span className="online-dot"/> Espace sécurisé <span className="version">v1.0</span></div>
      </div>
    </aside>
    {drawer && <button className="scrim" aria-label="Fermer le menu" onClick={() => setDrawer(false)}/>}
    <main className="main-content">
      <div className="page-heading"><div className="heading-title"><div className="heading-icon"><LayoutDashboard size={22}/></div><div><h1>{page}</h1><p>{page === 'Tableau de bord' ? 'Vue d’ensemble des activités de Los Sinaloa’s' : `Gestion de ${page.toLowerCase()} de la famille`}</p></div></div><div className="heading-meta"><div className="meta-pill"><CalendarDays size={16}/><span>{new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date())}</span></div><div className="meta-pill clock-pill"><Clock3 size={16}/><span>{new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'}).format(new Date())}</span></div></div></div>
      {page === 'Tableau de bord' ? <>
        <section className="stats-grid">
          <Stat icon={<Users/>} label="Membres" value={data.members.length} note="Dans la famille" tone="green" image="members"/>
          <Stat icon={<Banknote/>} label="Caisse propre" value={money(cash.propre)} note="Fonds familiaux" tone="green" image="clean"/>
          <Stat icon={<DollarSign/>} label="Caisse sale" value={money(cash.sale)} note="Fonds en circulation" tone="green" image="dirty"/>
          <Stat icon={<Box/>} label="Objets en stock" value={data.inventory.reduce((a,b)=>a+Number(b.quantity),0)} note="Unités inventoriées" tone="green" image="stock"/>
          <Stat icon={<UserRoundPlus/>} label="Candidatures" value={data.applicants.length} note="En attente" tone="amber" image="applicants"/>
        </section>
        <section className="panel drug-dashboard-panel"><div className="panel-head"><div className="panel-title"><Sparkles/><h2>Demandes Drogue</h2></div><button className="text-action" onClick={() => setPage('Drogue')}>Voir tout <ArrowRight size={14}/></button></div><div className="drug-dashboard-list">{data.drugRequests.length?data.drugRequests.slice(0,3).map(r=><button className="drug-dashboard-item" key={r.id} onClick={() => setPage('Drogue')}><span className="drug-dashboard-emoji">🌿</span><span><b>{Number(r.quantity).toLocaleString('fr-FR')} {r.unit} · {r.name}</b><small>{r.status} · {r.created_by_name||'Demande familiale'}</small></span><ArrowRight size={15}/></button>):<div className="drug-dashboard-empty">🌱 Aucune demande publiée pour le moment.</div>}</div></section>
        <section className="content-grid main-panels">
          <Panel title="Dernières activités" icon={<Clock3/>} action="Voir tout" onAction={() => setPage('Historique')} className="activity-panel"><div className="activity-list">{data.activities.slice(0,5).map((a,i)=><ActivityRow key={i} item={a}/>)}</div></Panel>
          <Panel title="Répartition de la caisse" icon={<BriefcaseBusiness/>} className="cash-panel"><div className="cash-content"><div className="donut" style={{'--share':`${total ? cash.sale/total*100 : 0}%`}}><div className="donut-center"><small>Total</small><b>{money(total)}</b></div></div><div className="cash-legend"><div><i className="legend-dot dirty"/><span>Argent sale<b>{money(cash.sale)} <small>({total ? Math.round(cash.sale/total*100) : 0}%)</small></b></span></div><div><i className="legend-dot clean"/><span>Argent propre<b>{money(cash.propre)} <small>({total ? Math.round(cash.propre/total*100) : 0}%)</small></b></span></div></div></div></Panel>
        </section>
        <section className="content-grid lower-panels">
          <Panel title="Inventaire rapide" icon={<Box/>} action="Voir tout" onAction={() => setPage('Inventaire')}><div className="inventory-list">{data.inventory.slice(0,5).map(item=><div className="inventory-row" key={item.id}><div className="item-thumb">{item.icon || '📦'}</div><div className="item-copy"><b>{item.name}</b><small>{item.category}</small></div><span className="item-count">{item.quantity}</span></div>)}</div></Panel>
          <Panel title="Membres récents" icon={<Users/>} action="Voir tout" onAction={() => setPage('Membres')}><div className="member-list">{data.members.slice(0,5).map((m,i)=><div className="member-row" key={m.id}><span className={`avatar avatar-${i%5}`}>{m.name.slice(0,1).toUpperCase()}</span><span className={`status-dot ${m.online?'':'offline'}`}/><div className="member-copy"><b>{m.name}</b><small>{m.rank.replace(/^.*・/, '')}</small></div><time>{i===0?'Aujourd’hui':i===1?'Hier':`${22-i} avr.`}</time></div>)}</div></Panel>
          <Panel title="Candidatures récentes" icon={<UserRoundPlus/>} action="Voir tout" onAction={() => setPage('Recrutements')}><div className="applicant-list">{data.applicants.slice(0,4).map((a,i)=><div className="applicant-row" key={a.id}><span className={`avatar applicant-avatar avatar-${i%5}`}>{a.name.slice(0,1).toUpperCase()}</span><div className="applicant-copy"><b>{a.name}</b><small>{a.reason}</small></div><span className="pending-tag">{a.status}</span></div>)}</div></Panel>
        </section>
      </> : <PageContent page={page} data={data} cash={cash} profiles={profiles} currentRank={currentRank} isModerator={canModerate} canManageRecruitment={canManageRecruitment} canManageReecel={canManageReecel} canManageReecelCatalog={canManageReecelCatalog} canManageInventory={canManageInventory} canManageCash={canManageCash} canManageOperations={canManageOperations} canManageDrug={canManageDrug} query={query} setQuery={setQuery} members={filteredMembers} onAdd={setModal} onMemberQuota={setMemberQuota} onNotify={notify} onNavigate={setPage} onApplicantStatus={decideApplication} onApplicantDelete={deleteApplication} onSaleStatus={setSaleStatus} onDrugStatus={setDrugStatus} onDrugDelete={deleteDrugRequest} onReecelCheckout={checkoutReecelCart} onReecelProductDelete={deleteReecelProduct} onDeleteOperation={deleteOperation} onInventoryAdjust={adjustInventory} onInventoryDelete={deleteInventory} onAccountRank={updateAccountRank} onAccountActive={setAccountActive} onMemberDelete={removeMember} onMemberRank={async (member, rank) => { if (session && !canModerate) {notify('Réservé à l’espace modérateur.');return} if (supabase && session) { if(member.user_id) {const {error}=await supabase.from('profiles').update({rank}).eq('id',member.user_id);if(error){notify(error.message);return}} const {error}=await supabase.from('members').update({ rank }).eq('id', member.id); if(error){notify(error.message);return} } update('members', data.members.map(m=>m.id===member.id?{...m,rank}:m)); setProfiles(ps=>ps.map(p=>p.id===member.user_id?{...p,rank}:p)); notify(`Grade de ${member.name} modifié.`) }} />}
      <footer className="footer"><span>LOS SINALOA’S</span><span>UNE FAMILLE · UN NOM · UN EMPIRE</span><span className="footer-live"><i className="online-dot"/> {supabase && session ? 'Synchronisé' : 'Mode démo'}</span></footer>
    </main>
    {modal && <Modal type={modal} onClose={() => setModal('')} onSubmit={onSubmit} onSwitchAuth={setModal} profile={profile} email={session?.user?.email} />}
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>
}

function Stat({icon,label,value,note,tone,image}){return <div className={`stat-card ${image}`}><div className="stat-bg"/><div className="stat-icon">{icon}</div><div className="stat-copy"><span>{label}</span><b>{value}</b><small className={tone}><ArrowUpRight size={13}/>{note}</small></div></div>}
function Panel({title,icon,action,onAction,children,className=''}){return <article className={`panel ${className}`}><div className="panel-head"><div className="panel-title">{icon}<h2>{title}</h2></div>{action&&<button className="text-action" onClick={onAction}>{action}<ArrowRight size={14}/></button>}</div>{children}</article>}
function ActivityRow({item}){const kind=(item.type||'').toLowerCase();const Icon=kind==='vente'?Sparkles:kind==='achat'?ShoppingCart:kind==='recrutement'?Users:kind==='membre'?Users:Package;return <div className="activity-row"><span className={`activity-kind ${kind}`}><Icon size={15}/><b>{item.type}</b></span><span className="activity-description">{item.text}</span><b className={`activity-amount ${item.amount?.startsWith('−')?'negative':''}`}>{item.amount}</b><time>{item.time}</time><span className="activity-by">par {item.by}</span></div>}
function PageContent({page,data,cash,profiles,currentRank,isModerator,canManageRecruitment,canManageReecel,canManageReecelCatalog,canManageInventory,canManageCash,canManageOperations,canManageDrug,query,setQuery,members,onAdd,onNotify,onNavigate,onMemberQuota,onMemberRank,onApplicantStatus,onApplicantDelete,onSaleStatus,onDrugStatus,onDrugDelete,onReecelCheckout,onReecelProductDelete,onDeleteOperation,onInventoryAdjust,onInventoryDelete,onAccountRank,onAccountActive,onMemberDelete}){
  const [selectedRank,setSelectedRank]=useState('')
  if(page==='Membres') return <><div className="section-toolbar"><label className="search-box"><Search size={17}/><input placeholder="Rechercher un membre…" value={query} onChange={e=>setQuery(e.target.value)}/></label>{isModerator&&<button className="primary-button" onClick={()=>onAdd('member')}><Plus size={16}/> Ajouter un membre</button>}</div><div className="panel table-panel"><div className="panel-head"><div className="panel-title"><Users/><h2>Membres de la famille</h2></div><span className="subtle-count">{members.length} membres</span></div><div className="table-wrap"><table><thead><tr><th>Membre</th><th>Grade</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{members.length?members.map((m,i)=><tr key={m.id}><td><span className="table-member"><span className={`avatar avatar-${i%5}`}>{m.name.slice(0,1)}</span><b>{m.name}</b></span></td><td>{isModerator?<select className="rank-select" value={m.rank} onChange={e=>onMemberRank(m,e.target.value)}>{ranks.map(r=><option key={r}>{r}</option>)}</select>:<span className="rank-label">{m.rank}</span>}</td><td><span className="status-label"><i className={`status-dot ${m.online?'':'offline'}`}/>{m.online?'En ligne':'Hors ligne'}</span></td><td>{isModerator?<button className="small-action remove-member" onClick={()=>onMemberDelete(m)}><Trash2 size={14}/> Retirer</button>:<button className="small-action" onClick={()=>onNotify(`Profil de ${m.name}`)}>Profil <ArrowRight size={14}/></button>}</td></tr>):<tr><td colSpan="4"><div className="table-empty">Aucun membre pour l’instant. Les comptes invités apparaîtront ici automatiquement.</div></td></tr>}</tbody></table></div></div></>
  if(page==='Quotas') return <QuotaPage members={members} quotas={data.quotas||{}} onSet={onMemberQuota}/>
  if(page==='Hiérarchie') { const activeProfiles=profiles.filter(p=>p.active); const people=[...activeProfiles.filter(p=>p.rank===selectedRank),...members.filter(m=>m.rank===selectedRank&&!m.user_id)]; return <><div className="hierarchy-grid">{ranks.map((r,i)=><button className={`rank-card rank-${i} ${selectedRank===r?'selected':''}`} key={r} onClick={()=>setSelectedRank(selectedRank===r?'':r)}><div className="rank-symbol">{i<3?<Crown/>:i<15?<BriefcaseBusiness/>:<Users/>}</div><div><small>RANG {String(i+1).padStart(2,'0')}</small><h3>{r}</h3><p>{people.length&&selectedRank===r?people.length:activeProfiles.filter(p=>p.rank===r).length+members.filter(m=>m.rank===r&&!m.user_id).length} membre(s)</p></div></button>)}</div>{selectedRank&&<Panel title={`Profils — ${selectedRank}`} icon={<Users/>}><div className="rank-people">{people.length?people.map((p,i)=><div className="rank-person" key={p.id||p.user_id||i}><span className={`avatar avatar-${i%5}`}>{(p.display_name||p.name).slice(0,1).toUpperCase()}</span><span><b>{p.display_name||p.name}</b><small>{'active' in p?(p.active?'Compte actif':'Compte désactivé'):p.online?'En ligne':'Membre du roster'}</small></span>{'active' in p&&<span className="connection-tag connected">Profil familial</span>}</div>):<div className="empty-accounts">Aucune personne n’a encore ce grade.</div>}</div></Panel>}</> }
  if(page==='Inventaire') return <><div className="section-toolbar"><div className="toolbar-note">Suivi des objets et quantités de la famille</div>{canManageInventory&&<button className="primary-button" onClick={()=>onAdd('item')}><Plus size={16}/> Ajouter un article</button>}</div><div className="inventory-grid">{data.inventory.map(item=><article className="inventory-card" key={item.id}><span className="inventory-emoji">{item.icon||'📦'}</span><span className="category-tag">{item.category}</span><h3>{item.name}</h3><div className="inventory-quantity"><span>Quantité en stock</span><b>{item.quantity}</b></div><div className="stock-meter"><i style={{width:`${Math.min(Number(item.quantity)*3,100)}%`}}/></div>{canManageInventory&&<div className="stock-actions"><button onClick={()=>onInventoryAdjust(item,-1)} aria-label="Retirer une unité">−</button><button onClick={()=>onInventoryAdjust(item,1)} aria-label="Ajouter une unité">+</button>{isModerator&&<button className="delete-action" onClick={()=>onInventoryDelete(item)} aria-label="Supprimer l’article"><Trash2 size={14}/></button>}</div>}</article>)}</div></>
  if(page==='Recrutements') return <><div className="section-toolbar"><div className="toolbar-note">Le jefe de recrutement traite et décide des candidatures. Le haut commandement peut nettoyer les anciennes fiches.</div>{canManageRecruitment&&<button className="primary-button" onClick={()=>onAdd('applicant')}><Plus size={16}/> Nouvelle candidature</button>}</div><div className="candidate-grid">{data.applicants.map((a,i)=><article className="candidate-card" key={a.id}><div className="candidate-top"><span className={`avatar avatar-${i%5}`}>{a.name.slice(0,1)}</span><span className={`pending-tag ${a.status==='Acceptée'?'approved-tag':a.status==='Refusée'?'rejected-tag':''}`}>{a.status}</span>{isModerator&&<button className="candidate-delete" title="Supprimer cette candidature" aria-label={`Supprimer la candidature de ${a.name}`} onClick={()=>onApplicantDelete(a)}><Trash2 size={15}/></button>}</div><h3>{a.name}</h3><p>{a.reason}</p>{canManageRecruitment&&a.status==='En attente'&&<div className="candidate-actions"><button className="approve-button" onClick={()=>onApplicantStatus(a,'Acceptée')}><Check size={15}/> Accepter</button><button className="reject-button" onClick={()=>onApplicantStatus(a,'Refusée')}><X size={15}/> Refuser</button></div>}</article>)}</div></>
  if(page==='Caisse familiale') return <CashPage onAdd={onAdd} data={data} cash={cash} canManageCash={canManageCash}/>
  if(page==='REECEL & Ventes') return <ReecelPage data={data} cashSale={cash.sale} canManageReecel={canManageReecel} canManageCatalog={canManageReecelCatalog} isModerator={isModerator} onAdd={onAdd} onSaleStatus={onSaleStatus} onCheckout={onReecelCheckout} onDeleteProduct={onReecelProductDelete}/>
  if(page==='Drogue') return <DrugPage requests={data.drugRequests} canManage={canManageDrug} onAdd={onAdd} onStatus={onDrugStatus} onDelete={onDrugDelete}/>
  if(page==='Opérations') return <OperationsPage operations={data.operations} canManage={canManageOperations} onAdd={onAdd} onDelete={onDeleteOperation}/>
  if(page==='Centre de veille') return isModerator?<WatchPage data={data} onNavigate={onNavigate}/>:<div className="panel access-denied"><Shield/><h2>Accès réservé</h2><p>Le Centre de veille est réservé au haut commandement.</p></div>
  if(page==='Modération') return isModerator?<ModerationPage data={data} cash={cash} profiles={profiles} onNavigate={onNavigate} onAccountRank={onAccountRank} onAccountActive={onAccountActive} onAdd={onAdd}/>:<div className="panel access-denied"><Shield/><h2>Accès réservé</h2><p>L’espace modérateur est accessible uniquement à El Patrón, la Mano Derecha et la Mano de Izquierda.</p></div>
  if(page==='Historique') return <Panel title="Journal des activités" icon={<FileClock/>}><div className="history-list">{data.activities.map((a,i)=><ActivityRow key={i} item={a}/>)}</div></Panel>
  return <div className="settings-grid"><Panel title="Espace familial" icon={<Settings/>}><div className="setting-line"><span><b>Nom affiché</b><small>Identité de votre espace</small></span><b>Los Sinaloa’s</b></div><div className="setting-line"><span><b>Devise</b><small>Format des montants</small></span><b>Dollar ($)</b></div><div className="setting-line"><span><b>Connexion base de données</b><small>État de la synchronisation</small></span><span className={`connection-tag ${supabase?'connected':''}`}>{supabase?'Supabase prêt':'Mode démo'}</span></div></Panel><Panel title="Comptes & grades" icon={<Shield/>}><p className="settings-copy">Chaque personne peut créer un compte avec son e-mail et un mot de passe depuis le bouton Connexion. Supabase crée automatiquement son profil au grade Recrue. Les hauts gradés peuvent ensuite lui attribuer un autre grade dans Modération. Ouvre ton profil en haut à droite pour changer ton nom affiché ou ton mot de passe.</p><button className="primary-button" onClick={()=>onNavigate('Hiérarchie')}><Crown size={16}/> Voir la hiérarchie</button></Panel></div>
}
function CashPage({onAdd,data,cash,canManageCash}){return <><div className="cash-summary"><div><span>Caisse propre</span><b>{money(cash.propre)}</b><small>Fonds familiaux</small></div><div><span>Caisse sale</span><b>{money(cash.sale)}</b><small>Fonds en circulation</small></div><div><span>Dernière activité</span><b>{data.activities[0]?.time||'—'}</b><small>Historique de la caisse</small></div></div><div className="section-toolbar"><div className="toolbar-note">Les entrées et sorties sont enregistrées dans le journal.</div>{canManageCash&&<button className="primary-button" onClick={()=>onAdd('cash')}><Plus size={16}/> Nouveau mouvement</button>}</div><Panel title="Mouvements récents" icon={<Activity/>}><div className="history-list">{data.activities.filter(a=>['Vente','Achat','Caisse'].includes(a.type)).map((a,i)=><ActivityRow key={i} item={a}/>)}</div></Panel></>}
function ReecelPage({data,cashSale,canManageReecel,canManageCatalog,isModerator,onAdd,onSaleStatus,onCheckout,onDeleteProduct}){
  const [cart,setCart]=useState({}),[kind,setKind]=useState('Vente')
  const itemFor=product=>data.inventory.find(item=>item.id===product?.inventory_item_id)||product?.item
  const cartLines=data.catalog.filter(product=>Number(cart[product.id])>0).map(product=>({product,quantity:Number(cart[product.id]),subtotal:Number(product.unit_price)*Number(cart[product.id])}))
  const total=cartLines.reduce((sum,line)=>sum+line.subtotal,0)
  const changeQuantity=(product,delta)=>setCart(current=>{const next=Math.max(0,Number(current[product.id]||0)+delta);if(kind==='Vente'&&next>Number(itemFor(product)?.quantity||0))return current;const updated={...current};if(next===0)delete updated[product.id];else updated[product.id]=next;return updated})
  const changeKind=next=>{setKind(next);if(next==='Vente')setCart(current=>Object.fromEntries(Object.entries(current).map(([id,quantity])=>{const product=data.catalog.find(p=>p.id===Number(id));return [id,Math.min(Number(quantity),Number(itemFor(product)?.quantity||0))]}).filter(([,quantity])=>quantity>0)))}
  const submit=async()=>{if(await onCheckout(kind,cart))setCart({})}
  return <>
    <div className="section-toolbar"><div className="toolbar-note">Catalogue REECEL · ventes et rachats débités/crédités dans la caisse sale.</div><div className="reecel-toolbar-actions">{canManageCatalog&&<button className="secondary-button" onClick={()=>onAdd('product')}><Plus size={15}/> Fixer un article</button>}{canManageReecel&&<button className="primary-button" onClick={()=>onAdd('sale')}><Plus size={16}/> Déclarer une vente</button>}</div></div>
    <div className="reecel-store-layout"><section className="panel reecel-catalog"><div className="panel-head"><div className="panel-title"><Package/><h2>Catalogue & prix fixes</h2></div><span className="subtle-count">{data.catalog.length} articles · stock vente {data.catalog.reduce((n,p)=>n+Number(itemFor(p)?.quantity||0),0)}</span></div>{data.catalog.length?<div className="reecel-product-list">{data.catalog.map(product=>{const item=itemFor(product),stock=Number(item?.quantity||0);return <article className="reecel-product" key={product.id}><span className="reecel-product-icon">{item?.icon||'📦'}</span><span className="reecel-product-info"><b>{product.name}</b><small>{item?.category||'Catalogue'} · {stock} en stock</small></span><b className="reecel-product-price">{money(product.unit_price)}</b><button className="reecel-add" onClick={()=>changeQuantity(product,1)} disabled={kind==='Vente'&&stock<=Number(cart[product.id]||0)} aria-label={`Ajouter ${product.name} au panier`}><Plus size={16}/></button>{isModerator&&<button className="reecel-remove" onClick={()=>onDeleteProduct(product)} title="Supprimer du catalogue" aria-label={`Supprimer ${product.name}`}><Trash2 size={14}/></button>}</article>})}</div>:<div className="reecel-empty"><span>🧾</span><b>Le catalogue est encore vide</b><small>Le chef REECEL, son assistant ou le haut commandement peut y fixer le premier article avec son prix.</small>{canManageCatalog&&<button className="primary-button" onClick={()=>onAdd('product')}><Plus size={15}/> Ajouter le premier article</button>}</div>}</section>
    <aside className="panel reecel-cart"><div className="panel-head"><div className="panel-title"><ShoppingCart/><h2>Panier</h2></div><span className="subtle-count">{cartLines.reduce((n,line)=>n+line.quantity,0)} article(s)</span></div><div className="reecel-mode-switch"><button className={kind==='Vente'?'active':''} onClick={()=>changeKind('Vente')}><ArrowUpRight size={15}/> Vente</button><button className={kind==='Rachat'?'active':''} onClick={()=>changeKind('Rachat')}><ArrowDownRight size={15}/> Rachat</button></div><div className="reecel-mode-hint">{kind==='Vente'?'La famille reçoit l’argent sale ; les quantités sortent du stock.':'La caisse sale paie ; les quantités entrent dans le stock.'}</div><div className="reecel-cart-lines">{cartLines.length?cartLines.map(({product,quantity,subtotal})=><div className="reecel-cart-line" key={product.id}><div><b>{product.name}</b><small>{money(product.unit_price)} × {quantity} = {money(subtotal)}</small></div><div className="quantity-stepper"><button onClick={()=>changeQuantity(product,-1)} aria-label="Retirer une unité">−</button><span>{quantity}</span><button onClick={()=>changeQuantity(product,1)} disabled={kind==='Vente'&&quantity>=Number(itemFor(product)?.quantity||0)} aria-label="Ajouter une unité">+</button></div></div>):<div className="reecel-cart-empty">Choisis un article dans le catalogue pour commencer.</div>}</div><div className="reecel-cart-total"><span>Total · argent sale</span><b>{money(total)}</b><small>{kind==='Vente'?`Solde actuel : ${money(cashSale)} · crédité après validation`:`Solde actuel : ${money(cashSale)} · débité au rachat`}</small></div><button className="primary-button reecel-checkout" disabled={!cartLines.length} onClick={submit}>{kind==='Vente'?<><Check size={16}/> Confirmer la vente</>:<><HandCoins size={16}/> Confirmer le rachat</>}</button></aside></div>
    <Panel title="Dernières opérations du catalogue" icon={<History/>}><div className="reecel-receipts">{data.transactions.length?data.transactions.slice(0,8).map(tx=><div className="reecel-receipt" key={tx.id}><span className={`receipt-kind ${tx.kind==='Vente'?'receipt-sale':'receipt-buy'}`}>{tx.kind==='Vente'?'↗ Vente':'↙ Rachat'}</span><span className="receipt-items">{(tx.items||[]).map(line=>`${line.quantity} × ${line.name}`).join(' · ')}</span><b className={tx.kind==='Vente'?'receipt-positive':'receipt-negative'}>{tx.kind==='Vente'?'+':'−'} {money(tx.total)}</b><small>{tx.buyer_name||'Membre'} · {new Date(tx.created_at).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'})}</small></div>):<div className="reecel-cart-empty">Les opérations du catalogue apparaîtront ici.</div>}</div></Panel>
    <div className="panel table-panel reecel-declared-sales"><div className="panel-head"><div className="panel-title"><ShoppingCart/><h2>Registre des ventes à valider</h2></div><span className="subtle-count">{data.sales.length} opérations</span></div><div className="table-wrap"><table><thead><tr><th>Opération</th><th>Quantité</th><th>Montant</th><th>Déclarée par</th><th>État</th><th>Validation</th></tr></thead><tbody>{data.sales.map(s=><tr key={s.id}><td><b>{s.name}</b><small className="table-date">{new Date(s.created_at).toLocaleDateString('fr-FR')}</small></td><td>{s.quantity}</td><td>{money(s.amount)}</td><td>{s.created_by_name||'Membre'}</td><td><span className={`pending-tag ${s.status==='Validée'?'approved-tag':s.status==='Refusée'?'rejected-tag':''}`}>{s.status}</span></td><td>{canManageReecel&&s.status==='En attente'?<span className="table-actions"><button className="approve-icon" aria-label="Valider la vente" onClick={()=>onSaleStatus(s,'Validée')}><Check size={15}/></button><button className="reject-icon" aria-label="Refuser la vente" onClick={()=>onSaleStatus(s,'Refusée')}><X size={15}/></button></span>:<span className="muted-dash">—</span>}</td></tr>)}</tbody></table></div></div>
  </>
}
function DrugPage({requests,canManage,onAdd,onStatus,onDelete}){return <><div className="section-toolbar"><div className="toolbar-note">Les demandes publiées sont visibles par toute la famille et sur le tableau de bord.</div>{canManage&&<button className="primary-button" onClick={()=>onAdd('drug')}><Plus size={16}/> Nouvelle demande</button>}</div><div className="drug-request-grid">{requests.length?requests.map((r,i)=><article className="drug-request-card" key={r.id}><div className="drug-card-top"><span className="drug-icon">🌿</span><span className={`pending-tag ${r.status==='Terminée'?'approved-tag':''}`}>{r.status}</span></div><h3>{Number(r.quantity).toLocaleString('fr-FR')} {r.unit} · {r.name}</h3><p>{r.notes||'Aucun détail supplémentaire.'}</p><small>Demandé par {r.created_by_name||'un membre'}</small>{canManage&&<label className="status-select-label">État<select value={r.status} onChange={e=>onStatus(r,e.target.value)}><option>Demandée</option><option>En cours</option><option>Terminée</option></select></label>}{canManage&&r.status==='Terminée'&&<button className="drug-delete-button" onClick={()=>onDelete(r)}><Trash2 size={14}/> Supprimer la demande terminée</button>}</article>):<div className="panel empty-state"><Sparkles/><h3>Aucune demande pour le moment</h3><p>Les demandes publiées ici apparaîtront également sur le tableau de bord.</p>{canManage&&<button className="primary-button" onClick={()=>onAdd('drug')}><Plus size={15}/> Créer une demande</button>}</div>}</div></>}
function OperationsPage({operations,canManage,onAdd,onDelete}){const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));const [selected,setSelected]=useState(new Date().toISOString().slice(0,10));const [open,setOpen]=useState(null);const monthName=new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(month);const offset=(month.getDay()+6)%7;const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();const cells=Array.from({length:Math.ceil((offset+count)/7)*7},(_,i)=>{const day=i-offset+1;return day<1||day>count?null:new Date(month.getFullYear(),month.getMonth(),day)});const key=d=>d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'';const dayOps=operations.filter(o=>key(new Date(o.scheduled_at))===selected);return <><div className="section-toolbar"><div className="toolbar-note">Le calendrier est visible par tous ; seuls les responsables des opérations le modifient.</div>{canManage&&<button className="primary-button" onClick={()=>onAdd('operation')}><Plus size={16}/> Planifier une opération</button>}</div><div className="operations-layout"><section className="panel calendar-panel"><div className="calendar-head"><button className="icon-button" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft size={17}/></button><h2>{monthName}</h2><button className="icon-button" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight size={17}/></button></div><div className="calendar-grid">{['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d=><span className="weekday" key={d}>{d}</span>)}{cells.map((d,i)=>{const dateKey=key(d),hasEvent=operations.some(o=>key(new Date(o.scheduled_at))===dateKey);return <button key={i} disabled={!d} className={`calendar-day ${d&&dateKey===selected?'selected':''} ${d&&key(d)===key(new Date())?'today':''} ${hasEvent?'has-event':''}`} onClick={()=>{setSelected(dateKey);setOpen(null)}}>{d?.getDate()}{hasEvent&&<i/>}</button>})}</div></section><section className="panel day-panel"><div className="panel-head"><div className="panel-title"><CalendarDays/><h2>{selected?new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(new Date(`${selected}T12:00:00`)):'Choisir une date'}</h2></div></div><div className="day-operations">{dayOps.length?dayOps.map(o=><button className={`operation-list-card ${open?.id===o.id?'selected':''}`} key={o.id} onClick={()=>setOpen(open?.id===o.id?null:o)}><time>{new Date(o.scheduled_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</time><span><b>{o.title}</b><small>{o.location||'Lieu à préciser'}</small></span><ChevronRight size={16}/></button>):<div className="mini-empty">Aucune opération ce jour-là.</div>}{open&&<article className="operation-details"><div className="details-title"><h3>{open.title}</h3>{canManage&&<button className="delete-action" onClick={()=>onDelete(open)} aria-label="Supprimer"><Trash2 size={14}/></button>}</div><p className="detail-meta">{new Date(open.scheduled_at).toLocaleString('fr-FR',{dateStyle:'full',timeStyle:'short'})} · {open.location||'Lieu à préciser'}</p><p>{open.details||open.summary}</p></article>}</div></section></div></>}
function WatchPage({data,onNavigate}){
  const now=new Date(),limit=new Date(now.getTime()+14*86400000)
  const upcoming=data.operations.filter(o=>new Date(o.scheduled_at)>=now&&new Date(o.scheduled_at)<=limit).sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at)).slice(0,5)
  const pending=data.applicants.filter(a=>a.status==='En attente')
  const openRequests=data.drugRequests.filter(r=>r.status!=='Terminée').slice(0,5)
  const lowStock=data.inventory.filter(i=>Number(i.quantity)<=5).sort((a,b)=>Number(a.quantity)-Number(b.quantity)).slice(0,6)
  const quick=[{label:'Candidatures à traiter',value:pending.length,icon:<UserRoundPlus/>,target:'Recrutements',tone:pending.length?'amber':''},{label:'Demandes Drogue actives',value:openRequests.length,icon:<Sparkles/>,target:'Drogue',tone:openRequests.length?'amber':''},{label:'Opérations · 14 jours',value:upcoming.length,icon:<CalendarDays/>,target:'Opérations',tone:''},{label:'Stocks bas',value:lowStock.length,icon:<Box/>,target:'Inventaire',tone:lowStock.length?'red':''}]
  return <><div className="watch-intro"><div className="watch-symbol"><Activity size={23}/></div><div><span className="eyebrow">VUE FAMILIALE · MISE À JOUR AVEC LES DONNÉES DU SITE</span><h2>Centre de veille</h2><p>Les points à garder à l’œil, regroupés au même endroit.</p></div><time>{new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(now)}</time></div><section className="watch-metrics">{quick.map(item=><button key={item.label} className={`watch-metric ${item.tone}`} onClick={()=>onNavigate(item.target)}><span className="watch-metric-icon">{item.icon}</span><span><small>{item.label}</small><b>{item.value}</b></span><ArrowRight size={15}/></button>)}</section><section className="watch-grid"><Panel title="À venir · 14 jours" icon={<CalendarDays/>} action="Ouvrir le calendrier" onAction={()=>onNavigate('Opérations')}><div className="watch-list">{upcoming.length?upcoming.map(o=><button className="watch-row" key={o.id} onClick={()=>onNavigate('Opérations')}><span className="watch-row-icon">🗓️</span><span><b>{o.title}</b><small>{new Date(o.scheduled_at).toLocaleString('fr-FR',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · {o.location||'Lieu à préciser'}</small></span><ArrowRight size={14}/></button>):<div className="watch-empty">Aucune opération planifiée dans les 14 prochains jours.</div>}</div></Panel><Panel title="Demandes Drogue actives" icon={<Sparkles/>} action="Voir les demandes" onAction={()=>onNavigate('Drogue')}><div className="watch-list">{openRequests.length?openRequests.map(r=><button className="watch-row" key={r.id} onClick={()=>onNavigate('Drogue')}><span className="watch-row-icon">🌿</span><span><b>{Number(r.quantity).toLocaleString('fr-FR')} {r.unit} · {r.name}</b><small>{r.status} · {r.created_by_name||'Demande familiale'}</small></span><ArrowRight size={14}/></button>):<div className="watch-empty">Aucune demande en cours.</div>}</div></Panel><Panel title="Candidatures en attente" icon={<UserRoundPlus/>} action="Ouvrir les recrutements" onAction={()=>onNavigate('Recrutements')}><div className="watch-list">{pending.length?pending.slice(0,5).map(a=><button className="watch-row" key={a.id} onClick={()=>onNavigate('Recrutements')}><span className="watch-row-icon">👤</span><span><b>{a.name}</b><small>{a.reason||'Motivation non renseignée'}</small></span><ArrowRight size={14}/></button>):<div className="watch-empty">Toutes les candidatures ont été traitées.</div>}</div></Panel><Panel title="Stock à surveiller · 5 unités ou moins" icon={<Box/>} action="Ouvrir l’inventaire" onAction={()=>onNavigate('Inventaire')}><div className="watch-list">{lowStock.length?lowStock.map(i=><button className="watch-row" key={i.id} onClick={()=>onNavigate('Inventaire')}><span className="watch-row-icon">{i.icon||'📦'}</span><span><b>{i.name}</b><small>{i.category} · {Number(i.quantity)===0?'Rupture':`${i.quantity} unité(s)`}</small></span><span className={`watch-stock ${Number(i.quantity)===0?'empty':''}`}>{i.quantity}</span></button>):<div className="watch-empty">Aucun article en stock bas.</div>}</div></Panel></section><Panel title="Activité récente" icon={<Clock3/>} action="Ouvrir l’historique" onAction={()=>onNavigate('Historique')}><div className="history-list">{data.activities.slice(0,5).map((a,i)=><ActivityRow key={i} item={a}/>)}</div>{!data.activities.length&&<div className="watch-empty">Aucune activité récente.</div>}</Panel></>
}
function ModerationPage({data,cash,profiles,onNavigate,onAccountRank,onAccountActive,onAdd}){return <><div className="moderation-banner"><div className="moderation-mark"><Shield size={22}/></div><div><span className="eyebrow">ACCÈS RESTREINT · 3 GRADES</span><h2>Espace modérateur</h2><p>El Patrón · Mano Derecha · Mano de Izquierda</p></div></div><div className="moderation-stats"><button onClick={()=>onNavigate('Membres')}><Users/><span>Membres<b>{data.members.length}</b></span><ArrowRight/></button><button onClick={()=>onNavigate('Inventaire')}><Box/><span>Stock<b>{data.inventory.length} références</b></span><ArrowRight/></button><button onClick={()=>onNavigate('Caisse familiale')}><HandCoins/><span>Caisses<b>{money(cash.propre+cash.sale)}</b></span><ArrowRight/></button><button onClick={()=>onNavigate('Recrutements')}><UserRoundPlus/><span>Candidatures<b>{data.applicants.length}</b></span><ArrowRight/></button><button onClick={()=>onNavigate('REECEL & Ventes')}><ShoppingCart/><span>REECEL<b>{data.sales.length} opérations</b></span><ArrowRight/></button><button onClick={()=>onNavigate('Opérations')}><CalendarDays/><span>Opérations<b>{data.operations.length} prévues</b></span><ArrowRight/></button><button onClick={()=>onNavigate('Drogue')}><Sparkles/><span>Drogue<b>{data.drugRequests.length} demandes</b></span><ArrowRight/></button></div><Panel title="Comptes familiaux et grades" icon={<Users/>}><p className="settings-copy">Invite les comptes dans Supabase. Chaque membre apparaît ensuite ici automatiquement. Attribue un grade ou désactive un compte depuis cette liste.</p>{profiles.length?<div className="account-list">{profiles.map(p=><div className={`account-row ${p.active?'':'inactive'}`} key={p.id}><span className="avatar">{p.display_name.slice(0,1).toUpperCase()}</span><span className="account-name"><b>{p.display_name}</b><small>{p.active?'Compte actif':'Compte désactivé'}</small></span><select className="rank-select" value={p.rank} onChange={e=>onAccountRank(p,e.target.value)}>{ranks.map(r=><option key={r}>{r}</option>)}</select><button className="account-toggle" onClick={()=>onAccountActive(p,!p.active)}>{p.active?'Désactiver':'Réactiver'}</button></div>)}</div>:<div className="empty-accounts"><p>Aucun compte Supabase chargé. En mode démo, les grades se modifient depuis l’onglet Membres.</p><button className="primary-button" onClick={()=>onNavigate('Membres')}><Users size={15}/> Gérer les membres</button></div>}</Panel><div className="moderation-links"><button className="secondary-button" onClick={()=>onAdd('cash')}><Plus size={15}/> Ajustement de caisse</button><button className="secondary-button" onClick={()=>onAdd('item')}><Plus size={15}/> Ajouter au stock</button><button className="secondary-button" onClick={()=>onAdd('applicant')}><Plus size={15}/> Ajouter une candidature</button><button className="secondary-button" onClick={()=>onAdd('sale')}><Plus size={15}/> Ajouter une vente REECEL</button><button className="secondary-button" onClick={()=>onAdd('operation')}><Plus size={15}/> Planifier une opération</button><button className="secondary-button" onClick={()=>onAdd('drug')}><Plus size={15}/> Nouvelle demande Drogue</button></div></>}
function Modal({type,onClose,onSubmit,profile,email,onSwitchAuth}){const titles={login:'Connexion à l’espace',signup:'Créer un compte',member:'Ajouter un membre',applicant:'Nouvelle candidature',item:'Ajouter au stock',product:'Fixer un article REECEL',cash:'Mouvement de caisse',sale:'Ajouter une vente REECEL',account:'Gérer mon profil'};return <div className="modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><div className="modal-head"><div><span className="eyebrow">LOS SINALOA’S</span><h2>{titles[type]||'Votre compte'}</h2></div><button className="icon-button" onClick={onClose}><X size={19}/></button></div>{<form onSubmit={onSubmit}>
  {(type==='login'||type==='signup')&&<><label>Adresse e-mail<input required type="email" name="email" placeholder="nom@exemple.com" autoComplete="email"/></label><label>Mot de passe<input required type="password" name="password" minLength={type==='signup'?8:undefined} placeholder={type==='signup'?'8 caractères minimum':'••••••••'} autoComplete={type==='signup'?'new-password':'current-password'}/></label>{type==='signup'?<p className="form-hint">Ton compte sera créé au grade Recrue. Une confirmation par e-mail peut être demandée avant la première connexion.</p>:<p className="form-hint">Tu peux te connecter après avoir créé ton compte ou accepté une invitation.</p>}</>}
  {type==='member'&&<><label>Nom du membre<input required name="name" placeholder="Ex. El Jefe"/></label><label>Grade<select name="rank" defaultValue={ranks[ranks.length-1]}>{ranks.map(r=><option key={r}>{r}</option>)}</select></label></>}
  {type==='applicant'&&<><label>Nom du candidat<input required name="name" placeholder="Ex. Carlos M."/></label><label>E-mail du candidat<input required type="email" name="email" placeholder="candidat@exemple.fr"/></label><label>Motivation<textarea name="reason" rows="5" placeholder="Quelques mots sur sa candidature…"/></label></>}
  {type==='item'&&<><label>Nom de l’article<input required name="name" placeholder="Ex. Équipement"/></label><div className="form-row"><label>Catégorie<select name="category"><option>Arme</option><option>Protection</option><option>Accessoire</option><option>Divers</option></select></label><label>Quantité<input required min="0" type="number" name="quantity" defaultValue="1"/></label></div></>}
  {type==='product'&&<><label>Nom de l’article<input required name="name" maxLength="80" placeholder="Ex. Pistolet MK2"/></label><div className="form-row"><label>Prix fixe ($)<input required min="0.01" step="0.01" type="number" name="unit_price" placeholder="450"/></label><label>Catégorie<select name="category"><option>Arme</option><option>Protection</option><option>Accessoire</option><option>Divers</option></select></label></div><p className="form-hint">L’article sera aussi créé dans l’inventaire avec un stock initial de 0 s’il n’existe pas encore.</p></>}
  {type==='cash'&&<><label>Compte<select name="account"><option value="propre">Caisse propre</option><option value="sale">Caisse sale</option></select></label><label>Montant<input required type="number" name="amount" placeholder="Montant positif ou négatif"/></label><label>Motif<input name="note" placeholder="Ex. Vente, achat…"/></label><p className="form-hint">Utilisez un montant négatif pour une sortie.</p></>}
  {type==='sale'&&<><label>Nom de la vente<input required name="name" placeholder="Ex. Vente de matériel"/></label><div className="form-row"><label>Quantité<input required min="1" type="number" name="quantity" defaultValue="1"/></label><label>Montant ($)<input required min="0" type="number" name="amount"/></label></div><p className="form-hint">La vente sera enregistrée en attente de validation du jefe REECEL.</p></>}
  {type==='operation'&&<><label>Nom de l’opération<input required name="title" placeholder="Ex. Réunion familiale"/></label><div className="form-row"><label>Date et heure<input required type="datetime-local" name="scheduled_at" defaultValue={new Date(Date.now()+86400000).toISOString().slice(0,16)}/></label><label>Lieu<input name="location" placeholder="Lieu"/></label></div><label>Résumé visible<input required name="summary" placeholder="Quelques mots sur l’opération"/></label><label>Détails<textarea name="details" rows="4" placeholder="Consignes et informations détaillées…"/></label></>}
  {type==='drug'&&<><label>Produit demandé<input required name="name" placeholder="Ex. Speedo"/></label><div className="form-row"><label>Quantité<input required min="1" type="number" name="quantity" defaultValue="1200"/></label><label>Unité<input required name="unit" defaultValue="unités"/></label></div><label>Détails<textarea name="notes" rows="3" placeholder="Informations complémentaires…"/></label><p className="form-hint">La demande sera visible par toute la famille et sur le tableau de bord.</p></>}
  {type==='account'&&<><label>Adresse e-mail<input readOnly value={email||''}/></label><label>Nom affiché<input required name="display_name" defaultValue={profile?.display_name||''} maxLength="40"/></label><label>Nouveau mot de passe <small>(laisser vide pour ne pas le changer)</small><input type="password" name="password" minLength="8" placeholder="8 caractères minimum" autoComplete="new-password"/></label><p className="form-hint">Ton grade est attribué par un modérateur.</p></>}
  <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Annuler</button><button className="primary-button" type="submit">{type==='login'?'Se connecter':type==='signup'?'Créer mon compte':'Enregistrer'}<ArrowRight size={15}/></button></div>
  {(type==='login'||type==='signup')&&<p className="form-hint auth-switch">{type==='login'?"Pas encore de compte ?":"Tu as déjà un compte ?"} <button type="button" className="text-button" onClick={()=>onSwitchAuth(type==='login'?'signup':'login')}>{type==='login'?"S’inscrire":"Se connecter"}</button></p>}
 </form>}</div></div>}

class ScreenBoundary extends React.Component {
  constructor(props){super(props);this.state={failed:false}}
  static getDerivedStateFromError(){return {failed:true}}
  render(){return this.state.failed?<main className="screen-error"><Shield size={30}/><h1>Cette page n’a pas pu s’ouvrir</h1><p>Une erreur a interrompu l’affichage. Reviens au tableau de bord ou recharge la page.</p><button className="primary-button" onClick={()=>{this.setState({failed:false});window.location.reload()}}>Recharger l’espace</button></main>:this.props.children}
}
createRoot(document.getElementById('root')).render(<AccessGate><ScreenBoundary><App/></ScreenBoundary></AccessGate>)
