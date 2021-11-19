import {
  FeatureCollection,
  Geometry,
  GeometryCollection,
  Properties,
} from "@turf/turf";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { isValidGeoJson } from "../src/helpers";
import styles from "../styles/Home.module.css";
import ReactMapGl, {
  InteractiveMapProps,
  Layer,
  Source,
  ViewState,
} from "react-map-gl";
type ViewportState = Pick<
  InteractiveMapProps,
  | "altitude"
  | "bearing"
  | "latitude"
  | "longitude"
  | "pitch"
  | "zoom"
  | "transitionDuration"
  | "width"
  | "height"
>;

const initialViewState: ViewportState = {
  latitude: 0,
  longitude: 0,
  zoom: 1,
};

const Home: NextPage = () => {
  const [viewSate, setViewState] = useState<ViewportState>(initialViewState);
  const [inputText, setInputText] = useState<string>("");
  const [geojson, setGeojson] = useState<
    FeatureCollection<Geometry | GeometryCollection, Properties> | undefined
  >();

  const updateGeojson = (text: string) => {
    if (isValidGeoJson(text)) {
      setGeojson(JSON.parse(text));
    } else {
      setGeojson(undefined);
    }
  };

  useEffect(() => {
    fetch("./test.geojson")
      .then((res) => res.text())
      .then((text) => {
        setInputText(text);
        updateGeojson(text);
      });
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>TurfJS webworker example</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div>
          <div className={styles.grid}>
            <label htmlFor="textarea">Sample GeoJSON</label>
            <textarea
              style={{
                width: "800px",
                maxWidth: "800px",
                height: "200px",
                maxHeight: "200px",
              }}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                updateGeojson(e.target.value);
              }}
            />
            {geojson === undefined && (
              <div>
                <span style={{ color: "red" }}>Invalid GeoJSON</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <ReactMapGl
            {...viewSate}
            onViewStateChange={(newViewState: { viewState: ViewState }) =>
              setViewState(newViewState.viewState)
            }
            width="800px"
            height="300px"
            mapStyle="https://geoserveis.icgc.cat/contextmaps/osm-bright.json"
          >
            {
              //@ts-ignore
              <Source id="sampleData" type="geojson" data={geojson}>
                <Layer
                  id="smapleLayer"
                  paint={{ "circle-color": "#aa66dd" }}
                  type="circle"
                />
              </Source>
            }
          </ReactMapGl>
        </div>
      </main>
    </div>
  );
};

export default Home;
