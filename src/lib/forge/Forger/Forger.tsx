/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEqual } from "lodash";
import { isWeb, Slot } from "../utils";
import { Component, memo } from "react";
import {
  FieldValues,
  RegisterOptions,
  UseFormReturn,
  useController,
  useFormContext,
  Control,
} from "react-hook-form";

type ForgerProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> &
  Record<string, any> & {
    name: keyof FieldValues;
    component: any;
    label?: string;
    onChangeText?: (value: string) => void;
  };

type ForgeProps = {
  name: keyof FieldValues;
  className?: string;
  rules?: Omit<
    RegisterOptions<FieldValues, any>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
  transform?: {
    input?: (value: string) => string;
    output?: (val: string) => string;
  };
  Component: typeof Component<any>;
  trigger?: string;
  methods: UseFormReturn;
};

export type ForgerSlotProps = {
  name: string;
  error: string;
  value: string;
  placeholder?: string;
  control: Control<FieldValues, any>;
  onBlur: RegisterOptions["onBlur"];
  onChange: RegisterOptions["onChange"];
};

const ForgerController = (props: ForgeProps) => {
  const { rules, transform, methods, Component, name, trigger, ...rest } =
    props;
  const {
    field: { onBlur, onChange, value, ref },
    fieldState: { error },
  } = useController({ name, rules, control: methods.control });

  const getTextTransform = (text: string) => {
    return typeof transform === "undefined" ? text : transform.output?.(text);
  };

  const getTransformedValue = (text: string) => {
    return typeof transform === "undefined" ? text : transform.input?.(text);
  };

  const handleTrigger = trigger
    ? {
        [trigger]: (value: string) => onChange(getTextTransform(value)),
        onChange: () => {},
      }
    : isWeb
    ? { onChange: (value: string) => onChange(getTextTransform(value)) }
    : {
        onChangeText: (value: string) => onChange(getTextTransform(value)),
        onChange: () => {},
      };

  return (
    <Component
      {...rest}
      ref={ref}
      name={name}
      onBlur={onBlur}
      error={error?.message}
      control={methods.control}
      value={getTransformedValue(value)}
      {...handleTrigger}
    />
  );
};

const MemorizeController = memo<ForgeProps>(
  (props) => <ForgerController {...props} />,
  (prev, next) => {
    const { methods, ...others } = next;
    const { methods: _, ...rest } = prev;

    if (_.formState.isDirty === methods.formState.isDirty) {
      return true;
    }

    if (isEqual(rest, others)) {
      return true;
    }

    return true;
  }
);

export const Forger = (props: ForgerProps) => {
  const methods = useFormContext();

  return (
    <Slot>
      <MemorizeController
        {...props}
        name={props.name}
        methods={methods}
        Component={props.component}
      />
    </Slot>
  );
};
