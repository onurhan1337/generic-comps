# generic-comps

**ikas Studio ile her hafta bir kampanya, bir bileşen, bir fikir.**

Bu repo bir açık kaynak koleksiyonu. Her hafta ikas Studio ile gerçek bir senaryo kuruyorum — bir kampanya mekaniği, bir vitrin bloğu, bir dönüşüm denemesi — ve çıkan kodu buraya bırakıyorum. Beğendiğin bileşeni alıp kendi ikas projene taşıyabilirsin.

Yazı serisini takip etmene gerek yok; buradaki her bileşen tek başına çalışacak şekilde duruyor.

---

## Bileşenler

| Hafta | Bileşen | Tür | Ne işe yarar |
|-------|---------|-----|--------------|
| — | `ExampleComponent` | component | Başlangıç şablonu — prop tanımlarının nasıl çalıştığını gösterir |
| — | `ExampleSection` | section | Sayfa seviyesi bölüm şablonu, prop gruplarıyla |

> Seri başladıkça bu tablo dolacak. Her satır kendi klasörüne ve ilgili yazıya link verecek.

---

## Bileşeni kendi projene taşıma

Tek bir bileşeni almak istiyorsan repoyu klonlamana gerek yok:

1. İstediğin bileşenin klasörünü (`src/components/BileşenAdı/`) kendi projendeki `src/components/` altına kopyala.
2. `src/components/index.ts` dosyana export satırını ekle:
   ```ts
   export { default as BileşenAdı } from "./BileşenAdı";
   ```
3. `ikas.config.json` dosyandaki `components` dizisine bileşeni tanıt. Buradaki karşılığını kopyalayıp `id` alanını **kendi projene ait bir id ile** değiştir:
   ```json
   {
     "id": "<senin-projectId>-<yeni-id>",
     "name": "Bileşen Adı",
     "entry": "./src/components/BileşenAdı/index.tsx",
     "styles": "./src/components/BileşenAdı/styles.css",
     "props": [ ... ]
   }
   ```
   Kolay yol: `npm run add` ile boş bir bileşen oluştur, üretilen `id`'yi kullan, dosyaların içini buradakiyle değiştir.
4. Bileşen `src/global.css`'teki bir design token'a dayanıyorsa, o değişkenleri kendi `global.css` dosyana da ekle.

Bağımlılık gerektiren bir bileşen varsa kendi klasöründeki README'de yazıyor olacak.

---

## Repoyu olduğu gibi çalıştırma

```bash
pnpm install      # veya npm install
pnpm dev
```

Ardından ikas editöründe **Dev Components** panelinden dev sunucusuna bağlan.

> `ikas.config.json` içindeki `projectId` benim geliştirme projeme ait. Repoyu kendi mağazanda çalıştıracaksan `ikas-component` CLI ile kendi projeni oluşturup o `projectId`'yi kullan — aksi halde editör bileşenleri eşleştiremez.

### Komutlar

| Komut | Açıklama |
|-------|----------|
| `pnpm dev` | Canlı editör güncellemeleriyle geliştirme sunucusu |
| `pnpm build` | Prodüksiyon derlemesi |
| `pnpm add` | Projeye yeni bileşen ekle |
| `pnpm publish` | Bileşenleri ikas'a yayınla |

---

## Proje yapısı

```
generic-comps/
├── src/
│   ├── components/
│   │   ├── ExampleComponent/   # Çocuk bileşen (type: "component")
│   │   │   ├── index.tsx
│   │   │   ├── styles.css
│   │   │   └── types.ts
│   │   ├── ExampleSection/     # Sayfa seviyesi bölüm (type: "section")
│   │   └── index.ts
│   ├── global.css              # Scope'suz global stiller / design token'lar
│   └── global-types.ts         # Otomatik üretilen paylaşımlı enum tipleri
├── ikas.config.json            # Bileşen ve prop tanımları
├── CLAUDE.md                   # ikas code components geliştirme rehberi
└── vite.config.ts
```

`component` ile `section` farkı: `section` sayfaya doğrudan yerleştirilen üst seviye bir blok, `component` ise bir section'ın içinde kullanılan parça.

---

## Katkı ve geri bildirim

Bir bileşende hata bulursan, geliştirme fikrin varsa ya da "şu kampanyayı da yapar mısın" diyeceksen issue aç. Serinin konularını büyük ölçüde gelen isteklere göre seçeceğim.

## Lisans

MIT — ticari projelerinde serbestçe kullanabilirsin, atıf zorunlu değil ama sevindirir.
