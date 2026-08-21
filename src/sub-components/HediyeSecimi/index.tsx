import { observer } from "@ikas/component-utils";
import { IkasComponentRenderer } from "@ikas/bp-storefront";

interface Props {
  baslik: string;
  aciklama?: string;
  /** COMPONENT_LIST prop değeri — editörden eklenen hediye kartları. */
  kartlar?: any;
  /** Alt bileşenlerin dinamik değerlere erişebilmesi için üst bileşenin propları. */
  ustProplar: Record<string, any>;
  onayMetni?: string;
  secildi: boolean;
  metinRengi: string;
  vurguRengi: string;
  bosMetin: string;
  /** Tahtanın üstünde (kutu adımında) gösterilirken ayraç ve üst boşluk kalkar. */
  sade?: boolean;
}

const HediyeSecimi = observer(function HediyeSecimi({
  baslik,
  aciklama,
  kartlar,
  ustProplar,
  onayMetni,
  secildi,
  metinRengi,
  vurguRengi,
  bosMetin,
  sade,
}: Props) {
  const kartListesi = (kartlar as any[]) ?? [];

  return (
    <div className={sade ? "hediye-serit sade" : "hediye-serit"} style={{ color: metinRengi }}>
      <div className="hediye-basliklar">
        <h4 className="hediye-baslik">{baslik}</h4>
        {aciklama && <p className="hediye-aciklama">{aciklama}</p>}
      </div>

      {/* Grid, renderer'ın kendisine değil kendi sarmalayıcımıza uygulanır:
          runtime dışarıdan verilen className'i uygulamayabiliyor. */}
      {kartListesi.length > 0 ? (
        <div className="hediye-kart-alani">
          <IkasComponentRenderer
            id="hediye-kartlari"
            components={kartListesi}
            parentProps={ustProplar}
          />
        </div>
      ) : (
        <p className="hediye-bos">{bosMetin}</p>
      )}

      {secildi && onayMetni && (
        <p className="hediye-onay" style={{ color: vurguRengi }} role="status" aria-live="polite">
          {onayMetni}
        </p>
      )}
    </div>
  );
});

export default HediyeSecimi;
