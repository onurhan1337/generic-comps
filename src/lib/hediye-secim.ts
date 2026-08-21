/**
 * Hediye kartları ile kampanya bölümü arasındaki iletişim.
 *
 * Hediye kartları COMPONENT_LIST slotuna editörden yerleştirilir ve kendi
 * paketlerinde çalışır — bu yüzden paylaşılan bir modül state'ine güvenilemez.
 * İletişim window üzerinden CustomEvent ile kurulur: kart seçimi yayınlar,
 * bölüm işlemi yapar ve güncel durumu geri yayınlar.
 */

export const SECIM_OLAYI = "ikas-puzzle-hediye-secildi";
export const DURUM_OLAYI = "ikas-puzzle-hediye-durumu";

export interface HediyeSecimDetayi {
  /** Kartın kendi ürettiği benzersiz kimlik. */
  kartId: string;
  /** Kartın slot içindeki sırası. Kimlikler her turda yenilendiği için
      "hangi hediye alınmıştı" bilgisi bu sıraya göre tutulur. */
  indeks?: number;
  baslik?: string;
  urun?: unknown;
  baglantiHref?: string;
}

export interface HediyeDurumDetayi {
  /** Şu an seçili olan kartın kimliği; hiçbiri seçili değilse null. */
  seciliKartId: string | null;
  /** Kartlar kapalı sürpriz kutu olarak mı gösterilecek? */
  kutuModu?: boolean;
  /** Bir kutu açıldıktan sonra diğerleri kilitlenir. */
  kilitli?: boolean;
  /** Kilitli kutuların üzerinde görünen metin. */
  kilitMetni?: string;
  /** Önceki turlarda alınmış kartların sıra numaraları — bunlar tekrar seçilemez. */
  kullanilanIndeksler?: number[];
  /** Kullanılmış hediyenin üzerinde görünen metin. */
  kullanildiMetni?: string;
}

export function hediyeSecimiYayinla(detay: HediyeSecimDetayi): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<HediyeSecimDetayi>(SECIM_OLAYI, { detail: detay }));
}

export function hediyeDurumuYayinla(detay: HediyeDurumDetayi): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<HediyeDurumDetayi>(DURUM_OLAYI, { detail: detay }));
}

export function hediyeSecimineAbone(dinleyici: (detay: HediyeSecimDetayi) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const sarmalayici = (olay: Event) => dinleyici((olay as CustomEvent<HediyeSecimDetayi>).detail);
  window.addEventListener(SECIM_OLAYI, sarmalayici);
  return () => window.removeEventListener(SECIM_OLAYI, sarmalayici);
}

export function hediyeDurumunaAbone(dinleyici: (detay: HediyeDurumDetayi) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const sarmalayici = (olay: Event) => dinleyici((olay as CustomEvent<HediyeDurumDetayi>).detail);
  window.addEventListener(DURUM_OLAYI, sarmalayici);
  return () => window.removeEventListener(DURUM_OLAYI, sarmalayici);
}

let sayac = 0;
/** Bileşen örneği başına benzersiz kimlik (SVG clipPath id'leri ve kart kimliği için). */
export function benzersizKimlik(onEk: string): string {
  sayac += 1;
  return `${onEk}-${sayac.toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export const ISTEK_OLAYI = "ikas-puzzle-hediye-durum-istegi";

/**
 * Kart mount olduğunda bölümden güncel durumu ister. Kart ile bölüm ayrı
 * paketlerde çalıştığı için ilk render'da kutu modunu bilmesinin tek yolu bu.
 */
export function hediyeDurumuIste(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ISTEK_OLAYI));
}

export function hediyeDurumIstegineAbone(dinleyici: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(ISTEK_OLAYI, dinleyici);
  return () => window.removeEventListener(ISTEK_OLAYI, dinleyici);
}
