import { useSubscribe } from "../useSubscribe";
import { Control, FieldValues, EventType } from "react-hook-form";

type ForgePersist<TFieldValues extends FieldValues = FieldValues> = {
  control: Control<TFieldValues>;
  handler: (
    payload: FieldValues,
    formState: {
      name?: string | undefined;
      type?: EventType | undefined;
      values: FieldValues;
    }
  ) => void;
};

export const usePersist = <TFieldProps extends FieldValues = FieldValues>({
  control,
  handler,
}: ForgePersist<TFieldProps>) => {
  useSubscribe({
    disabled: false,
    subject: control._subjects.values,
    next: (formState) => {
      handler(formState.values, formState);
    },
  });
};
