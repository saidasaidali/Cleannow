// ═══════════════════════════════════════════════
// Demandes.js (admin)
// ═══════════════════════════════════════════════
import React, { useEffect, useState } from 'react';
import { demandesAPI } from '../api/axios';
import CardDemande from '../components/CardDemande';
import Alert from '../components/Alert';
import { useLang } from '../context/LanguageContext';

export function Demandes() {
  const { t, isAr } = useLang();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterStatut, setFilterStatut] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try { const res = await demandesAPI.getAll(); setDemandes(res.data); }
    catch { setAlert({ type: 'error', message: t('error_load') }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = demandes.filter(d => {
    const matchStatut = filterStatut === 'all' || d.statut === filterStatut;
    const matchSearch = !search || String(d.id).includes(search) || (d.Beneficiaire?.nom || '').toLowerCase().includes(search.toLowerCase());
    return matchStatut && matchSearch;
  });

  const TABS = [
    { value: 'all',        label: t('demandes_all') },
    { value: 'en_attente', label: t('statut_en_attente') },
    { value: 'en_cours',   label: t('statut_en_cours') },
    { value: 'termine',    label: t('statut_termine') },
    { value: 'annule',     label: t('statut_annule') },
  ];

  return (
    <div style={DS.page} dir={isAr ? 'rtl' : 'ltr'}>
      <div style={DS.header}>
        <h1 style={DS.title}>{isAr ? 'جميع الطلبات' : 'Toutes les demandes'}</h1>
        <p style={DS.subtitle}>{demandes.length} {isAr ? 'طلب' : `demande${demandes.length !== 1 ? 's' : ''}`}</p>
      </div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div style={DS.toolbar}>
        <div style={DS.searchBar}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isAr ? 'بحث بالرقم أو العميل...' : 'Rechercher par ID ou client...'} style={DS.searchInput} />
        </div>
        <div style={DS.tabs}>
          {TABS.map(tab => (
            <button key={tab.value} onClick={() => setFilterStatut(tab.value)}
              style={{ ...DS.tab, ...(filterStatut === tab.value ? DS.tabActive : {}) }}>
              {tab.label}
              <span style={DS.tabCount}>{tab.value === 'all' ? demandes.length : demandes.filter(d => d.statut === tab.value).length}</span>
            </button>
          ))}
        </div>
      </div>
      {loading ? <div style={DS.center}><div className="spinner" /></div>
        : filtered.length === 0 ? <div style={DS.empty}><span style={{ fontSize: 48 }}>📭</span><p>{t('no_data')}</p></div>
        : <div style={DS.list}>{filtered.map(d => <CardDemande key={d.id} demande={d} isAdmin />)}</div>}
    </div>
  );
}

const DS = {
  page: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
  header: { marginBottom: 24 },
  title: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff' },
  subtitle: { fontSize: 14, color: 'var(--muted)', marginTop: 4 },
  toolbar: { display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' },
  searchBar: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '0 16px', flex: 1, minWidth: 200 },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '12px 0' },
  tabs: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(30,41,59,0.5)', color: 'var(--muted)', cursor: 'pointer', fontSize: 12 },
  tabActive: { background: 'rgba(14,165,233,0.15)', color: 'var(--sky)', borderColor: 'rgba(14,165,233,0.4)' },
  tabCount: { background: 'rgba(14,165,233,0.2)', color: 'var(--sky)', borderRadius: 20, padding: '1px 6px', fontSize: 10, fontWeight: 700 },
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 60, color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
};

export default Demandes;