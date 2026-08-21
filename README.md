# generic-comps

**ikas Studio ile her hafta bir kampanya, bir bileşen, bir fikir.**

Bu repo bir açık kaynak koleksiyonu. Her hafta ikas Studio ile gerçek bir senaryo kuruyorum — bir kampanya mekaniği, bir vitrin bloğu, bir dönüşüm denemesi — ve çıkan kodu buraya bırakıyorum. Beğendiğin bileşeni alıp kendi ikas projene taşıyabilirsin.

**Vitrin:** [onurhan1337.github.io/generic-comps](https://onurhan1337.github.io/generic-comps/) — canlı demolar, prop tabloları ve her bileşen için kopyalanmaya hazır bir AI kurulum prompt'u.

---

## Bileşenler

| Hafta | Bileşen | Tür | Ne işe yarar |
|-------|---------|-----|--------------|
| 01 | [`PuzzleKampanya`](src/components/PuzzleKampanya) | section | Sürükle-bırak jigsaw puzzle kampanyası — tamamlanınca kupon ödülü ve opsiyonel hediye seçimi |
| 01 | [`PuzzleHediyeKarti`](src/components/PuzzleHediyeKarti) | component | Puzzle kampanyasının hediye seçim slotuna yerleştirilen hediye kartı |

> Her satırın ayrıntılı sayfası vitrinde: ne geliştirildi, nerede kullanılır, tam prop listesi ve kurulum prompt'u.

---

## Hafta 01 — Puzzle Kampanya

Sayfanın ortasında gerçek bir jigsaw puzzle. Ziyaretçi dağınık parçaları sürükleyip görseli tamamlıyor; tamamlandığında kupon ödülü açılıyor, istersen ardından bir hediye seçme adımı geliyor.

- **Gerçek puzzle geometrisi** — her parça, üç kübik bezier'den oluşan klasik jigsaw kenar profiliyle SVG `clip-path`'e kırpılıyor. Gölge, kırpılmış içeriğin üzerine bir sarmalayıcıdan uygulanıyor; böylece kare kutuyu değil puzzle silüetini takip ediyor.
- **Sürükle-bırak + dokunmatik + klavye** — tek bir `pointer` olay yolu, ayrıca tıkla-seç/tıkla-yerleştir ve klavye ile seçim.
- **Deterministik karıştırma** — parça biçimleri ve tepsi dizilimi `karistirmaAnahtari` prop'undan türeyen bir tohumdan üretiliyor. Sunucu ve tarayıcı aynı çıktıyı veriyor, ilerleme `localStorage`'da saklanabiliyor.
- **Slot tabanlı hediye seçimi ve sürpriz kutu** — hediye kartları `COMPONENT_LIST` slotu; mağaza sahibi editörden istediği kadar kart ekliyor. `hediyeKutuModu` ile kartlar kapalı kutuya dönüşüp tamamlanan puzzle'ın üzerine yan yana geliyor: kullanıcı tur başına yalnızca bir kutu açıyor, konfeti o anda patlıyor, diğerleri kilitleniyor. Yeniden oynandığında önceki turda alınan hediye tekrar seçilemiyor.
- **Oyunlaştırma katmanı** — puzzle parçası ikonlu rozet, parça başına kutucuk gösteren ilerleme, süre azalınca uyarı rengine geçip nabız atan geri sayım, sınırlanabilen yeniden karıştırma hakkı ve son parça yerleşince tepsiyi devralan kutlama durumu.
- **Kendini açıklayan başlangıç ekranı** — hafif cam örtü, arkasında açılan rehber görsel, tek satır oynanış ipucu ve süre limiti açıksa "ne kadar süren olacağı" rozeti. Geri sayım kullanıcı başlatmadan asla işlemiyor.
- **Premium yüzey** — çok katmanlı gölge, cilalı butonlar ve vurgu renginden türeyen hâle; Inter Tight (bileşenin kendi CSS'inde `@font-face` ile tanımlı, latin-ext dahil) ve tamamen ayarlanabilir palet.
- **67 prop, yedi grup, hepsi Türkçe ve açıklamalı** — ekranda görünen hiçbir metin koda gömülü değil.

```
src/
├── components/
│   ├── PuzzleKampanya/       # section — kampanyanın kendisi
│   └── PuzzleHediyeKarti/    # component — hediye seçim slotuna eklenir
├── sub-components/
│   ├── PuzzleTahtasi/        # tahta + tepsi + sürükle-bırak
│   ├── OdulPaneli/           # kupon kodu, kopyala, CTA
│   ├── HediyeSecimi/         # COMPONENT_LIST slotunu render eder
│   └── Konfeti/              # tamamlanma efekti
└── lib/
    ├── puzzle.ts             # jigsaw geometrisi, tohumlu rastgelelik, tepsi düzeni
    └── hediye-secim.ts       # kart ↔ bölüm iletişimi (CustomEvent)
```

---

## Bileşeni kendi projene taşıma

**En hızlı yol:** [vitrindeki bileşen sayfasını](https://onurhan1337.github.io/generic-comps/) aç, sayfanın sonundaki AI prompt'unu kopyala ve kendi ikas projenin kök dizininde açtığın Claude Code / Cursor oturumuna yapıştır. Prompt dosya kopyalamayı, enum ve prop oluşturmayı ve doğrulamayı sırasıyla yapar.

**Elle yapmak istersen** dikkat edilecek tek şey şu: `ikas.config.json`, `types.ts`, `global-types.ts` ve `src/components/index.ts` otomatik üretilen dosyalar — elle düzenlenmemeli. Bileşen id'leri de projene özel. Yani dosyaları kopyalamak yetmez, prop tanımlarını CLI ile kendi projende oluşturman gerekir:

1. Bileşenin klasörünü (`src/components/BileşenAdı/`) ve kullandığı `src/sub-components/` + `src/lib/` dosyalarını kendi projene kopyala. `types.ts`'i kopyalama.
2. Bileşenin ENUM prop'ları varsa önce enum'ları oluştur: `npx ikas-component config add-enum --name "..." --options '{"Ad":"deger"}'` — dönen `enumId`'leri not al.
3. Bileşeni oluştur: `npx ikas-component config add-component --name "BileşenAdı" --type section`
4. Prop gruplarını ve prop'ları `config add-prop-group` / `config add-prop` ile ekle. Buradaki `ikas.config.json` referans; ENUM prop'larında 2. adımdaki id'leri kullan.
5. `npx ikas-component check --json && npx ikas-component build` ile doğrula.

> Alt bileşen CSS'lerini `.tsx` içinde `import` etme — build reddediyor. Bunun yerine ana bileşenin `styles.css` dosyasının başına `@import "../../sub-components/X/styles.css";` satırlarını ekle.

---

## Repoyu olduğu gibi çalıştırma

```bash
pnpm install      # veya npm install
pnpm dev          # ikas dev sunucusu (Vite 5200 + WebSocket 5201)
```

Ardından ikas editöründe **Dev Components** panelinden dev sunucusuna bağlan.

> `ikas.config.json` içindeki `projectId` benim geliştirme projeme ait. Repoyu kendi mağazanda çalıştıracaksan `ikas-component` CLI ile kendi projeni oluşturup o `projectId`'yi kullan — aksi halde editör bileşenleri eşleştiremez.

### Komutlar

| Komut | Ne yapar |
|-------|----------|
| `pnpm dev` | ikas dev sunucusunu başlatır |
| `pnpm build` | Bileşenleri derler (`dist/`) |
| `npx ikas-component check --json` | Tip kontrolü |
| `pnpm site:dev` | Vitrin sitesini yerel olarak çalıştırır |
| `pnpm site:build` | Vitrini `docs/` klasörüne derler |
| `pnpm site:preview` | Derlenmiş vitrini önizler |

---

## Vitrin sitesi

`site/` klasörü GitHub Pages'te yayınlanan vitrinin kaynağıdır; `pnpm site:build` çıktıyı `docs/` klasörüne yazar ve bu klasör repoya commit edilir.

Demolar bileşenlerin **gerçek kaynak kodunu** import eder (`site/vite.config.ts` içindeki alias'lar ikas SDK'sını hafif taklitlerle değiştirir), yani vitrindeki örnek ile mağazadaki bileşen arasında sürüm farkı oluşmaz. Prop tabloları da `ikas.config.json`'dan üretilir.

**Pages ayarı:** repo ayarlarında Pages kaynağı olarak `main` (veya `master`) dalının `/docs` klasörünü seç.

**Yeni hafta eklemek:**
1. Bileşeni `src/components/` altında geliştir.
2. `site/hafta-XX/index.html` sayfasını ve `site/src/hafta-XX.tsx` demo giriş dosyasını oluştur (hafta 01'i şablon olarak kullan).
3. `site/vite.config.ts` içindeki `rollupOptions.input`'a yeni sayfayı ekle.
4. `site/index.html`'deki hafta listesine kartı ekle.
5. `pnpm site:build` çalıştır ve `docs/` değişikliklerini commit et.

---

## Katkı ve geri bildirim

Bir bileşende hata bulursan, geliştirme fikrin varsa ya da "şu kampanyayı da yapar mısın" diyeceksen issue aç. Serinin konularını büyük ölçüde gelen isteklere göre seçeceğim.

## Lisans

MIT — ticari projelerinde serbestçe kullanabilirsin, atıf zorunlu değil ama sevindirir.
