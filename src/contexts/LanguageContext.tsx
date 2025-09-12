
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, updateSettings } from '@/lib/settings';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Arabic translation dictionary
const translations: Record<string, Record<string, string>> = {
  ar: {
    // Login
    'welcome_back': 'أهلاً وسهلاً',
    'enter_credentials': 'أدخل بياناتك للوصول إلى لوحة المعلومات',
    'username': 'اسم المستخدم',
    'password': 'كلمة المرور',
    'login': 'دخول',
    'default_credentials': 'البيانات الافتراضية',
    'username_admin': 'اسم المستخدم: admin',
    'password_1234': 'كلمة المرور: 1234',
    'incorrect_credentials': 'اسم المستخدم أو كلمة المرور غير صحيحة',

    // Common
    'dashboard': 'لوحة المعلومات',
    'print': 'طباعة',
    'history': 'السجل',
    'statistics': 'الإحصائيات',
    'settings': 'الإعدادات',
    'save': 'حفظ',
    'cancel': 'إلغاء',
    'delete': 'حذف',
    'edit': 'تعديل',
    'add': 'إضافة',
    'search': 'بحث',
    'filter': 'تصفية',
    'all': 'الكل',
    'from': 'من',
    'to': 'إلى',
    'yes': 'نعم',
    'no': 'لا',
    'confirm': 'تأكيد',

    // Dashboard
    'dashboard_access': 'الدخول إلى لوحة المعلومات',
    'enter_pin': 'أدخل رمز PIN للوصول إلى لوحة المعلومات',
    'access_granted': 'تم منح الوصول',
    'welcome_to_dashboard': 'مرحبًا بك في لوحة المعلومات',
    'access_denied': 'تم رفض الوصول',
    'incorrect_pin': 'رمز PIN غير صحيح',
    'todays_print_jobs': 'مهام الطباعة اليوم',
    'total_pages_printed': 'إجمالي الصفحات المطبوعة',
    'unpaid_balance': 'الرصيد غير المدفوع',
    'total_print_jobs': 'إجمالي مهام الطباعة',
    'recent_print_jobs': 'مهام الطباعة الأخيرة',
    'view_all_print_jobs': 'عرض جميع مهام الطباعة',
    'no_print_jobs_yet': 'لا توجد مهام طباعة حتى الآن',
    'create_first_print_job': 'إنشاء أول مهمة طباعة',
    'unpaid_balances_by_class': 'الأرصدة غير المدفوعة حسب الفصل',
    'unpaid': 'غير مدفوع',
    'all_classes_paid': 'تم دفع جميع الفصول!',
    'view_all_unpaid_jobs': 'عرض جميع المهام غير المدفوعة',

    // Print History
    'print_history': 'سجل الطباعة',
    'view_and_manage': 'عرض وإدارة جميع مهام الطباعة',
    'export_csv': 'تصدير CSV',
    'export_pdf': 'تصدير PDF',
    'unpaid_reports': 'تقارير غير مدفوعة',
    'new_print_job': 'مهمة طباعة جديدة',
    'receipt': 'إيصال',
    'date': 'التاريخ',
    'class': 'الفصل',
    'teacher': 'المعلم',
    'document': 'المستند',
    'type': 'النوع',
    'pages': 'الصفحات',
    'price': 'السعر',
    'status': 'الحالة',
    'paid': 'مدفوع',
    'class_filter': 'الفصل',
    'payment_status': 'حالة الدفع',
    'document_type': 'نوع المستند',
    'date_range': 'نطاق التاريخ',
    'start_date': 'تاريخ البدء',
    'end_date': 'تاريخ الانتهاء',
    'clear_filters': 'مسح التصفية',
    
    // Settings
    'general_settings': 'الإعدادات العامة',
    'customize_settings': 'تخصيص إعدادات متجر الطباعة',
    'currency': 'د.م.', // Moroccan Dirham
    'shop_information': 'معلومات المتجر',
    'shop_name': 'اسم المتجر',
    'contact_information': 'معلومات الاتصال',
    'print_prices': 'أسعار الطباعة',
    'price_recto': 'سعر وجه واحد (د.م.)',
    'price_recto_verso': 'سعر الوجهين (د.م.)',
    'price_both': 'سعر كلاهما (د.م.)',
    'maximum_unpaid': 'الحد الأقصى المسموح به للمبالغ غير المدفوعة',
    'automation_settings': 'إعدادات التشغيل التلقائي',
    'whatsapp_template': 'قالب رسالة واتساب',
    'auto_save_pdf': 'حفظ تلقائي كـ PDF',
    'auto_whatsapp': 'إرسال تلقائي عبر واتساب',
    'default_save_path': 'مسار الحفظ الافتراضي',
    'auto_paid_notification': 'إرسال إشعار تلقائي عند التحديد كمدفوع',
    'language_settings': 'إعدادات اللغة',
    'select_language': 'اختر اللغة',
    'english': 'الإنجليزية',
    'arabic': 'العربية',
    'settings_saved': 'تم حفظ الإعدادات',
    'settings_updated': 'تم تحديث الإعدادات بنجاح',
    'error_saving_settings': 'خطأ في حفظ الإعدادات',
    'try_again': 'حدث خطأ في حفظ الإعدادات. يرجى المحاولة مرة أخرى.'
  },
  en: {
    // We'll use keys as values for English
  }
};

// Create a default translator that returns the key if no translation is found
const createTranslator = (language: string) => {
  return (key: string): string => {
    if (language === 'en') return key;
    return translations[language]?.[key] || key;
  };
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('en');
  const [translator, setTranslator] = useState(() => createTranslator('en'));

  useEffect(() => {
    const loadLanguagePreference = async () => {
      const settings = await getSettings();
      if (settings.language) {
        setLanguageState(settings.language);
        setTranslator(() => createTranslator(settings.language));
      }
    };
    
    loadLanguagePreference();
  }, []);

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    setTranslator(() => createTranslator(lang));
    
    const settings = await getSettings();
    await updateSettings({ ...settings, language: lang });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translator }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
