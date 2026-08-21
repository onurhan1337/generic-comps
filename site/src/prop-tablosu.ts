import yapilandirma from "../../ikas.config.json";

interface Prop {
  name: string;
  displayName?: string;
  type: string;
  required?: boolean;
  description?: string;
  defaultValue?: unknown;
  groupId?: string;
  enumTypeId?: string;
}

interface PropGrubu {
  id: string;
  name: string;
  description?: string;
}

interface Bilesen {
  id: string;
  name: string;
  type?: string;
  props?: Prop[];
  propGroups?: PropGrubu[];
}

const bilesenler = (yapilandirma as any).components as Bilesen[];
const ozelTipler = ((yapilandirma as any).customTypes ?? []) as Array<{
  id: string;
  name: string;
  enumOptions?: Record<string, string>;
}>;

function kacis(metin: string): string {
  return metin.replace(/[&<>]/g, (k) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[k] as string);
}

function varsayilanYazisi(prop: Prop): string {
  if (prop.defaultValue === undefined || prop.defaultValue === null) return "—";
  const deger = prop.defaultValue as any;
  if (typeof deger === "object") {
    if ("value" in deger) return `${deger.value}${deger.unit ?? ""}`;
    return "—";
  }
  if (typeof deger === "boolean") return deger ? "açık" : "kapalı";
  const metin = String(deger);
  return metin.length > 60 ? metin.slice(0, 57) + "…" : metin;
}

function tipYazisi(prop: Prop): string {
  if (prop.type !== "ENUM" || !prop.enumTypeId) return prop.type;
  const tip = ozelTipler.find((t) => t.id === prop.enumTypeId);
  if (!tip?.enumOptions) return "ENUM";
  return `ENUM<br><span class="secenekler">${Object.keys(tip.enumOptions).join(" · ")}</span>`;
}

/** Verilen bileşenin proplarını, gruplarına göre ayrılmış bir tabloya basar. */
export function propTablosuBas(bilesenAdi: string, hedefSecici: string): void {
  const hedef = document.querySelector(hedefSecici);
  const bilesen = bilesenler.find((b) => b.name === bilesenAdi);
  if (!hedef || !bilesen) return;

  const proplar = bilesen.props ?? [];
  const gruplar = bilesen.propGroups ?? [];
  const sirali: Array<{ grup: PropGrubu | null; proplar: Prop[] }> = [];

  gruplar.forEach((grup) => {
    const grupProplari = proplar.filter((p) => p.groupId === grup.id);
    if (grupProplari.length) sirali.push({ grup, proplar: grupProplari });
  });
  const grupsuz = proplar.filter((p) => !p.groupId);
  if (grupsuz.length) sirali.push({ grup: null, proplar: grupsuz });

  const satirlar = sirali
    .map(({ grup, proplar: grupProplari }) => {
      const baslik = grup
        ? `<tr class="grup-satiri"><td colspan="4">${kacis(grup.name)}${
            grup.description ? ` — <span style="font-weight:400">${kacis(grup.description)}</span>` : ""
          }</td></tr>`
        : "";
      const icerik = grupProplari
        .map(
          (p) => `<tr>
            <td><code>${kacis(p.name)}</code>${p.required ? ' <span class="etiket">zorunlu</span>' : ""}</td>
            <td>${tipYazisi(p)}</td>
            <td>${kacis(varsayilanYazisi(p))}</td>
            <td>${kacis(p.description ?? "")}</td>
          </tr>`
        )
        .join("");
      return baslik + icerik;
    })
    .join("");

  hedef.innerHTML = `<div class="tablo-sarmal"><table>
    <thead><tr><th>Prop</th><th>Tip</th><th>Varsayılan</th><th>Açıklama</th></tr></thead>
    <tbody>${satirlar}</tbody>
  </table></div>`;
}

/** Bir bileşenin ikas.config.json karşılığını (id hariç) metin olarak döndürür. */
export function yapilandirmaMetni(bilesenAdi: string): string {
  const bilesen = bilesenler.find((b) => b.name === bilesenAdi);
  return bilesen ? JSON.stringify(bilesen, null, 2) : "";
}

export function propSayisi(bilesenAdi: string): number {
  return bilesenler.find((b) => b.name === bilesenAdi)?.props?.length ?? 0;
}
