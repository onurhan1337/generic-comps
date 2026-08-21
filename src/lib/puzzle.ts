/**
 * Jigsaw puzzle geometrisi.
 *
 * Buradaki her fonksiyon saf ve deterministiktir: aynı seed her zaman aynı
 * puzzle'ı üretir. Bu sayede sunucuda ve tarayıcıda aynı çıktı oluşur
 * (hydration uyuşmazlığı olmaz) ve kullanıcının ilerlemesi kaydedilebilir.
 */

/** Bir kenarın biçimi: 1 = dışa çıkıntı (knob), -1 = içe girinti (blank), 0 = düz. */
export type Kenar = -1 | 0 | 1;

export interface ParcaKenarlari {
  ust: Kenar;
  sag: Kenar;
  alt: Kenar;
  sol: Kenar;
}

/** FNV-1a — metinden 32 bit tohum üretir. */
function tohumla(metin: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < metin.length; i++) {
    h ^= metin.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — küçük, hızlı, deterministik rastgele sayı üreteci. */
export function rastgeleUretec(seed: string): () => number {
  let a = tohumla(seed);
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Her parça için dört kenarın biçimini üretir.
 * Komşu parçalar zorunlu olarak birbirinin tersi olur (biri çıkıntıysa
 * diğeri girinti), dış kenarlar düz kalır — gerçek bir puzzle gibi.
 */
export function kenarMatrisiUret(satir: number, sutun: number, seed: string): ParcaKenarlari[][] {
  const rnd = rastgeleUretec(seed + ":kenarlar");
  // yatay[r][c] = (r,c) parçasının sağ kenarı
  const yatay: Kenar[][] = [];
  const dikey: Kenar[][] = [];
  for (let r = 0; r < satir; r++) {
    yatay.push([]);
    dikey.push([]);
    for (let c = 0; c < sutun; c++) {
      yatay[r].push(rnd() > 0.5 ? 1 : -1);
      dikey[r].push(rnd() > 0.5 ? 1 : -1);
    }
  }

  const matris: ParcaKenarlari[][] = [];
  for (let r = 0; r < satir; r++) {
    const satirDizisi: ParcaKenarlari[] = [];
    for (let c = 0; c < sutun; c++) {
      satirDizisi.push({
        ust: r === 0 ? 0 : ((-dikey[r - 1][c]) as Kenar),
        sag: c === sutun - 1 ? 0 : yatay[r][c],
        alt: r === satir - 1 ? 0 : dikey[r][c],
        sol: c === 0 ? 0 : ((-yatay[r][c - 1]) as Kenar),
      });
    }
    matris.push(satirDizisi);
  }
  return matris;
}

/**
 * Klasik jigsaw kenar profili.
 * Kenar boyunca normalize edilmiş konum (s) ve kenara dik yükseklik (n) çiftleri.
 * n'in tepe noktası 0.5'tir; tırtık yüksekliği ile ölçeklenir.
 */
const KENAR_EGRISI: Array<[number, number, number, number, number, number]> = [
  // [c1s, c1n, c2s, c2n, s, n] — her satır bir kübik bezier.
  // Profil klasik karton puzzle kenarıdır: önce hafif bir boyun girintisi,
  // sonra yuvarlak bir topuz, sonra tekrar boyun ve düz çıkış.
  [0.24, 0.0, 0.36, 0.0, 0.40, -0.05],
  [0.16, 0.30, 0.84, 0.30, 0.60, -0.05],
  [0.64, 0.0, 0.76, 0.0, 1.0, 0.0],
];

/** Orta bezier'in tepe noktası (kenar uzunluğu birimiyle) — ölçekleme buna göre yapılır. */
const TEPE_ORANI = 0.2125;

/** Topuzun kutu kenarına değmemesi için bırakılan pay. */
const GUVENLIK_PAYI = 0.92;

interface Nokta {
  x: number;
  y: number;
}

/**
 * Tek bir kenarı çizer. Kenar p0'dan p1'e gider; tırtık kenara dik yönde,
 * `yon` işaretine göre dışarı (1) ya da içeri (-1) taşar.
 * Parçalar saat yönünde çizildiği için dik vektör her zaman dışarıyı gösterir.
 */
function kenarCiz(p0: Nokta, p1: Nokta, yon: Kenar, tirtik: number): string {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  if (yon === 0 || tirtik <= 0) return `L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;

  // birim vektör (kenar boyunca) ve dik vektör (dışarı doğru)
  const uzunluk = Math.hypot(dx, dy);
  const ux = dx / uzunluk;
  const uy = dy / uzunluk;
  const px = uy;
  const py = -ux;
  // Topuzun tepesi kutunun kenarına değmesin diye küçük bir pay bırakılır.
  const yukseklik = ((tirtik * GUVENLIK_PAYI) / TEPE_ORANI) * yon;

  const nokta = (s: number, n: number) => {
    const x = p0.x + ux * uzunluk * s + px * n * yukseklik;
    const y = p0.y + uy * uzunluk * s + py * n * yukseklik;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  };

  return KENAR_EGRISI.map(
    ([c1s, c1n, c2s, c2n, s, n]) => `C ${nokta(c1s, c1n)}, ${nokta(c2s, c2n)}, ${nokta(s, n)}`
  ).join(" ");
}

/**
 * Bir parçanın SVG path'ini üretir.
 * Koordinatlar parçanın kendi kutusuna göredir: hücre, kutunun içinde
 * her yönden `tirtik` kadar içeride durur — böylece çıkıntılar taşabilir.
 */
export function parcaPathUret(
  kenarlar: ParcaKenarlari,
  hucreGenislik: number,
  hucreYukseklik: number,
  tirtik: number
): string {
  const x0 = tirtik;
  const y0 = tirtik;
  const x1 = tirtik + hucreGenislik;
  const y1 = tirtik + hucreYukseklik;

  const solUst = { x: x0, y: y0 };
  const sagUst = { x: x1, y: y0 };
  const sagAlt = { x: x1, y: y1 };
  const solAlt = { x: x0, y: y1 };

  return [
    `M ${solUst.x.toFixed(2)} ${solUst.y.toFixed(2)}`,
    kenarCiz(solUst, sagUst, kenarlar.ust, tirtik),
    kenarCiz(sagUst, sagAlt, kenarlar.sag, tirtik),
    kenarCiz(sagAlt, solAlt, kenarlar.alt, tirtik),
    kenarCiz(solAlt, solUst, kenarlar.sol, tirtik),
    "Z",
  ].join(" ");
}

export interface ParcaTanimi {
  indeks: number;
  satir: number;
  sutun: number;
  kenarlar: ParcaKenarlari;
  /** Tepsideki dizilim sırası — parçalar tahtadaki sırayla dizilmesin diye karıştırılır. */
  tepsiSira: number;
  /** Tepsideki ızgara konumundan sapma (kutu boyutuna oranla, -0.5..0.5). */
  sapmaX: number;
  sapmaY: number;
  /** Tepside dururken uygulanan hafif eğiklik (derece). */
  egiklik: number;
}

/** Tüm parçaları ve tepsideki dağınık dizilimlerini deterministik olarak üretir. */
export function parcalariUret(satir: number, sutun: number, seed: string): ParcaTanimi[] {
  const matris = kenarMatrisiUret(satir, sutun, seed);
  const rnd = rastgeleUretec(seed + ":tepsi");
  const toplam = satir * sutun;

  // Tepsi sırası: 0..n-1'in karıştırılmış hali
  const sira = Array.from({ length: toplam }, (_, i) => i);
  for (let i = sira.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [sira[i], sira[j]] = [sira[j], sira[i]];
  }

  const parcalar: ParcaTanimi[] = [];
  for (let r = 0; r < satir; r++) {
    for (let c = 0; c < sutun; c++) {
      const indeks = r * sutun + c;
      parcalar.push({
        indeks,
        satir: r,
        sutun: c,
        kenarlar: matris[r][c],
        tepsiSira: sira[indeks],
        sapmaX: (rnd() - 0.5) * 0.24,
        sapmaY: (rnd() - 0.5) * 0.24,
        egiklik: (rnd() - 0.5) * 14,
      });
    }
  }
  return parcalar;
}

export interface TepsiPlani {
  /** Parçaların tepside gösterileceği ölçek (1 = tahtadaki gerçek boyut). */
  olcek: number;
  sutunSayisi: number;
  satirSayisi: number;
  /** Bu planın gerektirdiği tepsi yüksekliği. */
  yukseklik: number;
}

/** Denenen ölçekler — büyükten küçüğe; sığan ilk ölçek seçilir. */
const OLCEK_ADAYLARI = [0.78, 0.72, 0.66, 0.6, 0.54, 0.48, 0.42, 0.36, 0.3];

/** İki parça arasındaki yatay adımın kutu genişliğine oranı (bindirmeli yığın görüntüsü). */
const YATAY_ADIM = 0.74;
/** Satırlar arası dikey adımın kutu yüksekliğine oranı. */
const DIKEY_ADIM = 0.52;
/** Tepsinin üst ve alt iç boşluğu. */
const TEPSI_PAYI = 24;

function planHesapla(
  olcek: number,
  tepsiGenislik: number,
  kutuGenislik: number,
  kutuYukseklik: number,
  toplamParca: number
): TepsiPlani {
  const bw = kutuGenislik * olcek;
  const bh = kutuYukseklik * olcek;
  const sutunSayisi = Math.max(
    1,
    Math.min(toplamParca, Math.floor(tepsiGenislik / (bw * YATAY_ADIM)))
  );
  const satirSayisi = Math.ceil(toplamParca / sutunSayisi);
  const yukseklik = bh + (satirSayisi - 1) * bh * DIKEY_ADIM + TEPSI_PAYI;
  return { olcek, sutunSayisi, satirSayisi, yukseklik };
}

/**
 * Tepsi düzenini planlar.
 *
 * Parçalar tepside küçültülmüş gösterilir; ölçek, tüm yığının verilen alana
 * sığacağı en büyük değer olarak seçilir. Böylece tepsi ne tahtadan uzun olur
 * (yan tepside sonsuz büyüme sorunu buradan çıkıyordu) ne de parçalar parmakla
 * tutulamayacak kadar küçülür.
 */
export function tepsiPlanla(
  tepsiGenislik: number,
  hedefYukseklik: number,
  kutuGenislik: number,
  kutuYukseklik: number,
  toplamParca: number
): TepsiPlani {
  if (tepsiGenislik <= 0 || kutuGenislik <= 0) {
    return { olcek: 0.6, sutunSayisi: 1, satirSayisi: toplamParca, yukseklik: 0 };
  }
  for (const olcek of OLCEK_ADAYLARI) {
    const plan = planHesapla(olcek, tepsiGenislik, kutuGenislik, kutuYukseklik, toplamParca);
    if (plan.yukseklik <= hedefYukseklik) return plan;
  }
  // Hiçbiri sığmadıysa en küçük ölçekle devam et
  return planHesapla(
    OLCEK_ADAYLARI[OLCEK_ADAYLARI.length - 1],
    tepsiGenislik,
    kutuGenislik,
    kutuYukseklik,
    toplamParca
  );
}

/** Zorluk seviyesinin yerleştirme toleransına karşılığı (hücre boyutuna oran). */
export function tolerans(zorluk: string | undefined): number {
  if (zorluk === "zor") return 0.22;
  if (zorluk === "orta") return 0.35;
  return 0.5;
}

/** Saniyeyi 01:23 biçimine çevirir. */
export function sureBicimle(saniye: number): string {
  const dk = Math.floor(Math.max(0, saniye) / 60);
  const sn = Math.max(0, saniye) % 60;
  return `${String(dk).padStart(2, "0")}:${String(sn).padStart(2, "0")}`;
}

/** "{tamamlanan} / {toplam}" gibi şablonlardaki yer tutucuları doldurur. */
export function metniDoldur(sablon: string, degerler: Record<string, string | number>): string {
  return sablon.replace(/\{(\w+)\}/g, (tam, anahtar) =>
    anahtar in degerler ? String(degerler[anahtar]) : tam
  );
}
