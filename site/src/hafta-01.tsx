import { render } from "preact";
import { useState } from "preact/hooks";
import PuzzleKampanya from "../../src/components/PuzzleKampanya";
import PuzzleHediyeKarti from "../../src/components/PuzzleHediyeKarti";
import "../../src/components/PuzzleKampanya/styles.css";
import "../../src/components/PuzzleHediyeKarti/styles.css";
import "./ortak";
import { propTablosuBas } from "./prop-tablosu";
import "./demo.css";

const GORSEL = { src: `${import.meta.env.BASE_URL}demo/puzzle-gorseli.svg` };
const ANAHTAR = "vitrin";

const HEDIYELER = [
  { hediyeBasligi: "Ekstra %10 indirim", hediyeAciklamasi: "Sepetine otomatik uygulanır", rozetMetni: "İndirim" },
  { hediyeBasligi: "Seyahat boy parfüm", hediyeAciklamasi: "10 ml, kampanyaya özel", rozetMetni: "Hediye" },
  { hediyeBasligi: "Ücretsiz kargo", hediyeAciklamasi: "Bu siparişe özel", rozetMetni: "Kargo" },
];

const aralik = (deger: number, birim: string | null = null) => ({ value: deger, unit: birim }) as any;

/** Bölümün kendi kayıt biçimine yazarak "tamamlanmış" durumu önizler. */
function cozulmusYaz(anahtar: string, satir: number, sutun: number) {
  try {
    localStorage.setItem(
      `ikas-puzzle:${anahtar}:${satir}x${sutun}`,
      JSON.stringify({
        tur: 0,
        yerlesenler: Array.from({ length: satir * sutun }, (_, i) => i),
        hamle: satir * sutun,
        tamamlandi: true,
      })
    );
  } catch {
    // depolama kapalıysa önizleme atlanır
  }
}

function kayitSil(anahtar: string, satir: number, sutun: number) {
  try {
    localStorage.removeItem(`ikas-puzzle:${anahtar}:${satir}x${sutun}`);
  } catch {
    // yoksayılabilir
  }
}

