import {klona} from "klona";
import {Run, Runner} from "../nodecg/generated/schedule";
import {ServerNodecgInstance} from "../nodecg/nodecg";

export default (nodecg: ServerNodecgInstance) => {
	const scheduleRep = nodecg.Replicant("schedule");
	const currentRunRep = nodecg.Replicant("currentRun");
	const timerRep = nodecg.Replicant("timer");

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
};
