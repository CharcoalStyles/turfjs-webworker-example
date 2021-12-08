import {
  AllGeoJSON,
  buffer,
  FeatureCollection,
  Geometry,
  GeometryCollection,
  Properties,
} from "@turf/turf";
import { TurfFunction } from "./workers/turf.worker";

const bufferDistance = 10;
const bufferUnit = "kilometers";

export type BufferProps = {
  geojson: FeatureCollection<Geometry | GeometryCollection, Properties>;
  onComplete: BufferOnComplete;
};

export type BufferOnComplete = (
  newGeojson:
    | FeatureCollection<Geometry | GeometryCollection, Properties>
    | undefined,
  newSyncTime?: number,
  newAsyncTime?: number
) => void;

export const SyncBuffer = ({ geojson, onComplete }: BufferProps) => {
  const start = Date.now();
  const buf = buffer(geojson, bufferDistance, {
    units: bufferUnit,
  });
  onComplete(buf, Date.now() - start, undefined);
};

export const AsyncBuffer = async ({ geojson, onComplete }: BufferProps) => {
  const start = Date.now();
  const worker = new Worker(
    new URL("/src/workers/turf.worker.ts", import.meta.url)
  );

  worker.onmessage = ({ data }: MessageEvent<AllGeoJSON | null>) => {
    const end = Date.now();
    worker.terminate();
    if (data !== null) {
      //@ts-ignore
      onComplete(data, undefined, Date.now() - start);
    } else {
      onComplete(undefined, undefined, Date.now() - start);
    }
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
};
