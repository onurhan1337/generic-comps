import { useEffect, useMemo, useState } from "preact/hooks";
import { getDefaultSrc } from "@ikas/bp-storefront";
import {
  benzersizKimlik,
  hediyeDurumunaAbone,
  hediyeSecimiYayinla,
} from "../../lib/hediye-secim";
import { Props } from "./types";

export function PuzzleHediyeKarti({
  hediyeGorseli,
  hediyeBasligi,
  hediyeAciklamasi,
  rozetMetni,
  hediyeUrunu,
  hediyeBaglantisi,
  secimButonMetni,
  secildiButonMetni,
  kartArkaPlanRengi,
  metinRengi,
  vurguRengi,
  koseYuvarlakligi,
}: Props) {
  // Kartın kimliği: kampanya bölümü hangi kartın seçildiğini bununla ayırt eder.
  const kartId = useMemo(() => benzersizKimlik("hediye"), []);
  const [secili, setSecili] = useState(false);

  // Kampanya bölümü seçim durumunu geri yayınlar; kart kendi görünümünü ona göre günceller.
  useEffect(
    () =>
      hediyeDurumunaAbone((detay) => {
        setSecili(detay.seciliKartId === kartId);
      }),
    [kartId]
  );

  const gorselSrc = hediyeGorseli ? getDefaultSrc(hediyeGorseli) : "";
  const kose = koseYuvarlakligi?.value ?? 16;
  const aksiyonMetni = secili
    ? secildiButonMetni ?? "Seçildi"
    : secimButonMetni ?? "Bu hediyeyi seç";

  const secimYap = () => {
    hediyeSecimiYayinla({
      kartId,
      baslik: hediyeBasligi,
      urun: hediyeUrunu ?? undefined,
      baglantiHref: hediyeBaglantisi?.href,
    });
  };

  return (
    <button
      type="button"
      className={secili ? "hediye-karti secili" : "hediye-karti"}
      onClick={secimYap}
      aria-pressed={secili}
      style={{
        backgroundColor: kartArkaPlanRengi || undefined,
        color: metinRengi || undefined,
        borderRadius: `${kose}px`,
        borderColor: secili ? vurguRengi || undefined : undefined,
      }}
    >
      {gorselSrc && (
        <span
          className="hk-gorsel"
          style={{ borderRadius: `${Math.max(6, kose - 6)}px` }}
        >
          <img src={gorselSrc} alt="" />
        </span>
      )}

      <span className="hk-metin">
        <span className="hk-ust">
          <span className="hk-baslik">{hediyeBasligi}</span>
          {rozetMetni && <span className="hk-rozet">{rozetMetni}</span>}
        </span>
        {hediyeAciklamasi && <span className="hk-aciklama">{hediyeAciklamasi}</span>}
        <span className="hk-aksiyon" style={secili ? { color: vurguRengi || undefined } : undefined}>
          {aksiyonMetni}
        </span>
      </span>

      <span
        className="hk-tik"
        aria-hidden="true"
        style={secili ? { backgroundColor: vurguRengi || undefined, borderColor: vurguRengi || undefined } : undefined}
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
    </button>
  );
}

export default PuzzleHediyeKarti;
