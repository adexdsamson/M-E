import {
  CSSProperties,
  ComponentElement,
  ExoticComponent,
  ReactNode,
  Ref,
} from "react";

type ContainerProps = {
  as?:
    | ComponentElement
    | HTMLElementTagNameMap
    | ExoticComponent<{ children?: ReactNode }>;
  display?: "flex" | "grid" | "none";
  noGutter?: boolean;
  direction?: "none" | "row" | "col" | "row-reverse" | "col-reverse";
  className?: string;
  md?: ContainerProps["size"];
  sm?: ContainerProps["size"];
  xl?: ContainerProps["size"];
  lg?: ContainerProps["size"];
  xl?: ContainerProps["size"];
  size?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  children?: ReactNode;
  fullWidth?: boolean;
  fullHeight?: boolean;
  style?: CSSProperties;
};

type ContainerRef = Ref<ContainerProps["as"]>;
