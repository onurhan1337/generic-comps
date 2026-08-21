import { observer } from "@ikas/component-utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  parcalariUret,
  parcaPathUret,
  tepsiPlanla,
  tolerans,
  metniDoldur,
  type ParcaTanimi,
} from "../../lib/puzzle";

interface Props {
  gorselSrc: string;
  satir: number;
  sutun: number;
  /** Tırtık yüksekliğinin hücre boyutuna oranı (0 = düz kare parçalar). */
  tirtikOrani: number;
  zorluk?: string;
  tepsiKonumu?: string;
  rehberGoster: boolean;
  yanlisDavranis?: string;
  seed: string;
  aktif: boolean;
  yerlesenler: number[];
  onYerlestir: (indeks: number) => void;
  onHamle: () => void;
  tahtaArkaPlanRengi: string;
  parcaKenarRengi: string;
  golgeOrani: number;
  koseYuvarlakligi: number;
  parcaAlEtiketi: string;
  slotEtiketi: string;
}

interface Konum {
  x: number;
  y: number;
}

interface Olculer {
  tahtaX: number;
  tahtaY: number;
  tahtaG: number;
  tahtaY_: number;
  tepsiX: number;
  tepsiY: number;
  tepsiG: number;
  tepsiYu: number;
}

/** Sürükleme sayılması için gereken en küçük hareket (piksel). */
const SURUKLEME_ESIGI = 5;

/** Alt tepsinin en fazla kaplayabileceği yükseklik (tahta yüksekliğine oranla ve mutlak). */
const ALT_TEPSI_ORANI = 0.62;
const ALT_TEPSI_AZAMI = 280;

const BOS_OLCU: Olculer = {
  tahtaX: 0,
  tahtaY: 0,
  tahtaG: 0,
  tahtaY_: 0,
  tepsiX: 0,
  tepsiY: 0,
  tepsiG: 0,
  tepsiYu: 0,
};

