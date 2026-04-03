import React, { useEffect, useState } from 'react';
import { usersAPI } from '../api/axios';
import Alert from '../components/Alert';
import { useLang } from '../context/LanguageContext';

export default function Utilisateurs() {
  const { t, isAr } = useLang();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ nom: '', email: '', password: '', role: 'fournisseur', telephone: '', adresse: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('tous');

  const ROLE_CONFIG = {
    fournisseur:  { label: isAr ? 'مزود خدمة' : 'Fournisseur',  color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)',  icon: '🔧' },
    beneficiaire: { label: isAr ? 'مستفيد'     : 'Bénéficiaire', color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '👤' },
    admin:        { label: isAr ? 'مسؤول'      : 'Admin',        color: '#a855f7', bg: 'rgba(168,85,247,0.1)',   icon: '⚙️' },
  };
  const STATUT_CONFIG = {
    actif:      { label: isAr ? 'نشط'          : 'Actif',      color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '✅' },
    en_attente: { label: isAr ? 'قيد الانتظار' : 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '⏳' },
    suspendu:   { label: isAr ? 'موقوف'        : 'Suspendu',   color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',  icon: '🚫' },
  };

  const load = async () => {
    setLoading(true);
    try { const res = await usersAPI.getAll(); setUsers(Array.isArray(res.data) ? res.data : []); }
    catch { setAlert({ type: 'error', message: t('error_load') }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditUser(null); setForm({ nom: '', email: '', password: '', role: 'fournisseur', telephone: '', adresse: '' }); setShowModal(true); };
  const openEdit = (user) => { setEditUser(user); setForm({ nom: user.nom, email: user.email, password: '', role: user.role, telephone: user.telephone || '', adresse: user.adresse || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editUser) { await usersAPI.update(editUser.id, form); setAlert({ type: 'success', message: isAr ? 'تم التحديث ✅' : 'Utilisateur mis à jour ✅' }); }
      else { await usersAPI.create(form); setAlert({ type: 'success', message: isAr ? 'تم الإنشاء ✅' : 'Utilisateur créé ✅' }); }
      setShowModal(false); load();
    } catch (err) { setAlert({ type: 'error', message: err.response?.data?.error || t('error_load') }); }
    setSaving(false);
  };

  const handleDelete = async (id, nom) => {
    if (!window.confirm(isAr ? `حذف ${nom}؟` : `Supprimer ${nom} ?`)) return;
    try { await usersAPI.delete(id); setAlert({ type: 'success', message: isAr ? 'تم الحذف.' : 'Utilisateur supprimé.' }); load(); }
    catch { setAlert({ type: 'error', message: t('error_load') }); }
  };

  const handleValider = async (id, nom) => {
    try { await usersAPI.valider(id); setAlert({ type: 'success', message: isAr ? `✅ تم تفعيل ${nom}!` : `✅ ${nom} validé et activé !` }); load(); }
    catch { setAlert({ type: 'error', message: t('error_load') }); }
  };

  const handleRejeter = async (id, nom) => {
    if (!window.confirm(isAr ? `رفض طلب ${nom}؟` : `Rejeter la candidature de ${nom} ?`)) return;
    try { await usersAPI.rejeter(id); setAlert({ type: 'error', message: isAr ? `🚫 تم رفض ${nom}.` : `🚫 ${nom} rejeté.` }); load(); }
    catch { setAlert({ type: 'error', message: t('error_load') }); }
  };

  const enAttente = users.filter(u => u.role === 'fournisseur' && u.statut === 'en_attente');
  const count = r => users.filter(u => u.role === r).length;
  const filtered = users.filter(u => (filterRole === 'all' || u.role === filterRole) && (!search || u.nom?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())));

  const TH = isAr ? ['#', 'الاسم', 'البريد', 'الدور', 'الحالة', 'تاريخ الإنشاء', 'إجراءات'] : ['#', 'Nom', 'Email', 'Rôle', 'Statut', 'Inscrit le', 'Actions'];

  return (
    <div style={US.page} dir={isAr ? 'rtl' : 'ltr'}>
      <div style={US.header}>
        <div>
          <h1 style={US.title}>{isAr ? 'إدارة المستخدمين' : 'Gestion des utilisateurs'}</h1>
          <p style={US.subtitle}>{users.length} {isAr ? 'مستخدم' : `utilisateur${users.length !== 1 ? 's' : ''}`}</p>
        </div>
        <button onClick={openCreate} style={US.addBtn}>{isAr ? '+ إضافة مستخدم' : '+ Ajouter un utilisateur'}</button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div style={US.statsGrid}>
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
          <div key={role} style={{ ...US.statCard, borderColor: `${cfg.color}30` }}>
            <span style={{ fontSize: 28 }}>{cfg.icon}</span>
            <div><div style={{ ...US.statNum, color: cfg.color }}>{count(role)}</div><div style={US.statLabel}>{cfg.label}</div></div>
          </div>
        ))}
        {enAttente.length > 0 && (
          <div style={{ ...US.statCard, borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.05)' }}>
            <span style={{ fontSize: 28 }}>⏳</span>
            <div><div style={{ ...US.statNum, color: '#f59e0b' }}>{enAttente.length}</div><div style={US.statLabel}>{isAr ? 'بانتظار التحقق' : 'En attente validation'}</div></div>
          </div>
        )}
      </div>

      <div style={US.mainTabs}>
        <button onClick={() => setActiveTab('tous')} style={{ ...US.mainTab, ...(activeTab === 'tous' ? US.mainTabActive : {}) }}>
          👥 {isAr ? 'جميع المستخدمين' : 'Tous les utilisateurs'}
        </button>
        <button onClick={() => setActiveTab('validation')} style={{ ...US.mainTab, ...(activeTab === 'validation' ? US.mainTabActive : {}), ...(enAttente.length > 0 ? US.mainTabUrgent : {}) }}>
          ⏳ {isAr ? 'مزودون بانتظار التحقق' : 'Fournisseurs à valider'}
          {enAttente.length > 0 && <span style={US.badge}>{enAttente.length}</span>}
        </button>
      </div>

      {activeTab === 'validation' && (
        enAttente.length === 0
          ? <div style={US.empty}><span style={{ fontSize: 48 }}>✅</span><p>{isAr ? 'لا يوجد مزودون بانتظار التحقق' : 'Aucun fournisseur en attente'}</p></div>
          : <div style={US.validationGrid}>
              {enAttente.map(u => (
                <div key={u.id} style={US.validationCard}>
                  <div style={US.validationHeader}>
                    <div style={{ ...US.avatar, background: '#0ea5e9', width: 52, height: 52, fontSize: 20 }}>{(u.nom || 'F')[0].toUpperCase()}</div>
                    <div><div style={US.validationName}>{u.nom}</div><div style={US.validationEmail}>{u.email}</div></div>
                    <span style={{ ...US.statutBadge, color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>⏳ {isAr ? 'بانتظار' : 'En attente'}</span>
                  </div>
                  <div style={US.validationInfo}>
                    {u.telephone && <div style={US.infoRow}><span>📞</span><span>{u.telephone}</span></div>}
                    {u.adresse   && <div style={US.infoRow}><span>📍</span><span>{u.adresse}</span></div>}
                    <div style={US.infoRow}><span>📅</span><span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR') : '—'}</span></div>
                  </div>
                  <div style={US.validationActions}>
                    <button onClick={() => handleValider(u.id, u.nom)} style={US.validerBtn}>{isAr ? '✅ تفعيل' : '✅ Valider et activer'}</button>
                    <button onClick={() => handleRejeter(u.id, u.nom)} style={US.rejeterBtn}>{isAr ? '🚫 رفض' : '🚫 Rejeter'}</button>
                  </div>
                </div>
              ))}
            </div>
      )}

      {activeTab === 'tous' && (
        <>
          <div style={US.toolbar}>
            <div style={US.tabs}>
              {[
                { value: 'all', label: isAr ? 'الكل' : 'Tous', count: users.length },
                { value: 'fournisseur', label: `🔧 ${ROLE_CONFIG.fournisseur.label}`, count: count('fournisseur') },
                { value: 'beneficiaire', label: `👤 ${ROLE_CONFIG.beneficiaire.label}`, count: count('beneficiaire') },
                { value: 'admin', label: `⚙️ ${ROLE_CONFIG.admin.label}`, count: count('admin') },
              ].map(tab => (
                <button key={tab.value} onClick={() => setFilterRole(tab.value)}
                  style={{ ...US.tab, ...(filterRole === tab.value ? US.tabActive : {}) }}>
                  {tab.label} <span style={US.tabCount}>{tab.count}</span>
                </button>
              ))}
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`🔍 ${t('search')}`} style={US.search} />
          </div>

          {loading ? <div style={US.center}><div className="spinner" /></div>
            : filtered.length === 0 ? <div style={US.empty}><span style={{ fontSize: 48 }}>👥</span><p>{t('no_data')}</p></div>
            : (
              <div style={US.tableWrapper}>
                <table style={US.table}>
                  <thead><tr>{TH.map(h => <th key={h} style={US.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.map(u => {
                      const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.beneficiaire;
                      const scfg = STATUT_CONFIG[u.statut] || STATUT_CONFIG.actif;
                      return (
                        <tr key={u.id} style={US.tr}>
                          <td style={US.td}><span style={US.idTag}>#{u.id}</span></td>
                          <td style={US.td}>
                            <div style={US.userCell}>
                              <div style={{ ...US.avatar, background: cfg.color }}>{(u.nom || 'U')[0].toUpperCase()}</div>
                              <div><div style={US.userName}>{u.nom}</div>{u.telephone && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.telephone}</div>}</div>
                            </div>
                          </td>
                          <td style={US.td}><span style={US.emailText}>{u.email}</span></td>
                          <td style={US.td}><span style={{ ...US.roleBadge, color: cfg.color, background: cfg.bg }}>{cfg.icon} {cfg.label}</span></td>
                          <td style={US.td}><span style={{ ...US.statutBadge, color: scfg.color, background: scfg.bg }}>{scfg.icon} {scfg.label}</span></td>
                          <td style={US.td}><span style={US.date}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR') : '—'}</span></td>
                          <td style={US.td}>
                            <div style={US.actions}>
                              {u.statut === 'en_attente' && <button onClick={() => handleValider(u.id, u.nom)} style={US.validerBtnSm}>✅</button>}
                              <button onClick={() => openEdit(u)} style={US.editBtn}>✏️</button>
                              <button onClick={() => handleDelete(u.id, u.nom)} style={US.deleteBtn}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}

      {showModal && (
        <div style={US.overlay} onClick={() => setShowModal(false)}>
          <div style={US.modal} onClick={e => e.stopPropagation()} dir={isAr ? 'rtl' : 'ltr'}>
            <div style={US.modalHeader}>
              <h2 style={US.modalTitle}>{editUser ? (isAr ? '✏️ تعديل' : '✏️ Modifier') : (isAr ? '+ إضافة' : '+ Ajouter')} {isAr ? 'مستخدم' : 'un utilisateur'}</h2>
              <button onClick={() => setShowModal(false)} style={US.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSave} style={US.form}>
              {[
                { key: 'nom',       label: isAr ? 'الاسم *'            : 'Nom *',        type: 'text',     ph: isAr ? 'الاسم الكامل' : 'Prénom Nom' },
                { key: 'email',     label: isAr ? 'البريد الإلكتروني *' : 'Email *',      type: 'email',    ph: 'email@exemple.com' },
                { key: 'telephone', label: isAr ? 'الهاتف'              : 'Téléphone',    type: 'text',     ph: '+212 6XX XXX XXX' },
                { key: 'adresse',   label: isAr ? 'العنوان'             : 'Adresse',      type: 'text',     ph: isAr ? 'المدينة، الحي' : 'Ville, Quartier' },
              ].map(f => (
                <div key={f.key} style={US.field}>
                  <label style={US.label}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.key === 'nom' || f.key === 'email'} placeholder={f.ph} style={US.input} />
                </div>
              ))}
              <div style={US.field}>
                <label style={US.label}>{isAr ? 'كلمة المرور' : 'Mot de passe'} {editUser && <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({isAr ? 'فارغ = بدون تغيير' : 'vide = inchangé'})</span>}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  required={!editUser} placeholder={editUser ? (isAr ? 'كلمة مرور جديدة...' : 'Nouveau mot de passe...') : (isAr ? 'كلمة المرور *' : 'Mot de passe *')} style={US.input} />
              </div>
              <div style={US.field}>
                <label style={US.label}>{isAr ? 'الدور *' : 'Rôle *'}</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={US.select}>
                  <option value="fournisseur">🔧 {ROLE_CONFIG.fournisseur.label}</option>
                  <option value="beneficiaire">👤 {ROLE_CONFIG.beneficiaire.label}</option>
                  <option value="admin">⚙️ {ROLE_CONFIG.admin.label}</option>
                </select>
              </div>
              <div style={US.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={US.cancelBtn}>{t('cancel')}</button>
                <button type="submit" disabled={saving} style={{ ...US.saveBtn, opacity: saving ? 0.5 : 1 }}>
                  {saving ? '⏳...' : editUser ? (isAr ? '✅ تحديث' : '✅ Mettre à jour') : (isAr ? '+ إنشاء' : '+ Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const US = {
  page: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff' },
  subtitle: { fontSize: 14, color: 'var(--muted)', marginTop: 4 },
  addBtn: { background: 'linear-gradient(135deg, var(--sky), var(--sky-dark))', border: 'none', borderRadius: 10, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 },
  statCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: 'rgba(30,41,59,0.7)', borderRadius: 14, border: '1px solid' },
  statNum: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 },
  statLabel: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  mainTabs: { display: 'flex', gap: 8, marginBottom: 20 },
  mainTab: { padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(30,41,59,0.5)', color: 'var(--muted)', cursor: 'pointer', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 },
  mainTabActive: { background: 'rgba(14,165,233,0.15)', color: 'var(--sky)', borderColor: 'rgba(14,165,233,0.4)' },
  mainTabUrgent: { borderColor: 'rgba(245,158,11,0.4)', color: '#f59e0b' },
  badge: { background: '#f59e0b', color: '#000', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 800 },
  validationGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  validationCard: { background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 24 },
  validationHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 },
  validationName: { fontSize: 16, fontWeight: 700, color: '#fff' },
  validationEmail: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  validationInfo: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 },
  infoRow: { display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', alignItems: 'center' },
  validationActions: { display: 'flex', gap: 10 },
  validerBtn: { flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  rejeterBtn: { flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.08)', color: '#f43f5e', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  validerBtnSm: { padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)', color: '#10b981', cursor: 'pointer', fontSize: 14 },
  toolbar: { display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' },
  tabs: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(30,41,59,0.5)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 },
  tabActive: { background: 'rgba(14,165,233,0.15)', color: 'var(--sky)', borderColor: 'rgba(14,165,233,0.4)' },
  tabCount: { background: 'rgba(14,165,233,0.2)', color: 'var(--sky)', borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700 },
  search: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '10px 16px', color: '#fff', fontSize: 14, outline: 'none', minWidth: 220 },
  tableWrapper: { overflowX: 'auto', borderRadius: 16, border: '1px solid rgba(14,165,233,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'rgba(15,23,42,0.6)', borderBottom: '1px solid rgba(14,165,233,0.1)' },
  tr: { borderBottom: '1px solid rgba(14,165,233,0.06)' },
  td: { padding: '14px 20px', verticalAlign: 'middle' },
  idTag: { fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' },
  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 },
  userName: { fontSize: 14, fontWeight: 600, color: '#fff' },
  emailText: { fontSize: 13, color: 'var(--muted)' },
  roleBadge: { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 },
  statutBadge: { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 },
  date: { fontSize: 13, color: 'var(--muted)' },
  actions: { display: 'flex', gap: 6 },
  editBtn: { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 8, padding: '6px 10px', color: '#0ea5e9', fontSize: 14, cursor: 'pointer' },
  deleteBtn: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 8, padding: '6px 10px', color: '#f43f5e', fontSize: 14, cursor: 'pointer' },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 60, color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 },
  modal: { background: '#1e293b', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--light)' },
  input: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' },
  select: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 10, padding: '10px 20px', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 },
  saveBtn: { background: 'linear-gradient(135deg, var(--sky), var(--sky-dark))', border: 'none', borderRadius: 10, padding: '10px 24px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
};