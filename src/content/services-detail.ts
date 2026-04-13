import type { ServiceDetailData } from "@/components/hizmetlerimiz/ServiceDetailClient";

// Mock service detail data (TR)
export const SERVICES_DETAIL: Record<string, ServiceDetailData> = {
  "ic-mimarlik-dekorasyon": {
    slug: "ic-mimarlik-dekorasyon",
    name: "İç Mimarlık & Dekorasyon",
    heroImageUrl: "/images/hero-1.webp",
    shortDescription:
      "Mekânın karakterini; ışık, malzeme ve oranlarla birlikte ele alarak modern, sakin ve zamansız iç mekânlar tasarlıyoruz.",
    hizmetKapsami: [
      "İhtiyaç analizi ve konsept kurgusu",
      "Moodboard, renk & malzeme seçimleri",
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
      { question: "Kaç revizyon hakkı var?", answer: "Proje kapsamında 2 ana revizyon döngüsü sunuyoruz; ek revizyonlar birlikte planlanır." },
      { question: "Uygulama hizmeti zorunlu mu?", answer: "Hayır. Sadece tasarım teslimi veya tasarım + uygulama şeklinde ilerleyebiliriz." },
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
      "Kapsam & bütçe planlaması",
      "Tasarım ve uygulama koordinasyonu",
      "Satın alma ve tedarik yönetimi",
      "Şantiye organizasyonu ve kalite kontrol",
      "İş programı ve teslim planı",
      "Teslim sonrası destek",
    ],
    hizmetSureci: [
      { title: "Planlama", description: "Kapsam, bütçe ve iş programını netleştiriyoruz." },
      { title: "Tasarım & Onay", description: "Tasarımı finalize edip uygulama kararlarını kilitliyoruz." },
      { title: "Uygulama", description: "Şantiye, tedarik ve kalite kontrolü tek merkezden yürütüyoruz." },
      { title: "Teslim", description: "Kontrol listeleriyle teslimi tamamlayıp destek sürecini başlatıyoruz." },
    ],
    sss: [
      { question: "Bütçe kontrolü nasıl yapılır?", answer: "Kalem kalem keşif ve tekliflerle, onaylı satın alma akışıyla ilerleriz." },
      { question: "Teslim tarihinde sapma olur mu?", answer: "Riskleri baştan görünür kılıp alternatif planlarla minimum sapma hedefleriz." },
    ],
  },
  "mimari-kontrolorluk": {
    slug: "mimari-kontrolorluk",
    name: "Mimari Kontrolörlük",
    heroImageUrl: "/images/hero-3.webp",
    shortDescription:
      "Saha denetimi ve detay kontrolleriyle uygulamada tasarımın doğru ve kaliteli şekilde hayata geçmesini güvence altına alıyoruz.",
    hizmetKapsami: [
      "Uygulama detay kontrolü",
      "Şantiye toplantıları ve raporlama",
      "Kalite kontrol ve saha denetimi",
      "İmalat/işçilik uygunluk takibi",
      "İş programı koordinasyonu",
    ],
    hizmetSureci: [
      { title: "Başlangıç", description: "Uygulama setlerini ve kontrol kriterlerini netleştiriyoruz." },
      { title: "Periyodik Denetim", description: "Saha ziyaretleri ve raporlamayla ilerlemeyi takip ediyoruz." },
      { title: "Kritik Noktalar", description: "Detay ve malzeme kararlarında sahada doğrulama yapıyoruz." },
      { title: "Teslim Kontrol", description: "Eksik/kusur listeleriyle final kalite kontrol sağlıyoruz." },
    ],
    sss: [
      { question: "Denetim sıklığı nedir?", answer: "İş programına göre haftalık/iki haftalık periyotlarla planlanır." },
      { question: "Rapor formatı nedir?", answer: "Fotoğraflı kontrol listeleri ve aksiyon maddeleriyle düzenli raporlama yaparız." },
    ],
  },
  "mimari-tasarim-ruhsat-projesi": {
    slug: "mimari-tasarim-ruhsat-projesi",
    name: "Mimari Tasarım & Ruhsat Projesi",
    heroImageUrl: "/images/hero-4.webp",
    shortDescription:
      "Mevzuatla uyumlu, net ve uygulanabilir bir tasarım diliyle ruhsat sürecini hızlandıran proje setleri hazırlıyoruz.",
    hizmetKapsami: [
      "İmar/mevzuat ön analizi",
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
      { question: "Diğer disiplin koordinasyonu var mı?", answer: "İhtiyaca göre statik/mekanik/elektrik ekipleriyle koordinasyon sağlarız." },
    ],
  },
  "mimari-danismanlik": {
    slug: "mimari-danismanlik",
    name: "Mimari Danışmanlık",
    heroImageUrl: "/images/hero-5.webp",
    shortDescription:
      "Kritik tasarım kararlarında doğru yönde ilerlemeniz için hızlı analiz, alternatif üretimi ve karar desteği sunuyoruz.",
    hizmetKapsami: [
      "Konsept yönlendirme ve review",
      "Plan/cephe optimizasyonu",
      "Malzeme ve detay önerileri",
      "Maliyet/performans değerlendirmesi",
      "Uygulama sürecinde karar desteği",
    ],
    hizmetSureci: [
      { title: "Brief", description: "Hedefi ve kısıtları netleştiriyoruz." },
      { title: "Analiz", description: "Mevcut tasarımı/alternatifleri değerlendiriyoruz." },
      { title: "Öneri", description: "Karar seti ve uygulanabilir aksiyonlar çıkarıyoruz." },
      { title: "Takip", description: "Kritik noktalarda tekrar review ile ilerliyoruz." },
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
      "Bütçe & etap planlaması",
      "Malzeme ve işçilik seçimi",
      "Uygulama koordinasyonu",
      "Teslim kontrol ve iyileştirme",
    ],
    hizmetSureci: [
      { title: "Keşif", description: "Mevcut durum ve kısıtları sahada tespit ediyoruz." },
      { title: "Planlama", description: "Etaplar, bütçe ve iş programını netleştiriyoruz." },
      { title: "Uygulama", description: "Saha yönetimi ve kalite kontrol ile dönüşümü gerçekleştiriyoruz." },
      { title: "Teslim", description: "Kontrolleri tamamlayıp teslim ediyoruz." },
    ],
    sss: [
      { question: "Evimde yaşarken tadilat olur mu?", answer: "Etaplı planlama ile bazı senaryolarda mümkün; keşif sonrası netleştiriyoruz." },
      { question: "Ne kadar sürede biter?", answer: "Kapsama göre değişir; etaplı tadilatlarda süre planlaması özellikle önemlidir." },
    ],
  },
};

