declare module "@ikas/component-utils" {
  export function observer<T extends (props: any) => any>(component: T): T;
}
