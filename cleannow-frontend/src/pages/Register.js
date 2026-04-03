import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/axios';
import Alert from '../components/Alert';
import { useLang } from '../context/LanguageContext';

export default function Register() {
  const navigate = useNavigate();
  const { t, isAr, lang, toggleLang } = useLang();
  const [form, setForm] = useState({ nom: '', email: '', password: '', confirmPassword: '', role: 'beneficiaire', telephone: '', adresse: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setAlert({ type: 'error', message: isAr ? 'كلمتا المرور غير متطابقتين.' : 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (form.password.length < 6) {
      setAlert({ type: 'error', message: isAr ? 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل.' : 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({ nom: form.nom, email: form.email, password: form.password, role: form.role, telephone: form.telephone, adresse: form.adresse });
      if (form.role === 'fournisseur') {
        setSuccess(true);
      } else {
        setAlert({ type: 'success', message: t('register_success') });
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || (isAr ? 'خطأ أثناء التسجيل.' : "Erreur lors de l'inscription.") });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page} dir={isAr ? 'rtl' : 'ltr'}>
        <button onClick={toggleLang} style={styles.langBtn}>{lang === 'fr' ? '🇲🇦 AR' : '🇫🇷 FR'}</button>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
            <h2 style={{ ...styles.title, fontSize: 24, marginBottom: 12 }}>
              {isAr ? 'تم استلام طلبك!' : 'Inscription reçue !'}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              {t('register_pending')}
            </p>
            <div style={styles.waitBox}>
              <p style={{ fontSize: 13, color: '#f59e0b', margin: 0 }}>⏳ {isAr ? 'حسابك قيد المراجعة.' : 'Votre compte est en attente de validation.'}</p>
            </div>
            <Link to="/login" style={styles.backBtn}>{isAr ? '→ العودة إلى تسجيل الدخول' : '← Retour à la connexion'}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} dir={isAr ? 'rtl' : 'ltr'}>
      <button onClick={toggleLang} style={styles.langBtn}>{lang === 'fr' ? '🇲🇦 AR' : '🇫🇷 FR'}</button>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.logo}>✦ CleanNow</span>
        </div>
        <h1 style={styles.title}>{t('register_title')}</h1>
        <p style={styles.subtitle}>{isAr ? 'انضم إلى منصة CleanNow' : 'Rejoignez la plateforme CleanNow'}</p>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.roleSelector}>
            {[
              { value: 'beneficiaire', label: `👤 ${t('register_beneficiaire')}`, desc: isAr ? 'أبحث عن خدمة تنظيف' : 'Je cherche un service de nettoyage' },
              { value: 'fournisseur',  label: `🔧 ${t('register_fournisseur')}`,  desc: isAr ? 'أقدم خدمات التنظيف' : 'Je propose des services de nettoyage' },
            ].map((r) => (
              <button key={r.value} type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                style={{ ...styles.roleBtn, ...(form.role === r.value ? styles.roleBtnActive : {}) }}>
                <span style={styles.roleIcon}>{r.label}</span>
                <span style={styles.roleDesc}>{r.desc}</span>
              </button>
            ))}
          </div>

          {form.role === 'fournisseur' && (
            <div style={styles.infoBox}>
              ℹ️ {isAr ? 'حسابات مزودي الخدمة تتطلب موافقة المسؤول قبل التفعيل.' : "Les comptes fournisseurs nécessitent une validation par l'administrateur."}
            </div>
          )}

          {[
            { key: 'nom',   label: t('register_nom'),   type: 'text',     ph: isAr ? 'الاسم الكامل' : 'Prénom Nom' },
            { key: 'email', label: t('register_email'),  type: 'email',    ph: isAr ? 'بريدك@مثال.com' : 'votre@email.com' },
          ].map((f) => (
            <div key={f.key} style={styles.field}>
              <label style={styles.label}>{f.label} *</label>
              <input type={f.type} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                required placeholder={f.ph} style={styles.input} />
            </div>
          ))}

          {form.role === 'fournisseur' && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>{isAr ? 'الهاتف *' : 'Téléphone *'}</label>
                <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  required placeholder="+212 6XX XXX XXX" style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>{isAr ? 'العنوان / منطقة التدخل *' : "Adresse / Zone d'intervention *"}</label>
                <input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  required placeholder={isAr ? 'مثال: الرباط، أكدال' : 'Ex: Casablanca, Hay Hassani'} style={styles.input} />
              </div>
            </>
          )}

          <div style={styles.field}>
            <label style={styles.label}>{t('register_password')} *</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              required placeholder={isAr ? '6 أحرف على الأقل' : 'Minimum 6 caractères'} style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>{isAr ? 'تأكيد كلمة المرور *' : 'Confirmer le mot de passe *'}</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required placeholder={isAr ? 'أعد كتابة كلمة المرور' : 'Répétez le mot de passe'} style={styles.input} />
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}>
            {loading ? '⏳...' : form.role === 'fournisseur'
              ? (isAr ? '📋 إرسال طلب الانضمام' : '📋 Soumettre ma candidature')
              : `→ ${t('register_btn')}`}
          </button>
        </form>

        <p style={styles.loginLink}>
          {t('register_has_account')} <Link to="/login" style={{ color: 'var(--sky)' }}>{t('register_login')}</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:       { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  langBtn:    { position: 'fixed', top: 20, right: 20, padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', cursor: 'pointer', fontSize: 13, fontWeight: 700, zIndex: 100 },
  card:       { background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.4)' },
  logoRow:    { textAlign: 'center', marginBottom: 24 },
  logo:       { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--sky)' },
  title:      { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 6 },
  subtitle:   { fontSize: 14, color: 'var(--muted)', textAlign: 'center', marginBottom: 24 },
  form:       { display: 'flex', flexDirection: 'column', gap: 16 },
  roleSelector:{ display: 'flex', gap: 10, marginBottom: 4 },
  roleBtn:    { flex: 1, padding: '12px 10px', borderRadius: 12, border: '1px solid rgba(14,165,233,0.2)', background: 'rgba(15,23,42,0.4)', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4 },
  roleBtnActive:{ border: '1px solid rgba(14,165,233,0.6)', background: 'rgba(14,165,233,0.1)' },
  roleIcon:   { fontSize: 13, fontWeight: 700, color: '#fff' },
  roleDesc:   { fontSize: 11, color: 'var(--muted)' },
  infoBox:    { background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#94a3b8', lineHeight: 1.6 },
  waitBox:    { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 },
  field:      { display: 'flex', flexDirection: 'column', gap: 6 },
  label:      { fontSize: 13, fontWeight: 600, color: 'var(--light)' },
  input:      { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' },
  submitBtn:  { background: 'linear-gradient(135deg, var(--sky), var(--sky-dark))', border: 'none', borderRadius: 10, padding: '14px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  loginLink:  { textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--muted)' },
  backBtn:    { display: 'inline-block', marginTop: 16, color: 'var(--sky)', fontSize: 14, textDecoration: 'none' },
};