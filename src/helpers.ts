import { valid } from "geojson-validation";

export const isValidJson = (value: string) => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};
export const isValidGeoJson = (value: string) => {
  if (!isValidJson(value)) return false;
  return valid(JSON.parse(value), false);
};
