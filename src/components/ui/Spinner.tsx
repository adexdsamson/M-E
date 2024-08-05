import React, { CSSProperties, ComponentType, RefObject } from "react";
import classNames from "clsx";
import { CgSpinner } from "react-icons/cg";

type SpinnerProps = {
  className?: string;
  color?: string;
  indicator?: ComponentType;
  isSpinning?: boolean;
  size?: number;
  style?: CSSProperties;
};
type SpinnerRef = RefObject<unknown>;

const Spinner = React.forwardRef<SpinnerRef, SpinnerProps>((props) => {
  const {
    className,
    color,
    indicator,
    isSpinning = true,
    size = 20,
    style,
    ...rest
  } = props;

  const spinnerColor = color;
  const Component = indicator ? indicator : CgSpinner;

  const spinnerStyle = {
    height: size,
    width: size,
    ...style,
  };

  const spinnerClass = classNames(
    isSpinning && "animate-spin",
    spinnerColor && `text-${spinnerColor}`,
    className
  );

  return <Component style={spinnerStyle} className={spinnerClass} {...rest} />;
});

export default Spinner;
