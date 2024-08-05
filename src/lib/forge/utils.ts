/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  Children,
  ReactElement,
  ReactNode,
  isValidElement,
} from "react";
import {
  Ref,
  Names,
  Mode,
  FieldRefs,
  InternalFieldName,
  ValidationModeFlags,
  FieldArrayMethodProps,
  FieldValues,
  EmptyObject,
  FieldErrors,
  FieldError,
  ValidateResult,
  Message,
  ValidationRule,
  FieldElement,
} from "react-hook-form";
import { isUndefined, isObject, isString } from "lodash";

export const isNullOrUndefined = (value: unknown): value is null | undefined =>
  value == null;

export const isPlainObject = (tempObject: object) => {
  const prototypeCopy =
    tempObject.constructor && tempObject.constructor.prototype;

  return (
    isObject(prototypeCopy) && prototypeCopy.hasOwnProperty("isPrototypeOf")
  );
};

const isKey = (value: string) => /^\w*$/.test(value);
const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";
export const isMessage = (value: unknown): value is Message => isString(value);

function baseGet(object: any, updatePath: (string | number)[]) {
  const length = updatePath.slice(0, -1).length;
  let index = 0;

  while (index < length) {
    object = isUndefined(object) ? index++ : object[updatePath[index++]];
  }

  return object;
}

function isEmptyArray(obj: unknown[]) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !isUndefined(obj[key])) {
      return false;
    }
  }
  return true;
}

