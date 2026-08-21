import { observer } from "@ikas/component-utils";
import { useMemo } from "preact/hooks";
import { rastgeleUretec } from "../../lib/puzzle";

interface Props {
  /** Aynı seed her zaman aynı konfeti dağılımını üretir (SSR uyumu için). */
  seed: string;
  renkler: string[];
  adet?: number;
}

const Konfeti = observer(function Konfeti({ seed, renkler, adet = 48 }: Props) {
  const tanecikler = useMemo(() => {
    const rnd = rastgeleUretec(seed + ":konfeti");
    return Array.from({ length: adet }, (_, i) => ({
      anahtar: i,
      sol: rnd() * 100,
      gecikme: rnd() * 0.6,
      sure: 2.2 + rnd() * 1.6,
      genislik: 6 + rnd() * 6,
      yukseklik: 10 + rnd() * 8,
      donme: rnd() * 360,
      renk: renkler[Math.floor(rnd() * renkler.length)] ?? "#111111",
    }));
  }, [seed, renkler, adet]);

  return (
    <div className="konfeti" aria-hidden="true">
      {tanecikler.map((t) => (
        <span
          key={t.anahtar}
          className="tanecik"
          style={{
            left: `${t.sol}%`,
            width: `${t.genislik}px`,
            height: `${t.yukseklik}px`,
            backgroundColor: t.renk,
            animationDelay: `${t.gecikme}s`,
            animationDuration: `${t.sure}s`,
            transform: `rotate(${t.donme}deg)`,
          }}
        />
      ))}
    </div>
  );
});

export default Konfeti;
