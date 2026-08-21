import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  addItemToCart,
  getDefaultSrc,
  getSelectedProductVariant,
  type IkasProduct,
} from "@ikas/bp-storefront";
import PuzzleTahtasi from "../../sub-components/PuzzleTahtasi";
import OdulPaneli from "../../sub-components/OdulPaneli";
import HediyeSecimi from "../../sub-components/HediyeSecimi";
import Konfeti from "../../sub-components/Konfeti";
import {
  hediyeDurumuYayinla,
  hediyeSecimineAbone,
  type HediyeSecimDetayi,
} from "../../lib/hediye-secim";
import { metniDoldur, parcaPathUret, sureBicimle } from "../../lib/puzzle";
import { Props } from "./types";

type OyunDurumu = "hazir" | "oynaniyor" | "tamamlandi" | "sureBitti";

interface KayitliDurum {
  tur: number;
  yerlesenler: number[];
  hamle: number;
  tamamlandi: boolean;
}

const DEPO_ONEKI = "ikas-puzzle:";

/**
 * Rozet ikonu, parçalarla aynı jigsaw üretecinden çizilir — böylece
 * bölümdeki her puzzle silüeti aynı elden çıkmış olur.
 */
const ROZET_TIRTIK = 2.2;
const ROZET_HUCRE = 9;
const ROZET_KUTU = ROZET_HUCRE + ROZET_TIRTIK * 2;
const ROZET_PATH = parcaPathUret(
  { ust: 0, sag: 1, alt: 0, sol: -1 },
  ROZET_HUCRE,
  ROZET_HUCRE,
  ROZET_TIRTIK
);

/** Yazı tipi seçeneklerinin karşılığı olan font yığınları. */
const YAZI_TIPLERI: Record<string, string> = {
  tema: "inherit",
  sistem:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  geometrik: '"Avenir Next", "Avenir", "Nunito Sans", "Segoe UI", system-ui, sans-serif',
  serif: '"New York", "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
};

function durumuOku(anahtar: string): KayitliDurum | null {
  if (typeof window === "undefined") return null;
  try {
    const ham = window.localStorage.getItem(DEPO_ONEKI + anahtar);
    return ham ? (JSON.parse(ham) as KayitliDurum) : null;
  } catch {
    return null;
  }
}

function durumuYaz(anahtar: string, durum: KayitliDurum): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEPO_ONEKI + anahtar, JSON.stringify(durum));
  } catch {
    // Depolama kapalıysa (gizli sekme, kota) oyun yine de oynanabilir.
  }
}

function durumuSil(anahtar: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DEPO_ONEKI + anahtar);
  } catch {
    // yoksayılabilir
  }
}

