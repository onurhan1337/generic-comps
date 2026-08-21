/** Vitrin sitesi için ikas storefront SDK taklidi. Sadece demoların kullandığı yüzey. */
export interface IkasImage {
  id?: string;
  src?: string;
}

export interface IkasProduct {
  id?: string;
  name?: string;
}

export function getDefaultSrc(gorsel: any): string {
  return gorsel?.src ?? "";
}

export function getSelectedProductVariant(_urun: any): any {
  return null;
}

export async function addItemToCart(..._args: any[]): Promise<void> {
  // demo ortamında sepet yok
}

/**
 * COMPONENT_LIST slot render'ının taklidi.
 * Editörde bu, mağaza sahibinin sürüklediği bileşenleri basar. Vitrinde ise
 * `components` doğrudan Preact düğümleri olduğu için oldukları gibi render edilir.
 */
export function IkasComponentRenderer({ components }: { components?: any[]; [k: string]: any }) {
  // Gerçek runtime bileşenleri kendi sarmalayıcısında basıyor ve dışarıdan
  // verilen className'i uygulamıyor — taklit de aynı şekilde davranmalı ki
  // vitrindeki yerleşim mağazadakinden farklı çıkmasın.
  return <div>{components ?? null}</div>;
}
