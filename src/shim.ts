import { createRequire } from "node:module";

globalThis.__dirname = import.meta.dirname;
globalThis.__filename = import.meta.filename;
globalThis.require = createRequire(import.meta.url);
