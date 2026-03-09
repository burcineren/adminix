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
