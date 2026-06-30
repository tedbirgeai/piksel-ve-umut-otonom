// lib/roles.ts

/**
 * ROL TANIMLARI — iki taraflı mimarinin tek kaynağı.
 *
 * Öğrenci (cüzdansız) · Öğretmen (cüzdanlı) · Okul/Kurum (yönetici).
 * Blokzincir yalnızca üretici (öğretmen) tarafında; öğrenci hiç cüzdan görmez.
 * Rol bu cihazda hatırlanır (localStorage) ve sonradan değiştirilebilir.
 */
export type Role = "student" | "teacher" | "school";

export interface RoleDef {
  key: Role;
  label: string;
  tagline: string;
  description: string;
  /** Cüzdan gerektirir mi? (öğrenci için ASLA) */
  needsWallet: boolean;
  features: string[];
  cta: string;
  badge: string;
}

export const ROLES: Record<Role, RoleDef> = {
  student: {
    key: "student",
    label: "Öğrenci",
    tagline: "Öğren, izle, dinle",
    description:
      "İnternet olmadan da çalışır. 3 yaştan üniversiteye, her kademeye uygun.",
    needsWallet: false,
    features: [
      "Kademene göre dersler",
      "Çevrimdışı kütüphane",
      "Sesli anlatım & belge",
    ],
    cta: "Öğrenmeye başla",
    badge: "Cüzdan gerekmez",
  },
  teacher: {
    key: "teacher",
    label: "Öğretmen",
    tagline: "Üret, paylaş, hakkını al",
    description:
      "Yapay zekâ ile içerik üret; her ders cüzdanında bir sertifika NFT'si olur.",
    needsWallet: true,
    features: [
      "YZ üretim fabrikası",
      "Üretim Sertifikası NFT",
      "Şeffaf telif geliri",
    ],
    cta: "Üretmeye başla",
    badge: "En popüler",
  },
  school: {
    key: "school",
    label: "Okul & Kurum",
    tagline: "Yönet, dağıt, ölç",
    description:
      "Sınıflarını oluştur, müfredatı dağıt, öğrenme verisini izle.",
    needsWallet: false,
    features: [
      "Sınıf & öğrenci yönetimi",
      "Toplu içerik dağıtımı",
      "İlerleme panosu",
    ],
    cta: "Kurumu kur",
    badge: "Kurumsal",
  },
};

export const ROLE_KEYS = Object.keys(ROLES) as Role[];
