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
import { AsyncBuffer, BufferOnComplete, SyncBuffer } from "../src/buffers";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [syncTime, setSyncTime] = useState(-1);
  const [asyncTime, setAsyncTime] = useState(-1);
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

  const handleCompletedBuffer: BufferOnComplete = (
    newGeojson,
    newSyncTime,
    newAsyncTime
  ) => {
    console.log({ newGeojson, newSyncTime, newAsyncTime });
    newGeojson && setBuffered(newGeojson);
    newSyncTime && setSyncTime(newSyncTime);
    newAsyncTime && setAsyncTime(newAsyncTime);
  };

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
                      SyncBuffer({
                        geojson: geojson,
                        onComplete: handleCompletedBuffer,
                      });
                    }
                  }}
                >
                  Run buffer Synchronously
                </button>
                <button
                  onClick={() => {
                    if (geojson !== undefined) {
                      AsyncBuffer({
                        geojson: geojson,
                        onComplete: handleCompletedBuffer,
                      });
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
                  {(asyncTime !== -1 || syncTime !== -1) && "Last runs:"}
                  {asyncTime !== -1 && ` async: ${asyncTime}ms`}
                  {syncTime !== -1 && ` sync: ${syncTime}ms`}
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
