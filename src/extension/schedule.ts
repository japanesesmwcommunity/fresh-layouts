import {sheets} from "@googleapis/sheets";
import {klona} from "klona";
import {Run, Runner} from "../nodecg/generated/schedule";
import {ServerNodecgInstance} from "../nodecg/nodecg";

interface BundleConfig {
	googleApiKey?: string;
	spreadsheetId?: string;
}

export default (nodecg: ServerNodecgInstance) => {
	const scheduleRep = nodecg.Replicant("schedule");
	const currentRunRep = nodecg.Replicant("currentRun");
	const runnersRep = nodecg.Replicant("runners");
	const timerRep = nodecg.Replicant("timer");

	const {googleApiKey, spreadsheetId} = nodecg.bundleConfig as BundleConfig;
	const sheetsApi = sheets({version: "v4", auth: googleApiKey});

	const getRunnersData = async () => {
		if (!runnersRep.value) {
			nodecg.log.error("runner replicant does not exist.");
			return;
		}

		try {
			const res = await sheetsApi.spreadsheets.values.batchGet({
				spreadsheetId: spreadsheetId,
				ranges: ["本番用データ"],
			});
			const sheetValues = res.data.valueRanges;
			if (!sheetValues?.[0]?.values) {
				nodecg.log.error("スプレッドシートデータの取得に失敗しました。");
				return;
			}
			const [_, ...data] = sheetValues[0].values;

			const maxId =
				runnersRep.value.length > 0
					? Math.max(...runnersRep.value.map((runner) => runner.id))
					: 0;

			const rawData = data.map((content, index) => {
				return {
					id: maxId + index + 1,
					name: content[0],
					twitchId: content[1],
					message: content[2],
				};
			});

			if (rawData.length > 0) {
				runnersRep.value = rawData;
				nodecg.log.info("走者データを取得しました。");
			}
		} catch (e: any) {
			nodecg.log.error(e.message);
		}
	};

	const addSchedule = (run: Run) => {
		if (!scheduleRep.value) {
			nodecg.log.error("schedule replicant does not exist.");
			return;
		}

		const maxId =
			scheduleRep.value.length > 0
				? Math.max(...scheduleRep.value.map((s) => s.id))
				: 0;
		const newId = maxId + 1;

		run.id = newId;
		const newSchedule = [...scheduleRep.value, run];
		newSchedule.sort((a, b) => {
			if (!a.timestamp || !b.timestamp) return 0;
			return a.timestamp.localeCompare(b.timestamp);
		});
		scheduleRep.value = newSchedule;
		nodecg.log.info(`スケジュール: ${run.title}を追加しました。`);
	};

	const updateSchedule = (data: {index: number; run: Run}) => {
		if (!scheduleRep.value) {
			nodecg.log.error("schedule replicant does not exist.");
			return;
		}

		const {index, run} = data;
		if (index >= 0 && index < scheduleRep.value.length) {
			const newSchedule = [...scheduleRep.value];
			newSchedule[index] = run;
			newSchedule.sort((a, b) => {
				if (!a.timestamp || !b.timestamp) return 0;
				return a.timestamp.localeCompare(b.timestamp);
			});
			scheduleRep.value = newSchedule;
			nodecg.log.info(`スケジュール更新: ${run.title} (ID: ${run.id})`);
		}
	};

	const removeSchedule = (id: number) => {
		if (!scheduleRep.value) {
			nodecg.log.error("schedule replicant does not exist.");
			return;
		}

		const run = scheduleRep.value.find((r) => r.id === id);
		scheduleRep.value = scheduleRep.value.filter((run) => run.id !== id);
		nodecg.log.info(`スケジュール削除: ${run?.title || "Unknown"} (ID: ${id})`);
	};

	const setCurrentRun = (id: number) => {
		const run = scheduleRep.value?.find((run) => run.id === id);
		if (!run) {
			return;
		}

		// ディープコピー
		currentRunRep.value = klona(run);
		nodecg.log.info(
			`現在の演目: ${currentRunRep.value?.title} (ID: ${currentRunRep.value?.id})`,
		);
	};

	const confirmRun = (id: number) => {
		currentRunRep.value?.runners?.forEach((runner: Runner) => {
			if (runner.id === id) {
				runner.finishTime = timerRep.value?.formattedTime;
			}
		});

		const allFinished = currentRunRep.value?.runners?.every(
			(runner: Runner) => runner.finishTime && runner.finishTime !== "",
		);
		if (allFinished && timerRep.value?.state === "Running") {
			nodecg.sendMessage("timer:stop");
			nodecg.log.info("全員完走のためタイマーを停止しました");
		}
	};

	const undoConfirmRun = (id: number) => {
		currentRunRep.value?.runners?.forEach((runner: Runner) => {
			if (runner.id === id) {
				runner.finishTime = "";
				if (timerRep.value?.state === "Paused") {
					nodecg.sendMessage("timer:start");
				}
			}
		});
	};

	nodecg.listenFor("schedule:add", addSchedule);
	nodecg.listenFor("schedule:update", updateSchedule);
	nodecg.listenFor("schedule:remove", removeSchedule);

	nodecg.listenFor("current-run:set", setCurrentRun);
	nodecg.listenFor("current-run:player-confirm", confirmRun);
	nodecg.listenFor("current-run:player-undo", undoConfirmRun);

	nodecg.listenFor("runners:get", getRunnersData);
};
