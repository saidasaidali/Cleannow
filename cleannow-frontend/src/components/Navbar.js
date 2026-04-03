import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

const NAV_LINKS = {
  admin: [
    { to: '/dashboard',     key: 'nav_dashboard',    icon: '⊞' },
    { to: '/services',      key: 'nav_services',     icon: '✦' },
    { to: '/demandes',      key: 'nav_demandes',     icon: '📋' },
    { to: '/paiements',     key: 'nav_paiements',    icon: '💳' },
    { to: '/evaluations',   key: 'nav_evaluations',  icon: '★' },
    { to: '/utilisateurs',  key: 'nav_utilisateurs', icon: '👥' },
  ],
  beneficiaire: [
    { to: '/dashboard',    key: 'nav_dashboard',   icon: '⊞' },
    { to: '/services',     key: 'nav_services',    icon: '✦' },
    { to: '/mes-demandes', key: 'nav_mydemandes',  icon: '📋' },
    { to: '/paiements',    key: 'nav_paiements',   icon: '💳' },
    { to: '/evaluations',  key: 'nav_evaluations', icon: '★' },
  ],
  fournisseur: [
    { to: '/dashboard',          key: 'nav_dashboard', icon: '⊞' },
    { to: '/demandes-a-traiter', key: 'nav_demandes',  icon: '📋' },
    { to: '/paiements',          key: 'nav_paiements', icon: '💳' },
  ],
};

export default function Navbar() {
  const { user, logout }        = useAuth();
  const { lang, toggleLang, t } = useLang();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const links = NAV_LINKS[user?.role] || [];
  const handleLogout = () => { logout(); navigate('/login'); };
  const roleColors = { admin: '#f59e0b', beneficiaire: '#0ea5e9', fournisseur: '#10b981' };
  const roleColor = roleColors[user?.role] || '#64748b';

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/dashboard" style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>Clean<span style={{ color: 'var(--sky)' }}>Now</span></span>
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <div style={styles.links}>
            {links.map((l) => (
              <Link key={l.to} to={l.to}
                style={{ ...styles.link, ...(location.pathname === l.to ? styles.linkActive : {}) }}>
                <span style={styles.linkIcon}>{l.icon}</span>
                {t(l.key)}
              </Link>
            ))}
          </div>
        )}

        {/* Zone droite */}
        <div style={styles.userArea}>
          {/* Langue */}
          <button onClick={toggleLang} style={styles.langBtn}>
            {lang === 'fr' ? '🇲🇦' : '🇫🇷'}
            {!isMobile && <span style={{ marginLeft: 4 }}>{lang === 'fr' ? 'AR' : 'FR'}</span>}
          </button>

          {/* Avatar + info — desktop */}
          {!isMobile && (
            <div style={styles.userBadge}>
              <div style={{ ...styles.avatar, background: roleColor }}>
                {user?.nom?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user?.nom || user?.email}</span>
                <span style={{ ...styles.userRole, color: roleColor }}>{user?.role}</span>
              </div>
            </div>
          )}

          {/* Logout — desktop */}
          {!isMobile && (
            <button onClick={handleLogout} style={styles.logoutBtn} title={t('nav_logout')}>⇤</button>
          )}

          {/* Burger — mobile */}
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} style={styles.burger}>
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>

      {/* Menu mobile */}
      {isMobile && menuOpen && (
        <div style={styles.mobileMenu}>
          {/* Info user */}
          <div style={styles.mobileUserInfo}>
            <div style={{ ...styles.avatar, background: roleColor, width: 42, height: 42, fontSize: 17 }}>
              {user?.nom?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{user?.nom || user?.email}</div>
              <div style={{ fontSize: 12, color: roleColor, textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>

          <div style={styles.mobileDivider} />

          {links.map((l) => (
            <Link key={l.to} to={l.to}
              style={{ ...styles.mobileLink, ...(location.pathname === l.to ? styles.mobileLinkActive : {}) }}
              onClick={() => setMenuOpen(false)}>
              <span style={styles.mobileLinkIcon}>{l.icon}</span>
              {t(l.key)}
            </Link>
          ))}

          <div style={styles.mobileDivider} />

          <button onClick={() => { toggleLang(); setMenuOpen(false); }} style={styles.mobileLangBtn}>
            <span>{lang === 'fr' ? '🇲🇦' : '🇫🇷'}</span>
            {lang === 'fr' ? 'التبديل إلى العربية' : 'Passer en français'}
          </button>

          <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
            ⇤ {t('nav_logout')}
          </button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(15,23,42,0.97)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(14,165,233,0.15)',
    boxShadow: '0 2px 32px rgba(0,0,0,0.4)',
  },
  inner: {
    maxWidth: 1280, margin: '0 auto', padding: '0 16px',
    display: 'flex', alignItems: 'center', height: 60, gap: 16,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 },
  logoIcon: { fontSize: 20, color: 'var(--sky)' },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' },
  links: { display: 'flex', gap: 2, flex: 1, flexWrap: 'nowrap', overflowX: 'auto' },
  link: { display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, textDecoration: 'none', color: 'var(--muted)', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 },
  linkActive: { background: 'rgba(14,165,233,0.15)', color: 'var(--sky)' },
  linkIcon: { fontSize: 13 },
  userArea: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' },
  langBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.08)', color: '#0ea5e9', cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  userBadge: { display: 'flex', alignItems: 'center', gap: 8 },
  avatar: { width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 },
  userInfo: { display: 'flex', flexDirection: 'column', lineHeight: 1.2 },
  userName: { fontSize: 13, fontWeight: 600, color: '#fff' },
  userRole: { fontSize: 11, textTransform: 'capitalize' },
  logoutBtn: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16 },
  burger: { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', color: '#fff', fontSize: 20, cursor: 'pointer', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 },
  mobileMenu: { display: 'flex', flexDirection: 'column', gap: 4, padding: '16px', background: 'rgba(15,23,42,0.98)', borderTop: '1px solid rgba(14,165,233,0.1)', maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' },
  mobileUserInfo: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px 12px' },
  mobileDivider: { height: 1, background: 'rgba(14,165,233,0.1)', margin: '4px 0' },
  mobileLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, textDecoration: 'none', color: '#94a3b8', fontSize: 15, fontWeight: 500 },
  mobileLinkActive: { background: 'rgba(14,165,233,0.12)', color: 'var(--sky)' },
  mobileLinkIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  mobileLangBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(14,165,233,0.2)', background: 'rgba(14,165,233,0.06)', color: '#0ea5e9', cursor: 'pointer', fontSize: 14, fontWeight: 600, textAlign: 'left' },
  mobileLogoutBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', fontSize: 15, fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginTop: 4 },
};