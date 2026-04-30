import { create } from "zustand";

export type Language = "en" | "tr" | "de" | "fr" | "es";

export interface Translations {
  common: {
    create: string;
    edit: string;
    save: string;
    cancel: string;
    delete: string;
    confirm: string;
    search: string;
    filters: string;
    export: string;
    actions: string;
    no_results: string;
    loading: string;
    dashboard: string;
    resources: string;
    welcome: string;
    logout: string;
    settings: string;
  };
  messages: {
    confirm_delete: string;
    delete_success: string;
    create_success: string;
    update_success: string;
    error_occurred: string;
  };
  auth: {
    welcome_back: string;
    enter_credentials: string;
    email: string;
    password: string;
    sign_in: string;
    signing_in: string;
    create_account: string;
    sign_up_to_get_started: string;
    name: string;
    sign_up: string;
    creating_account: string;
    invalid_email: string;
    password_min_length: string;
    name_min_length: string;
  };
}

const en: Translations = {
  common: {
    create: "Create",
    edit: "Edit",
    save: "Save Changes",
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    search: "Search...",
    filters: "Filters",
    export: "Export",
    actions: "Actions",
    no_results: "No results found",
    loading: "Loading...",
    dashboard: "Dashboard",
    resources: "Resources",
    welcome: "Welcome back",
    logout: "Logout",
    settings: "Settings",
  },
  messages: {
    confirm_delete: "Are you sure you want to delete this item?",
    delete_success: "Item deleted successfully",
    create_success: "Item created successfully",
    update_success: "Item updated successfully",
    error_occurred: "An error occurred",
  },
  auth: {
    welcome_back: "Welcome Back",
    enter_credentials: "Enter your credentials to access your account",
    email: "Email",
    password: "Password",
    sign_in: "Sign In",
    signing_in: "Signing in...",
    create_account: "Create Account",
    sign_up_to_get_started: "Sign up to get started",
    name: "Name",
    sign_up: "Sign Up",
    creating_account: "Creating account...",
    invalid_email: "Invalid email address",
    password_min_length: "Password must be at least 6 characters",
    name_min_length: "Name must be at least 2 characters",
  },
};

const tr: Translations = {
  common: {
    create: "Oluştur",
    edit: "Düzenle",
    save: "Değişiklikleri Kaydet",
    cancel: "İptal",
    delete: "Sil",
    confirm: "Onayla",
    search: "Ara...",
    filters: "Filtreler",
    export: "Dışa Aktar",
    actions: "İşlemler",
    no_results: "Sonuç bulunamadı",
    loading: "Yükleniyor...",
    dashboard: "Panel",
    resources: "Kaynaklar",
    welcome: "Hoş geldiniz",
    logout: "Çıkış",
    settings: "Ayarlar",
  },
  messages: {
    confirm_delete: "Bu öğeyi silmek istediğinizden emin misiniz?",
    delete_success: "Öğe başarıyla silindi",
    create_success: "Öğe başarıyla oluşturuldu",
    update_success: "Öğe başarıyla güncellendi",
    error_occurred: "Bir hata oluştu",
  },
  auth: {
    welcome_back: "Tekrar Hoş Geldiniz",
    enter_credentials: "Hesabınıza erişmek için bilgilerinizi girin",
    email: "E-posta",
    password: "Şifre",
    sign_in: "Giriş Yap",
    signing_in: "Giriş yapılıyor...",
    create_account: "Hesap Oluştur",
    sign_up_to_get_started: "Başlamak için kayıt olun",
    name: "İsim",
    sign_up: "Kayıt Ol",
    creating_account: "Hesap oluşturuluyor...",
    invalid_email: "Geçersiz e-posta adresi",
    password_min_length: "Şifre en az 6 karakter olmalıdır",
    name_min_length: "İsim en az 2 karakter olmalıdır",
  },
};

const translations: Record<Language, Translations> = {
  en,
  tr,
  de: en, // Fallback for now
  fr: en,
  es: en,
};

interface I18nState {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nState>((set) => ({
  language: "en",
  t: en,
  setLanguage: (lang) => set({ language: lang, t: translations[lang] || en }),
}));