export const stringToPath = (input: string): string[] =>
  compact(input.replace(/["|']|\]/g, "").split(/\.|\[/));

export const appendAt = <T>(data: T[], value: T | T[]): T[] => [
  ...data,
  ...convertToArrayPayload(value),
];

export const fillEmptyArray = <T>(value: T | T[]): undefined[] | undefined =>
  Array.isArray(value) ? value.map(() => undefined) : undefined;

export const isEmptyObject = (value: unknown): value is EmptyObject =>
  isObject(value) && !Object.keys(value).length;

export const isWatched = (
  name: InternalFieldName,
  _names: Names,
  isBlurEvent?: boolean
) =>
  !isBlurEvent &&
  (_names.watchAll ||
    _names.watch.has(name) ||
    [..._names.watch].some(
      (watchName) =>
        name.startsWith(watchName) &&
        /^\.\w+/.test(name.slice(watchName.length))
    ));

export const isWeb =
  typeof window !== "undefined" &&
  typeof window.HTMLElement !== "undefined" &&
  typeof document !== "undefined";

export const get = <T>(
  object: T,
  path?: string,
  defaultValue?: unknown
): any => {
  if (!path || !isObject(object)) {
    return defaultValue;
  }

  const result = compact(path.split(/[,[\].]+?/)).reduce(
    (result, key) =>
      isNullOrUndefined(result) ? result : result[key as keyof {}],
    object
  );

  return isUndefined(result) || result === object
    ? isUndefined(object[path as keyof T])
      ? defaultValue
      : object[path as keyof T]
    : result;
};

export const getFocusFieldName = (
  name: InternalFieldName,
  index: number,
  options: FieldArrayMethodProps = {}
): string =>
  options.shouldFocus || isUndefined(options.shouldFocus)
    ? options.focusName ||
      `${name}.${isUndefined(options.focusIndex) ? index : options.focusIndex}.`
    : "";

export const compact = <TValue>(value: TValue[]) =>
  Array.isArray(value) ? value.filter(Boolean) : [];

export const convertToArrayPayload = <T>(value: T) =>
  Array.isArray(value) ? value : [value];
export const isFunction = (value: unknown): value is Function =>
  typeof value === "function";
export const isRegex = (value: unknown): value is RegExp =>
  value instanceof RegExp;

export const VALIDATION_MODE = {
  onBlur: "onBlur",
  onChange: "onChange",
  onSubmit: "onSubmit",
  onTouched: "onTouched",
  all: "all",
} as const;

export const INPUT_VALIDATION_RULES = {
  max: "max",
  min: "min",
  maxLength: "maxLength",
  minLength: "minLength",
  pattern: "pattern",
  required: "required",
  validate: "validate",
} as const;

export const getValidationModes = (mode?: Mode): ValidationModeFlags => ({
  isOnSubmit: !mode || mode === VALIDATION_MODE.onSubmit,
  isOnBlur: mode === VALIDATION_MODE.onBlur,
  isOnChange: mode === VALIDATION_MODE.onChange,
  isOnAll: mode === VALIDATION_MODE.all,
  isOnTouch: mode === VALIDATION_MODE.onTouched,
});

export const iterateFieldsByAction = (
  fields: FieldRefs,
  action: (ref: Ref, name: string) => 1 | undefined | void,
  fieldsNames?: Set<InternalFieldName> | InternalFieldName[] | 0,
  abortEarly?: boolean
) => {
  for (const key of fieldsNames || Object.keys(fields)) {
    const field = get(fields, key);

    if (field) {
      const { _f, ...currentField } = field;

      if (_f) {
        if (_f.refs && _f.refs[0] && action(_f.refs[0], key) && !abortEarly) {
          break;
        } else if (_f.ref && action(_f.ref, _f.name) && !abortEarly) {
          break;
        } else {
          iterateFieldsByAction(currentField, action);
        }
      } else if (isObject(currentField)) {
        iterateFieldsByAction(currentField, action);
      }
    }
  }
};

export function cloneObject<T>(data: T): T {
  let copy: any;
  const isArray = Array.isArray(data);

  if (data instanceof Date) {
    copy = new Date(data);
  } else if (data instanceof Set) {
    copy = new Set(data);
  } else if (
    !(isWeb && (data instanceof Blob || data instanceof FileList)) &&
    (isArray || isObject(data))
  ) {
    copy = isArray ? [] : {};

    if (!isArray && !isPlainObject(data)) {
      copy = data;
    } else {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          copy[key] = cloneObject(data[key]);
        }
      }
    }
  } else {
    return data;
  }

  return copy;
}

function removeAtIndexes<T>(data: T[], indexes: number[]): T[] {
  let i = 0;
  const temp = [...data];

  for (const index of indexes) {
    temp.splice(index - i, 1);
    i++;
  }

  return compact(temp).length ? temp : [];
}

export const removeArrayAt = <T>(data: T[], index?: number | number[]): T[] =>
  isUndefined(index)
    ? []
    : removeAtIndexes(
        data,
        (convertToArrayPayload(index) as number[]).sort((a, b) => a - b)
      );

export const generateId = () => {
  const d =
    typeof performance === "undefined" ? Date.now() : performance.now() * 1000;

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16 + d) % 16 | 0;

    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const set = (object: FieldValues, path: string, value?: unknown) => {
  let index = -1;
  const tempPath = isKey(path) ? [path] : stringToPath(path);
  const length = tempPath.length;
  const lastIndex = length - 1;

  while (++index < length) {
    const key = tempPath[index];
    let newValue = value;

    if (index !== lastIndex) {
      const objValue = object[key];
      newValue =
        isObject(objValue) || Array.isArray(objValue)
          ? objValue
          : !isNaN(+tempPath[index + 1])
          ? []
          : {};
    }
    object[key] = newValue;
    object = object[key];
  }
  return object;
};

export function unset(object: any, path: string | (string | number)[]) {
  const paths = Array.isArray(path)
    ? path
    : isKey(path)
    ? [path]
    : stringToPath(path);

  const childObject = paths.length === 1 ? object : baseGet(object, paths);

  const index = paths.length - 1;
  const key = paths[index];

  if (childObject) {
    delete childObject[key];
  }

  if (
    index !== 0 &&
    ((isObject(childObject) && isEmptyObject(childObject)) ||
      (Array.isArray(childObject) && isEmptyArray(childObject)))
  ) {
    unset(object, paths.slice(0, -1));
  }

  return object;
}

export const updateFieldArrayRootError = <T extends FieldValues = FieldValues>(
  errors: FieldErrors<T>,
  error: Partial<Record<string, FieldError>>,
  name: InternalFieldName
): FieldErrors<T> => {
  const fieldArrayErrors = compact(get(errors, name));
  set(fieldArrayErrors, "root", error[name]);
  set(errors, name, fieldArrayErrors);
  return errors;
};

export function getValidateError(
  result: ValidateResult,
  ref: Ref,
  type = "validate"
): FieldError | void {
  if (
    isMessage(result) ||
    (Array.isArray(result) && result.every(isMessage)) ||
    (isBoolean(result) && !result)
  ) {
    return {
      type,
      message: isMessage(result) ? result : "",
      ref,
    };
  }
}

export const getValueAndMessage = (validationData?: ValidationRule) =>
  isObject(validationData) && !isRegex(validationData)
    ? validationData
    : {
        value: validationData,
        message: "",
      };

export const isHTMLElement = (value: unknown): value is HTMLElement => {
  if (!isWeb) {
    return false;
  }

  const owner = value ? ((value as HTMLElement).ownerDocument as Document) : 0;
  return (
    value instanceof
    (owner && owner.defaultView ? owner.defaultView.HTMLElement : HTMLElement)
  );
};

export const isFileInput = (
  element: FieldElement
): element is HTMLInputElement => element.type === "file";

export const isCheckBoxInput = (
  element: FieldElement
): element is HTMLInputElement => element.type === "checkbox";

export const isRadioInput = (
  element: FieldElement
): element is HTMLInputElement => element.type === "radio";

type SlotProps = {
  children?: React.ReactNode;
  style?: any;
};

export function Slot({ children, ...props }: SlotProps) {
  if (React.Children.count(children) > 1) {
    throw new Error("Only one child allowed");
  }

  if (React.isValidElement(children)) {
    const customChildStyle = children?.props?.style ?? [];
    const style = props?.style ?? [];

    return React.cloneElement(children, {
      ...props,
      ...children.props,
      style: isWeb ? style : [...style, ...customChildStyle],
    });
  }

  return null;
}

export type AsChildProps<DefaultElementProps, CustomProps> =
  | ({ asChild?: false } & DefaultElementProps)
  | ({ asChild: true; children: React.ReactNode } & CustomProps);

export function isButtonSlot(child: ReactNode): child is ReactElement {
  return isValidElement(child) && child.props.type === "submit";
}
export function isElementSlot(child: ReactNode): child is ReactElement {
  return isValidElement(child);
}

export function isNestedSlot(child: ReactNode): child is ReactElement {
  return (
    isValidElement(child) &&
    typeof child.type === "string" &&
    Children.count(child) !== 0 &&
    ["section", "div", "main"].includes(child.type)
  );
}

export function isInputSlot(child: ReactNode): child is ReactElement {
  return isValidElement(child) && child.props.name;
}
