import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { routes } from "@/routes";
import { Suspense } from "react";
import { useProviders } from "./hooks/useProviders";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Loading from "@/components/ui/Spinner";
import { ErrorFallback } from "@/components/layouts/Error";
import { Providers } from "@/hooks/useProviders/type";
import * as Sentry from "@sentry/react";

function App() {
  const queryClient = new QueryClient();

  const router = createBrowserRouter(createRoutesFromElements(routes));

  const providers: Providers = {
    types: Sentry.ErrorBoundary,
    props: { fallback: ErrorFallback },
    children: [
      {
        types: Suspense,
        props: {
          fallback: (
            <div className="flex flex-auto items-center justify-center flex-col min-h-[100vh]">
              <Loading  />
            </div>
          ),
        },
        children: [
          {
            types: QueryClientProvider,
            props: { client: queryClient },
            children: [
              {
                types: RouterProvider,
                props: { router },
              },
            ],
          },
        ],
      },
      {
        types: Toaster,
        props: {},
      },
    ],
  };

  return useProviders(providers);
}

export default App;
