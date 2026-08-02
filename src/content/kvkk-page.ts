/** Ofis adresi — tek kaynak (NAP tutarlılığı) */
export const OFFICE_STREET_TR = "Güzelevler Mahallesi 2067/2 Sokak A blok No: 32/3";
export const OFFICE_STREET_EN = "Güzelevler District, 2067/2 Street A Block No: 32/3";
export const OFFICE_LOCALITY = "Yüreğir";
export const OFFICE_REGION = "Adana";
export const OFFICE_POSTAL = "01220";
export const OFFICE_COUNTRY_CODE = "TR";

export const OFFICE_ADDRESS_TR =
  `${OFFICE_STREET_TR}, ${OFFICE_POSTAL} ${OFFICE_LOCALITY} / ${OFFICE_REGION} / Türkiye`;

export const OFFICE_ADDRESS_EN =
  `${OFFICE_STREET_EN}, ${OFFICE_POSTAL} ${OFFICE_LOCALITY} / ${OFFICE_REGION} / Türkiye`;

export const OFFICE_ADDRESS_MAP_QUERY =
  `Güzelevler, 2067/2 SK A blok no:32/3, ${OFFICE_POSTAL} ${OFFICE_LOCALITY}/${OFFICE_REGION}`;

export const KVKK_PAGE_TITLE = "KVKK Aydınlatma Metni ve Gizlilik";
export const KVKK_PAGE_DESCRIPTION =
  "Samet Alp Mimarlık kişisel verilerin işlenmesine ilişkin aydınlatma metni ve gizlilik politikası.";

export const KVKK_UPDATED = "28 Temmuz 2026";

export const KVKK_SECTIONS = [
  {
    id: "aydinlatma",
    title: "1. Aydınlatma metni (KVKK)",
    paragraphs: [
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu sıfatıyla Samet Alp Mimarlık (“Ofis”) olarak; web sitemiz ve iletişim kanallarımız üzerinden paylaştığınız kişisel verilerinizi aşağıda açıklanan çerçevede işlemekteyiz.",
      `Veri sorumlusu: Samet Alp Mimarlık — ${OFFICE_ADDRESS_TR}. İletişim: info@mimarsametalp.com / 0 (541) 426 76 44.`,
    ],
  },
  {
    id: "veriler",
    title: "2. İşlenen kişisel veriler",
    paragraphs: [
      "İletişim formu ve benzeri kanallar aracılığıyla; ad, soyad, e-posta adresi, telefon (paylaşmanız halinde) ve mesaj içeriğiniz işlenebilir. Teknik güvenlik amacıyla IP adresi gibi bağlantı verileri sınırlı süreyle kaydedilebilir.",
    ],
  },
  {
    id: "amac",
    title: "3. İşleme amaçları ve hukuki sebepler",
    paragraphs: [
      "Kişisel verileriniz; proje taleplerinizi değerlendirmek, size geri dönüş yapmak, randevu ve danışmanlık süreçlerini yürütmek, hizmet kalitesini artırmak ve yasal yükümlülükleri yerine getirmek amacıyla işlenir.",
      "Hukuki sebepler: KVKK m.5/2 (c) bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması; m.5/2 (f) meşru menfaat; açık rızanızın bulunduğu hallerde m.5/1.",
    ],
  },
  {
    id: "aktarim",
    title: "4. Aktarım ve saklama",
    paragraphs: [
      "Verileriniz, barındırma / e-posta altyapısı gibi hizmet sağlayıcılarla sınırlı ve gerekli ölçüde paylaşılabilir. Yurt dışına aktarım söz konusu olduğunda KVKK’daki usullere uyulur.",
      "Veriler, işleme amacının gerektirdiği süre ve ilgili mevzuattaki saklama süreleri boyunca muhafaza edilir; süre sonunda silinir, yok edilir veya anonim hale getirilir.",
    ],
  },
  {
    id: "haklar",
    title: "5. Haklarınız",
    paragraphs: [
      "KVKK m.11 kapsamında; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme, düzeltilmesini veya silinmesini isteme ve zararlarınızın giderilmesini talep etme haklarına sahipsiniz.",
      "Başvurularınızı info@mimarsametalp.com adresine yazılı olarak iletebilirsiniz.",
    ],
  },
  {
    id: "gizlilik",
    title: "6. Gizlilik politikası",
    paragraphs: [
      "Web sitemizi ziyaret ettiğinizde, tarayıcı çerezleri veya benzeri teknolojiler yoluyla sınırlı teknik veriler toplanabilir. Zorunlu çerezler sitenin çalışması için kullanılır; istatistik / analitik araçlar kullanılıyorsa mümkün olduğunca anonimleştirilmiş verilerle çalışılır.",
      "Üçüncü taraf bağlantılar (ör. harita, sosyal medya) kendi gizlilik politikalarına tabidir; bu sitelerin uygulamalarından Ofis sorumlu değildir.",
      "Bu metin güncellenebilir. Güncel sürüm bu sayfada yayınlanır.",
    ],
  },
] as const;

export const CONTACT_FORM_KVKK_LABEL =
  "KVKK Aydınlatma Metni’ni okudum; kişisel verilerimin iletişim talebim kapsamında işlenmesini kabul ediyorum.";
export const CONTACT_FORM_KVKK_ERROR = "Devam etmek için KVKK onayını işaretleyin.";
