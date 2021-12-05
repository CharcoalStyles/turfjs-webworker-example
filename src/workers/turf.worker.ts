import * as turf from "@turf/turf";

export type TurfFunction = {
  functionName: string;
  params: any[];
};

addEventListener("message", ({ data }: MessageEvent<TurfFunction>) => {
  // @ts-ignore
  postMessage(turf[data.functionName].apply(null, data.params));
});
