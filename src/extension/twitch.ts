import {ServerNodecgInstance} from "../nodecg/nodecg";
import {TwitchClient} from "./twitch-client";

export default (nodecg: ServerNodecgInstance) => {
	const config = nodecg.bundleConfig.twitch;
	if (config)
		Object.defineProperty(nodecg.bundleConfig, "twitch", {
			value: config,
			enumerable: false,
		});
	const client = config ? new TwitchClient(config) : undefined;
	const requireClient = () => {
		if (!client)
			throw new Error(
				"Twitch連携が未設定です。サーバーのtwitch設定を追加してください。",
			);
		return client;
	};
	const errorMessage = (error: unknown) =>
		error instanceof Error ? error.message : "Twitchの処理に失敗しました。";
	nodecg.listenFor("twitch:get", async (_, ack) => {
		try {
			const channel = await requireClient().getChannel();
			if (ack && !ack.handled) ack(null, channel);
		} catch (error) {
			if (ack && !ack.handled) ack(errorMessage(error));
		}
	});
	nodecg.listenFor("twitch:update", async (input, ack) => {
		try {
			await requireClient().updateChannel(input);
			if (ack && !ack.handled) ack(null);
		} catch (error) {
			if (ack && !ack.handled) ack(errorMessage(error));
		}
	});
	nodecg.listenFor("twitch:search-categories", async (query, ack) => {
		try {
			const categories = await requireClient().searchCategories(query);
			if (ack && !ack.handled) ack(null, categories);
		} catch (error) {
			if (ack && !ack.handled) ack(errorMessage(error));
		}
	});
	if (client) {
		const validate = () =>
			client
				.validate()
				.catch((error: unknown) => nodecg.log.warn(errorMessage(error)));
		void validate();
		setInterval(() => void validate(), 60 * 60 * 1000).unref();
	}
};
