import react from "@vitejs/plugin-react";
import rollupEsbuild from "rollup-plugin-esbuild";
import rollupExternals from "rollup-plugin-node-externals";
import {defineConfig} from "vite";
import nodecg from "./vite-plugin-nodecg.mjs";

export default defineConfig(() => {
	return {
		plugins: [
			react(),
			nodecg({
				bundleName: "nodecg-react-template",
				graphics: "./src/browser/graphics/views/**/*.tsx",
				dashboard: "./src/browser/dashboard/views/**/*.tsx",
				extension: {
					input: "./src/extension/index.ts",
					plugins: [rollupEsbuild(), rollupExternals()],
				},
			}),
		],
	};
});
