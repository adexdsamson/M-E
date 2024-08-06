import { useEffect } from "react";
import { useState } from "react";
import Papa from "papaparse";

type State = {
  data: Record<string, string>[];
  error: null | unknown;
  isLoading: boolean;
  isCompleted: boolean;
};

export const useCsvData = (url?: string) => {
  const [state, setState] = useState<State>({
    data: [],
    error: null,
    isLoading: false,
    isCompleted: false,
  });

  useEffect(() => {
    if (!url) return;
    let controller: ReadableStreamDefaultReader<Uint8Array> | undefined;
    let cancel = false;

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        if (!response?.body) return;

        const reader = response.body.getReader();
        controller = reader;

        const decoder = new TextDecoder("utf-8"); // Assumes CSV is encoded as UTF-8
        let result = "";
        let done = false;

        while (!done && !cancel) {
          const { value, done: streamDone } = await reader.read();

          if (streamDone) {
            done = true;
          } else {
            result += decoder.decode(value);
          }
        }

        if (!cancel) {
          // Parse the CSV data if needed (e.g., using a CSV parsing library)
          // Here, we split the CSV into rows assuming a newline delimiter.
          const { data } = Papa.parse<Record<string, string>>(result, {
            header: true,
          });

          // Process and store the CSV data
          setState((prev) => ({
            ...prev,
            data,
            isLoading: false,
            error: null,
          }));
        }
      } catch (error) {
        if (!cancel) {
          setState((prev) => ({
            ...prev,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error: error as any,
            isLoading: false,
            data: [],
          }));
        }
      }
    };

    if (url) {
      fetchData();
    }

    return () => {
      cancel = true;
      if (controller) {
        controller.cancel();
      }
    };
  }, [url]);

  // console.log('controller', controller);

  const getCsvData = async (url: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      if (!response?.body) return;

      const reader = response.body.getReader();

      const decoder = new TextDecoder("utf-8"); // Assumes CSV is encoded as UTF-8
      let result = "";
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();

        if (streamDone) {
          done = true;
        } else {
          result += decoder.decode(value);
        }
      }

      // Parse the CSV data if needed (e.g., using a CSV parsing library)
      // Here, we split the CSV into rows assuming a newline delimiter.
      const { data } = Papa.parse<Record<string, string>>(result, {
        header: true,
      });

      // Process and store the CSV data
      setState((prev) => ({
        ...prev,
        data,
        isLoading: false,
        error: null,
      }));

      return { data };
    } catch (error) {
      console.log(error);

      setState((prev) => ({
        ...prev,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: error as any,
        isLoading: false,
        data: [],
      }));

      return { data: [] };
    }
  };

  return { ...state, getCsvData };
};
