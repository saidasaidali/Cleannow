// ═══════════════════════════════════════════════
// Services.js
// ═══════════════════════════════════════════════
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { servicesAPI, demandesAPI } from '../api/axios';
import CardService from '../components/CardService';
import Alert from '../components/Alert';

const EMPTY_FORM = { nom: '', description: '', prix: '', duree: '' };

export default function Services() {
  const { isAdmin, isBeneficiaire } = useAuth();
  const { t, isAr } = useLang();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [showDemandeModal, setShowDemandeModal] = useState(false);
  const [demandeForm, setDemandeForm] = useState({ adresse: '', description: '', date_souhaitee: '' });
  const [sendingDemande, setSendingDemande] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const res = await servicesAPI.getAll(); setServices(res.data); } catch { setAlert({ type: 'error', message: t('error_load') }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (s) => { setEditTarget(s); setForm({ nom: s.nom || '', description: s.description || '', prix: s.prix || '', duree: s.duree || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editTarget) { await servicesAPI.update(editTarget.id, form); setAlert({ type: 'success', message: isAr ? '✅ تم تحديث الخدمة.' : '✅ Service mis à jour.' }); }
      else { await servicesAPI.create(form); setAlert({ type: 'success', message: isAr ? '✅ تم إنشاء الخدمة.' : '✅ Service créé.' }); }
      setShowModal(false); load();
    } catch { setAlert({ type: 'error', message: t('error_load') }); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(isAr ? 'حذف هذه الخدمة نهائياً؟' : 'Supprimer ce service définitivement ?')) return;
    try { await servicesAPI.delete(id); setAlert({ type: 'success', message: isAr ? '🗑 تم الحذف.' : '🗑 Service supprimé.' }); load(); }
    catch { setAlert({ type: 'error', message: t('error_load') }); }
  };

  const handleSelectService = (service) => {
    if (!isBeneficiaire) return;
    setSelectedService(service); setDemandeForm({ adresse: '', description: '', date_souhaitee: '' }); setShowDemandeModal(true);
  };

  const handleSendDemande = async (e) => {
    e.preventDefault(); setSendingDemande(true);
    try {
      await demandesAPI.create({ serviceId: selectedService.id, adresse: demandeForm.adresse, notes: demandeForm.description });
      setAlert({ type: 'success', message: isAr ? `✅ تم إرسال الطلب!` : `✅ Demande envoyée !` });
      setShowDemandeModal(false);
    } catch { setAlert({ type: 'error', message: t('error_load') }); }
    setSendingDemande(false);
  };

  const filtered = services.filter(s => (s.nom || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={S.page} dir={isAr ? 'rtl' : 'ltr'}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>{t('services_title')}</h1>
          <p style={S.subtitle}>{services.length} {isAr ? 'خدمة' : `service${services.length !== 1 ? 's' : ''}`}
            {isBeneficiaire && <span style={{ color: 'var(--sky)', fontStyle: 'italic' }}> — {isAr ? 'انقر على خدمة لتقديم طلب' : 'Cliquez sur un service pour faire une demande'}</span>}
          </p>
        </div>
        {isAdmin && <button onClick={openCreate} style={S.addBtn}>{t('services_add')}</button>}
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div style={S.searchBar}>
        <span>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`${t('search')} ${isAr ? 'خدمة' : 'un service'}...`} style={S.searchInput} />
      </div>

      {loading ? <div style={S.center}><div className="spinner" /></div>
        : filtered.length === 0 ? (
          <div style={S.empty}>
            <span style={{ fontSize: 48 }}>✦</span>
            <p>{t('services_empty')}</p>
            {isAdmin && <button onClick={openCreate} style={S.emptyBtn}>{t('services_add')}</button>}
          </div>
        ) : (
          <div style={S.grid}>
            {filtered.map(s => <CardService key={s.id} service={s} isAdmin={isAdmin} isBeneficiaire={isBeneficiaire} onEdit={openEdit} onDelete={handleDelete} onSelect={isBeneficiaire ? handleSelectService : null} />)}
          </div>
        )}

      {/* Modal admin */}
      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h2 style={S.modalTitle}>{editTarget ? t('services_edit') : t('services_add')}</h2>
              <button onClick={() => setShowModal(false)} style={S.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSave} style={S.form}>
              {[
                { key: 'nom',         label: t('services_nom'),  ph: isAr ? 'مثال: تنظيف شقة' : 'Ex: Nettoyage appartement', type: 'text' },
                { key: 'description', label: t('services_desc'), ph: isAr ? 'وصف الخدمة...' : 'Décrivez le service...', type: 'textarea' },
              ].map(f => (
                <div key={f.key} style={S.field}>
                  <label style={S.label}>{f.label}</label>
                  {f.type === 'textarea'
                    ? <textarea value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} rows={3} placeholder={f.ph} style={{ ...S.input, resize: 'vertical' }} />
                    : <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required placeholder={f.ph} style={S.input} />}
                </div>
              ))}
              <div style={S.row}>
                <div style={S.field}>
                  <label style={S.label}>{t('services_prix')}</label>
                  <input type="number" min="0" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} placeholder="0.00" style={S.input} />
                </div>
                <div style={S.field}>
                  <label style={S.label}>{isAr ? 'المدة التقديرية' : 'Durée estimée'}</label>
                  <input value={form.duree} onChange={e => setForm({ ...form, duree: e.target.value })} placeholder={isAr ? 'مثال: ساعتان' : 'Ex: 2h'} style={S.input} />
                </div>
              </div>
              <div style={S.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={S.cancelBtn}>{t('services_cancel')}</button>
                <button type="submit" disabled={saving} style={S.saveBtn}>{saving ? '⏳...' : t('services_save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal bénéficiaire */}
      {showDemandeModal && selectedService && (
        <div style={S.overlay} onClick={() => setShowDemandeModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--sky)', display: 'block', marginBottom: 4 }}>📋 {isAr ? 'طلب جديد' : 'Nouvelle demande'}</span>
                <h2 style={S.modalTitle}>{selectedService.nom}</h2>
                {selectedService.prix && <p style={{ color: 'var(--sky)', fontWeight: 700 }}>{selectedService.prix} {isAr ? 'درهم' : 'MAD'}</p>}
              </div>
              <button onClick={() => setShowDemandeModal(false)} style={S.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSendDemande} style={S.form}>
              <div style={S.field}>
                <label style={S.label}>{isAr ? 'عنوان التدخل *' : "Adresse d'intervention *"}</label>
                <input value={demandeForm.adresse} onChange={e => setDemandeForm({ ...demandeForm, adresse: e.target.value })} required placeholder={isAr ? 'عنوانك الكامل...' : 'Votre adresse complète...'} style={S.input} />
              </div>
              <div style={S.field}>
                <label style={S.label}>{isAr ? 'التاريخ المرغوب' : 'Date souhaitée'}</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} value={demandeForm.date_souhaitee} onChange={e => setDemandeForm({ ...demandeForm, date_souhaitee: e.target.value })} style={S.input} />
              </div>
              <div style={S.field}>
                <label style={S.label}>{isAr ? 'ملاحظات' : 'Remarques'}</label>
                <textarea value={demandeForm.description} onChange={e => setDemandeForm({ ...demandeForm, description: e.target.value })} rows={3} placeholder={isAr ? 'احتياجاتك الخاصة...' : 'Précisez vos besoins...'} style={{ ...S.input, resize: 'vertical' }} />
              </div>
              <div style={S.modalActions}>
                <button type="button" onClick={() => setShowDemandeModal(false)} style={S.cancelBtn}>{t('cancel')}</button>
                <button type="submit" disabled={sendingDemande} style={S.saveBtn}>{sendingDemande ? '⏳...' : `→ ${isAr ? 'إرسال الطلب' : 'Envoyer la demande'}`}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff' },
  subtitle: { fontSize: 14, color: 'var(--muted)', marginTop: 4 },
  addBtn: { background: 'linear-gradient(135deg, var(--sky), var(--sky-dark))', border: 'none', borderRadius: 10, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  searchBar: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '0 16px', marginBottom: 24 },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '14px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 60, color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  emptyBtn: { background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 10, padding: '10px 24px', color: 'var(--sky)', cursor: 'pointer', fontSize: 14 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 },
  modal: { background: '#1e293b', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--light)' },
  input: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  cancelBtn: { background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 10, padding: '10px 20px', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 },
  saveBtn: { background: 'linear-gradient(135deg, var(--sky), var(--sky-dark))', border: 'none', borderRadius: 10, padding: '10px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
};