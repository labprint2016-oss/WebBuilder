import { create } from "zustand";
import {
  loadDashboardChromeState,
  normalizeDashboardChromeState,
} from "../../dashboardChrome";
import { useBuilderContextStore } from "../builderContextStore";

const createInitialSiteState = () => {
  const initialState = loadDashboardChromeState();
  return {
    draft: initialState,
    saved: initialState,
    isSaving: false,
  };
};

const INITIAL_SITE_STATE = createInitialSiteState();

const getCurrentSiteId = () =>
  useBuilderContextStore.getState().siteId || "default";

const createInitialState = () => ({
  stateBySiteId: {
    [getCurrentSiteId()]: INITIAL_SITE_STATE,
  },
});

export const useDashboardChromeStore = create((set) => ({
  ...createInitialState(),

  setDraft: (nextDraft) =>
    set((state) => {
      const siteId = getCurrentSiteId();
      const siteState =
        state.stateBySiteId[siteId] || createInitialSiteState();
      const resolvedDraft =
        typeof nextDraft === "function" ? nextDraft(siteState.draft) : nextDraft;
      const draft = normalizeDashboardChromeState(resolvedDraft);
      return {
        stateBySiteId: {
          ...state.stateBySiteId,
          [siteId]: { ...siteState, draft },
        },
      };
    }),

  hydrate: (nextState, requestedSiteId) => {
    const siteId = requestedSiteId || getCurrentSiteId();
    const normalized = normalizeDashboardChromeState(nextState);
    set((state) => ({
      stateBySiteId: {
        ...state.stateBySiteId,
        [siteId]: {
          draft: normalized,
          saved: normalized,
          isSaving: false,
        },
      },
    }));
  },

  markSaved: (nextState, requestedSiteId) => {
    const siteId = requestedSiteId || getCurrentSiteId();
    const normalized = normalizeDashboardChromeState(nextState);
    set((state) => {
      const siteState =
        state.stateBySiteId[siteId] || createInitialSiteState();
      return {
        stateBySiteId: {
          ...state.stateBySiteId,
          [siteId]: { ...siteState, saved: normalized },
        },
      };
    });
  },

  setSaving: (isSaving, requestedSiteId) =>
    set((state) => {
      const siteId = requestedSiteId || getCurrentSiteId();
      const siteState =
        state.stateBySiteId[siteId] || createInitialSiteState();
      const nextIsSaving = Boolean(isSaving);
      if (siteState.isSaving === nextIsSaving) return state;
      return {
        stateBySiteId: {
          ...state.stateBySiteId,
          [siteId]: { ...siteState, isSaving: nextIsSaving },
        },
      };
    }),

  resetDashboardChrome: () =>
    set((state) => ({
      stateBySiteId: {
        ...state.stateBySiteId,
        [getCurrentSiteId()]: createInitialSiteState(),
      },
    })),
}));

export const useDashboardChromeSiteState = () => {
  const siteId = useBuilderContextStore((state) => state.siteId);
  return useDashboardChromeStore(
    (state) => state.stateBySiteId[siteId] || INITIAL_SITE_STATE
  );
};
