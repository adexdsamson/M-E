import { ComponentClass, ComponentProps, FunctionComponent } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Providers = {
  types: string | FunctionComponent<any> | ComponentClass<any, any>;
  props:
    | ComponentProps<FunctionComponent<any> | ComponentClass<any, any>>
    | null
    | undefined;
  children?: Providers[];
};
