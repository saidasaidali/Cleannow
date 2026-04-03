// ═══════════════════════════════════════════════
// Evaluations.js
// ═══════════════════════════════════════════════
import React, { useEffect, useState } from 'react';
import { evaluationsAPI, demandesAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import Alert from '../components/Alert';

function StarRating({ value, onChange, readOnly = false, size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)} onMouseLeave={() => !readOnly && setHover(0)}
          style={{ fontSize: size, cursor: readOnly ? 'default' : 'pointer', color: (hover || value) >= star ? '#f59e0b' : 'rgba(100,116,139,0.35)', transition: 'color 0.1s', display: 'inline-block', userSelect: 'none' }}>★</span>
      ))}
    </div>
  );
}

function EvalCard({ ev }) {
  const { isAr } = useLang();
  const NOTE_LABELS = isAr
    ? { 1: 'سيء جداً', 2: 'سيء', 3: 'متوسط', 4: 'جيد', 5: 'ممتاز!' }
    : { 1: 'Très mauvais', 2: 'Mauvais', 3: 'Moyen', 4: 'Bien', 5: 'Excellent !' };

  const nomClient  = ev.DemandeService?.Beneficiaire?.nom || ev.DemandeService?.User?.nom || (isAr ? 'عميل' : 'Client');
  const nomService = ev.DemandeService?.Service?.nom || '—';
  const date = ev.createdAt ? new Date(ev.createdAt).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const initiale = (nomClient[0] || 'C').toUpperCase();
  const avatarColors = ['#0ea5e9', '#10b981', '#f59e0b', '#a855f7', '#f43f5e'];
  const color = avatarColors[initiale.charCodeAt(0) % avatarColors.length];

  return (
    <div style={ES.evalCard}>
      <div style={ES.evalTop}>
        <div style={{ ...ES.evalAvatar, background: color }}>{initiale}</div>
        <div style={ES.evalAuthorBlock}>
          <span style={ES.evalAuthor}>{nomClient}</span>
          <span style={ES.evalDate}>{date}</span>
        </div>
        <div style={ES.evalNoteBlock}>
          <StarRating value={ev.note} readOnly size={16} />
          <span style={ES.evalNoteNum}>{ev.note}/5 — {NOTE_LABELS[ev.note] || ''}</span>
        </div>
      </div>
      {ev.commentaire && <blockquote style={ES.evalQuote}>"{ev.commentaire}"</blockquote>}
      <span style={ES.evalServiceTag}>✦ {nomService}</span>
    </div>
  );
}

