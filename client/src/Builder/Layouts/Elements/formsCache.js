import { getForms } from "../../../../Functions/forms";

const FORMS_MENU_BAR_ID = "69db17211be82fe7637ea096";

let formsCache = null;
let formsCachePromise = null;

export const getFormsCacheSnapshot = () => formsCache;

export const loadFormsCached = () => {
  if (formsCache) return Promise.resolve(formsCache);
  if (formsCachePromise) return formsCachePromise;
  formsCachePromise = getForms(FORMS_MENU_BAR_ID)
    .then((res) => {
      const list = Array.isArray(res?.data?.formPresets) ? res.data.formPresets : [];
      formsCache = {
        presets: list,
        defaultFormPresetId: String(
          res?.data?.defaultFormPresetId || list[0]?.id || ""
        ),
      };
      return formsCache;
    })
    .catch((error) => {
      formsCachePromise = null;
      throw error;
    });
  return formsCachePromise;
};

export const invalidateFormsCache = () => {
  formsCache = null;
  formsCachePromise = null;
};
