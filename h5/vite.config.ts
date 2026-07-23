import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { fileURLToPath, URL } from "node:url";
import uniRouter from "unplugin-uni-router/vite";

const scssVariables = fileURLToPath(new URL("./src/styles/variables.scss", import.meta.url));

export default defineConfig(async () => {
	return {
		plugins: [uni(), uniRouter()],
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `@import "${scssVariables.replace(/\\/g, "/")}";`,
				},
			},
		},
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
				"#": fileURLToPath(new URL("./types", import.meta.url)),
				"@ccnc/shared": fileURLToPath(new URL("../packages/shared/src/index.ts", import.meta.url)),
			},
		},
		server: {
			port: 5174,
			proxy: {
				"/api": {
					target: "http://localhost:3000",
					changeOrigin: true,
				},
			},
		},
	};
});