export default function Evaluations() {
  const { isBeneficiaire } = useAuth();
  const { t, isAr } = useLang();
  const [evaluations, setEvaluations] = useState([]);
  const [demandesTerminees, setDemandesTerminees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ demande_id: '', note: 0, commentaire: '' });
  const [saving, setSaving] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  const NOTE_LABELS = isAr
    ? { 1: 'سيء جداً', 2: 'سيء', 3: 'متوسط', 4: 'جيد', 5: 'ممتاز!' }
    : { 1: 'Très mauvais', 2: 'Mauvais', 3: 'Moyen', 4: 'Bien', 5: 'Excellent !' };

  const load = async () => {
    setLoading(true);
    try {
      const eRes = await evaluationsAPI.getAll();
      const evList = Array.isArray(eRes.data) ? eRes.data : [];
      setEvaluations(evList);
      if (isBeneficiaire) {
        const dRes = await demandesAPI.getMine();
        const mesDemandes = Array.isArray(dRes.data) ? dRes.data : [];
        const evaluatedIds = evList.map(e => String(e.demandeServiceId));
        setDemandesTerminees(mesDemandes.filter(d => d.statut === 'termine' && !evaluatedIds.includes(String(d.id))));
      }
    } catch { setAlert({ type: 'error', message: t('error_load') }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.note === 0) { setAlert({ type: 'error', message: isAr ? 'يرجى اختيار تقييم.' : 'Veuillez sélectionner une note.' }); return; }
    if (!form.demande_id) { setAlert({ type: 'error', message: isAr ? 'يرجى اختيار خدمة.' : 'Veuillez choisir une prestation.' }); return; }
    setSaving(true);
    try {
      await evaluationsAPI.create(form);
      setAlert({ type: 'success', message: isAr ? '⭐ شكراً على تقييمك!' : '⭐ Merci pour votre évaluation !' });
      setShowModal(false); setForm({ demande_id: '', note: 0, commentaire: '' }); load();
    } catch (err) { setAlert({ type: 'error', message: err.response?.data?.error || t('error_load') }); }
    setSaving(false);
  };

  const avgNote = evaluations.length ? evaluations.reduce((s, e) => s + (Number(e.note) || 0), 0) / evaluations.length : 0;
  const repartition = [5, 4, 3, 2, 1].map(star => ({ star, count: evaluations.filter(e => e.note === star).length, pct: evaluations.length ? (evaluations.filter(e => e.note === star).length / evaluations.length) * 100 : 0 }));
  const sorted = [...evaluations].sort((a, b) => sortBy === 'recent' ? new Date(b.createdAt) - new Date(a.createdAt) : sortBy === 'top' ? b.note - a.note : a.note - b.note);

  return (
    <div style={ES.page} dir={isAr ? 'rtl' : 'ltr'}>
      <div style={ES.header}>
        <div>
          <h1 style={ES.title}>{t('evals_title')}</h1>
          <p style={ES.subtitle}>{evaluations.length} {isAr ? 'تقييم' : `avis client${evaluations.length > 1 ? 's' : ''}`}{avgNote > 0 && <span style={{ color: '#f59e0b' }}> · ★ {avgNote.toFixed(1)}/5</span>}</p>
        </div>
        {isBeneficiaire && demandesTerminees.length > 0 && (
          <button onClick={() => setShowModal(true)} style={ES.addBtn}>
            ⭐ {t('evals_leave')}
            <span style={ES.addBtnBadge}>{demandesTerminees.length}</span>
          </button>
        )}
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {isBeneficiaire && demandesTerminees.length === 0 && evaluations.length > 0 && (
        <div style={ES.allDoneBox}>✅ {isAr ? 'لقد قيّمت جميع طلباتك المكتملة. شكراً!' : 'Vous avez évalué toutes vos demandes terminées. Merci !'}</div>
      )}

      {evaluations.length > 0 && (
        <div style={ES.statsPanel}>
          <div style={ES.bigScore}>
            <span style={ES.bigNum}>{avgNote.toFixed(1)}</span>
            <StarRating value={Math.round(avgNote)} readOnly size={24} />
            <span style={ES.bigSub}>{isAr ? `من ${evaluations.length} تقييم` : `sur ${evaluations.length} avis`}</span>
          </div>
          <div style={ES.repartition}>
            {repartition.map(({ star, count, pct }) => (
              <div key={star} style={ES.repartRow}>
                <span style={ES.repartLabel}>★ {star}</span>
                <div style={ES.repartBar}><div style={{ ...ES.repartFill, width: `${pct}%` }} /></div>
                <span style={ES.repartCount}>{count}</span>
              </div>
            ))}
          </div>
          <div style={ES.noteCards}>
            {[
              { label: isAr ? 'ممتازة' : 'Excellents', count: evaluations.filter(e => e.note >= 4).length, color: '#10b981' },
              { label: isAr ? 'محايدة'  : 'Neutres',    count: evaluations.filter(e => e.note === 3).length, color: '#f59e0b' },
              { label: isAr ? 'سلبية'   : 'Négatifs',   count: evaluations.filter(e => e.note <= 2).length, color: '#f43f5e' },
            ].map(n => (
              <div key={n.label} style={{ ...ES.noteCard, borderColor: `${n.color}30` }}>
                <span style={{ ...ES.noteCardNum, color: n.color }}>{n.count}</span>
                <span style={ES.noteCardLabel}>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {evaluations.length > 0 && (
        <div style={ES.sortRow}>
          <span style={ES.sortLabel}>{isAr ? 'ترتيب:' : 'Trier par :'}</span>
          {[
            { value: 'recent', label: isAr ? '🕐 الأحدث'     : '🕐 Plus récents' },
            { value: 'top',    label: isAr ? '★ الأعلى'      : '★ Meilleurs' },
            { value: 'low',    label: isAr ? '↓ الأضعف'      : '↓ Plus faibles' },
          ].map(s => (
            <button key={s.value} onClick={() => setSortBy(s.value)}
              style={{ ...ES.sortBtn, ...(sortBy === s.value ? ES.sortBtnActive : {}) }}>{s.label}</button>
          ))}
        </div>
      )}

      {loading ? <div style={ES.center}><div className="spinner" /></div>
        : evaluations.length === 0 ? (
          <div style={ES.empty}>
            <span style={{ fontSize: 56 }}>⭐</span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{isAr ? 'لا توجد تقييمات بعد' : 'Aucune évaluation pour le moment'}</p>
            {isBeneficiaire && demandesTerminees.length > 0 && <button onClick={() => setShowModal(true)} style={ES.emptyBtn}>{isAr ? 'كن أول من يضيف تقييماً!' : 'Soyez le premier à laisser un avis !'}</button>}
          </div>
        ) : <div style={ES.grid}>{sorted.map(ev => <EvalCard key={ev.id} ev={ev} />)}</div>}

      {showModal && (
        <div style={ES.overlay} onClick={() => setShowModal(false)}>
          <div style={ES.modal} onClick={e => e.stopPropagation()} dir={isAr ? 'rtl' : 'ltr'}>
            <div style={ES.modalHeader}>
              <div>
                <span style={ES.modalBadge}>⭐ {t('evals_leave')}</span>
                <h2 style={ES.modalTitle}>{isAr ? 'تقييم خدمة' : 'Évaluer un service'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} style={ES.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={ES.form}>
              <div style={ES.field}>
                <label style={ES.label}>{isAr ? 'الخدمة للتقييم *' : 'Service à évaluer *'}</label>
                <select value={form.demande_id} onChange={e => setForm({ ...form, demande_id: e.target.value })} required style={ES.select}>
                  <option value="">— {isAr ? 'اختر خدمة مكتملة' : 'Choisir une prestation terminée'} —</option>
                  {demandesTerminees.map(d => <option key={d.id} value={d.id}>#{d.id} — {d.Service?.nom || 'Service'}</option>)}
                </select>
              </div>
              <div style={ES.field}>
                <label style={ES.label}>{t('evals_note')} *</label>
                <div style={ES.starArea}>
                  <StarRating value={form.note} onChange={n => setForm({ ...form, note: n })} size={36} />
                  {form.note > 0 && <span style={{ ...ES.noteLabel, color: form.note >= 4 ? '#10b981' : form.note === 3 ? '#f59e0b' : '#f43f5e' }}>{NOTE_LABELS[form.note]}</span>}
                </div>
                {form.note === 0 && <span style={ES.noteHint}>{isAr ? 'انقر على نجمة للتقييم' : 'Cliquez sur une étoile pour noter'}</span>}
              </div>
              <div style={ES.field}>
                <label style={ES.label}>{t('evals_comment')} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({isAr ? 'اختياري' : 'facultatif'})</span></label>
                <textarea value={form.commentaire} onChange={e => setForm({ ...form, commentaire: e.target.value })} rows={4} maxLength={500}
                  placeholder={isAr ? 'صف تجربتك...' : 'Décrivez votre expérience...'} style={{ ...ES.input, resize: 'vertical' }} />
                <span style={ES.charCount}>{form.commentaire.length}/500</span>
              </div>
              <div style={ES.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={ES.cancelBtn}>{t('cancel')}</button>
                <button type="submit" disabled={saving || form.note === 0}
                  style={{ ...ES.saveBtn, opacity: (saving || form.note === 0) ? 0.5 : 1, cursor: (saving || form.note === 0) ? 'not-allowed' : 'pointer' }}>
                  {saving ? '⏳...' : `⭐ ${isAr ? 'نشر التقييم' : "Publier l'avis"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const ES = {
  page: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#fff' },
  subtitle: { fontSize: 14, color: 'var(--muted)', marginTop: 4 },
  addBtn: { display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: 10, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  addBtnBadge: { background: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: '2px 8px', fontSize: 12, fontWeight: 800 },
  allDoneBox: { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 20px', fontSize: 14, color: '#10b981', marginBottom: 20 },
  statsPanel: { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'stretch', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 20, padding: '28px 32px', marginBottom: 28 },
  bigScore: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 100 },
  bigNum: { fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 800, color: '#f59e0b', lineHeight: 1 },
  bigSub: { fontSize: 12, color: 'var(--muted)' },
  repartition: { flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' },
  repartRow: { display: 'flex', alignItems: 'center', gap: 10 },
  repartLabel: { fontSize: 12, color: '#f59e0b', width: 32, flexShrink: 0, textAlign: 'right' },
  repartBar: { flex: 1, height: 8, background: 'rgba(100,116,139,0.2)', borderRadius: 4, overflow: 'hidden' },
  repartFill: { height: '100%', background: '#f59e0b', borderRadius: 4, transition: 'width 0.5s' },
  repartCount: { fontSize: 12, color: 'var(--muted)', width: 24, textAlign: 'right' },
  noteCards: { display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' },
  noteCard: { padding: '10px 16px', borderRadius: 10, border: '1px solid', background: 'rgba(15,23,42,0.4)', textAlign: 'center' },
  noteCardNum: { display: 'block', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 },
  noteCardLabel: { fontSize: 11, color: 'var(--muted)' },
  sortRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  sortLabel: { fontSize: 13, color: 'var(--muted)' },
  sortBtn: { padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(30,41,59,0.5)', color: 'var(--muted)', cursor: 'pointer', fontSize: 12 },
  sortBtnActive: { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 },
  center: { display: 'flex', justifyContent: 'center', padding: 60 },
  empty: { textAlign: 'center', padding: 60, color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  emptyBtn: { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '10px 24px', color: '#f59e0b', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  evalCard: { background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(14,165,233,0.1)', borderRadius: 16, padding: 22 },
  evalTop: { display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  evalAvatar: { width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#fff', flexShrink: 0 },
  evalAuthorBlock: { flex: 1 },
  evalAuthor: { display: 'block', fontWeight: 600, color: '#fff', fontSize: 15 },
  evalDate: { fontSize: 12, color: 'var(--muted)', marginTop: 2, display: 'block' },
  evalNoteBlock: { textAlign: 'right' },
  evalNoteNum: { display: 'block', fontSize: 11, color: '#f59e0b', marginTop: 4 },
  evalQuote: { fontSize: 14, color: 'rgba(148,163,184,0.9)', fontStyle: 'italic', lineHeight: 1.7, paddingLeft: 14, borderLeft: '2px solid rgba(245,158,11,0.3)', margin: '0 0 12px' },
  evalServiceTag: { fontSize: 12, padding: '3px 12px', borderRadius: 20, background: 'rgba(14,165,233,0.1)', color: 'var(--sky)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 },
  modal: { background: '#1e293b', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  modalBadge: { fontSize: 12, color: '#f59e0b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer', flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--light)' },
  select: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' },
  input: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' },
  starArea: { display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0' },
  noteLabel: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 },
  noteHint: { fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' },
  charCount: { fontSize: 11, color: 'var(--muted)', textAlign: 'right' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  cancelBtn: { background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 10, padding: '10px 20px', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 },
  saveBtn: { background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: 10, padding: '10px 24px', color: '#fff', fontWeight: 700, fontSize: 14 },
};