const PuzzleTahtasi = observer(function PuzzleTahtasi({
  gorselSrc,
  satir,
  sutun,
  tirtikOrani,
  zorluk,
  tepsiKonumu,
  rehberGoster,
  yanlisDavranis,
  seed,
  aktif,
  yerlesenler,
  onYerlestir,
  onHamle,
  tahtaArkaPlanRengi,
  parcaKenarRengi,
  golgeOrani,
  koseYuvarlakligi,
  parcaAlEtiketi,
  slotEtiketi,
}: Props) {
  const alanRef = useRef<HTMLDivElement | null>(null);
  const tahtaRef = useRef<HTMLDivElement | null>(null);
  const tepsiRef = useRef<HTMLDivElement | null>(null);

  const [olcu, setOlcu] = useState<Olculer>(BOS_OLCU);
  const [oran, setOran] = useState(1);
  const [serbestKonumlar, setSerbestKonumlar] = useState<Record<number, Konum>>({});
  const [suruklenen, setSuruklenen] = useState<number | null>(null);
  const [secili, setSecili] = useState<number | null>(null);
  const [sonYerlesen, setSonYerlesen] = useState<number | null>(null);
  const [genisEkran, setGenisEkran] = useState(false);
  const tutmaFarki = useRef<Konum>({ x: 0, y: 0 });
  const baslangicNoktasi = useRef<Konum>({ x: 0, y: 0 });
  const hareketEtti = useRef(false);

  // clipPath id'leri sayfa genelinde benzersiz olmalı — aynı bölüm iki kez
  // yerleştirilirse parçalar birbirinin maskesini kullanmasın.
  const kimlik = useMemo(
    () => `pz${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  const parcalar = useMemo(
    () => parcalariUret(satir, sutun, `${seed}:${satir}x${sutun}`),
    [satir, sutun, seed]
  );

  // Yan tepsi yalnızca geniş ekranlarda kullanılır — styles.css'teki
  // `max-width: 900px` kuralının karşılığı.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const sorgu = window.matchMedia("(min-width: 901px)");
    const uygula = () => setGenisEkran(sorgu.matches);
    uygula();
    sorgu.addEventListener("change", uygula);
    return () => sorgu.removeEventListener("change", uygula);
  }, []);

  // Görselin en-boy oranını oku; tahta bu orana göre şekillenir.
  useEffect(() => {
    if (!gorselSrc || typeof window === "undefined") return;
    const gorsel = new window.Image();
    gorsel.onload = () => {
      if (gorsel.naturalWidth && gorsel.naturalHeight) {
        setOran(gorsel.naturalWidth / gorsel.naturalHeight);
      }
    };
    gorsel.src = gorselSrc;
  }, [gorselSrc]);

  // Tahta ve tepsi ölçülerini takip et — parça konumları bunlara göre hesaplanır.
  const olcuAl = useCallback(() => {
    const alan = alanRef.current;
    const tahta = tahtaRef.current;
    const tepsi = tepsiRef.current;
    if (!alan || !tahta || !tepsi) return;
    const a = alan.getBoundingClientRect();
    const t = tahta.getBoundingClientRect();
    const p = tepsi.getBoundingClientRect();
    const yeni: Olculer = {
      tahtaX: t.left - a.left,
      tahtaY: t.top - a.top,
      tahtaG: t.width,
      tahtaY_: t.height,
      tepsiX: p.left - a.left,
      tepsiY: p.top - a.top,
      tepsiG: p.width,
      tepsiYu: p.height,
    };
    // Değer değişmediyse state'i güncelleme — gereksiz render ve olası
    // ölçüm/yerleşim geri besleme döngülerini engeller.
    setOlcu((onceki) =>
      (Object.keys(yeni) as Array<keyof Olculer>).every(
        (anahtar) => Math.abs(onceki[anahtar] - yeni[anahtar]) < 0.5
      )
        ? onceki
        : yeni
    );
  }, []);

  useEffect(() => {
    olcuAl();
    if (typeof ResizeObserver === "undefined") return;
    const gozlemci = new ResizeObserver(() => olcuAl());
    if (alanRef.current) gozlemci.observe(alanRef.current);
    if (tahtaRef.current) gozlemci.observe(tahtaRef.current);
    if (tepsiRef.current) gozlemci.observe(tepsiRef.current);
    return () => gozlemci.disconnect();
  }, [olcuAl, oran, tepsiKonumu]);

  // Yeniden karıştırıldığında serbest konumları da temizle.
  useEffect(() => {
    setSerbestKonumlar({});
    setSecili(null);
  }, [seed, satir, sutun]);

  // Tahtanın yüksekliği ÖLÇÜLMEZ, genişlik ve en-boy oranından hesaplanır.
  // Ölçmek, esnek yerleşimde geri besleme döngüsü yaratıyordu: tepsi uzuyor →
  // satır uzuyor → tahta geriliyor → hücreler büyüyor → tepsi daha da uzuyor.
  const tahtaYukseklik = oran > 0 ? olcu.tahtaG / oran : olcu.tahtaG;
  const hucreG = olcu.tahtaG / sutun;
  const hucreY = tahtaYukseklik / satir;
  const tirtik = Math.min(hucreG, hucreY) * tirtikOrani;
  const kutuG = hucreG + tirtik * 2;
  const kutuY = hucreY + tirtik * 2;
  const olculerHazir = olcu.tahtaG > 0 && tahtaYukseklik > 0;

  const yerlesenKumesi = useMemo(() => new Set(yerlesenler), [yerlesenler]);

  const hedefKonum = useCallback(
    (p: ParcaTanimi): Konum => ({
      x: olcu.tahtaX + p.sutun * hucreG - tirtik,
      y: olcu.tahtaY + p.satir * hucreY - tirtik,
    }),
    [olcu.tahtaX, olcu.tahtaY, hucreG, hucreY, tirtik]
  );

  // Tepsi tahtanın yanında mı duruyor? Bu karar ÖLÇÜMDEN çıkarılmaz: tepsinin
  // yüksekliği kararı, kararın kendisi de ölçümü etkilediği için iki durum
  // arasında salınım oluşuyordu. Bunun yerine stylesheet'teki kırılma noktasının
  // birebir aynısı sorgulanır.
  const yanYana = genisEkran && (tepsiKonumu === "sag" || tepsiKonumu === "sol");

  const hedefTepsiYuksekligi = yanYana
    ? tahtaYukseklik
    : Math.min(ALT_TEPSI_AZAMI, tahtaYukseklik * ALT_TEPSI_ORANI);

  const plan = useMemo(
    () => tepsiPlanla(olcu.tepsiG, hedefTepsiYuksekligi, kutuG, kutuY, parcalar.length),
    [olcu.tepsiG, hedefTepsiYuksekligi, kutuG, kutuY, parcalar.length]
  );

  const tepsiOlcegi = plan.olcek;
  const tepsiKutuG = kutuG * tepsiOlcegi;
  const tepsiKutuY = kutuY * tepsiOlcegi;
  const duzen = plan;

  const tepsiKonumuHesapla = useCallback(
    (p: ParcaTanimi): Konum => {
      const sutunNo = p.tepsiSira % duzen.sutunSayisi;
      const satirNo = Math.floor(p.tepsiSira / duzen.sutunSayisi);
      const adimX =
        duzen.sutunSayisi > 1
          ? Math.max(0, olcu.tepsiG - tepsiKutuG) / (duzen.sutunSayisi - 1)
          : 0;
      const adimY = tepsiKutuY * 0.52;
      const ustBosluk = Math.max(
        0,
        (olcu.tepsiYu - (tepsiKutuY + (duzen.satirSayisi - 1) * adimY)) / 2
      );
      // Görünen (ölçeklenmiş) sol-üst köşenin olması gereken yer
      const gorunenX =
        olcu.tepsiX +
        (duzen.sutunSayisi > 1 ? sutunNo * adimX : Math.max(0, olcu.tepsiG - tepsiKutuG) / 2) +
        p.sapmaX * tepsiKutuG * 0.3;
      const gorunenY = olcu.tepsiY + ustBosluk + satirNo * adimY + p.sapmaY * tepsiKutuY * 0.14;
      // Sapma parçayı tepsinin dışına taşırmasın
      const sinirliX = Math.min(
        Math.max(gorunenX, olcu.tepsiX),
        olcu.tepsiX + Math.max(0, olcu.tepsiG - tepsiKutuG)
      );
      // transform-origin merkez olduğu için CSS left/top bu kadar geri alınır
      return {
        x: sinirliX - (kutuG * (1 - tepsiOlcegi)) / 2,
        y: gorunenY - (kutuY * (1 - tepsiOlcegi)) / 2,
      };
    },
    [olcu.tepsiX, olcu.tepsiY, olcu.tepsiG, olcu.tepsiYu, kutuG, kutuY, tepsiKutuG, tepsiKutuY, tepsiOlcegi, duzen]
  );

  /** Parça tepside mi duruyor (yani küçültülmüş mü)? */
  const tepsideMi = useCallback(
    (p: ParcaTanimi) =>
      !yerlesenKumesi.has(p.indeks) && !serbestKonumlar[p.indeks],
    [yerlesenKumesi, serbestKonumlar]
  );

  const parcaKonumu = useCallback(
    (p: ParcaTanimi): Konum => {
      if (yerlesenKumesi.has(p.indeks)) return hedefKonum(p);
      const serbest = serbestKonumlar[p.indeks];
      if (serbest) return serbest;
      return tepsiKonumuHesapla(p);
    },
    [yerlesenKumesi, hedefKonum, serbestKonumlar, tepsiKonumuHesapla]
  );

  const yerlestirmeyiDene = useCallback(
    (p: ParcaTanimi, konum: Konum): boolean => {
      const hedef = hedefKonum(p);
      const mesafe = Math.hypot(konum.x - hedef.x, konum.y - hedef.y);
      const esik = Math.min(hucreG, hucreY) * tolerans(zorluk);
      if (mesafe <= esik) {
        onYerlestir(p.indeks);
        setSonYerlesen(p.indeks);
        setSerbestKonumlar((onceki) => {
          const yeni = { ...onceki };
          delete yeni[p.indeks];
          return yeni;
        });
        return true;
      }
      return false;
    },
    [hedefKonum, hucreG, hucreY, zorluk, onYerlestir]
  );

  const parcayiBirak = useCallback(
    (p: ParcaTanimi, konum: Konum) => {
      onHamle();
      if (yerlestirmeyiDene(p, konum)) return;
      if (yanlisDavranis === "kal") {
        setSerbestKonumlar((onceki) => ({ ...onceki, [p.indeks]: konum }));
      } else {
        setSerbestKonumlar((onceki) => {
          const yeni = { ...onceki };
          delete yeni[p.indeks];
          return yeni;
        });
      }
    },
    [onHamle, yerlestirmeyiDene, yanlisDavranis]
  );

  const isaretciBasti = (olay: PointerEvent, p: ParcaTanimi) => {
    if (!aktif || yerlesenKumesi.has(p.indeks)) return;
    const alan = alanRef.current;
    if (!alan) return;
    olay.preventDefault();
    const a = alan.getBoundingClientRect();
    const mevcut = parcaKonumu(p);
    const olcek = tepsideMi(p) ? tepsiOlcegi : 1;
    // Görünen kutunun sol-üst köşesi (ölçek merkezden uygulandığı için düzeltilir)
    const gorunenX = mevcut.x + (kutuG * (1 - olcek)) / 2;
    const gorunenY = mevcut.y + (kutuY * (1 - olcek)) / 2;
    // Tutulan nokta parçanın neresine denk geliyor (0..1) — parça büyürken korunur
    tutmaFarki.current = {
      x: ((olay.clientX - a.left - gorunenX) / (kutuG * olcek)) * kutuG,
      y: ((olay.clientY - a.top - gorunenY) / (kutuY * olcek)) * kutuY,
    };
    baslangicNoktasi.current = { x: olay.clientX, y: olay.clientY };
    hareketEtti.current = false;
    setSuruklenen(p.indeks);
    setSecili(p.indeks);
    (olay.currentTarget as HTMLElement).setPointerCapture(olay.pointerId);
  };

  const isaretciHareket = (olay: PointerEvent, p: ParcaTanimi) => {
    if (suruklenen !== p.indeks) return;
    const alan = alanRef.current;
    if (!alan) return;
    // Parmakla dokunurken küçük titremeler sürükleme sayılmasın; eşik altındaki
    // hareketler "tıklama" olarak kalır ve tıkla-seç akışı bozulmaz.
    const kayma = Math.hypot(
      olay.clientX - baslangicNoktasi.current.x,
      olay.clientY - baslangicNoktasi.current.y
    );
    if (!hareketEtti.current && kayma < SURUKLEME_ESIGI) return;
    hareketEtti.current = true;

    const a = alan.getBoundingClientRect();
    const yeni = {
      x: olay.clientX - a.left - tutmaFarki.current.x,
      y: olay.clientY - a.top - tutmaFarki.current.y,
    };
    setSerbestKonumlar((onceki) => ({ ...onceki, [p.indeks]: yeni }));
  };

  const isaretciBirakti = (olay: PointerEvent, p: ParcaTanimi) => {
    if (suruklenen !== p.indeks) return;
    setSuruklenen(null);
    try {
      (olay.currentTarget as HTMLElement).releasePointerCapture(olay.pointerId);
    } catch {
      // yakalama zaten bırakılmışsa sorun değil
    }
    if (!hareketEtti.current) {
      // Sürüklemeden tıklandı: parça seçili kalsın, yuvaya tıklanarak yerleştirilsin.
      return;
    }
    const konum = serbestKonumlar[p.indeks] ?? parcaKonumu(p);
    parcayiBirak(p, konum);
  };

  /** Tıkla-seç → yuvaya tıkla akışı. Dokunmatik ve klavye için sürüklemeye alternatif. */
  const yuvayaTikla = (satirNo: number, sutunNo: number) => {
    if (!aktif || secili === null) return;
    const parca = parcalar.find((p) => p.indeks === secili);
    if (!parca) return;
    onHamle();
    if (parca.satir === satirNo && parca.sutun === sutunNo) {
      onYerlestir(parca.indeks);
      setSonYerlesen(parca.indeks);
      setSerbestKonumlar((onceki) => {
        const yeni = { ...onceki };
        delete yeni[parca.indeks];
        return yeni;
      });
    }
    setSecili(null);
  };

  const hepsiYerlesti = olculerHazir && yerlesenKumesi.size >= parcalar.length;
  const golge = Math.max(0, Math.min(1, golgeOrani));
  const alanSinifi = [
    "puzzle-alan",
    `tepsi-${tepsiKonumu ?? "alt"}`,
    aktif ? "aktif" : "pasif",
  ].join(" ");

  return (
    <div className={alanSinifi} ref={alanRef}>
      <div
        className="tahta"
        ref={tahtaRef}
        style={{
          aspectRatio: String(oran),
          backgroundColor: tahtaArkaPlanRengi,
          borderRadius: `${koseYuvarlakligi}px`,
        }}
      >
        {rehberGoster && gorselSrc && (
          <div
            className="rehber"
            style={{ backgroundImage: `url("${gorselSrc}")`, borderRadius: `${koseYuvarlakligi}px` }}
          />
        )}

        {/* Boş yuvaların soluk puzzle çizgileri — parçaların nereye gideceğini gösterir */}
        {olculerHazir && (
          <svg
            className="yuva-cizgileri"
            viewBox={`0 0 ${olcu.tahtaG} ${tahtaYukseklik}`}
            aria-hidden="true"
          >
            {parcalar.map((p) => (
              <path
                key={`yuva-${p.indeks}`}
                d={parcaPathUret(p.kenarlar, hucreG, hucreY, tirtik)}
                transform={`translate(${p.sutun * hucreG - tirtik}, ${p.satir * hucreY - tirtik})`}
                className={yerlesenKumesi.has(p.indeks) ? "yuva-dolu" : "yuva-bos"}
              />
            ))}
          </svg>
        )}

        {/* Klavye ve dokunmatik için tıklanabilir yuvalar */}
        {olculerHazir &&
          parcalar.map((p) => (
            <button
              key={`btn-${p.indeks}`}
              type="button"
              className="yuva-dugmesi"
              style={{
                left: `${p.sutun * hucreG}px`,
                top: `${p.satir * hucreY}px`,
                width: `${hucreG}px`,
                height: `${hucreY}px`,
              }}
              aria-label={metniDoldur(slotEtiketi, { no: p.indeks + 1 })}
              disabled={!aktif || yerlesenKumesi.has(p.indeks) || secili === null}
              onClick={() => yuvayaTikla(p.satir, p.sutun)}
            />
          ))}
      </div>

      <div
        className={hepsiYerlesti ? "tepsi bos" : "tepsi"}
        ref={tepsiRef}
        style={{
          backgroundColor: tahtaArkaPlanRengi,
          borderRadius: `${koseYuvarlakligi}px`,
          height: hepsiYerlesti
            ? "0px"
            : olculerHazir
              ? `${yanYana ? tahtaYukseklik : plan.yukseklik}px`
              : undefined,
        }}
      />

      {/* Parça maskeleri — clipPath tanımları */}
      {olculerHazir && (
        <svg className="maske-tanimlari" aria-hidden="true">
          <defs>
            {parcalar.map((p) => (
              <clipPath key={`clip-${p.indeks}`} id={`${kimlik}-${p.indeks}`} clipPathUnits="userSpaceOnUse">
                <path d={parcaPathUret(p.kenarlar, hucreG, hucreY, tirtik)} />
              </clipPath>
            ))}
          </defs>
        </svg>
      )}

      {/* Parçalar — hepsi alanın koordinat düzleminde mutlak konumlanır */}
      {olculerHazir &&
        gorselSrc &&
        parcalar.map((p) => {
          const yerlesti = yerlesenKumesi.has(p.indeks);
          const konum = parcaKonumu(p);
          const suruklenyor = suruklenen === p.indeks;
          const path = parcaPathUret(p.kenarlar, hucreG, hucreY, tirtik);
          const sinif = [
            "parca",
            yerlesti ? "yerlesti" : "serbest",
            suruklenyor ? "suruklenyor" : "",
            secili === p.indeks && !yerlesti ? "secili" : "",
            sonYerlesen === p.indeks ? "oturdu" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={`parca-${p.indeks}`}
              className={sinif}
              role={yerlesti ? "presentation" : "button"}
              tabIndex={yerlesti || !aktif ? -1 : 0}
              aria-label={yerlesti ? undefined : metniDoldur(parcaAlEtiketi, { no: p.indeks + 1 })}
              aria-pressed={yerlesti ? undefined : secili === p.indeks}
              style={{
                left: `${konum.x}px`,
                top: `${konum.y}px`,
                width: `${kutuG}px`,
                height: `${kutuY}px`,
                transform: yerlesti
                  ? "rotate(0deg)"
                  : tepsideMi(p) && !suruklenyor
                    ? `rotate(${p.egiklik}deg) scale(${tepsiOlcegi})`
                    : "rotate(0deg)",
                zIndex: suruklenyor ? 40 : yerlesti ? 10 : 20,
                filter: `drop-shadow(0 ${suruklenyor ? 10 : 3}px ${
                  suruklenyor ? 18 : 6
                }px rgba(0,0,0,${(yerlesti ? golge * 0.35 : golge) * 0.5}))`,
              }}
              onPointerDown={(olay: PointerEvent) => isaretciBasti(olay, p)}
              onPointerMove={(olay: PointerEvent) => isaretciHareket(olay, p)}
              onPointerUp={(olay: PointerEvent) => isaretciBirakti(olay, p)}
              onPointerCancel={(olay: PointerEvent) => isaretciBirakti(olay, p)}
              onKeyDown={(olay: KeyboardEvent) => {
                if (yerlesti || !aktif) return;
                if (olay.key === "Enter" || olay.key === " ") {
                  olay.preventDefault();
                  setSecili((onceki) => (onceki === p.indeks ? null : p.indeks));
                }
              }}
            >
              <div
                className="parca-yuz"
                style={{
                  clipPath: `url(#${kimlik}-${p.indeks})`,
                  backgroundImage: `url("${gorselSrc}")`,
                  backgroundSize: `${olcu.tahtaG}px ${tahtaYukseklik}px`,
                  backgroundPosition: `${-(p.sutun * hucreG - tirtik)}px ${-(
                    p.satir * hucreY -
                    tirtik
                  )}px`,
                }}
              />
              <svg className="parca-kenar" viewBox={`0 0 ${kutuG} ${kutuY}`} aria-hidden="true">
                <path d={path} fill="none" stroke={parcaKenarRengi} strokeWidth={1.25} />
              </svg>
            </div>
          );
        })}
    </div>
  );
});

export default PuzzleTahtasi;
