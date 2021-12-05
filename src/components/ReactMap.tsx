import {
  FeatureCollection,
  Geometry,
  GeometryCollection,
  Properties,
} from "@turf/helpers";
import React, { useState } from "react";
import ReactMapGl, {
  InteractiveMapProps,
  Layer,
  Source,
  ViewState,
} from "react-map-gl";

type ReactMapProps = {
  geojson:
    | FeatureCollection<Geometry | GeometryCollection, Properties>
    | undefined;
  buffered:
    | FeatureCollection<Geometry | GeometryCollection, Properties>
    | undefined;
};

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

export const ReactMap = ({ geojson, buffered }: ReactMapProps) => {
  const [viewSate, setViewState] = useState<ViewportState>(initialViewState);

  return (
    <ReactMapGl
      {...viewSate}
      onViewStateChange={(newViewState: { viewState: ViewState }) =>
        setViewState(newViewState.viewState)
      }
      width="800px"
      height="300px"
      mapStyle="https://geoserveis.icgc.cat/contextmaps/osm-bright.json"
    >
      {geojson && (
        //@ts-ignore
        <Source id="sampleData" type="geojson" data={geojson}>
          <Layer
            id="sampleLayer"
            paint={{ "circle-color": "#aa66dd" }}
            type="circle"
          />
        </Source>
      )}
      {buffered && (
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
      )}
    </ReactMapGl>
  );
};