export function PuzzleKampanya(props: Props) {
  const {
    ustEtiket,
    baslik,
    aciklama,
    puzzleGorseli,
    satirSayisi,
    sutunSayisi,
    tirtikBoyutu,
    zorlukSeviyesi,
    tepsiKonumu,
    rehberGorseliGoster,
    yanlisParcaDavranisi,
    karistirmaAnahtari,
    sureLimitiAktif,
    sureSaniye,
    hamleSayaciniGoster,
    ilerlemeyiHatirla,
    tekrarOynanabilir,
    odulBasligi,
    odulAciklamasi,
    odulGorseli,
    kuponKodunuGoster,
    kuponKodu,
    kopyalaButonMetni,
    kopyalandiMetni,
    odulBaglantisi,
    odulButonMetni,
    konfetiEfekti,
    hediyeAdimiAktif,
    hediyeBasligi,
    hediyeAciklamasi,
    hediyeKartlari,
    hediyeSecimDavranisi,
    hediyeOnayMetni,
    hediyeBosMetni,
    baslaButonMetni,
    sifirlaButonMetni,
    ilerlemeMetni,
    kalanSureMetni,
    hamleMetni,
    sureDolduBasligi,
    sureDolduAciklamasi,
    tekrarDeneButonMetni,
    gorselYokMetni,
    parcaAlEtiketi,
    slotEtiketi,
    oynanisIpucuMetni,
    sureBilgiMetni,
    arkaPlanRengi,
    metinRengi,
    vurguRengi,
    vurguMetinRengi,
    tahtaArkaPlanRengi,
    parcaKenarRengi,
    yaziTipi,
    uyariRengi,
    butonParlamasi,
    golgeYogunlugu,
    koseYuvarlakligi,
    maksimumGenislik,
    dikeyBosluk,
  } = props;

  const satir = Math.round(satirSayisi?.value ?? 3);
  const sutun = Math.round(sutunSayisi?.value ?? 3);
  const toplamParca = satir * sutun;
  const anahtar = karistirmaAnahtari || "kampanya-1";
  const gorselSrc = puzzleGorseli ? getDefaultSrc(puzzleGorseli) : "";
  const odulGorselSrc = odulGorseli ? getDefaultSrc(odulGorseli) : "";
  const toplamSure = Math.max(5, Math.round(sureSaniye ?? 120));

  const [tur, setTur] = useState(0);
  const [durum, setDurum] = useState<OyunDurumu>("hazir");
  const [yerlesenler, setYerlesenler] = useState<number[]>([]);
  const [hamle, setHamle] = useState(0);
  const [kalanSure, setKalanSure] = useState(toplamSure);
  const [seciliHediye, setSeciliHediye] = useState<string | null>(null);
  const [yuklendi, setYuklendi] = useState(false);
  const kaydetmeAnahtari = `${anahtar}:${satir}x${sutun}`;

  // Kaydedilmiş ilerlemeyi yalnızca tarayıcıda oku — sunucu render'ı hep boş
  // başlar, böylece hydration uyuşmazlığı olmaz.
  useEffect(() => {
    setYuklendi(true);
    if (!ilerlemeyiHatirla) return;
    const kayit = durumuOku(kaydetmeAnahtari);
    if (!kayit) return;
    setTur(kayit.tur ?? 0);
    setHamle(kayit.hamle ?? 0);
    setYerlesenler(Array.isArray(kayit.yerlesenler) ? kayit.yerlesenler : []);
    if (kayit.tamamlandi) setDurum("tamamlandi");
    else if ((kayit.yerlesenler?.length ?? 0) > 0) setDurum("oynaniyor");
  }, [kaydetmeAnahtari, ilerlemeyiHatirla]);

  // İlerlemeyi kaydet
  useEffect(() => {
    if (!yuklendi || !ilerlemeyiHatirla) return;
    durumuYaz(kaydetmeAnahtari, {
      tur,
      yerlesenler,
      hamle,
      tamamlandi: durum === "tamamlandi",
    });
  }, [yuklendi, ilerlemeyiHatirla, kaydetmeAnahtari, tur, yerlesenler, hamle, durum]);

  // Tüm parçalar yerleştiyse oyun tamamlanır
  useEffect(() => {
    if (durum === "oynaniyor" && yerlesenler.length >= toplamParca && toplamParca > 0) {
      setDurum("tamamlandi");
    }
  }, [durum, yerlesenler.length, toplamParca]);

  // Süre sayacı
  useEffect(() => {
    if (!sureLimitiAktif || durum !== "oynaniyor") return;
    const sayac = window.setInterval(() => {
      setKalanSure((onceki) => {
        if (onceki <= 1) {
          window.clearInterval(sayac);
          setDurum("sureBitti");
          return 0;
        }
        return onceki - 1;
      });
    }, 1000);
    return () => window.clearInterval(sayac);
  }, [sureLimitiAktif, durum]);

  const oyunuBaslat = useCallback(() => {
    setDurum("oynaniyor");
    setKalanSure(toplamSure);
  }, [toplamSure]);

  const oyunuSifirla = useCallback(() => {
    setTur((onceki) => onceki + 1);
    setYerlesenler([]);
    setHamle(0);
    setKalanSure(toplamSure);
    setSeciliHediye(null);
    setDurum("oynaniyor");
    hediyeDurumuYayinla({ seciliKartId: null });
    durumuSil(kaydetmeAnahtari);
  }, [toplamSure, kaydetmeAnahtari]);

  const parcaYerlesti = useCallback((indeks: number) => {
    setYerlesenler((onceki) => (onceki.includes(indeks) ? onceki : [...onceki, indeks]));
  }, []);

  const hamleYapildi = useCallback(() => {
    setHamle((onceki) => onceki + 1);
  }, []);

  // Hediye kartlarından gelen seçimi işle
  const davranisRef = useRef(hediyeSecimDavranisi);
  davranisRef.current = hediyeSecimDavranisi;

  useEffect(() => {
    if (!hediyeAdimiAktif) return;
    return hediyeSecimineAbone(async (detay: HediyeSecimDetayi) => {
      setSeciliHediye(detay.kartId);
      hediyeDurumuYayinla({ seciliKartId: detay.kartId });

      const davranis = davranisRef.current ?? "sepeteEkle";
      if (davranis === "sepeteEkle" && detay.urun) {
        const urun = detay.urun as IkasProduct;
        const varyant = getSelectedProductVariant(urun);
        if (varyant) await addItemToCart(varyant, urun, 1);
      } else if (davranis === "baglantiyaGit" && detay.baglantiHref) {
        window.location.href = detay.baglantiHref;
      }
    });
  }, [hediyeAdimiAktif]);

  const golgeOrani = (golgeYogunlugu?.value ?? 35) / 100;
  const kose = koseYuvarlakligi?.value ?? 20;
  // Kart içindeki yüzeyler dıştaki köşeden bir tık daha keskin olur — iç içe
  // yuvarlatmanın doğru görünmesi için.
  const icKose = Math.max(6, kose - 8);
  const enGenis = maksimumGenislik?.value ?? 1120;
  const bosluk = dikeyBosluk?.value ?? 72;
  const tirtikOrani = Math.max(0, Math.min(0.4, (tirtikBoyutu?.value ?? 24) / 100));

  const ilerlemeYazisi = useMemo(
    () =>
      metniDoldur(ilerlemeMetni ?? "{tamamlanan} / {toplam}", {
        tamamlanan: yerlesenler.length,
        toplam: toplamParca,
      }),
    [ilerlemeMetni, yerlesenler.length, toplamParca]
  );

  const oynaniyorMu = durum === "oynaniyor";
  const yuzde = toplamParca > 0 ? (yerlesenler.length / toplamParca) * 100 : 0;

  // Son çeyrekte (ya da son 10 saniyede) geri sayım "acil" moda geçer.
  const acilEsigi = Math.max(10, Math.round(toplamSure * 0.25));
  const acilSure = Boolean(sureLimitiAktif) && oynaniyorMu && kalanSure <= acilEsigi;
  const sureYuzdesi = toplamSure > 0 ? (kalanSure / toplamSure) * 100 : 0;

  // Az sayıda parçada tek tek kutucuk, çok parçada sürekli çubuk daha okunur.
  const pipGostergesi = toplamParca <= 20;

  const kokDegiskenleri = {
    "--pk-vurgu": vurguRengi || "#1d1d1f",
    "--pk-vurgu-metin": vurguMetinRengi || "#ffffff",
    "--pk-uyari": uyariRengi || "#d93025",
    "--pk-yuzey": tahtaArkaPlanRengi || "#ffffff",
    "--pk-kose": `${kose}px`,
    "--pk-ic-kose": `${icKose}px`,
    "--pk-font": YAZI_TIPLERI[yaziTipi ?? "sistem"] ?? YAZI_TIPLERI.sistem,
  } as Record<string, string>;

  return (
    <section
      className="puzzle-kampanya"
      style={{
        ...kokDegiskenleri,
        backgroundColor: arkaPlanRengi || undefined,
        color: metinRengi || undefined,
        paddingTop: `${bosluk}px`,
        paddingBottom: `${bosluk}px`,
      }}
    >
      <div className="kampanya-ic" style={{ maxWidth: `${enGenis}px` }}>
        <header className="kampanya-baslik-alani">
          {ustEtiket && (
            <span className="ust-etiket">
              <svg
                className="etiket-ikon"
                viewBox={`0 0 ${ROZET_KUTU} ${ROZET_KUTU}`}
                aria-hidden="true"
              >
                <path d={ROZET_PATH} fill="currentColor" />
              </svg>
              {ustEtiket}
            </span>
          )}
          <h2 className="kampanya-baslik">{baslik}</h2>
          {aciklama && (
            <div className="kampanya-aciklama" dangerouslySetInnerHTML={{ __html: aciklama }} />
          )}
        </header>

        {!gorselSrc ? (
          <p className="gorsel-yok">{gorselYokMetni ?? "Puzzle görseli seçilmedi."}</p>
        ) : (
          <div
            className="oyun-kutusu"
            style={{
              backgroundColor: tahtaArkaPlanRengi || undefined,
              borderRadius: `${kose}px`,
            }}
          >
            {sureLimitiAktif && oynaniyorMu && (
              <div className="sure-cizgisi" aria-hidden="true">
                <span
                  className={acilSure ? "sure-dolgu acil" : "sure-dolgu"}
                  style={{ width: `${sureYuzdesi}%` }}
                />
              </div>
            )}

            <div className="oyun-bar">
              <div
                className="ilerleme-alani"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={toplamParca}
                aria-valuenow={yerlesenler.length}
                aria-label={ilerlemeYazisi}
              >
                {pipGostergesi ? (
                  <div className="pip-satiri" aria-hidden="true">
                    {Array.from({ length: toplamParca }, (_, i) => (
                      <span
                        key={i}
                        className={i < yerlesenler.length ? "pip dolu" : "pip"}
                        style={{ transitionDelay: `${Math.min(i, 12) * 18}ms` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="ilerleme-cubugu" aria-hidden="true">
                    <span className="ilerleme-dolgu" style={{ width: `${yuzde}%` }} />
                  </div>
                )}
                <span className="ilerleme-yazisi">{ilerlemeYazisi}</span>
              </div>

              <div className="sayaclar">
                {sureLimitiAktif && (
                  <span className={acilSure ? "sayac sure acil" : "sayac sure"}>
                    <svg className="sayac-ikon" viewBox="0 0 16 16" aria-hidden="true">
                      <circle cx="8" cy="9" r="5.6" fill="none" stroke="currentColor" stroke-width="1.4" />
                      <path d="M8 6.2V9l1.9 1.2M6 1.8h4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                    </svg>
                    {metniDoldur(kalanSureMetni ?? "{sure}", { sure: sureBicimle(kalanSure) })}
                  </span>
                )}
                {hamleSayaciniGoster && (
                  <span className="sayac">
                    {metniDoldur(hamleMetni ?? "{hamle}", { hamle })}
                  </span>
                )}
                {tekrarOynanabilir && durum !== "hazir" && (
                  <button type="button" className="metin-buton" onClick={oyunuSifirla}>
                    {sifirlaButonMetni ?? "Yeniden karıştır"}
                  </button>
                )}
              </div>
            </div>

            <div className="oyun-sarmal">
              <PuzzleTahtasi
                gorselSrc={gorselSrc}
                satir={satir}
                sutun={sutun}
                tirtikOrani={tirtikOrani}
                zorluk={zorlukSeviyesi}
                tepsiKonumu={tepsiKonumu}
                rehberGoster={rehberGorseliGoster !== false}
                yanlisDavranis={yanlisParcaDavranisi}
                seed={`${anahtar}:${tur}`}
                aktif={oynaniyorMu}
                yerlesenler={yerlesenler}
                onYerlestir={parcaYerlesti}
                onHamle={hamleYapildi}
                tahtaArkaPlanRengi={tahtaArkaPlanRengi || "#ffffff"}
                parcaKenarRengi={parcaKenarRengi || "#ffffff"}
                golgeOrani={golgeOrani}
                koseYuvarlakligi={icKose}
                parcaAlEtiketi={parcaAlEtiketi ?? "Puzzle parçası {no}"}
                slotEtiketi={slotEtiketi ?? "{no}. parça yuvası"}
              />

              {durum === "hazir" && (
                <div className="ortu" style={{ borderRadius: `${icKose}px` }}>
                  <div className="ortu-kutu">
                    <button
                      type="button"
                      className={butonParlamasi === false ? "ana-buton" : "ana-buton parlak"}
                      onClick={oyunuBaslat}
                    >
                      {baslaButonMetni ?? "Puzzle'ı başlat"}
                    </button>
                    {oynanisIpucuMetni && <p className="ortu-ipucu">{oynanisIpucuMetni}</p>}
                    {sureLimitiAktif && sureBilgiMetni && (
                      <p className="ortu-sure">
                        <svg className="sayac-ikon" viewBox="0 0 16 16" aria-hidden="true">
                          <circle cx="8" cy="9" r="5.6" fill="none" stroke="currentColor" stroke-width="1.4" />
                          <path d="M8 6.2V9l1.9 1.2M6 1.8h4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                        </svg>
                        {metniDoldur(sureBilgiMetni, { sure: sureBicimle(toplamSure) })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {durum === "sureBitti" && (
                <div className="ortu" style={{ borderRadius: `${icKose}px` }}>
                  <div className="ortu-kutu">
                    <h3 className="ortu-baslik">{sureDolduBasligi ?? "Süre doldu"}</h3>
                    {sureDolduAciklamasi && <p className="ortu-metin">{sureDolduAciklamasi}</p>}
                    <button
                      type="button"
                      className={butonParlamasi === false ? "ana-buton" : "ana-buton parlak"}
                      onClick={oyunuSifirla}
                    >
                      {tekrarDeneButonMetni ?? "Tekrar dene"}
                    </button>
                  </div>
                </div>
              )}

              {durum === "tamamlandi" && konfetiEfekti !== false && (
                <Konfeti
                  seed={`${anahtar}:${tur}`}
                  renkler={[vurguRengi || "#111111", "#f2b705", "#e8552d", "#2f9e8f"]}
                />
              )}
            </div>

            {durum === "tamamlandi" && (
              <div className="odul-alani">
                <OdulPaneli
                  baslik={odulBasligi ?? "Tebrikler!"}
                  aciklamaHtml={odulAciklamasi}
                  gorselSrc={odulGorselSrc}
                  kuponKodu={kuponKodu}
                  kuponGoster={kuponKodunuGoster !== false}
                  kopyalaMetni={kopyalaButonMetni ?? "Kodu kopyala"}
                  kopyalandiMetni={kopyalandiMetni ?? "Kopyalandı!"}
                  butonMetni={odulButonMetni}
                  butonHref={odulBaglantisi?.href}
                  metinRengi={metinRengi || "#1d1d1f"}
                  vurguRengi={vurguRengi || "#1d1d1f"}
                  koseYuvarlakligi={kose}
                  butonParlamasi={butonParlamasi !== false}
                />

                {hediyeAdimiAktif && (
                  <HediyeSecimi
                    baslik={hediyeBasligi ?? "Hediyeni seç"}
                    aciklama={hediyeAciklamasi}
                    kartlar={hediyeKartlari}
                    ustProplar={props as Record<string, any>}
                    onayMetni={hediyeOnayMetni}
                    secildi={seciliHediye !== null}
                    metinRengi={metinRengi || "#1d1d1f"}
                    vurguRengi={vurguRengi || "#1d1d1f"}
                    bosMetin={hediyeBosMetni ?? ""}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default PuzzleKampanya;
