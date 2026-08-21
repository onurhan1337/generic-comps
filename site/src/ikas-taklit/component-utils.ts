/** Vitrin sitesi için observer taklidi — demoda MobX reaktifliğine gerek yok. */
export function observer<T extends (props: any) => any>(bilesen: T): T {
  return bilesen;
}
