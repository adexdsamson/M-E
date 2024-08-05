import { useMemo, LegacyRef } from "react";
import { Providers } from "./type";
import { createElement } from "react";

type RenderElementType = {
  type: Providers["types"];
  props: Providers["props"];
  ref?: LegacyRef<Providers["types"]> | null;
  key: string | null;
};

const renderChildren = (
  child?: Providers
): RenderElementType | RenderElementType[] =>
  child?.children?.length === 0
    ? createElement(child.types)
    : createElement(
        child?.types ?? "",
        child?.props,
        child?.children?.map((item) => renderChildren?.(item))
      );

/**
 * The useEntryPoint function is a custom hook that takes in an object props of type EntryPoint and returns an element based on the provided props.
 * @param props
 * @returns - entryPoint (type: React.ReactElement): The created entry point element.
 *
 * @example
 *   Example Usage:
 * ```
 * const MyComponent = () => {
 *   const entryPointProps = {
 *    types: "div",
 *    props: { className: "my-class" },
 *     children: []
 *    };
 *
 *  const entryPoint = useEntryPoint(entryPointProps);
 *
 *   return entryPoint;
 * };
 * ``
 */
export const useProviders = (props: Providers) => {
  const entryPoint = useMemo(() => {
    const children = props?.children?.map?.(renderChildren) ?? [];

    return props?.children?.length === 0
      ? createElement(props.types, props.props)
      : createElement(props.types, props.props, ...children);
  }, [props]);

  return entryPoint;
};
