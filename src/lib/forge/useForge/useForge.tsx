/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  ReactNode,
  cloneElement,
  Children,
  createElement,
  Component,
  useImperativeHandle,
  forwardRef,
  LegacyRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react";
import {
  FieldValues,
  FormProvider,
  Resolver,
  SubmitErrorHandler,
  UseFormReturn,
  useForm,
  DefaultValues,
} from "react-hook-form";
import { Forger, ForgerSlotProps } from "../Forger";
import {
  isButtonSlot,
  isElementSlot,
  isNestedSlot,
  isInputSlot,
} from "../utils";

type ForgerProps = {
  name: string;
  component: typeof Component<ForgerSlotProps> | any;
  label?: string;
};

export type FieldProps<TFieldProps = unknown> = ForgerProps & TFieldProps;

type ForgeProps<
  TFieldProps = unknown,
  TFieldValues extends FieldValues = FieldValues
> = {
  defaultValues?:
    | AsyncDefaultValues<TFieldValues>
    | DefaultValues<TFieldValues>
    | undefined;
  resolver?: Resolver<TFieldValues>;
  fieldProps?: FieldProps<TFieldProps>[];
  mode?: "onBlur" | "onChange" | "onSubmit" | "onTouched" | "all";
};

type UseForgeResult<T extends FieldValues> = UseFormReturn<T> & {
  ForgeForm: ForwardRefExoticComponent<FormProps<T>> &
    RefAttributes<FormPropsRef>;
};

type FormProps<TFieldValues extends FieldValues> = {
  onSubmit: (submit: TFieldValues) => void;
  className?: string;
  children?: ReactNode;
  onError?: SubmitErrorHandler<TFieldValues>;
  control?: "form" | "forger";
  ref?: LegacyRef<FormPropsRef>;
};

type AsyncDefaultValues<TFieldValues> = (
  payload?: unknown
) => Promise<TFieldValues>;

export type FormPropsRef = {
  onSubmit: () => void;
};

/**
 * A custom hook that returns a form component and form control functions using the `react-hook-form` library.
 * @param {ForgeFormProps} options - The options for the form.
 * @returns {UseForgeFormResult} - The form control functions and the form component.
 */
export const useForge = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldProps = unknown
>({
  defaultValues,
  resolver,
  mode,
  fieldProps,
  ...props
}: ForgeProps<TFieldProps, TFieldValues>): UseForgeResult<TFieldValues> => {
  const formProps = useForm<TFieldValues>({
    defaultValues,
    resolver,
    mode,
    ...props,
  });
  const hasFieldProps =
    typeof fieldProps !== "undefined" && fieldProps?.length !== 0;

  /**
   * The form component that wraps the form content and provides the form control functions and properties.
   * @param {FormProps} props - The props for the form component.
   * @returns {JSX.Element} - The rendered form component.
   */
  const ForgeForm = forwardRef<FormPropsRef, FormProps<TFieldValues>>(
    (
      { className, children, onSubmit, onError, control = "form" },
      ref
    ): JSX.Element => {
      const updatedChildren = Children.map(children, (child) => {
        if (isButtonSlot(child)) {
          return cloneElement(child, {
            onClick: formProps.handleSubmit(onSubmit, onError),
          });
        }

        if (isInputSlot(child) && control === "form") {
          return React.createElement(child.type, {
            ...{
              ...child.props,
              ...formProps.register(child.props.name),
              key: child.props.name,
            },
          });
        }

        if (isNestedSlot(child)) {
          return createElement(child.type, {
            ...{
              ...child.props,
              children: Children.map(child.props.children, (child) => {
                return isButtonSlot(child)
                  ? cloneElement(child, {
                      onClick: formProps.handleSubmit(onSubmit, onError),
                    })
                  : child;
              }),
            },
          });
        }

        return isElementSlot(child)
          ? cloneElement(child, { control: formProps.control })
          : undefined;
      });

      useImperativeHandle(
        ref,
        () => {
          return {
            onSubmit: formProps.handleSubmit(onSubmit, onError),
          };
        },
        [onSubmit, onError]
      );

      const renderFieldProps = hasFieldProps
        ? fieldProps.map((inputs, index) => <Forger key={index} {...inputs} />)
        : null;

      return (
        <FormProvider {...formProps}>
          <div className={className}>
            {renderFieldProps}
            {updatedChildren}
          </div>
        </FormProvider>
      );
    }
  );

  return { ...formProps, ForgeForm };
};
