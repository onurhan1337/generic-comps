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
}: Props) {
  const kartListesi = (kartlar as any[]) ?? [];

  return (
    <div className="hediye-serit" style={{ color: metinRengi }}>
      <div className="hediye-basliklar">
        <h4 className="hediye-baslik">{baslik}</h4>
        {aciklama && <p className="hediye-aciklama">{aciklama}</p>}
      </div>

      {kartListesi.length > 0 ? (
        <IkasComponentRenderer
          id="hediye-kartlari"
          className="hediye-kart-alani"
          components={kartListesi}
          parentProps={ustProplar}
        />
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