function PuzzleDemo() {
  const [satir, setSatir] = useState(3);
  const [sutun, setSutun] = useState(3);
  const [tirtik, setTirtik] = useState(24);
  const [zorluk, setZorluk] = useState("kolay");
  const [tepsi, setTepsi] = useState("alt");
  const [sureli, setSureli] = useState(false);
  const [hediye, setHediye] = useState(true);
  const [vurgu, setVurgu] = useState("#1d1d1f");
  const [kutuModu, setKutuModu] = useState(true);
  const [karistirmaHakki, setKaristirmaHakki] = useState(0);
  const [surum, setSurum] = useState(0);

  const yenile = (islem?: () => void) => {
    islem?.();
    setSurum((s) => s + 1);
  };

  const boyutDegistir = (s: number, u: number) => {
    kayitSil(ANAHTAR, s, u);
    setSatir(s);
    setSutun(u);
    setSurum((v) => v + 1);
  };

  return (
    <div className="demo-sarmal">
      <div className="demo-ayarlar">
        <label>
          Parça
          <select
            value={`${satir}x${sutun}`}
            onChange={(e) => {
              const [s, u] = (e.target as HTMLSelectElement).value.split("x").map(Number);
              boyutDegistir(s, u);
            }}
          >
            <option value="2x2">2 × 2</option>
            <option value="3x3">3 × 3</option>
            <option value="4x3">4 × 3</option>
            <option value="4x4">4 × 4</option>
            <option value="5x5">5 × 5</option>
          </select>
        </label>
        <label>
          Tırtık
          <input
            type="range"
            min={0}
            max={40}
            step={2}
            value={tirtik}
            onInput={(e) => setTirtik(Number((e.target as HTMLInputElement).value))}
          />
          <span className="deger">%{tirtik}</span>
        </label>
        <label>
          Zorluk
          <select value={zorluk} onChange={(e) => setZorluk((e.target as HTMLSelectElement).value)}>
            <option value="kolay">Kolay</option>
            <option value="orta">Orta</option>
            <option value="zor">Zor</option>
          </select>
        </label>
        <label>
          Tepsi
          <select value={tepsi} onChange={(e) => setTepsi((e.target as HTMLSelectElement).value)}>
            <option value="alt">Altta</option>
            <option value="sag">Sağda</option>
            <option value="sol">Solda</option>
          </select>
        </label>
        <label>
          Vurgu
          <select value={vurgu} onChange={(e) => setVurgu((e.target as HTMLSelectElement).value)}>
            <option value="#1d1d1f">Grafit</option>
            <option value="#0a84ff">Mavi</option>
            <option value="#8a5cf6">Mor</option>
            <option value="#0f7b6c">Yeşil</option>
          </select>
        </label>
        <label className="onay">
          <input
            type="checkbox"
            checked={sureli}
            onChange={(e) => yenile(() => setSureli((e.target as HTMLInputElement).checked))}
          />
          Süre limiti
        </label>
        <label>
          Karıştırma hakkı
          <select
            value={String(karistirmaHakki)}
            onChange={(e) => setKaristirmaHakki(Number((e.target as HTMLSelectElement).value))}
          >
            <option value="0">Sınırsız</option>
            <option value="1">1 hak</option>
            <option value="3">3 hak</option>
          </select>
        </label>
        <label className="onay">
          <input
            type="checkbox"
            checked={kutuModu}
            onChange={(e) => setKutuModu((e.target as HTMLInputElement).checked)}
          />
          Sürpriz kutu
        </label>
        <label className="onay">
          <input
            type="checkbox"
            checked={hediye}
            onChange={(e) => setHediye((e.target as HTMLInputElement).checked)}
          />
          Hediye adımı
        </label>
        <button
          type="button"
          className="demo-buton"
          onClick={() => yenile(() => kayitSil(ANAHTAR, satir, sutun))}
        >
          Sıfırla
        </button>
        <button
          type="button"
          className="demo-buton"
          onClick={() => yenile(() => cozulmusYaz(ANAHTAR, satir, sutun))}
        >
          Ödülü göster
        </button>
      </div>

      <PuzzleKampanya
        key={surum}
        ustEtiket="Mini oyun"
        baslik="Puzzle'ı tamamla, hediyeni kap"
        aciklama="<p>Parçaları doğru yerlerine sürükle. Görseli tamamladığında ödülün açılacak.</p>"
        puzzleGorseli={GORSEL as any}
        satirSayisi={aralik(satir)}
        sutunSayisi={aralik(sutun)}
        tirtikBoyutu={aralik(tirtik, "%")}
        zorlukSeviyesi={zorluk as any}
        tepsiKonumu={tepsi as any}
        rehberGorseliGoster
        yanlisParcaDavranisi="geriDon"
        karistirmaAnahtari={ANAHTAR}
        sureLimitiAktif={sureli}
        sureSaniye={60}
        hamleSayaciniGoster
        ilerlemeyiHatirla
        tekrarOynanabilir
        odulBasligi="Tebrikler, kazandın!"
        odulAciklamasi="<p>Kodu sepetinde kullanarak indirimini alabilirsin.</p>"
        kuponKodunuGoster
        kuponKodu="PUZZLE20"
        kopyalaButonMetni="Kopyala"
        kopyalandiMetni="Kopyalandı"
        odulButonMetni="Alışverişe başla"
        konfetiEfekti
        hediyeAdimiAktif={hediye}
        hediyeBasligi={kutuModu ? "Bir kutu aç" : "Hediyeni seç"}
        hediyeAciklamasi={kutuModu ? "Yalnızca bir kutu açabilirsin." : "Aşağıdaki hediyelerden birini seçebilirsin."}
        hediyeKartlari={
          HEDIYELER.map((h) => (
            <PuzzleHediyeKarti
              key={h.hediyeBasligi}
              hediyeBasligi={h.hediyeBasligi}
              hediyeAciklamasi={h.hediyeAciklamasi}
              rozetMetni={h.rozetMetni}
              secimButonMetni="Bu hediyeyi seç"
              secildiButonMetni="Seçildi"
              kutuKapakMetni="Sürpriz kutu"
              kutuAcMetni="Kutuyu aç"
              kartArkaPlanRengi="#ffffff"
              metinRengi="#1d1d1f"
              vurguRengi={vurgu}
              koseYuvarlakligi={aralik(14, "px")}
            />
          )) as any
        }
        hediyeSecimDavranisi="isaretle"
        hediyeOnayMetni="Hediyen seçildi."
        hediyeBosMetni="Bu alana editörden hediye kartı ekleyebilirsin."
        baslaButonMetni="Puzzle'ı başlat"
        sifirlaButonMetni="Yeniden karıştır"
        yenidenBaslaButonMetni="Yeniden başla"
        hediyeKullanildiMetni="Bu hediyeyi zaten aldın"
        ilerlemeMetni="{tamamlanan} / {toplam}"
        kalanSureMetni="{sure}"
        hamleMetni="{hamle} hamle"
        sureDolduBasligi="Süre doldu"
        sureDolduAciklamasi="Merak etme, tekrar deneyebilirsin."
        tekrarDeneButonMetni="Tekrar dene"
        gorselYokMetni="Puzzle görseli seçilmedi."
        parcaAlEtiketi="Puzzle parçası {no}"
        slotEtiketi="{no}. parça yuvası"
        oynanisIpucuMetni=""
        sureBilgiMetni=""
        karistirmaHakki={karistirmaHakki}
        karistirmaHakkiMetni="Yeniden karıştır ({kalan})"
        hakBittiMetni="Karıştırma hakkın bitti"
        tepsiTamamlandiMetni="Tüm parçalar yerleşti"
        hediyeKutuModu={kutuModu}
        kutuKilitliMetni="Bu tur için bir kutu açtın"
        arkaPlanRengi="#f5f5f7"
        metinRengi="#1d1d1f"
        vurguRengi={vurgu}
        vurguMetinRengi="#ffffff"
        uyariRengi="#d93025"
        butonParlamasi
        tahtaArkaPlanRengi="#ffffff"
        parcaKenarRengi="#ffffff"
        golgeYogunlugu={aralik(30, "%")}
        koseYuvarlakligi={aralik(24, "px")}
        maksimumGenislik={aralik(1120, "px")}
        dikeyBosluk={aralik(28, "px")}
      />
    </div>
  );
}

const kap = document.getElementById("puzzle-demo");
if (kap) render(<PuzzleDemo />, kap);

propTablosuBas("PuzzleKampanya", "#prop-tablosu-kampanya");
propTablosuBas("PuzzleHediyeKarti", "#prop-tablosu-kart");
