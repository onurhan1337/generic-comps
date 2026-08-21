import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { getDefaultSrc } from "@ikas/bp-storefront";
import {
  benzersizKimlik,
  hediyeDurumuIste,
  hediyeDurumunaAbone,
  hediyeSecimiYayinla,
} from "../../lib/hediye-secim";
import { Props } from "./types";

interface KutuDurumu {
  kutuModu: boolean;
  kilitli: boolean;
  kilitMetni: string;
  kullanildi: boolean;
  kullanildiMetni: string;
}

const BASLANGIC: KutuDurumu = {
  kutuModu: false,
  kilitli: false,
  kilitMetni: "",
  kullanildi: false,
  kullanildiMetni: "",
};

export function PuzzleHediyeKarti({
  hediyeGorseli,
  hediyeBasligi,
  hediyeAciklamasi,
  rozetMetni,
  hediyeUrunu,
  hediyeBaglantisi,
  secimButonMetni,
  secildiButonMetni,
  kutuKapakMetni,
  kutuAcMetni,
  kartArkaPlanRengi,
  metinRengi,
  vurguRengi,
  koseYuvarlakligi,
}: Props) {
  // Kartın kimliği: kampanya bölümü hangi kartın seçildiğini bununla ayırt eder.
  const kartId = useMemo(() => benzersizKimlik("hediye"), []);
  const [secili, setSecili] = useState(false);
  const [kutu, setKutu] = useState<KutuDurumu>(BASLANGIC);
  const dugmeRef = useRef<HTMLButtonElement | null>(null);

  /**
   * Kartın slot içindeki sırası. Kart kimlikleri her turda yenilendiği ve
   * başlıklar birbirinin aynı olabildiği için "hangi hediye alınmıştı"
   * bilgisi bu sıraya göre tutulur. Sıra DOM'dan, kendi slot'u içinde okunur.
   */
  const kendiSiram = useCallback((): number => {
    const el = dugmeRef.current;
    if (!el) return -1;
    const alan = el.closest(".hediye-kart-alani");
    if (!alan) return -1;
    return Array.prototype.indexOf.call(alan.querySelectorAll(".hediye-karti"), el);
  }, []);

  // Kampanya bölümü seçim durumunu geri yayınlar; kart kendi görünümünü ona göre günceller.
  useEffect(() => {
    const birak = hediyeDurumunaAbone((detay) => {
      setSecili(detay.seciliKartId === kartId);
      setKutu({
        kutuModu: Boolean(detay.kutuModu),
        kilitli: Boolean(detay.kilitli),
        kilitMetni: detay.kilitMetni ?? "",
        // Önceki turda alınan hediye başlığa göre işaretlenir: kartlar her turda
        // yeniden mount olduğu için kimlik değil başlık kalıcı referans.
        kullanildi: (detay.kullanilanIndeksler ?? []).includes(kendiSiram()),
        kullanildiMetni: detay.kullanildiMetni ?? "",
      });
    });
    // Bölüm ile kart ayrı paketlerde: mount olur olmaz güncel durumu iste.
    hediyeDurumuIste();
    return birak;
  }, [kartId, kendiSiram]);

  const gorselSrc = hediyeGorseli ? getDefaultSrc(hediyeGorseli) : "";
  const kose = koseYuvarlakligi?.value ?? 16;

  // Kutu modunda kart, açılana kadar içeriğini göstermez.
  const kullanildi = kutu.kullanildi && !secili;
  // Kullanılmış hediye kapalı kalmaz: hangisini aldığın görünsün diye açılır.
  const kapali = kutu.kutuModu && !secili && !kullanildi;
  const kilitli = kullanildi || (kapali && kutu.kilitli);

  const aksiyonMetni = kullanildi
    ? kutu.kullanildiMetni
    : kapali
    ? kilitli
      ? kutu.kilitMetni
      : kutuAcMetni ?? "Kutuyu aç"
    : secili
      ? secildiButonMetni ?? "Seçildi"
      : secimButonMetni ?? "Bu hediyeyi seç";

  const secimYap = () => {
    if (kilitli) return;
    hediyeSecimiYayinla({
      kartId,
      indeks: kendiSiram(),
      baslik: hediyeBasligi,
      urun: hediyeUrunu ?? undefined,
      baglantiHref: hediyeBaglantisi?.href,
    });
  };

  const sinif = [
    "hediye-karti",
    secili ? "secili" : "",
    kapali ? "kapali" : "",
    kilitli ? "kilitli" : "",
    kullanildi ? "kullanildi" : "",
    kutu.kutuModu && secili ? "acildi" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={dugmeRef}
      type="button"
      className={sinif}
      onClick={secimYap}
      aria-pressed={secili}
      disabled={kilitli}
      style={{
        backgroundColor: kartArkaPlanRengi || undefined,
        color: metinRengi || undefined,
        borderRadius: `${kose}px`,
        borderColor: secili ? vurguRengi || undefined : undefined,
      }}
    >
      {kapali ? (
        <span
          className="hk-kutu"
          aria-hidden="true"
          style={{ borderRadius: `${Math.max(8, kose - 4)}px`, color: vurguRengi || undefined }}
        >
          <svg viewBox="0 0 32 32" width="32" height="32">
            <rect x="5" y="13" width="22" height="14" rx="2.4" fill="currentColor" opacity="0.16" />
            <rect x="3.5" y="9" width="25" height="5.6" rx="1.8" fill="currentColor" opacity="0.3" />
            <rect x="14" y="9" width="4" height="18" fill="currentColor" opacity="0.5" />
            <path
              d="M16 9c-1.2-2.6-2.6-4-4.4-4a2.6 2.6 0 0 0 0 5.2M16 9c1.2-2.6 2.6-4 4.4-4a2.6 2.6 0 0 1 0 5.2"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              opacity="0.75"
            />
          </svg>
        </span>
      ) : (
        gorselSrc && (
          <span
            className="hk-gorsel"
            style={{ borderRadius: `${Math.max(6, kose - 6)}px` }}
          >
            <img src={gorselSrc} alt="" />
          </span>
        )
      )}

      <span className="hk-metin">
        <span className="hk-ust">
          <span className="hk-baslik">
            {kapali ? kutuKapakMetni ?? "Sürpriz kutu" : hediyeBasligi}
          </span>
          {!kapali && rozetMetni && <span className="hk-rozet">{rozetMetni}</span>}
        </span>
        {!kapali && hediyeAciklamasi && <span className="hk-aciklama">{hediyeAciklamasi}</span>}
        {aksiyonMetni && (
          <span
            className="hk-aksiyon"
            style={secili ? { color: vurguRengi || undefined } : undefined}
          >
            {aksiyonMetni}
          </span>
        )}
      </span>

      {!kapali && (
        <span
          className="hk-tik"
          aria-hidden="true"
          style={
            secili
              ? { backgroundColor: vurguRengi || undefined, borderColor: vurguRengi || undefined }
              : undefined
          }
        >
          <svg viewBox="0 0 12 12" width="12" height="12">
            <path
              d="M2.5 6.2 4.7 8.4 9.5 3.6"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  );
}

export default PuzzleHediyeKarti;
