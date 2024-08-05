import { create } from "zustand";
import { persist, combine, PersistOptions } from "zustand/middleware";
import {
  createSelectorHooks,
  ZustandHookSelectors,
  createSelectorFunctions,
  ZustandFuncSelectors,
} from "auto-zustand-selectors-hook";
import { User } from "../types";

type InitialState = {
  user: User | null;
  token: string | null;
  refresh: string | null;
  authorities: string[];
};

type Actions = {
  setReset: () => void;
  setUser: (user: InitialState["user"]) => void;
  setToken: (user: InitialState["token"]) => void;
  setRefreshToken: (user: InitialState["refresh"]) => void;
  setAuthorities: (user: InitialState["authorities"]) => void;
};

const initialState: InitialState = {
  user: null,
  token: null,
  refresh: null,
  authorities: [],
};

const reducer = combine(initialState, (set) => ({
  setUser: (user: InitialState["user"]) => set({ user }),
  setToken: (token: InitialState["token"]) => set({ token }),
  setRefreshToken: (refresh: InitialState["refresh"]) => set({ refresh }),
  setAuthorities: (authorities: InitialState["authorities"]) => {
    set({ authorities });
  },
  setReset: () => {
    set(initialState);
  },
}));

// const logger = (config) => (set, get, api) => {
//   return config(
//     (args) => {
//       // console.log("studio  applying", args);
//       set(args);
//       // console.log("studio  new state", get());
//     },
//     get,
//     api
//   );
// };

type Selectors = InitialState & Actions;

const persistConfig: PersistOptions<Selectors> = {
  name: "auth",
};

const baseReducer = create(persist(reducer, persistConfig));

export const {
  useUser,
  useSetUser,
  useToken,
  useRefresh,
  useSetToken,
  useAuthorities,
  useSetReset,
  useSetRefreshToken,
  useSetAuthorities,
} = createSelectorHooks(baseReducer) as typeof baseReducer &
  ZustandHookSelectors<Selectors>;

export const authSlice = createSelectorFunctions(
  baseReducer
) as typeof baseReducer & ZustandFuncSelectors<Selectors>;

export const storeFunctions = createSelectorFunctions(
  baseReducer
) as typeof baseReducer & ZustandFuncSelectors<Selectors>;
