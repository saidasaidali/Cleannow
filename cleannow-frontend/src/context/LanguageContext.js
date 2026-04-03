import React, { createContext, useContext, useState } from 'react';

const translations = {
  fr: {
    // Navbar
    nav_dashboard:    'Tableau de bord',
    nav_services:     'Services',
    nav_mydemandes:   'Mes demandes',
    nav_demandes:     'Demandes',
    nav_paiements:    'Paiements',
    nav_evaluations:  'Évaluations',
    nav_utilisateurs: 'Utilisateurs',
    nav_logout:       'Déconnexion',

    // Auth
    login_title:      'Connectez-vous à votre espace',
    login_email:      'Adresse email',
    login_password:   'Mot de passe',
    login_btn:        'Se connecter',
    login_no_account: "Pas encore de compte ?",
    login_register:   'Créer un compte',
    login_error:      'Email ou mot de passe incorrect.',

    register_title:   'Créer un compte',
    register_nom:     'Nom complet',
    register_email:   'Adresse email',
    register_password:'Mot de passe',
    register_role:    'Je suis',
    register_beneficiaire: 'Bénéficiaire (client)',
    register_fournisseur:  'Fournisseur de service',
    register_btn:     "S'inscrire",
    register_has_account: 'Déjà un compte ?',
    register_login:   'Se connecter',
    register_pending: "Votre compte fournisseur est en attente de validation par l'administrateur.",
    register_success: 'Compte créé avec succès !',

    // Dashboard
    dashboard_welcome:    'Bienvenue',
    dashboard_stats:      'Statistiques',
    dashboard_demandes:   'Demandes',
    dashboard_paiements:  'Paiements',
    dashboard_services:   'Services',
    dashboard_evaluations:'Évaluations',
    dashboard_pending:    'En attente',
    dashboard_inprogress: 'En cours',
    dashboard_done:       'Terminées',

    // Services
    services_title:   'Services',
    services_add:     '+ Ajouter un service',
    services_nom:     'Nom du service',
    services_desc:    'Description',
    services_prix:    'Prix (MAD)',
    services_save:    'Enregistrer',
    services_cancel:  'Annuler',
    services_edit:    'Modifier',
    services_delete:  'Supprimer',
    services_empty:   'Aucun service disponible',

    // Demandes
    demandes_title:   'Mes demandes',
    demandes_new:     '+ Nouvelle demande',
    demandes_service: 'Choisir un service',
    demandes_adresse: 'Adresse',
    demandes_notes:   'Notes (optionnel)',
    demandes_send:    'Envoyer la demande',
    demandes_cancel:  'Annuler',
    demandes_empty:   '0 demandes',
    demandes_all:     'Toutes',
    demandes_pending: 'En attente',
    demandes_inprog:  'En cours',
    demandes_done:    'Terminées',

    // Statuts
    statut_en_attente: 'En attente',
    statut_en_cours:   'En cours',
    statut_termine:    'Terminé',
    statut_annule:     'Refusé',

    // Paiements
    paiements_title:  'Paiements',
    paiements_pay:    '💳 Payer',
    paiements_paid:   '✅ Payé',
    paiements_waiting:'⏳ Prestation en cours',
    paiements_method: 'Méthode de paiement',
    paiements_confirm:'Confirmer le paiement',
    paiements_total:  'Total',
    paiements_amount: 'Montant',
    paiements_service:'Service',
    paiements_client: 'Client',
    paiements_fournisseur: 'Fournisseur',

    // Évaluations
    evals_title:      'Évaluations',
    evals_leave:      '⭐ Laisser un avis',
    evals_note:       'Note',
    evals_comment:    'Commentaire',
    evals_send:       'Envoyer',
    evals_empty:      'Aucune évaluation',

    // Actions fournisseur
    action_accept:    '✅ Accepter',
    action_refuse:    '✕ Refuser',
    action_termine:   '🏁 Marquer terminé',
    action_locked:    '🔒 Assignée à un autre fournisseur',

    // Général
    loading:          'Chargement...',
    error_load:       'Impossible de charger les données.',
    save:             'Enregistrer',
    cancel:           'Annuler',
    delete:           'Supprimer',
    edit:             'Modifier',
    search:           'Rechercher...',
    no_data:          'Aucune donnée',
  },

  ar: {
    // Navbar
    nav_dashboard:    'لوحة التحكم',
    nav_services:     'الخدمات',
    nav_mydemandes:   'طلباتي',
    nav_demandes:     'الطلبات',
    nav_paiements:    'المدفوعات',
    nav_evaluations:  'التقييمات',
    nav_utilisateurs: 'المستخدمون',
    nav_logout:       'تسجيل الخروج',

    // Auth
    login_title:      'سجّل دخولك',
    login_email:      'البريد الإلكتروني',
    login_password:   'كلمة المرور',
    login_btn:        'دخول',
    login_no_account: 'ليس لديك حساب؟',
    login_register:   'إنشاء حساب',
    login_error:      'البريد الإلكتروني أو كلمة المرور غير صحيحة.',

    register_title:   'إنشاء حساب',
    register_nom:     'الاسم الكامل',
    register_email:   'البريد الإلكتروني',
    register_password:'كلمة المرور',
    register_role:    'أنا',
    register_beneficiaire: 'مستفيد (عميل)',
    register_fournisseur:  'مزود خدمة',
    register_btn:     'إنشاء الحساب',
    register_has_account: 'لديك حساب؟',
    register_login:   'سجّل دخولك',
    register_pending: 'حسابك كمزود خدمة قيد المراجعة من قبل المسؤول.',
    register_success: 'تم إنشاء الحساب بنجاح!',

    // Dashboard
    dashboard_welcome:    'مرحباً',
    dashboard_stats:      'الإحصاءات',
    dashboard_demandes:   'الطلبات',
    dashboard_paiements:  'المدفوعات',
    dashboard_services:   'الخدمات',
    dashboard_evaluations:'التقييمات',
    dashboard_pending:    'قيد الانتظار',
    dashboard_inprogress: 'جارٍ التنفيذ',
    dashboard_done:       'مكتملة',

    // Services
    services_title:   'الخدمات',
    services_add:     '+ إضافة خدمة',
    services_nom:     'اسم الخدمة',
    services_desc:    'الوصف',
    services_prix:    'السعر (درهم)',
    services_save:    'حفظ',
    services_cancel:  'إلغاء',
    services_edit:    'تعديل',
    services_delete:  'حذف',
    services_empty:   'لا توجد خدمات',

    // Demandes
    demandes_title:   'طلباتي',
    demandes_new:     '+ طلب جديد',
    demandes_service: 'اختر خدمة',
    demandes_adresse: 'العنوان',
    demandes_notes:   'ملاحظات (اختياري)',
    demandes_send:    'إرسال الطلب',
    demandes_cancel:  'إلغاء',
    demandes_empty:   '0 طلبات',
    demandes_all:     'الكل',
    demandes_pending: 'قيد الانتظار',
    demandes_inprog:  'جارٍ التنفيذ',
    demandes_done:    'مكتملة',

    // Statuts
    statut_en_attente: 'قيد الانتظار',
    statut_en_cours:   'جارٍ التنفيذ',
    statut_termine:    'مكتمل',
    statut_annule:     'مرفوض',

    // Paiements
    paiements_title:  'المدفوعات',
    paiements_pay:    '💳 ادفع الآن',
    paiements_paid:   '✅ تم الدفع',
    paiements_waiting:'⏳ الخدمة جارية',
    paiements_method: 'طريقة الدفع',
    paiements_confirm:'تأكيد الدفع',
    paiements_total:  'المجموع',
    paiements_amount: 'المبلغ',
    paiements_service:'الخدمة',
    paiements_client: 'العميل',
    paiements_fournisseur: 'مزود الخدمة',

    // Évaluations
    evals_title:      'التقييمات',
    evals_leave:      '⭐ أضف تقييماً',
    evals_note:       'التقييم',
    evals_comment:    'التعليق',
    evals_send:       'إرسال',
    evals_empty:      'لا توجد تقييمات',

    // Actions fournisseur
    action_accept:    '✅ قبول',
    action_refuse:    '✕ رفض',
    action_termine:   '🏁 تحديد كمكتمل',
    action_locked:    '🔒 مسند لمزود آخر',

    // Général
    loading:          'جارٍ التحميل...',
    error_load:       'تعذّر تحميل البيانات.',
    save:             'حفظ',
    cancel:           'إلغاء',
    delete:           'حذف',
    edit:             'تعديل',
    search:           'بحث...',
    no_data:          'لا توجد بيانات',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('cleannow_lang') || 'fr');

  const toggleLang = () => {
    const next = lang === 'fr' ? 'ar' : 'fr';
    setLang(next);
    localStorage.setItem('cleannow_lang', next);
    // RTL pour l'arabe
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  // Appliquer RTL au chargement
  React.useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translations[lang][key] || translations['fr'][key] || key;
  const isAr = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isAr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);