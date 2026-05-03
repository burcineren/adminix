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
    reports: string;
    plugins: string;
    toggle_sidebar: string;
    add_product: string;
    list_view: string;
    analytics: string;
    performance: string;
    activity: string;
    quick_access: string;
    extensions: string;
    invalid_config: string;
    refresh: string;
    welcome_to: string;
    select_resource: string;
    no_charts: string;
    open_designer: string;
    designer: string;
    fields_configured: string;
    open_resource: string;
    waiting_for_data: string;
    no_records_desc: string;
    create_first: string;
    failed_load: string;
    retry: string;
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
    reports: "Reports",
    plugins: "Plugins",
    toggle_sidebar: "Toggle Sidebar",
    add_product: "Add Product",
    list_view: "List View",
    analytics: "Analytics",
    performance: "Performance Overview",
    activity: "Real-time Activity",
    quick_access: "Quick Access Resources",
    extensions: "Extensions",
    invalid_config: "Invalid Configuration",
    refresh: "Refresh",
    welcome_to: "Welcome to Adminix",
    select_resource: "Select a resource from the sidebar to get started, or add resources to your <Adminix> component.",
    no_charts: "No Charts Configured",
    open_designer: "Open Dashboard Designer",
    designer: "Dashboard Designer",
    fields_configured: "fields configured",
    open_resource: "Open Resource",
    waiting_for_data: "Waiting for Data",
    no_records_desc: "This resource currently has no records. Adminix needs at least one record to automatically infer the schema.",
    create_first: "Create First Record",
    failed_load: "Failed to load records",
    retry: "Retry Connection",
    columns: "Columns",
    compact: "Compact",
    standard: "Standard",
    comfortable: "Comfortable",
    no_records_found: "No records found",
    no_records_found_desc: "We couldn't find any data matching your current view.",
    empty_desc: "Try adjusting your filters or search term.",
    system: "System",
    all: "All",
    yes: "Yes",
    any: "Any",
    range: "Range",
    period: "Period",
    reset: "Reset",
    min: "Min",
    max: "Max",
    per_page: "per page",
    showing: "Showing",
    of: "of",
    results: "results",
    first_page: "First page",
    last_page: "Last page",
    prev_page: "Previous page",
    next_page: "Next page",
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
    welcome: "Tekrar hoş geldiniz",
    logout: "Çıkış",
    settings: "Ayarlar",
    reports: "Raporlar",
    plugins: "Eklentiler",
    toggle_sidebar: "Menüyü Kapat/Aç",
    add_product: "Ürün Ekle",
    list_view: "Liste Görünümü",
    analytics: "Analiz",
    performance: "Performans Özeti",
    activity: "Gerçek Zamanlı Aktivite",
    quick_access: "Hızlı Erişim Kaynakları",
    extensions: "Uzantılar",
    invalid_config: "Geçersiz Yapılandırma",
    refresh: "Yenile",
    welcome_to: "Adminix'e Hoş Geldiniz",
    select_resource: "Başlamak için yan menüden bir kaynak seçin veya kendi şemanızı Adminix bileşenine ekleyin.",
    no_charts: "Yapılandırılmış Grafik Yok",
    open_designer: "Panel Tasarımcısını Aç",
    designer: "Panel Tasarımcısı",
    fields_configured: "alan yapılandırıldı",
    open_resource: "Kaynağı Aç",
    waiting_for_data: "Veri Bekleniyor",
    no_records_desc: "Bu kaynakta henüz kayıt bulunmuyor. Adminix şemayı otomatik olarak çıkarmak için en az bir kayda ihtiyaç duyar.",
    create_first: "İlk Kaydı Oluştur",
    failed_load: "Kayıtlar yüklenemedi",
    retry: "Bağlantıyı Tekrar Dene",
    columns: "Sütunlar",
    compact: "Sıkışık",
    standard: "Standart",
    comfortable: "Rahat",
    no_records_found: "Kayıt bulunamadı",
    no_records_found_desc: "Mevcut görünüme uygun veri bulamadık.",
    empty_desc: "Filtreleri veya arama teriminizi değiştirmeyi deneyin.",
    system: "Sistem",
    all: "Hepsi",
    yes: "Evet",
    any: "Herhangi",
    range: "Aralığı",
    period: "Dönemi",
    reset: "Sıfırla",
    min: "Min",
    max: "Max",
    per_page: "sayfa başı",
    showing: "Gösterilen",
    of: "toplam",
    results: "sonuç",
    first_page: "İlk sayfa",
    last_page: "Son sayfa",
    prev_page: "Önceki sayfa",
    next_page: "Sonraki sayfa",
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
    name: "Ad Soyad",
    sign_up: "Kayıt Ol",
    creating_account: "Hesap oluşturuluyor...",
    invalid_email: "Geçersiz e-posta adresi",
    password_min_length: "Şifre en az 6 karakter olmalıdır",
    name_min_length: "Ad en az 2 karakter olmalıdır",
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
