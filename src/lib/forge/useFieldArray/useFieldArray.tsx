import React, { useState, useRef, useEffect } from "react";
import { useSubscribe } from "../useSubscribe";
import {
  Control,
  FieldValues,
  FieldPath,
  FieldArray,
  RegisterOptions,
  InternalFieldName,
  FieldArrayWithId,
  FieldArrayPath,
  UseFieldArrayProps,
  useFormContext,
  FieldArrayMethodProps,
  FormState,
  get,
  set,
  FieldErrors,
  Field,
} from "react-hook-form";
import {
  appendAt,
  cloneObject,
  convertToArrayPayload,
  fillEmptyArray,
  generateId,
  getFocusFieldName,
  getValidationModes,
  isEmptyObject,
  isWatched,
  iterateFieldsByAction,
  removeArrayAt,
  unset,
  updateFieldArrayRootError,
  VALIDATION_MODE,
} from "../utils";
import validateField from "../validateField";

type ForgeFieldArray<
  T extends FieldValues,
  TF extends FieldArrayPath<T>,
  TK extends string = "id",
  IN = unknown
> = UseFieldArrayProps<T, TF, TK> & {
  inputProps: IN;
};

type FieldsArray<T> = {
  id: string;
  inputProps: T[];
};

export const useFieldArray = <
  InputProps = unknown,
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = "id"
>(
  props: ForgeFieldArray<TFieldValues, TFieldArrayName, TKeyName, InputProps>
) => {
  const methods = useFormContext();

  const { control = methods.control, name, keyName = "id", inputProps } = props;

  const [fields, setFields] = useState(control._getFieldArray(name));
  const ids = React.useRef<string[]>(
    control._getFieldArray(name).map(generateId)
  );

  const _fieldIds = useRef(fields);
  const _name = useRef(name);
  const _actioned = useRef(false);

  _name.current = name;
  _fieldIds.current = fields;
  control._names.array.add(name);

  props.rules &&
    (control as Control<TFieldValues>).register(
      name as FieldPath<TFieldValues>,
      props.rules as RegisterOptions<TFieldValues>
    );

  type Next = {
    values?: FieldValues;
    name?: InternalFieldName;
  };

  useSubscribe({
    next: ({ values, name: fieldArrayName }: Next) => {
      if (fieldArrayName === _name.current || !fieldArrayName) {
        const fieldValues = get(values, _name.current);
        if (Array.isArray(fieldValues)) {
          setFields(fieldValues);
          // ids.current = fieldValues.map(generateId);
        }
      }
    },
    subject: control._subjects.array,
  });

  const updateValues = React.useCallback(
    <
      T extends Partial<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >[]
    >(
      updatedFieldArrayValues: T
    ) => {
      _actioned.current = true;
      control._updateFieldArray(name, updatedFieldArrayValues);
    },
    [control, name]
  );

  const append = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps
  ) => {
    const appendValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValues = appendAt(
      control._getFieldArray(name),
      appendValue
    );
    control._names.focus = getFocusFieldName(
      name,
      updatedFieldArrayValues.length - 1,
      options
    );
    ids.current = appendAt(ids.current, appendValue.map(generateId));
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(name, updatedFieldArrayValues, appendAt, {
      argA: fillEmptyArray(value),
    });
  };

  const remove = (index?: number | number[]) => {
    const updatedFieldArrayValues: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = removeArrayAt(control._getFieldArray(name), index);
    ids.current = removeArrayAt(ids.current, index);
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(name, updatedFieldArrayValues, removeArrayAt, {
      argA: index,
    });
  };

  useEffect(() => {
    control._state.action = false;

    isWatched(name, control._names) &&
      control._subjects.state.next({
        ...control._formState,
      } as FormState<TFieldValues>);

    if (
      _actioned.current &&
      (!getValidationModes(control._options.mode).isOnSubmit ||
        control._formState.isSubmitted)
    ) {
      if (control._options.resolver) {
        control._executeSchema([name]).then((result) => {
          const error = get(result.errors, name);
          const existingError = get(control._formState.errors, name);

          if (
            existingError
              ? (!error && existingError.type) ||
                (error &&
                  (existingError.type !== error.type ||
                    existingError.message !== error.message))
              : error && error.type
          ) {
            error
              ? set(control._formState.errors, name, error)
              : unset(control._formState.errors, name);
            control._subjects.state.next({
              errors: control._formState.errors as FieldErrors<TFieldValues>,
            });
          }
        });
      } else {
        const field: Field = get(control._fields, name);
        if (
          field &&
          field._f &&
          !(
            getValidationModes(control._options.reValidateMode).isOnSubmit &&
            getValidationModes(control._options.mode).isOnSubmit
          )
        ) {
          validateField(
            field,
            control._formValues,
            control._options.criteriaMode === VALIDATION_MODE.all,
            control._options.shouldUseNativeValidation,
            true
          ).then(
            (error) =>
              !isEmptyObject(error) &&
              control._subjects.state.next({
                errors: updateFieldArrayRootError(
                  control._formState.errors as FieldErrors<TFieldValues>,
                  error,
                  name
                ) as FieldErrors<TFieldValues>,
              })
          );
        }
      }
    }

    control._subjects.values.next({
      name,
      values: { ...control._formValues },
    });

    control._names.focus &&
      iterateFieldsByAction(control._fields, (ref, key: string) => {
        if (
          control._names.focus &&
          key.startsWith(control._names.focus) &&
          ref.focus
        ) {
          ref.focus();
          return 1;
        }
        return;
      });

    control._names.focus = "";

    control._updateValid();
    _actioned.current = false;
  }, [fields, name, control]);

  return {
    append,
    remove,
    fields: React.useMemo(
      () =>
        fields.map((field, index) => ({
          ...field,
          inputProps,
          id: ids.current[index] || generateId(),
        })) as FieldsArray<InputProps>[],
      [fields, keyName]
    ),
  };
};
