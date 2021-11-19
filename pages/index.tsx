import {
  buffer,
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
  const [sampleGeojson, setSampleGeojson] = useState<
    FeatureCollection<Geometry | GeometryCollection, Properties> | undefined
  >();
  const [buffered, setBuffered] = useState<
    FeatureCollection<Geometry | GeometryCollection, Properties> | undefined
  >();

  const updateGeojson = (text: string) => {
    if (isValidGeoJson(text)) {
      setSampleGeojson(JSON.parse(text));
    } else {
      setSampleGeojson(undefined);
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
        <h1 className={styles.title}>
          Using <a href="https://turfjs.org/">TurfJS</a> in a webworker
        </h1>
        <div>
          <div className={styles.grid}>
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
            {sampleGeojson === undefined && (
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
              <Source id="sampleData" type="geojson" data={sampleGeojson}>
                <Layer
                  id="sampleLayer"
                  paint={{ "circle-color": "#aa66dd" }}
                  type="circle"
                />
              </Source>
            }
            {buffered && 
              //@ts-ignore
              <Source id={"bufferRing"} type="geojson" data={buffered}>
              <Layer
                id="bufferRingLayer"
                paint={{ "line-color": "#66eeaa" }}
                type="line"
              />
              <Layer
                id="bufferRingLayerFill"
                paint={{ "fill-color": "#66eeaa", "fill-opacity": 0.2 }}
                type="fill"
              />
              </Source>
            }
          </ReactMapGl>
        </div>
        <div>
          <div className={styles.grid}>
            <button onClick={() => setBuffered(undefined)}>Clear buffer</button>
            <button
              onClick={() => {
                if (sampleGeojson !== undefined) {
                  const start = Date.now();
                  const buf = buffer(sampleGeojson, 10, { units: "kilometers" });
                  setBuffered(buf);
                  const end = Date.now();
                  console.log(`Buffer took ${end - start}ms`, buf);
                }
              }}
            >
              Run buffer Synchronously
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
