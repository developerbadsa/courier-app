'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ──────────────────────────────────────────────────────
// Type-safe i18n context for Shohnaat Logistics
// Supports English (en) + Bengali (bn)
// ──────────────────────────────────────────────────────

type Locale = 'en' | 'bn';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  toggleLocale: () => void;
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
    'track.placeholder': 'Enter tracking number (e.g. SH-ABC123)',
    'track.recentSearches': 'Recent Searches',
    'track.notFound': 'Parcel Not Found',
    'track.notFoundDesc': 'Tracking number not found. Please check and try again.',
    'track.tryAnother': 'Try Another Number',
    'track.deliveryProgress': 'Delivery Progress',
    'track.estimatedDelivery': 'Estimated Delivery',
    'track.assignedRider': 'Assigned Rider',
    'track.journeyTimeline': 'Journey Timeline',
    'track.printReceipt': 'Print Receipt',
    'track.trackAnother': 'Track Another Parcel',
    'track.timeRemaining': 'remaining',
    'track.hours': 'Hours',
    'track.minutes': 'Minutes',
    'track.scannerHint': 'USB barcode scanner compatible — scan to auto-search',
    'dash.overview': 'Overview',
    'dash.shipments': 'Shipments',
    'dash.pickups': 'Pickup Requests',
    'dash.finance': 'COD & Payouts',
    'dash.addresses': 'Address Book',
    'dash.invoices': 'Invoices',
    'dash.developer': 'Developer API',
    'dash.profile': 'Store Profile',
    'dash.analytics': 'Analytics',
    'status.PENDING': 'Pending',
    'status.PICKUP_ASSIGNED': 'Rider Assigned',
    'status.PICKED_UP': 'Picked Up',
    'status.AT_HUB': 'At Hub',
    'status.IN_TRANSIT': 'In Transit',
    'status.OUT_FOR_DELIVERY': 'Out for Delivery',
    'status.DELIVERED': 'Delivered',
    'status.FAILED': 'Delivery Failed',
    'status.CANCELLED': 'Cancelled',
    'status.RESCHEDULED': 'Rescheduled',
    'feat.realTimeTracking': 'Real-Time Tracking',
    'feat.realTimeTrackingDesc': 'Live status updates as your parcel moves',
    'feat.deliveryEstimate': 'Delivery Estimates',
    'feat.deliveryEstimateDesc': 'Countdown to expected arrival',
    'feat.securePrivate': 'Secure & Private',
    'feat.securePrivateDesc': 'No login needed to track',
    'footer.rights': 'All rights reserved.',
    'onboard.title': 'Merchant Registration',
    'onboard.step1': 'Business Info',
    'onboard.step2': 'Documents',
    'onboard.step3': 'Review',
    'onboard.businessName': 'Business Name',
    'onboard.businessType': 'Business Type',
    'onboard.contactPerson': 'Contact Person',
    'onboard.phone': 'Phone Number',
    'onboard.email': 'Email Address',
    'onboard.password': 'Password',
    'onboard.submitApplication': 'Submit Application',
    'onboard.approvalPending': 'Your application is under review. We will notify you within 24-48 hours.',
    'invoice.title': 'Invoice',
    'invoice.invoiceNumber': 'Invoice #',
    'invoice.date': 'Date',
    'invoice.from': 'From',
    'invoice.to': 'To',
    'invoice.description': 'Description',
    'invoice.quantity': 'Qty',
    'invoice.unitPrice': 'Unit Price',
    'invoice.total': 'Total',
    'invoice.subtotal': 'Subtotal',
    'invoice.grandTotal': 'Grand Total',
    'invoice.downloadPdf': 'Download PDF',
    'bulk.title': 'Bulk Shipment Import',
    'bulk.subtitle': 'Upload a CSV or Excel file to create multiple shipments at once.',
    'bulk.downloadTemplate': 'Download Template',
    'bulk.uploadFile': 'Upload File',
    'bulk.dragDrop': 'Drag & drop your file here, or',
    'bulk.browse': 'browse',
    'bulk.supportedFormats': 'Supported: CSV, XLSX (max 500 rows)',
    'bulk.import': 'Import Shipments',
    'bulk.success': 'Shipments imported successfully!',
  },
  bn: {
    'nav.home': 'হোম',
    'nav.track': 'ট্র্যাক',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.signIn': 'লগইন',
    'nav.signOut': 'লগআউট',
    'nav.trackParcel': 'পার্সেল ট্র্যাক করুন',
    'common.loading': 'লোড হচ্ছে...',
    'common.error': 'কিছু ভুল হয়েছে',
    'common.retry': 'আবার চেষ্টা করুন',
    'common.cancel': 'বাতিল',
    'common.save': 'সংরক্ষণ',
    'common.delete': 'মুছুন',
    'common.edit': 'সম্পাদনা',
    'common.add': 'যোগ করুন',
    'common.search': 'অনুসন্ধান',
    'common.filter': 'ফিল্টার',
    'common.export': 'এক্সপোর্ট',
    'common.import': 'ইম্পোর্ট',
    'common.submit': 'জমা দিন',
    'common.back': 'পিছনে',
    'common.next': 'পরবর্তী',
    'common.previous': 'পূর্ববর্তী',
    'common.confirm': 'নিশ্চিত',
    'common.status': 'স্ট্যাটাস',
    'common.date': 'তারিখ',
    'common.amount': 'পরিমাণ',
    'common.total': 'মোট',
    'common.actions': 'কার্যক্রম',
    'track.title': 'আপনার পার্সেল ট্র্যাক করুন',
    'track.subtitle': 'রিয়েল-টাইম ডেলিভারি স্ট্যাটাস দেখতে আপনার ট্র্যাকিং নম্বর লিখুন।',
    'track.placeholder': 'ট্র্যাকিং নম্বর লিখুন (যেমন SH-ABC123)',
    'track.recentSearches': 'সাম্প্রতিক অনুসন্ধান',
    'track.notFound': 'পার্সেল পাওয়া যায়নি',
    'track.notFoundDesc': 'ট্র্যাকিং নম্বর পাওয়া যায়নি। অনুগ্রহ করে চেক করুন।',
    'track.tryAnother': 'অন্য নম্বর চেষ্টা করুন',
    'track.deliveryProgress': 'ডেলিভারি অগ্রগতি',
    'track.estimatedDelivery': 'আনুমানিক ডেলিভারি',
    'track.assignedRider': 'নির্ধারিত রাইডার',
    'track.journeyTimeline': 'যাত্রার টাইমলাইন',
    'track.printReceipt': 'রসিদ প্রিন্ট',
    'track.trackAnother': 'আরেকটি পার্সেল ট্র্যাক করুন',
    'track.timeRemaining': 'বাকি',
    'track.hours': 'ঘণ্টা',
    'track.minutes': 'মিনিট',
    'track.scannerHint': 'ইউএসবি বারকোড স্ক্যানার সাপোর্টেড',
    'dash.overview': 'ওভারভিউ',
    'dash.shipments': 'শিপমেন্ট',
    'dash.pickups': 'পিকআপ অনুরোধ',
    'dash.finance': 'কোড ও পেমেন্ট',
    'dash.addresses': 'ঠিকানা বই',
    'dash.invoices': 'ইনভয়েস',
    'dash.developer': 'ডেভেলপার API',
    'dash.profile': 'স্টোর প্রোফাইল',
    'dash.analytics': 'বিশ্লেষণ',
    'status.PENDING': 'অপেক্ষমাণ',
    'status.PICKUP_ASSIGNED': 'রাইডার নির্ধারিত',
    'status.PICKED_UP': 'সংগৃহীত',
    'status.AT_HUB': 'হাব-এ আছে',
    'status.IN_TRANSIT': 'পথে আছে',
    'status.OUT_FOR_DELIVERY': 'ডেলিভারির জন্য বের হয়েছে',
    'status.DELIVERED': 'ডেলিভারি সম্পন্ন',
    'status.FAILED': 'ডেলিভারি ব্যর্থ',
    'status.CANCELLED': 'বাতিল',
    'status.RESCHEDULED': 'পুনর্নির্ধারিত',
    'feat.realTimeTracking': 'রিয়েল-টাইম ট্র্যাকিং',
    'feat.realTimeTrackingDesc': 'পার্সেল চলাকালে লাইভ স্ট্যাটাস আপডেট',
    'feat.deliveryEstimate': 'ডেলিভারি আনুমানিক সময়',
    'feat.deliveryEstimateDesc': 'প্রত্যাশিত আগমনের কাউন্টডাউন',
    'feat.securePrivate': 'নিরাপদ ও গোপনীয়',
    'feat.securePrivateDesc': 'ট্র্যাক করতে লগইনের প্রয়োজন নেই',
    'footer.rights': 'সর্বস্বত্ব সংরক্ষিত।',
    'onboard.title': 'মার্চেন্ট নিবন্ধন',
    'onboard.step1': 'ব্যবসায়িক তথ্য',
    'onboard.step2': 'ডকুমেন্ট',
    'onboard.step3': 'পর্যালোচনা',
    'onboard.businessName': 'ব্যবসার নাম',
    'onboard.businessType': 'ব্যবসার ধরন',
    'onboard.contactPerson': 'যোগাযোগকারী',
    'onboard.phone': 'ফোন নম্বর',
    'onboard.email': 'ইমেইল',
    'onboard.password': 'পাসওয়ার্ড',
    'onboard.submitApplication': 'আবেদন জমা দিন',
    'onboard.approvalPending': 'আপনার আবেদন পর্যালোচনাধীন। ২৪-৪৮ ঘণ্টার মধ্যে জানানো হবে।',
    'invoice.title': 'ইনভয়েস',
    'invoice.invoiceNumber': 'ইনভয়েস #',
    'invoice.date': 'তারিখ',
    'invoice.from': 'প্রেরক',
    'invoice.to': 'প্রাপক',
    'invoice.description': 'বিবরণ',
    'invoice.quantity': 'পরিমাণ',
    'invoice.unitPrice': 'একক মূল্য',
    'invoice.total': 'মোট',
    'invoice.subtotal': 'উপমোট',
    'invoice.grandTotal': 'সর্বমোট',
    'invoice.downloadPdf': 'PDF ডাউনলোড',
    'bulk.title': 'বাল্ক শিপমেন্ট ইম্পোর্ট',
    'bulk.subtitle': 'একসাথে একাধিক শিপমেন্ট তৈরি করতে CSV বা Excel ফাইল আপলোড করুন।',
    'bulk.downloadTemplate': 'টেমপ্লেট ডাউনলোড',
    'bulk.uploadFile': 'ফাইল আপলোড',
    'bulk.dragDrop': 'আপনার ফাইল এখানে ড্র্যাগ ও ড্রপ করুন, অথবা',
    'bulk.browse': 'ব্রাউজ করুন',
    'bulk.supportedFormats': 'সমর্থিত: CSV, XLSX (সর্বোচ্চ ৫০০ সারি)',
    'bulk.import': 'শিপমেন্ট ইম্পোর্ট',
    'bulk.success': 'শিপমেন্ট সফলভাবে ইম্পোর্ট হয়েছে!',
  },
};

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
  toggleLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('shohnaat_locale') as Locale) || 'en';
    }
    return 'en';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shohnaat_locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'bn' : 'en');
  }, [locale, setLocale]);

  const t = useCallback((key: string): string => {
    return TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en[key] || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

/* ── Language Toggle Button Component ── */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, toggleLocale } = useI18n();

  return (
    <button
      onClick={toggleLocale}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-md border transition-all ${className} ${
        locale === 'bn'
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      }`}
      title={locale === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
    >
      {locale === 'en' ? 'বাং' : 'EN'}
    </button>
  );
}
