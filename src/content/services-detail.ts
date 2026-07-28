import type { ServiceDetailData } from "@/components/hizmetlerimiz/ServiceDetailClient";

// Mock service detail data (TR)
export const SERVICES_DETAIL: Record<string, ServiceDetailData> = {
  "ic-mimarlik-dekorasyon": {
    slug: "ic-mimarlik-dekorasyon",
    name: "İç Mimarlık & Dekorasyon",
    heroImageUrl: "/images/hero-1.webp",
    shortDescription:
      "Yaşam alanlarınızı estetik ve işlevsellikle yeniden tasarlıyoruz. Modern iç mimari ve dekorasyon projelerimizle Adana ve çevresinde konseptten uygulamaya profesyonel destek sunuyoruz.",
    hizmetKapsami: [
      "İhtiyaç analizi ve konsept kurgusu",
      "Moodboard, renk ve malzeme seçimleri",
      "Plan yerleşimi ve ölçülendirme",
      "3D görselleştirme ve revizyon döngüsü",
      "Özel imalat mobilya çizimleri",
      "Uygulama ve tedarik koordinasyonu",
    ],
    hizmetSureci: [
      { title: "Keşif & Brief", description: "İhtiyaçları, bütçe aralığını ve stil beklentisini netleştiriyoruz." },
      { title: "Konsept", description: "Mekân dili, malzeme paleti ve ana kararları belirliyoruz." },
      { title: "Tasarım Geliştirme", description: "Plan, detay ve görselleri revizyonlarla olgunlaştırıyoruz." },
      { title: "Uygulama", description: "İmalat ve saha koordinasyonuyla kaliteyi sahada koruyoruz." },
    ],
    sss: [
      { question: "Kaç revizyon hakkı var?", answer: "Proje kapsamında iki ana revizyon döngüsü sunuyoruz; ek revizyonlar birlikte planlanır." },
      { question: "Uygulama hizmeti zorunlu mu?", answer: "Hayır. Yalnızca tasarım teslimi veya tasarım ve uygulama birlikte ilerleyebilir." },
      { question: "Süre ortalama ne kadar?", answer: "Mekânın büyüklüğüne göre değişir; ilk tasarım teslimi genelde 2–4 hafta aralığındadır." },
    ],
  },
  "anahtar-teslim-proje": {
    slug: "anahtar-teslim-proje",
    name: "Anahtar Teslim Proje",
    heroImageUrl: "/images/hero-2.webp",
    shortDescription:
      "Tasarım, planlama ve uygulamayı tek elden yöneterek bütçe ve zaman çizelgesine sadık, sorunsuz teslim süreçleri sağlıyoruz.",
    hizmetKapsami: [
      "Kapsam ve bütçe planlaması",
      "Tasarım ve uygulama koordinasyonu",
      "Satın alma ve tedarik yönetimi",
      "Şantiye organizasyonu ve kalite kontrol",
      "İş programı ve teslim planı",
      "Teslim sonrası destek",
    ],
    hizmetSureci: [
      { title: "Planlama", description: "Kapsam, bütçe ve iş programını netleştiriyoruz." },
      { title: "Tasarım & Onay", description: "Tasarımı kesinleştirip uygulama kararlarını kilitliyoruz." },
      { title: "Uygulama", description: "Şantiye, tedarik ve kalite kontrolünü tek merkezden yürütüyoruz." },
      { title: "Teslim", description: "Kontrol listeleriyle teslimi tamamlayıp destek sürecini başlatıyoruz." },
    ],
    sss: [
      { question: "Bütçe kontrolü nasıl yapılır?", answer: "Kalem kalem keşif ve tekliflerle, onaylı satın alma akışıyla ilerleriz." },
      { question: "Teslim tarihinde sapma olur mu?", answer: "Riskleri baştan görünür kılıp alternatif planlarla sapmayı en aza indirmeyi hedefleriz." },
    ],
  },
  "mimari-kontrolorluk": {
    slug: "mimari-kontrolorluk",
    name: "Mimari Kontrolörlük",
    heroImageUrl: "/images/hero-3.webp",
    shortDescription:
      "Saha denetimi ve detay kontrolleriyle uygulamada tasarımın doğru ve kaliteli biçimde hayata geçmesini güvence altına alıyoruz.",
    hizmetKapsami: [
      "Uygulama detay kontrolü",
      "Şantiye toplantıları ve raporlama",
      "Kalite kontrol ve saha denetimi",
      "İmalat ve işçilik uygunluk takibi",
      "İş programı koordinasyonu",
    ],
    hizmetSureci: [
      { title: "Başlangıç", description: "Uygulama setlerini ve kontrol kriterlerini netleştiriyoruz." },
      { title: "Periyodik Denetim", description: "Saha ziyaretleri ve raporlamayla ilerlemeyi takip ediyoruz." },
      { title: "Kritik Noktalar", description: "Detay ve malzeme kararlarında sahada doğrulama yapıyoruz." },
      { title: "Teslim Kontrolü", description: "Eksik ve kusur listeleriyle final kalite kontrolü sağlıyoruz." },
    ],
    sss: [
      { question: "Denetim sıklığı nedir?", answer: "İş programına göre haftalık veya iki haftalık periyotlarla planlanır." },
      { question: "Rapor formatı nedir?", answer: "Fotoğraflı kontrol listeleri ve aksiyon maddeleriyle düzenli raporlama yaparız." },
    ],
  },
  "mimari-tasarim-ruhsat-projesi": {
    slug: "mimari-tasarim-ruhsat-projesi",
    name: "Mimari Tasarım & Ruhsat Projesi",
    heroImageUrl: "/images/hero-4.webp",
    shortDescription:
      "Mevzuata uyumlu, net ve uygulanabilir bir tasarım diliyle ruhsat sürecini hızlandıran proje setleri hazırlıyoruz.",
    hizmetKapsami: [
      "İmar ve mevzuat ön analizi",
      "Konsept tasarım geliştirme",
      "Ruhsat proje seti hazırlığı",
      "Pafta standardizasyonu",
      "Koordinasyon ve revizyon yönetimi",
    ],
    hizmetSureci: [
      { title: "Analiz", description: "İmar şartları, ihtiyaç programı ve saha verilerini topluyoruz." },
      { title: "Konsept", description: "Kütle, plan ve cephe kararlarını netleştiriyoruz." },
      { title: "Ruhsat Seti", description: "Pafta ve dokümanları mevzuata uygun şekilde hazırlıyoruz." },
      { title: "Takip", description: "Gerekli revizyonları yönetip süreci tamamlıyoruz." },
    ],
    sss: [
      { question: "Ruhsat süresi neye bağlı?", answer: "Belediye yoğunluğu, parsel verileri ve proje kapsamına göre değişir." },
      { question: "Diğer disiplinlerle koordinasyon var mı?", answer: "İhtiyaca göre statik, mekanik ve elektrik ekipleriyle koordinasyon sağlarız." },
    ],
  },
  "mimari-danismanlik": {
    slug: "mimari-danismanlik",
    name: "Mimari Danışmanlık",
    heroImageUrl: "/images/hero-5.webp",
    shortDescription:
      "Kritik tasarım kararlarında doğru yönde ilerlemeniz için hızlı analiz, alternatif üretimi ve karar desteği sunuyoruz.",
    hizmetKapsami: [
      "Konsept yönlendirme ve gözden geçirme",
      "Plan ve cephe optimizasyonu",
      "Malzeme ve detay önerileri",
      "Maliyet ve performans değerlendirmesi",
      "Uygulama sürecinde karar desteği",
    ],
    hizmetSureci: [
      { title: "Brief", description: "Hedefi ve kısıtları netleştiriyoruz." },
      { title: "Analiz", description: "Mevcut tasarımı ve alternatifleri değerlendiriyoruz." },
      { title: "Öneri", description: "Karar seti ve uygulanabilir aksiyonlar çıkarıyoruz." },
      { title: "Takip", description: "Kritik noktalarda yeniden gözden geçirerek ilerliyoruz." },
    ],
    sss: [
      { question: "Tek seans mümkün mü?", answer: "Evet. Hızlı değerlendirme seansı veya proje boyunca periyodik danışmanlık verebiliriz." },
    ],
  },
  "yenileme-tadilat": {
    slug: "yenileme-tadilat",
    name: "Yenileme & Tadilat",
    heroImageUrl: "/images/hero-6.webp",
    shortDescription:
      "Mevcut mekânı minimum yıkım ve maksimum etkiyle dönüştürerek yeni ihtiyaçlara uygun, modern ve dayanıklı çözümler üretiyoruz.",
    hizmetKapsami: [
      "Mevcut durum analizi",
      "Bütçe ve etap planlaması",
      "Malzeme ve işçilik seçimi",
      "Uygulama koordinasyonu",
      "Teslim kontrolü ve iyileştirme",
    ],
    hizmetSureci: [
      { title: "Keşif", description: "Mevcut durum ve kısıtları sahada tespit ediyoruz." },
      { title: "Planlama", description: "Etapları, bütçeyi ve iş programını netleştiriyoruz." },
      { title: "Uygulama", description: "Saha yönetimi ve kalite kontrolü ile dönüşümü gerçekleştiriyoruz." },
      { title: "Teslim", description: "Kontrolleri tamamlayıp teslim ediyoruz." },
    ],
    sss: [
      { question: "Evimde yaşarken tadilat olur mu?", answer: "Etaplı planlama ile bazı senaryolarda mümkün; keşif sonrası netleştiriyoruz." },
      { question: "Ne kadar sürede biter?", answer: "Kapsama göre değişir; etaplı tadilatlarda süre planlaması özellikle önemlidir." },
    ],
  },
};
