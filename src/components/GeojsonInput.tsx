import {
  FeatureCollection,
  Geometry,
  GeometryCollection,
  Properties,
} from "@turf/turf";
import { useEffect, useState } from "react";
import { isValidGeoJson } from "../helpers";

type GeojsonInputProps = {
  geojson: string;
  onUpdateGeojson: (
    geojson?: FeatureCollection<Geometry | GeometryCollection, Properties>
  ) => void;
};

export const GeojsonInput = ({
  geojson,
  onUpdateGeojson,
}: GeojsonInputProps) => {
  const [inputText, setInputText] = useState<string>(geojson);
  const [isValid, setIsValid] = useState<boolean>(true);

  const updateGeojson = (text: string) => {
    if (isValidGeoJson(text)) {
      onUpdateGeojson(JSON.parse(text));
      setIsValid(true);
    } else {
      onUpdateGeojson(undefined);
      setIsValid(false);
    }
  };

  useEffect(() => {
    setInputText(geojson);
  }, [geojson]);

  return (
    <>
      <label htmlFor="textarea">Sample GeoJSON</label>
      <textarea
        style={{
          width: "800px",
          maxWidth: "800px",
          height: "150px",
          maxHeight: "150px",
        }}
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value);
          updateGeojson(e.target.value);
        }}
      />
      {!isValid && (
        <div>
          <span style={{ color: "red" }}>Invalid GeoJSON</span>
        </div>
      )}
    </>
  );
};
