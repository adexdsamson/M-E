import { TextSelect, TextSelectProps } from './components/layouts/FormInputs/TextSelect';
import { TextInput, TextInputProps } from './components/layouts/FormInputs/TextInput';
import { FieldProps } from './lib/forge';
import { country } from '@/config/country';

type SlotProps = TextSelectProps | TextInputProps;

type Data = {
  dataset: string;
  form: FieldProps<SlotProps>[];
  formDefault: Record<string, string>,
  detail: Record<"id" | "function_code" | "model_name", string>;
};

type ModelData = Record<string, Data>

export const modelData: ModelData = {
  Education: {
    dataset:
      "https://storage.autogon.ai/9f3e5c71-0471-43c0-97f4-3df9d1b34bf7.csv",
    form: [
      {
        name: "country",
        label: "Country",
        placeholder: "Select region",
        options: country.map((item) => ({
          label: item.name,
          value: item.name,
        })),
        component: TextSelect,
        containerClass: "mb-3",
      },
      {
        name: "timePeriod",
        label: "Time Period (Year)",
        component: TextInput,
        // type: "date",
        containerClass: "mb-3",
        // placeholder: "Enter dependents",
      },
      {
        name: "sex",
        label: "Gender",
        placeholder: "Select region",
        options: ["Male", "Female", "All genders"].map((item) => ({
          label: item,
          value: item,
        })),
        component: TextSelect,
        containerClass: "mb-3",
      },
      {
        name: "ageGroup",
        label: "Age Group",
        component: TextInput,
        disabled: true,
        // type: "date",
        value: "15-24 year olds",
        containerClass: "mb-3",
        // placeholder: "Enter dependents",
      },
    ],
    formDefault: {
      country: "",
      timePeriod: "",
      sex: "",
      ageGroup: "15-24 year olds",
    },
    detail: {
      function_code: "AUTO_R_2",
      model_name: "Literator detector",
      id: "54b8c197-525f-44b1-a1f8-a293713b23fc",
    },
  },
  Maternal: {
    dataset: "",
    form: [],
    formDefault: {},
    detail: {
      function_code: "AUTO_R_2",
      model_name: "Literator detector",
      id: "b2ddc694-dda9-4886-b357-37a6862b5b00",
    },
  },
  Population: {
    dataset:
      "https://storage.autogon.ai/9f0bd8ef-5c99-493a-837e-1234a3d6d55a.csv",
    form: [],
    formDefault: {},
    detail: {
      function_code: "AUTO_R_2",
      model_name: "population rate",
      id: "dd3018de-3581-4543-8fb4-bad93e105af5",
    },
  },
  PowerOutage: {
    dataset:
      "https://storage.autogon.ai/a61ae26f-8f75-4ed6-bfe4-d0f686de84f2.csv",
    form: [],
    formDefault: {},
    detail: {
      function_code: "AUTO_R_2",
      model_name: "power-outage",
      id: "dd3018de-3581-4543-8fb4-bad93e105af5",
    },
  },
  "Life Expectancy (both)": {
    dataset:
      "https://storage.autogon.ai/55410955-5f29-4766-a21b-08659ce1a0a2.csv", //https://storage.autogon.ai/7bee0b91-08ae-4f50-8b70-96137b2f3cc3.csv
    form: [
      {
        name: "growthIndicator",
        label: "Population growth and indicators of fertility and mortality",
        component: TextInput,
        type: "number",
        containerClass: "mb-3",
        // placeholder: "Enter dependents",
      },
      {
        name: "region",
        label: "Region/Country/Area",
        placeholder: "Select region",
        options: ["Total, all countries or areas", "Africa"].map((item) => ({
          label: item,
          value: item,
        })),
        component: TextSelect,
        containerClass: "mb-3",
      },
      {
        name: "year",
        label: "Year",
        component: TextInput,
        // type: "ty",
        containerClass: "mb-3",
        // placeholder: "Enter dependents",
      },
      {
        name: "series",
        label: "Series",
        component: TextInput,
        disabled: true,
        containerClass: "mb-3",
        // placeholder: "Enter dependents",
      },
    ],
    formDefault: {
      growthIndicator: "",
      region: "",
      year: "",
      series: "Life expectancy at birth for both sexes (years)",
    },
    detail: {
      function_code: "Auto_R_2",
      id: "b2ddc694-dda9-4886-b357-37a6862b5b00",
      model_name: "Life-expectancy",
    },
  },
  "Life Expectancy (male)": {
    dataset:
      "https://storage.autogon.ai/55410955-5f29-4766-a21b-08659ce1a0a2.csv",
    form: [],
    formDefault: {},
    detail: {
      function_code: "Auto_R_2",
      id: "",
      model_name: "",
    },
  },
  "Life Expectancy (female)": {
    dataset:
      "https://storage.autogon.ai/55410955-5f29-4766-a21b-08659ce1a0a2.csv",
    form: [],
    formDefault: {},
    detail: {
      function_code: "Auto_R_2",
      id: "",
      model_name: "",
    },
  },
};
