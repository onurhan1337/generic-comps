// This file is auto-generated — do not edit manually.
import type { IkasImage, IkasNumberRange, IkasNavigationLink } from "@ikas/bp-storefront";
import type { PuzzleHediyeSecimDavranisi, PuzzleTepsiKonumu, PuzzleYanlisParcaDavranisi, PuzzleYaziTipi, PuzzleZorluk } from "../../global-types";

export interface Props {
  /** Başlığın üstünde görünen küçük etiket. Boş bırakırsan gösterilmez. */
  ustEtiket?: string;
  /** Kampanyanın ana başlığı. */
  baslik: string;
  /** Başlığın altındaki açıklama metni. */
  aciklama?: string;
  /** Puzzle'a dönüştürülecek görsel. Kare veya 4:3 yatay görseller en iyi sonucu verir. */
  puzzleGorseli?: IkasImage | null;
  /** Puzzle'ın kaç satıra bölüneceği. Satır × sütun toplam parça sayısını verir. */
  satirSayisi?: IkasNumberRange;
  /** Puzzle'ın kaç sütuna bölüneceği. */
  sutunSayisi?: IkasNumberRange;
  /** Parça kenarlarındaki çıkıntı ve girintilerin büyüklüğü. 0 = düz kare parçalar, yüksek değer = belirgin puzzle tırtığı. */
  tirtikBoyutu?: IkasNumberRange;
  /** Parçanın yuvasına oturması için gereken yakınlık toleransını belirler. Kolay = geniş tolerans. */
  zorlukSeviyesi?: PuzzleZorluk;
  /** Dağınık parçaların durduğu tepsinin tahtaya göre konumu. Mobilde her zaman altta gösterilir. */
  tepsiKonumu?: PuzzleTepsiKonumu;
  /** Tahtanın arkasında görselin soluk bir kopyasını gösterir. Kapatırsan puzzle zorlaşır. */
  rehberGorseliGoster?: boolean;
  /** Kullanıcı bir parçayı yanlış yere bıraktığında ne olacağı. */
  yanlisParcaDavranisi?: PuzzleYanlisParcaDavranisi;
  /** Parça dizilimi ve kaydedilen ilerleme bu anahtara göre üretilir. Değiştirdiğinde tüm ziyaretçilerin ilerlemesi sıfırlanır. */
  karistirmaAnahtari?: string;
  /** Açarsan kullanıcı puzzle'ı belirlenen sürede bitirmek zorunda kalır. */
  sureLimitiAktif?: boolean;
  /** Süre limiti açıksa kullanıcıya tanınan toplam saniye. */
  sureSaniye?: number;
  /** Kullanıcının yaptığı yerleştirme denemesi sayısını gösterir. */
  hamleSayaciniGoster?: boolean;
  /** Kullanıcının ilerlemesi kendi tarayıcısında saklanır; sayfayı yenilediğinde kaldığı yerden devam eder. */
  ilerlemeyiHatirla?: boolean;
  /** Puzzle tamamlandıktan sonra kullanıcının yeniden oynayabilmesine izin verir. */
  tekrarOynanabilir?: boolean;
  /** Puzzle tamamlandığında açılan panelin başlığı. */
  odulBasligi?: string;
  /** Ödül panelindeki açıklama metni. */
  odulAciklamasi?: string;
  /** Ödül panelinde gösterilecek görsel. Boş bırakırsan sadece metin gösterilir. */
  odulGorseli?: IkasImage | null;
  /** Ödül panelinde kopyalanabilir kupon kodu alanını gösterir. */
  kuponKodunuGoster?: boolean;
  /** Kullanıcının kazandığı indirim kodu. */
  kuponKodu?: string;
  /** Kupon kodunun yanındaki kopyalama butonunun metni. */
  kopyalaButonMetni?: string;
  /** Kod kopyalandıktan sonra kısa süre gösterilen metin. */
  kopyalandiMetni?: string;
  /** Ödül panelindeki butonun gideceği adres. Genelde kampanya kategorisi. */
  odulBaglantisi?: IkasNavigationLink | null;
  /** Ödül panelindeki ana butonun metni. */
  odulButonMetni?: string;
  /** Puzzle tamamlandığında kısa bir konfeti animasyonu oynatır. */
  konfetiEfekti?: boolean;
  /** Açarsan ödül panelinden sonra kullanıcı bir hediye seçebilir. */
  hediyeAdimiAktif?: boolean;
  /** Hediye seçme adımının başlığı. */
  hediyeBasligi?: string;
  /** Hediye kartlarının üstündeki açıklama satırı. */
  hediyeAciklamasi?: string;
  /** Kullanıcıya sunulacak hediye kartları. Editörden istediğin kadar 'PuzzleHediyeKarti' ekleyebilirsin. */
  hediyeKartlari?: any;
  /** Kullanıcı bir hediye seçtiğinde ne olacağı. */
  hediyeSecimDavranisi?: PuzzleHediyeSecimDavranisi;
  /** Hediye seçildikten sonra gösterilen onay mesajı. */
  hediyeOnayMetni?: string;
  /** Puzzle başlamadan önce gösterilen butonun metni. */
  baslaButonMetni?: string;
  /** Puzzle'ı yeniden karıştıran butonun metni. */
  sifirlaButonMetni?: string;
  /** Tamamlanan parça sayısını gösterir. {tamamlanan} ve {toplam} yerine gerçek sayılar yazılır. */
  ilerlemeMetni?: string;
  /** Süre limiti açıkken gösterilir. {sure} yerine kalan süre yazılır. */
  kalanSureMetni?: string;
  /** Hamle sayacı metni. {hamle} yerine hamle sayısı yazılır. */
  hamleMetni?: string;
  /** Süre bittiğinde gösterilen panelin başlığı. */
  sureDolduBasligi?: string;
  /** Süre bittiğinde gösterilen açıklama. */
  sureDolduAciklamasi?: string;
  /** Süre dolduğunda gösterilen butonun metni. */
  tekrarDeneButonMetni?: string;
  /** Puzzle görseli seçilmediğinde editörde gösterilen uyarı. */
  gorselYokMetni?: string;
  /** Ekran okuyucuların parçayı okurken kullandığı metin. {no} yerine parça numarası yazılır. */
  parcaAlEtiketi?: string;
  /** Ekran okuyucuların boş yuvayı okurken kullandığı metin. {no} yerine yuva numarası yazılır. */
  slotEtiketi?: string;
  /** Bölümün zemin rengi. */
  arkaPlanRengi?: string;
  /** Başlık ve açıklama metinlerinin rengi. */
  metinRengi?: string;
  /** Butonların ve aktif durumların rengi. */
  vurguRengi?: string;
  /** Vurgu renkli butonların üzerindeki yazı rengi. */
  vurguMetinRengi?: string;
  /** Puzzle tahtasının ve parça tepsisinin zemin rengi. */
  tahtaArkaPlanRengi?: string;
  /** Puzzle parçalarının ince kenar çizgisi rengi. */
  parcaKenarRengi?: string;
  /** Parçaların gölge koyuluğu. Yükseldikçe parçalar tahtadan daha çok ayrışır. */
  golgeYogunlugu?: IkasNumberRange;
  /** Tahta, tepsi ve panellerin köşe yuvarlaklığı. */
  koseYuvarlakligi?: IkasNumberRange;
  /** Bölüm içeriğinin en fazla ne kadar genişleyeceği. */
  maksimumGenislik?: IkasNumberRange;
  /** Bölümün üst ve alt iç boşluğu. */
  dikeyBosluk?: IkasNumberRange;
  /** Hediye adımı açık ama henüz kart eklenmemişken editörde gösterilen uyarı. */
  hediyeBosMetni?: string;
  /** Bölümün yazı tipi. 'Tema fontu' seçersen mağazanın kendi fontunu kullanır. */
  yaziTipi?: PuzzleYaziTipi;
  /** Süre azaldığında geri sayımın ve süre çizgisinin aldığı renk. */
  uyariRengi?: string;
  /** Ana butona vurgu renginden yayılan yumuşak bir ışık efekti ekler. */
  butonParlamasi?: boolean;
  /** Başlangıç ekranında butonun altında görünen kısa açıklama. Bölümün ne olduğunu anlatır. */
  oynanisIpucuMetni?: string;
  /** Süre limiti açıkken başlangıç ekranında gösterilir. {sure} yerine toplam süre yazılır. */
  sureBilgiMetni?: string;
}
