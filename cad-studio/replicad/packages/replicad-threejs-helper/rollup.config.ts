import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import sourceMaps from "rollup-plugin-sourcemaps";
import typescript from "rollup-plugin-ts";

export default {
  input: `lib/replicad-threejs-helper.ts`,
  output: [
    {
      file: "dist/umd/replicad-threejs-helper.js",
      name: "replicad",
      format: "umd",
      sourcemap: true,
    },
    {
      file: "dist/cjs/replicad-threejs-helper.js",
      name: "replicad",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/es/replicad-threejs-helper.js",
      format: "es",
      sourcemap: true,
    },
  ],
  external: [],
  watch: {
    include: "lib/**",
  },
  plugins: [
    typescript(),
    commonjs(),
    nodeResolve(),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
  external: ["three"],
};
