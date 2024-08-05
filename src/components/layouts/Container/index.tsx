import classNames from "clsx";
import { forwardRef } from "react";
import { ContainerProps, ContainerRef } from "./container";

const defaultElement = "section";

/**
 * It takes a size and a direction and returns a string that can be used as a CSS grid template.
 * @param [size=0-12] - The number of columns or rows you want to create.
 * @param [direction] - "row" or "col"
 * @returns A string that is a template literal.
 */
const generateGridTemplate = (size = 0, direction = ""): string => {
  if (direction.includes("reverse") || !["row", "col"].includes(direction))
    return "";
  return `grid-${direction}s-${size}`;
};

/**
 * It takes a size and a direction and returns a string that can be used as a Tailwind CSS grid
 * template for large screens.
 * @param [size=0] - The number of columns or rows you want to have.
 * @param [direction] - row or col
 * @returns A string.
 */
const generateGridTemplateLg = (size = 0, direction = "") => {
  if (direction.includes("reverse") || !["row", "col"].includes(direction))
    return "";
  return `lg:grid-${direction}s-${size}`;
};

/**
 * It takes a size and a direction and returns a string that can be used as a Tailwind CSS grid
 * template for medium screens.
 * @param [size=0] - The number of columns or rows you want to have.
 * @param [direction] - row or col
 * @returns A string.
 */
const generateGridTemplateMd = (size = 0, direction = "") => {
  if (direction.includes("reverse") || !["row", "col"].includes(direction))
    return "";
  return `md:grid-${direction}s-${size}`;
};

/**
 * It takes a string as an argument and returns a string.
 * @param [direction] - The direction of the flexbox.
 */
const generateFlexTemplate = (direction = "") => {
  if (!["row", "col", "reverse"].includes(direction)) return "";
  return `flex-${direction}`;
};

const Container = forwardRef<ContainerRef, ContainerProps>((props, ref) => {
  const {
    as,
    display,
    sm,
    md,
    lg,
    direction,
    noGutter,
    className,
    fullHeight,
    fullWidth,
    ...rest
  } = props;

  const Component = as ? as : defaultElement;

  const Display = {
    flex: "flex",
    grid: "grid",
    none: "none",
  };

  const classes = classNames(className, {
    "px-4 lg:px-8": !noGutter,
    "w-screen": fullWidth,
    "h-screen": fullHeight,
    [Display[display ?? "none"]]: display,
    [generateGridTemplate(sm, direction)]: direction && display === "grid",
    [generateFlexTemplate(direction)]: direction && display === "flex",
    [generateGridTemplateMd(md, direction)]: md,
    [generateGridTemplateLg(lg, direction)]: lg,
  });

  return <Component ref={ref} {...rest} className={classes} />;
});

export default Container;
