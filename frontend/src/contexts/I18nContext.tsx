'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ──────────────────────────────────────────────────────
// Clean 2-Language International Context (English & Arabic)
// Zero Bengali, Zero hydration issues, Pure Enterprise Standard
// ──────────────────────────────────────────────────────

export type Locale = 'en' | 'ar';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.track': 'Track',
    'nav.dashboard': 'Dashboard',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    'nav.trackParcel': 'Track Parcel',
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try Again',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.confirm': 'Confirm',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.amount': 'Amount',
    'common.total': 'Total',
    'common.actions': 'Actions',
    'track.title': 'Track Your Parcel',
    'track.subtitle': 'Enter your tracking number to see real-time delivery status.',
    'track.placeholder': 'Enter tracking number (e.g. SHN-98421-US)',
    'track.recentSearches': 'Recent Searches',
    'track.notFound': 'Parcel Not Found',
    'track.notFoundDesc': 'Tracking number not found. Please check and try again.',
    'track.tryAnother': 'Try Another Number',
    'track.deliveryProgress': 'Delivery Progress',
    'track.estimatedDelivery': 'Estimated Delivery',
    'track.assignedRider': 'Assigned Rider',
    'track.journeyTimeline': 'Journey Timeline',
    'track.printReceipt': 'Print Receipt',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.track': 'تتبع الشحنة',
    'nav.dashboard': 'لوحة التحكم',
    'nav.signIn': 'تسجيل الدخول',
    'nav.signOut': 'تسجيل الخروج',
    'nav.trackParcel': 'تتبع الطرد',
    'common.loading': 'جار التحميل...',
    'common.error': 'حدث خطأ ما',
    'common.retry': 'إعادة المحاولة',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.submit': 'إرسال',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.confirm': 'تأكيد',
    'common.status': 'الحالة',
    'common.date': 'التاريخ',
    'common.amount': 'المبلغ',
    'common.total': 'المجموع',
    'common.actions': 'الإجراءات',
    'track.title': 'تتبع شحنتك',
    'track.subtitle': 'أدخل رقم التتبع لمشاهدة حالة التسليم في الوقت الفعلي.',
    'track.placeholder': 'أدخل رقم التتبع (مثال: SHN-98421-US)',
    'track.recentSearches': 'عمليات البحث الأخيرة',
    'track.notFound': 'الشحنة غير موجودة',
    'track.notFoundDesc': 'رقم التتبع غير صحيح. يرجى التأكد والمحاولة مرة أخرى.',
    'track.tryAnother': 'جرب رقماً آخر',
    'track.deliveryProgress': 'تقدم التسليم',
    'track.estimatedDelivery': 'موعد التسليم المتوقع',
    'track.assignedRider': 'المندوب المعين',
    'track.journeyTimeline': 'مسار الشحنة',
    'track.printReceipt': 'طباعة الإيصال',
  },
};

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('shohnaat_locale') as Locale;
    if (saved === 'en' || saved === 'ar') {
      setLocaleState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shohnaat_locale', newLocale);
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      return TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en[key] || key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

/* ── Minimal 2-Language Toggle (EN / AR) ── */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`inline-flex items-center px-2 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md ${className}`}>
        🌐 EN
      </div>
    );
  }

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs ${className}`}
      title={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <span>🌐</span>
      <span>{locale === 'en' ? 'EN' : 'العربية'}</span>
    </button>
  );
}
