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
  hediyeDurumIstegineAbone,
  hediyeDurumuYayinla,
  hediyeSecimineAbone,
  type HediyeSecimDetayi,
} from "../../lib/hediye-secim";
import { metniDoldur, sureBicimle } from "../../lib/puzzle";
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
 * Rozet ikonu. Tahtadaki parça üreteci gerçek jigsaw eğrileri çiziyor ama o
 * silüet 16 piksele indiğinde okunmuyordu; bu yüzden rozet, aynı fikrin
 * elle sadeleştirilmiş hâli: üstte topuz, sağda girinti.
 */
const ROZET_PATH =
  "M6 4h4a2.4 2.4 0 1 1 4.8 0H19a1.2 1.2 0 0 1 1.2 1.2V10a2.4 2.4 0 1 0 0 4.8v4.8a1.2 1.2 0 0 1-1.2 1.2H5.2A1.2 1.2 0 0 1 4 19.6V5.2A1.2 1.2 0 0 1 5.2 4z";

/**
 * Bölümün yazı tipi. Mağazanın temasından bağımsız olarak her yerde aynı
 * premium görünümü versin diye sabit: önce mağazada yüklüyse dar-geniş
 * "display" kesimleri, sonra platformun kendi sistem yüz(ler)i.
 */
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
    hediyeKutuModu,
    kutuKilitliMetni,
    baslaButonMetni,
    sifirlaButonMetni,
    yenidenBaslaButonMetni,
    hediyeKullanildiMetni,
    karistirmaHakki,
    karistirmaHakkiMetni,
    hakBittiMetni,
    tepsiTamamlandiMetni,
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
  const [karistirmaSayisi, setKaristirmaSayisi] = useState(0);
  // Önceki turlarda alınmış hediyeler, kartın slot içindeki sırasına göre.
  // Kart kimlikleri her turda yenilendiği, başlıklar ise aynı olabildiği için
  // (üç kart da "Sürpriz Hediye" olabilir) kalıcı referans sıra numarasıdır.
  const [kullanilanIndeksler, setKullanilanIndeksler] = useState<number[]>([]);
  const seciliIndeksRef = useRef<number | null>(null);
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
    if (kayit.tamamlandi) {
      setHamle(kayit.hamle ?? 0);
      setYerlesenler(Array.isArray(kayit.yerlesenler) ? kayit.yerlesenler : []);
      setDurum("tamamlandi");
      return;
    }
    // Geri sayımlı oyunda yarım ilerleme geri yüklenmez: sayaç ancak kullanıcı
    // "başlat" dediğinde işlemeli, sayfa açılır açılmaz değil.
    if (sureLimitiAktif) return;
    setHamle(kayit.hamle ?? 0);
    setYerlesenler(Array.isArray(kayit.yerlesenler) ? kayit.yerlesenler : []);
    if ((kayit.yerlesenler?.length ?? 0) > 0) setDurum("oynaniyor");
  }, [kaydetmeAnahtari, ilerlemeyiHatirla, sureLimitiAktif]);

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

  // Karıştırma hakkı ziyaret başına verilir; ayar değiştiğinde de sıfırlanır.
  // Kalıcı saklansaydı önceki oturumların denemeleri hakkı tüketmiş görünürdü.
  useEffect(() => {
    setKaristirmaSayisi(0);
  }, [karistirmaHakki, kaydetmeAnahtari]);

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

  const turuSifirla = useCallback(
    (hakHarca: boolean) => {
      if (hakHarca) setKaristirmaSayisi((onceki) => onceki + 1);
      setTur((onceki) => onceki + 1);
      setYerlesenler([]);
      setHamle(0);
      setKalanSure(toplamSure);
      setSeciliHediye(null);
      // Geri sayımlı oyun kendiliğinden başlamaz; kullanıcı yeniden "başlat" der.
      setDurum(sureLimitiAktif ? "hazir" : "oynaniyor");
      durumuSil(kaydetmeAnahtari);
    },
    [toplamSure, kaydetmeAnahtari, sureLimitiAktif]
  );

  /** Oyun sırasında yeniden karıştırma — hak harcar. */
  const oyunuSifirla = useCallback(() => turuSifirla(true), [turuSifirla]);

  /** Tamamlandıktan sonra yeniden oynama — alınan hediye artık seçilemez. */
  const yenidenBasla = useCallback(() => {
    const alinan = seciliIndeksRef.current;
    if (alinan !== null) {
      setKullanilanIndeksler((onceki) =>
        onceki.includes(alinan) ? onceki : [...onceki, alinan]
      );
    }
    seciliIndeksRef.current = null;
    turuSifirla(false);
  }, [turuSifirla]);

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
      seciliIndeksRef.current = typeof detay.indeks === "number" ? detay.indeks : null;

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

  // Kutu modunda bir kutu açıldıysa diğerleri kilitlenir. Kartlar ayrı paketlerde
  // çalıştığı için durum olay yoluyla yayınlanır; kartlar mount olduklarında da
  // güncel durumu ister (aşağıdaki istek aboneliği ona cevap verir).
  const hediyeDurumu = useMemo(
    () => ({
      seciliKartId: seciliHediye,
      kutuModu: hediyeKutuModu !== false,
      kilitli: seciliHediye !== null,
      kilitMetni: kutuKilitliMetni ?? "Bu tur için bir kutu açtın",
      kullanilanIndeksler,
      kullanildiMetni: hediyeKullanildiMetni ?? "Bu hediyeyi zaten aldın",
    }),
    [seciliHediye, hediyeKutuModu, kutuKilitliMetni, kullanilanIndeksler, hediyeKullanildiMetni]
  );

  useEffect(() => {
    if (!hediyeAdimiAktif) return;
    hediyeDurumuYayinla(hediyeDurumu);
    return hediyeDurumIstegineAbone(() => hediyeDurumuYayinla(hediyeDurumu));
  }, [hediyeAdimiAktif, hediyeDurumu]);

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

  // Yeniden karıştırma hakkı — 0 girildiyse sınırsız.
  const karistirmaLimiti = Math.max(0, Math.round(karistirmaHakki ?? 0));
  const sinirliHak = karistirmaLimiti > 0;
  const kalanHak = sinirliHak ? Math.max(0, karistirmaLimiti - karistirmaSayisi) : Infinity;
  const hakVar = kalanHak > 0;
  const sifirlaYazisi = sinirliHak
    ? metniDoldur(karistirmaHakkiMetni ?? "Yeniden karıştır ({kalan})", { kalan: kalanHak })
    : sifirlaButonMetni ?? "Yeniden karıştır";
  const hakBittiYazisi = hakBittiMetni ?? "Karıştırma hakkın bitti";

  // Sürpriz kutu adımı tahtanın üstünde oynanır: puzzle tamamlanınca kutular
  // görselin üzerine geliyor, biri açılınca ödül şeridi aşağıda beliriyor.
  const kutuAdimi =
    Boolean(hediyeAdimiAktif) && hediyeKutuModu !== false && durum === "tamamlandi";
  const kutuAcildi = seciliHediye !== null;
  const odulGorunur = durum === "tamamlandi" && (!kutuAdimi || kutuAcildi);
  // Kutu adımında konfeti kutu açıldığında patlar — asıl "kazandın" anı orası.
  const konfetiGorunur =
    konfetiEfekti !== false && durum === "tamamlandi" && (!kutuAdimi || kutuAcildi);
  const yuzde = toplamParca > 0 ? (yerlesenler.length / toplamParca) * 100 : 0;

  // Son çeyrekte (ya da son 10 saniyede) geri sayım "acil" moda geçer.
  const acilEsigi = Math.max(10, Math.round(toplamSure * 0.25));
  const acilSure = Boolean(sureLimitiAktif) && oynaniyorMu && kalanSure <= acilEsigi;

  // Az sayıda parçada tek tek kutucuk, çok parçada sürekli çubuk daha okunur.
  const pipGostergesi = toplamParca <= 20;

  const kokDegiskenleri = {
    "--pk-vurgu": vurguRengi || "#1d1d1f",
    "--pk-vurgu-metin": vurguMetinRengi || "#ffffff",
    "--pk-uyari": uyariRengi || "#d93025",
    "--pk-yuzey": tahtaArkaPlanRengi || "#ffffff",
    "--pk-kose": `${kose}px`,
    "--pk-ic-kose": `${icKose}px`,
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
              <svg className="etiket-ikon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d={ROZET_PATH}
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.9"
                  stroke-linejoin="round"
                />
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
                {tekrarOynanabilir &&
                  oynaniyorMu &&
                  (hakVar ? (
                    <button type="button" className="metin-buton" onClick={oyunuSifirla}>
                      {sifirlaYazisi}
                    </button>
                  ) : (
                    <span className="sayac bitti">{hakBittiYazisi}</span>
                  ))}
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
                tamamlandiMetni={tepsiTamamlandiMetni ?? "Tüm parçalar yerleşti"}
                tamamlandi={durum === "tamamlandi"}
                onizleme={durum === "hazir"}
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
                    {hakVar ? (
                      <button
                        type="button"
                        className={butonParlamasi === false ? "ana-buton" : "ana-buton parlak"}
                        onClick={oyunuSifirla}
                      >
                        {tekrarDeneButonMetni ?? "Tekrar dene"}
                      </button>
                    ) : (
                      <p className="ortu-sure">{hakBittiYazisi}</p>
                    )}
                  </div>
                </div>
              )}

              {kutuAdimi && (
                <div className="ortu kutu-ortu" style={{ borderRadius: `${icKose}px` }}>
                  <div className="ortu-kutu genis">
                    <HediyeSecimi
                      baslik={hediyeBasligi ?? "Hediyeni seç"}
                      aciklama={hediyeAciklamasi}
                      kartlar={hediyeKartlari}
                      ustProplar={props as Record<string, any>}
                      onayMetni={hediyeOnayMetni}
                      secildi={kutuAcildi}
                      metinRengi={metinRengi || "#1d1d1f"}
                      vurguRengi={vurguRengi || "#1d1d1f"}
                      bosMetin={hediyeBosMetni ?? ""}
                      sade
                    />
                    {tekrarOynanabilir && (
                      <button type="button" className="ikincil-buton" onClick={yenidenBasla}>
                        {yenidenBaslaButonMetni ?? "Yeniden başla"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {konfetiGorunur && (
                <Konfeti
                  seed={`${anahtar}:${tur}:${seciliHediye ?? ""}`}
                  renkler={[vurguRengi || "#111111", "#f2b705", "#e8552d", "#2f9e8f"]}
                />
              )}
            </div>

            {odulGorunur && (
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

                {hediyeAdimiAktif && !kutuAdimi && (
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

                {tekrarOynanabilir && !kutuAdimi && (
                  <div className="odul-tekrar">
                    <button type="button" className="ikincil-buton" onClick={yenidenBasla}>
                      {yenidenBaslaButonMetni ?? "Yeniden başla"}
                    </button>
                  </div>
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
