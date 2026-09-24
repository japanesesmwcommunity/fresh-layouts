import {createHash} from "node:crypto";
import {mkdir, readFile, rename, writeFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {Configschema} from "../nodecg/generated/configschema";
import type {
	TwitchCategory,
	TwitchChannel,
	TwitchUpdate,
} from "../nodecg/generated/twitch";

type Config = NonNullable<Configschema["twitch"]>;
type Tokens = {accessToken: string; refreshToken: string; source: string};

export function validateTwitchUpdate(value: TwitchUpdate): TwitchUpdate {
	if (
		!value ||
		typeof value.title !== "string" ||
		!value.title.trim() ||
		[...value.title.trim()].length > 140
	) {
		throw new Error("配信タイトルは1〜140文字で入力してください。");
	}
	if (typeof value.gameId !== "string" || !/^(\d+)?$/.test(value.gameId)) {
		throw new Error("カテゴリーを検索結果から選択してください。");
	}
	return {title: value.title.trim(), gameId: value.gameId};
}

export class TwitchClient {
	private tokens: Tokens;
	private readonly tokenFile: string;
	private readonly ready: Promise<void>;
	private refreshing?: Promise<void>;
	private validatedAt = 0;

	constructor(private readonly config: Config) {
		this.tokenFile = resolve(
			config.tokenFile ?? "db/fresh-layouts/twitch-token.json",
		);
		const source = createHash("sha256")
			.update(
				JSON.stringify([
					config.clientId,
					config.broadcasterId,
					config.refreshToken,
				]),
			)
			.digest("hex");
		this.tokens = {
			accessToken: config.accessToken ?? "",
			refreshToken: config.refreshToken,
			source,
		};
		this.ready = this.loadTokens();
	}

	private async loadTokens() {
		try {
			const saved = JSON.parse(
				await readFile(this.tokenFile, "utf8"),
			) as Tokens;
			if (
				saved.source === this.tokens.source &&
				typeof saved.accessToken === "string" &&
				typeof saved.refreshToken === "string" &&
				saved.refreshToken
			)
				this.tokens = saved;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "ENOENT")
				throw new Error("Twitchトークン保存ファイルを読み込めません。");
		}
	}

	private async request(url: string, init: RequestInit = {}) {
		try {
			return await fetch(url, {...init, signal: AbortSignal.timeout(15000)});
		} catch {
			throw new Error(
				"Twitchに接続できません。時間をおいて再試行してください。",
			);
		}
	}

	private async refresh() {
		if (this.refreshing) return this.refreshing;
		this.refreshing = (async () => {
			const response = await this.request("https://id.twitch.tv/oauth2/token", {
				method: "POST",
				body: new URLSearchParams({
					grant_type: "refresh_token",
					client_id: this.config.clientId,
					client_secret: this.config.clientSecret,
					refresh_token: this.tokens.refreshToken,
				}),
			});
			if (!response.ok)
				throw new Error(
					"Twitch認証を更新できません。認証設定とRefresh Tokenを確認してください。",
				);
			const data = (await response.json()) as {
				access_token: string;
				refresh_token: string;
			};
			if (!data.access_token || !data.refresh_token)
				throw new Error("Twitchの認証応答が不正です。");
			this.tokens = {
				...this.tokens,
				accessToken: data.access_token,
				refreshToken: data.refresh_token,
			};
			this.validatedAt = 0;
			try {
				await mkdir(dirname(this.tokenFile), {recursive: true});
				await writeFile(this.tokenFile + ".tmp", JSON.stringify(this.tokens), {
					mode: 0o600,
				});
				await rename(this.tokenFile + ".tmp", this.tokenFile);
			} catch {
				throw new Error(
					"更新したTwitchトークンを保存できません。保存先の書き込み権限を確認してください。",
				);
			}
		})();
		try {
			await this.refreshing;
		} finally {
			this.refreshing = undefined;
		}
	}

	async validate() {
		await this.ready;
		if (!this.tokens.accessToken) await this.refresh();
		let response = await this.request("https://id.twitch.tv/oauth2/validate", {
			headers: {Authorization: "OAuth " + this.tokens.accessToken},
		});
		if (response.status === 401) {
			await this.refresh();
			response = await this.request("https://id.twitch.tv/oauth2/validate", {
				headers: {Authorization: "OAuth " + this.tokens.accessToken},
			});
		}
		if (!response.ok)
			throw new Error(
				"Twitch認証を検証できません。再認証または再試行してください。",
			);
		const data = (await response.json()) as {
			client_id: string;
			user_id: string;
			scopes: string[];
		};
		if (
			data.client_id !== this.config.clientId ||
			data.user_id !== this.config.broadcasterId
		) {
			this.validatedAt = 0;
			throw new Error(
				"Twitchの認証アカウントと設定の配信者ID・Client IDが一致しません。",
			);
		}
		if (!data.scopes?.includes("channel:manage:broadcast")) {
			this.validatedAt = 0;
			throw new Error("Twitch認証にchannel:manage:broadcast権限が必要です。");
		}
		this.validatedAt = Date.now();
	}

	private async api(path: string, init: RequestInit = {}) {
		await this.ready;
		if (Date.now() - this.validatedAt >= 60 * 60 * 1000) await this.validate();
		const send = () =>
			this.request("https://api.twitch.tv/helix/" + path, {
				...init,
				headers: {
					"Client-Id": this.config.clientId,
					Authorization: "Bearer " + this.tokens.accessToken,
					"Content-Type": "application/json",
				},
			});
		let response = await send();
		if (response.status === 401) {
			await this.refresh();
			await this.validate();
			response = await send();
		}
		if (!response.ok) {
			if (response.status === 429)
				throw new Error(
					"Twitchの利用制限に達しました。時間をおいて再試行してください。",
				);
			throw new Error(
				"Twitch APIの処理に失敗しました（HTTP " +
					response.status +
					"）。設定と入力内容を確認してください。",
			);
		}
		return response;
	}

	async getChannel(): Promise<TwitchChannel> {
		const response = await this.api(
			"channels?broadcaster_id=" +
				encodeURIComponent(this.config.broadcasterId),
		);
		const body = (await response.json()) as {
			data: {
				broadcaster_id: string;
				broadcaster_name: string;
				title: string;
				game_id: string;
				game_name: string;
			}[];
		};
		const channel = body.data[0];
		if (!channel) throw new Error("Twitchチャンネルが見つかりません。");
		return {
			broadcasterId: channel.broadcaster_id,
			broadcasterName: channel.broadcaster_name,
			title: channel.title,
			category: {id: channel.game_id, name: channel.game_name},
		};
	}

	async updateChannel(input: TwitchUpdate): Promise<void> {
		const update = validateTwitchUpdate(input);
		await this.api(
			"channels?broadcaster_id=" +
				encodeURIComponent(this.config.broadcasterId),
			{
				method: "PATCH",
				body: JSON.stringify({
					title: update.title,
					game_id: update.gameId || "0",
				}),
			},
		);
	}

	async searchCategories(query: string): Promise<TwitchCategory[]> {
		if (typeof query !== "string" || !query.trim() || query.length > 100)
			throw new Error("カテゴリー検索は1〜100文字で入力してください。");
		const response = await this.api(
			"search/categories?first=20&query=" + encodeURIComponent(query.trim()),
		);
		const body = (await response.json()) as {data: TwitchCategory[]};
		return body.data.map(({id, name}) => ({id, name}));
	}
}
