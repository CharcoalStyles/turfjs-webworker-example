/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  trailingSlash: true,
  webpack(config) {
    config.resolve.alias["mapbox-gl"] = "maplibre-gl";
    return config;
  },
};
