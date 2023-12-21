import { defineConfig } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import esmShim from "@rollup/plugin-esm-shim";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import terser from "@rollup/plugin-terser";

export default defineConfig({
  input: "./src/index.ts",
  plugins: [commonjs(), esmShim(), json(), resolve(), swc(), terser()],
  output: {
    file: "./dist/index.js",
    format: "es",
  },
});
