import {
  AllGeoJSON,
  buffer,
  FeatureCollection,
  Geometry,
  GeometryCollection,
  Properties,
} from "@turf/turf";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import Loader from "react-loader-spinner";
import { GeojsonInput } from "../src/components/GeojsonInput";
import { ReactMap } from "../src/components/ReactMap";
import { TurfFunction } from "../src/workers/turf.worker";

const bufferDistance = 10;
const bufferUnit = "kilometers";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [times, setTimes] = useState({ sync: -1, async: -1 });
  const [geojson, setGeojson] = useState<
    FeatureCollection<Geometry | GeometryCollection, Properties> | undefined
  >();
  const [buffered, setBuffered] = useState<
    FeatureCollection<Geometry | GeometryCollection, Properties> | undefined
  >();

  useEffect(() => {
    fetch("./test.geojson")
      .then((res) => res.json())
      .then((json) => {
        setGeojson(json);
        setLoading(false);
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
        {loading ? (
          <Loader type="ThreeDots" color="#00BFFF" height={80} />
        ) : (
          <>
            <div>
              <div className={styles.grid}>
                <GeojsonInput
                  onUpdateGeojson={setGeojson}
                  geojson={JSON.stringify(geojson)}
                />
              </div>
            </div>
            <div className={styles.grid}>
              {`Total features: ${geojson?.features.length}`}
            </div>
            <div>
              <ReactMap geojson={geojson} buffered={buffered} />
            </div>
            <div>
              <div className={styles.grid}>
                <button onClick={() => setBuffered(undefined)}>
                  Clear buffer
                </button>
                <button
                  onClick={() => {
                    if (geojson !== undefined) {
                      const start = Date.now();
                      const buf = buffer(geojson, bufferDistance, {
                        units: bufferUnit,
                      });
                      setBuffered(buf);
                      const end = Date.now();
                      setTimes({ ...times, sync: end - start });
                    }
                  }}
                >
                  Run buffer Synchronously
                </button>
                <button
                  onClick={() => {
                    if (geojson !== undefined) {
                      const start = Date.now();
                      const worker = new Worker(
                        new URL("/src/workers/turf.worker.ts", import.meta.url)
                      );

                      worker.onmessage = ({
                        data,
                      }: MessageEvent<AllGeoJSON | null>) => {
                        const end = Date.now();
                        worker.terminate();
                        if (data !== null) {
                          //@ts-ignore
                          setBuffered(data);
                        } else {
                        }
                        setTimes({ ...times, async: end - start });
                      };

                      const message: TurfFunction = {
                        functionName: "buffer",
                        params: [
                          geojson,
                          bufferDistance,
                          {
                            units: bufferUnit,
                          },
                        ],
                      };
                      worker.postMessage(message);
                    }
                  }}
                >
                  Run buffer Async
                </button>
              </div>

              <div className={styles.grid}>
                <Loader type="Audio" color="#80c8f8" height={20} />
              </div>

              <div className={styles.grid}>
                <span>
                  {(times.async !== -1 || times.sync !== -1) && "Last runs:"}
                  {times.async !== -1 && ` async: ${times.async}ms`}
                  {times.sync !== -1 && ` sync: ${times.sync}ms`}
                </span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
