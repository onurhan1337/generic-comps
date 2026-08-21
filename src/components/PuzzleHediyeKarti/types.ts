// This file is auto-generated — do not edit manually.
import type { IkasImage, IkasProduct, IkasNavigationLink, IkasNumberRange } from "@ikas/bp-storefront";

export interface Props {
  /** Kartın üstünde gösterilecek hediye görseli. */
  hediyeGorseli?: IkasImage | null;
  /** Kartın ana başlığı. Hediyenin adı. */
  hediyeBasligi: string;
  /** Başlığın altındaki kısa açıklama satırı. */
  hediyeAciklamasi?: string;
  /** Kartın köşesinde görünen küçük etiket. Boş bırakırsan rozet gösterilmez. */
  rozetMetni?: string;
  /** Kampanyada seçim davranışı 'Sepete ekle' ise bu ürün sepete eklenir. */
  hediyeUrunu?: IkasProduct | null;
  /** Kampanyada seçim davranışı 'Bağlantıya git' ise bu adrese yönlendirilir. */
  hediyeBaglantisi?: IkasNavigationLink | null;
  /** Hediye henüz seçilmemişken butonda yazan metin. */
  secimButonMetni?: string;
  /** Hediye seçildikten sonra butonda yazan metin. */
  secildiButonMetni?: string;
  /** Kartın zemin rengi. */
  kartArkaPlanRengi?: string;
  /** Başlık ve açıklama metinlerinin rengi. */
  metinRengi?: string;
  /** Kart seçildiğinde çerçevenin ve butonun aldığı renk. */
  vurguRengi?: string;
  /** Kart köşelerinin yuvarlaklık miktarı. */
  koseYuvarlakligi?: IkasNumberRange;
}
