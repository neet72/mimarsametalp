# Samet Alp Mimarlık

Next.js (App Router) + Prisma/Supabase (Postgres) + NextAuth + Cloudinary + Resend.

## Stack

| Parça | Nerede |
|-------|--------|
| Kod / site | Vercel |
| Veritabanı | Supabase Postgres |
| Domain | Hostinger (DNS → Vercel) |
| Görseller | Cloudinary |
| E-posta | Resend |

## Supabase kurulumu (bir kez)

1. [supabase.com](https://supabase.com) → New project  
2. **Project Settings → Database → Connection string**  
3. İki URL al:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL` (+ `?pgbouncer=true`)
   - **Direct** (port `5432`) → `DIRECT_URL` (migrate için)
4. Lokal `.env` ve **Vercel → Environment Variables** içine ikisini de yapıştır  
5. Tabloları oluştur:

```bash
npm run db:deploy
# veya: npx prisma migrate deploy
```

6. Admin’den projeleri / hizmetleri yeniden ekle (eski Hostinger MySQL verisi gelmez).

Auth için Supabase Auth **kullanılmıyor** — mevcut NextAuth + env admin kalır.

## Müşteri proje portalı

Portfolyo CMS (`Project`) ile karışmaz. Portal modelleri: `ClientUser`, `ClientProject`, aşamalar, güncellemeler, medya, bildirim logu, teslim talepleri.

| Alan | Rota |
|------|------|
| Admin müşteriler | `/admin/clients` |
| Admin müşteri projeleri | `/admin/client-projects` |
| Admin teslim inbox | `/admin/delivery-requests` |
| Müşteri giriş | `/panel/giris` |
| Müşteri panel | `/panel` |

### İlk müşteri hesabı

1. Admin ile giriş → **Müşteriler** → oluştur (geçici şifre ekranda + e-posta varsa Resend).
2. İsteğe bağlı: **Müşteri projeleri** oluştur, müşteriyi ata, aşama ekle.
3. Güncelleme yaz → **Yayınla & Bildir** (e-posta live; SMS stub).

### Bildirim davranışı

- Publish başarılı olur; bildirim hatası publish’i geri almaz.
- E-posta: Resend + `ClientProjectUpdateEmail`.
- SMS: `src/lib/notifications/sendSms.ts` stub (`skipped`). NetGSM gelince yalnızca bu dosya doldurulur.
- `SMS_*` / `SMS_PROVIDER` env boş bırakılabilir.

### Yetki (authz) checklist

- [ ] Client sorguları her zaman `members: { some: { clientId } }` ile scoped (`src/lib/portal/queries.ts`).
- [ ] Panel güncellemelerinde `isPublished: true`.
- [ ] Admin action’larda `requireAdmin()`; panel action’larda `requireClient()`.
- [ ] Middleware: `/admin/**` → admin; `/panel/**` → client; `mustChangePassword` → yalnızca `/panel/sifre`.
- [ ] Cross-client: başka müşterinin `projectId` / `updateId` ile çıplak fetch yok.

### Cloudinary portal medyası

Upload’lar `samet-alp/portal/...` klasörüne, unguessable `public_id` ile gider. İmzalı / authenticated delivery follow-up olarak düşünülebilir (şu an secure URL).

### Stack notları

- Admin auth: env `ADMIN_EMAIL` + bcrypt hash (değişmedi).
- Client auth: aynı NextAuth, `client-credentials` provider + `ClientUser`.
- SMS: stub; NetGSM sadece `sendSms.ts`.
