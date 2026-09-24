import {sheets} from "@googleapis/sheets";
import {ServerNodecgInstance} from "../nodecg/nodecg";
import {normalizeRunner, parseRunnerRows} from "./runner-data";

export default (nodecg: ServerNodecgInstance) => {
	const runnersRep = nodecg.Replicant("runners");
	const scheduleRep = nodecg.Replicant("schedule");
	const currentRunRep = nodecg.Replicant("currentRun");
	const {googleApiKey, spreadsheetId} = nodecg.bundleConfig;
	const sheetsApi = sheets({version: "v4", auth: googleApiKey});
	let importing = false;
	const message = (error: unknown) =>
		error instanceof Error ? error.message : "走者情報の処理に失敗しました。";
	nodecg.listenFor("runners:get", async (_, ack) => {
		if (importing) {
			if (ack && !ack.handled) ack("走者情報を取得中です。");
			return;
		}
		importing = true;
		try {
			if (!googleApiKey || !spreadsheetId)
				throw new Error("スプレッドシートの連携設定がありません。");
			const response = await sheetsApi.spreadsheets.values.batchGet({
				spreadsheetId,
				ranges: ["走者"],
			});
			const rows = response.data.valueRanges?.[0]?.values;
			if (!rows) throw new Error("走者シートのデータを取得できませんでした。");
			const ids = [
				...(runnersRep.value ?? []),
				...(scheduleRep.value ?? []).flatMap((run) => run.runners),
				...(currentRunRep.value?.runners ?? []),
			].map((runner) => runner.id);
			const runners = parseRunnerRows(rows, Math.max(0, ...ids));
			runnersRep.value = runners;
			nodecg.log.info("走者データを取得しました。");
			if (ack && !ack.handled) ack(null, runners.length);
		} catch (error) {
			const text =
				error instanceof Error && error.name === "GaxiosError"
					? "スプレッドシートの取得に失敗しました。APIキー・共有設定・シート名を確認してください。"
					: message(error);
			if (ack && !ack.handled) ack(text);
		} finally {
			importing = false;
		}
	});
	nodecg.listenFor("runners:update", (input, ack) => {
		try {
			if (importing)
				throw new Error(
					"スプレッドシートの取得が終わってから編集してください。",
				);
			const existing = runnersRep.value?.find(
				(runner) => runner.id === input?.id,
			);
			if (!existing)
				throw new Error("走者が見つかりません。一覧を確認してください。");
			const fields = normalizeRunner(input);
			runnersRep.value = runnersRep.value!.map((runner) =>
				runner.id === input.id ? {...runner, ...fields} : runner,
			);
			if (scheduleRep.value)
				scheduleRep.value = scheduleRep.value.map((run) => ({
					...run,
					runners: run.runners.map((runner) =>
						runner.id === input.id ? {...runner, ...fields} : runner,
					),
				}));
			if (ack && !ack.handled) ack(null);
		} catch (error) {
			if (ack && !ack.handled) ack(message(error));
		}
	});
};
