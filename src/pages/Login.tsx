import Container from "@/components/layouts/Container";
import { Header } from "@/layouts/Header";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormPropsRef, useForge } from "@/lib/forge";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { postRequest } from "@/lib/axiosInstance";
import { ApiResponse, ApiResponseError } from "@/types";
import { modelData } from "@/model";
import { useToastHandlers } from "@/hooks/useToaster";
import { useCsvData } from "@/hooks/useCsvData";

type VisualsResponse = {
  plots: string[];
};

function extractHtmlName(url: string) {
  var fileName = url?.substring?.(
    url?.lastIndexOf?.("/") + 1,
    url?.lastIndexOf?.(".html")
  );
  return fileName;
}

const modelDataJson = modelData;

export const Login = () => {
  const [activeModel, setActiveModel] =
    useState<keyof typeof modelDataJson>("Education");
  const [plot, setPlot] = useState<string | null>("distplots_nums");
  const ref = useRef<FormPropsRef | null>(null);
  const defaultValue = modelData[activeModel].formDefault;

  const { ForgeForm, reset, setValue } = useForge({
    fieldProps: modelData[activeModel].form,
    // shouldUnregister: true,
    // resetOptions: {
    //   keepDefaultValues: false,
    //   keepValues: false,
    //   keepDirtyValues: false,
    //   keepErrors: false,
    //   keepDirty: false,
    // },
  });

  const model = modelDataJson[activeModel].detail;

  const [message, setMessage] = useState<string | null>(null);
  const toastHandlers = useToastHandlers();

  const { data } = useQuery<
    ApiResponse<VisualsResponse>,
    ApiResponseError
  >({
    queryKey: ["visuals", activeModel],
    queryFn: () =>
      postRequest("engine/visualize/", {
        data: modelData[activeModel].dataset,
      }),
  });

  const { getCsvData } = useCsvData();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: any) =>
      postRequest(`models/quickpredict/${model?.id}`, payload),
  });

  const convertToCsvMutation = useMutation({
    mutationFn: (payload: any) => postRequest(`engine/start`, payload),
  });

  const handleSubmit = async (payload: any) => {
    console.log("pay", payload);

    try {
      let res = await convertToCsvMutation.mutateAsync({
        args: {
          dimensions: 1,
          scalar: Object.values(payload),
        },
        block_id: 43,
        function_code: "DP_STN",
        parent_id: 0,
        project_id: 2061,
      });

      if (!res.data) {
        res = await convertToCsvMutation.mutateAsync({
          args: {
            dimensions: 1,
            scalar: ["1", "2", "3", ""],
          },
          block_id: 43,
          function_code: "DP_STN",
          parent_id: 0,
          project_id: 2061,
        });
      }

      const result = await mutateAsync({
        args: {
          ...model,
          test_data: res?.data?.message?.output?.data_url,
        },
      });

      const csv = await getCsvData(
        result?.data?.message?.y_pred_url?.[1] as string
      );

      const messages = {
        Education: {
          Y: "Granted",
          N: "Not Granted",
        },
        loanDefault: {
          0: "The person wouldn't default",
          1: "The person is likely to default",
        },
        customerLifeTimeValue:
          "The expected Lifetime Value from this customer is",
        fraudDetection: "This is a type 1 fraud",
        projectedRevenue: {},
        employeeRetention: {
          0: "This employee would most likely leave",
          1: "this employee won't leave",
        },
      };

      console.log("csv", csv?.data?.[0]?.prediction_label);

      switch (activeModel) {
        case "Education":
          setMessage(
            () =>
              `The education literacy  in ${payload.country} in year ${
                payload.timePeriod
              } is ${Math.floor(
                (parseFloat(csv?.data?.[0]?.prediction_label ?? "0") / 100) *
                  100
              )}% `
          );
          break;
        case "loanDefault":
          setMessage(
            () =>
              messages[activeModel as "loanDefault"][
                csv?.data?.[0]?.prediction_label as "0" | "1"
              ]
          );
          break;
        case "customerLifeTimeValue":
          setMessage(
            () =>
              `${messages[activeModel as "customerLifeTimeValue"]} ${
                csv?.data?.[0]?.prediction_label
              }`
          );
          break;
        case "fraudDetection":
          setMessage(
            () => `This is a ${csv?.data?.[0]?.prediction_label} fraud`
          );
          break;
        case "projectedRevenue":
          setMessage(
            () =>
              `Our monthly revenue is projected to be (${csv?.data?.[0]?.prediction_label})`
          );
          break;
        case "employeeRetention":
          setMessage(
            () =>
              messages[activeModel as "employeeRetention"][
                csv?.data?.[0]?.prediction_label as "0" | "1"
              ]
          );
          break;
        default:
          break;
      }

      toastHandlers.success("Prediction Success", "");
    } catch (error) {
      const err = error as ApiResponseError;

      toastHandlers.error("Prediction Failure", err);
    }
  };

  const value = data?.data.plots.filter(
    (item) => typeof plot === "string" && item.includes(plot)
  )[0];

  useEffect(() => {
    if (activeModel) {
      Object.entries(defaultValue).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [defaultValue, activeModel]);

  return (
    <Container noGutter className="w-full overflow-auto">
      <Header
        showSideBar={false}
        setShow={() => {}}
        showSideBarOnSM={false}
        isSidebarCollapsed={false}
        setSidebarCollapsed={() => {}}
      />
      <div className="mt-8 px-5 w-fit">
        <h4 className="text-2xl mb-4">Monitor And Evaluation</h4>
        <Menubar className="w-fit">
          <MenubarMenu>
            <MenubarTrigger>Select Models</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={() => {
                setActiveModel("Education")
                setMessage(null);
                reset(defaultValue, {
                  keepDefaultValues: false,
                  keepValues: false,
                  keepDirtyValues: false,
                  keepErrors: false,
                  keepDirty: false,
                });
              }}>
                Education Literacy
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onSelect={() => setActiveModel("Maternal")}>
                Maternal mortality ratio
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Life Expectancy at birth</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem
                    onSelect={() => {
                      setActiveModel("Life Expectancy (both)");
                      setMessage(null)
                      reset(defaultValue, {
                        keepDefaultValues: false,
                        keepValues: false,
                        keepDirtyValues: false,
                        keepErrors: false,
                        keepDirty: false,
                      });
                    }}
                  >
                    Both Sex
                  </MenubarItem>
                  <MenubarItem
                    onSelect={() => setActiveModel("Life Expectancy (male)")}
                  >
                    Males
                  </MenubarItem>
                  <MenubarItem
                    onSelect={() => setActiveModel("Life Expectancy (female)")}
                  >
                    Females
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <Container>
        <div className="flex gap-4 w-full mt-5">
          <div className="flex-1">
            <Card className="w-full py-4">
              <CardContent>
                <Select
                  value={extractHtmlName(value ?? "")}
                  onValueChange={(value) => {
                    setPlot(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Plot" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {data?.data.plots.map?.((visual) => {
                      let name = extractHtmlName(visual);
                      return (
                        <SelectItem value={name}>
                          {name.split("--")?.[1]}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {data?.data.plots
                  .filter(
                    (uri) => typeof plot === "string" && uri.includes(plot)
                  )
                  .map((item) => (
                    <iframe src={item} className="h-[26rem] w-full mt-2" />
                  ))}
              </CardContent>
            </Card>
          </div>

          <div className="w-[30rem]">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Model prediction</CardTitle>
                <CardDescription>
                  Deploy your new project in one-click.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ForgeForm onSubmit={handleSubmit} ref={ref} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  isLoading={convertToCsvMutation.isPending || isPending}
                  onClick={() => ref.current?.onSubmit()}
                >
                  Run Model
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {message && (
          <div className="text-center mt-6 w-full border-2 border-dashed py-3 border-purple-600 mb-20">
            <p className="">{message}</p>
          </div>
        )}
      </Container>
    </Container>
  );
};
