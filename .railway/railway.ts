import { defineRailway, preserve, project, service, volume } from "railway/iac";

export default defineRailway((ctx) => {
	if (ctx.environment === "development") {
		const data = volume("fresh-layouts-dev-volume", {
			alerts: { usage: { "100": {}, "80": {}, "95": {} } },
			allowOnlineResize: true,
			region: "asia-southeast1-eqsg3a",
			sizeMB: 5000,
		});
		const app = service("fresh-layouts-dev", {
			build: { buildEnvironment: "V3", builder: "DOCKERFILE", dockerfilePath: "Dockerfile.railway" },
			start: "",
			replicas: { "asia-southeast1-eqsg3a": 1 },
			deploy: { drainingSeconds: 30 },
			volumeMounts: { "/data": data },
			env: { PORT: preserve() },
		});
		return project("fresh-layouts", { resources: [app, data] });
	}

	if (ctx.environment === "production") {
		const app = service("fresh-layouts", {
			build: { builder: "DOCKERFILE", dockerfilePath: "Dockerfile.railway" },
			replicas: { "asia-southeast1-eqsg3a": 1 },
			env: {
				NODECG_BASE_URL: preserve(),
				NODECG_GOOGLEAPI_KEY: preserve(),
				NODECG_HOST: preserve(),
				NODECG_LOGIN_DISCORD_ALLOWED_USER_IDS: preserve(),
				NODECG_LOGIN_DISCORD_CLIENT_ID: preserve(),
				NODECG_LOGIN_DISCORD_CLIENT_SECRET: preserve(),
				NODECG_LOGIN_DISCORD_ENABLED: preserve(),
				NODECG_LOGIN_ENABLED: preserve(),
				NODECG_LOGIN_SESSION_SECRET: preserve(),
				NODECG_SPREADSHEET_ID: preserve(),
			},
		});
		return project("fresh-layouts", { resources: [app] });
	}

	throw new Error(`Unsupported Railway environment: ${ctx.environment}`);
});
