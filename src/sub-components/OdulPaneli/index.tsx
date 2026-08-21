import { observer } from "@ikas/component-utils";
import { useEffect, useState } from "preact/hooks";

interface Props {
  baslik: string;
  aciklamaHtml?: string;
  gorselSrc?: string;
  kuponKodu?: string;
  kuponGoster: boolean;
  kopyalaMetni: string;
  kopyalandiMetni: string;
  butonMetni?: string;
  butonHref?: string;
  metinRengi: string;
  vurguRengi: string;
  koseYuvarlakligi: number;
  butonParlamasi?: boolean;
}

const OdulPaneli = observer(function OdulPaneli({
  baslik,
  aciklamaHtml,
  gorselSrc,
  kuponKodu,
  kuponGoster,
  kopyalaMetni,
  kopyalandiMetni,
  butonMetni,
  butonHref,
  metinRengi,
  vurguRengi,
  koseYuvarlakligi,
  butonParlamasi,
}: Props) {
  const [kopyalandi, setKopyalandi] = useState(false);

  useEffect(() => {
    if (!kopyalandi) return;
    const zamanlayici = window.setTimeout(() => setKopyalandi(false), 2000);
    return () => window.clearTimeout(zamanlayici);
  }, [kopyalandi]);

  const kodaKopyala = async () => {
    if (!kuponKodu) return;
    try {
      await navigator.clipboard.writeText(kuponKodu);
      setKopyalandi(true);
    } catch {
      // Pano izni yoksa kullanıcı kodu elle seçebilir — sessizce geç.
    }
  };

  return (
    <div className="odul-serit" style={{ color: metinRengi }} role="status" aria-live="polite">
      {gorselSrc && (
        <img
          className="odul-minik"
          src={gorselSrc}
          alt=""
          style={{ borderRadius: `${Math.max(8, koseYuvarlakligi - 8)}px` }}
        />
      )}

      <div className="odul-metin">
        <h3 className="odul-baslik">{baslik}</h3>
        {aciklamaHtml && (
          <div className="odul-aciklama" dangerouslySetInnerHTML={{ __html: aciklamaHtml }} />
        )}
      </div>

      <div className="odul-aksiyonlar">
        {kuponGoster && kuponKodu && (
          <div className="kupon-pill">
            <code className="kupon-kodu">{kuponKodu}</code>
            <button
              type="button"
              className="kupon-buton"
              onClick={kodaKopyala}
              style={{ color: vurguRengi }}
            >
              {kopyalandi ? kopyalandiMetni : kopyalaMetni}
            </button>
          </div>
        )}

        {butonMetni && (
          <a
            className={butonParlamasi === false ? "odul-buton" : "odul-buton parlak"}
            href={butonHref || "#"}
          >
            {butonMetni}
          </a>
        )}
      </div>
    </div>
  );
});

export default OdulPaneli;
