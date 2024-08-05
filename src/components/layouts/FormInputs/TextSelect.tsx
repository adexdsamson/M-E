import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RegisterOptions } from "react-hook-form";

export type TextSelectProps = {
  name: string;
  label?: string | JSX.Element;
  containerClass?: string;
  error?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  onChange?: RegisterOptions["onChange"];
  value: RegisterOptions["value"];
};

export const TextSelect = ({ label, ...rest }: TextSelectProps) => {
  return (
    <div className={rest?.containerClass ?? ""}>
      <Label
        htmlFor={typeof label === "string" ? label : ""}
        className="mb-3 block text-sm text-stone-900"
      >
        {label}
      </Label>

      <Select
        defaultValue={rest.value}
        onValueChange={(value) =>
          rest?.onChange?.({ target: { name: rest.name ?? "", value } })
        }
      >
        <SelectTrigger className="w-full 1text-xs !text-stone-400">
          <SelectValue
            className="1text-xs !text-gray-300"
            placeholder={rest?.placeholder}
          />
        </SelectTrigger>
        <SelectContent>
          {rest?.options?.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-xs text-red-500 mt-1">{rest.error}</span>
    </div>
  );
};
