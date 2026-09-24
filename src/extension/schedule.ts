import {klona} from "klona";
import {Run} from "../nodecg/generated/schedule";
import {ServerNodecgInstance} from "../nodecg/nodecg";

export default (nodecg: ServerNodecgInstance) => {
	const scheduleRep = nodecg.Replicant("schedule");
	const currentRunRep = nodecg.Replicant("currentRun");
	const runnersRep = nodecg.Replicant("runners");
	const timerRep = nodecg.Replicant("timer");
	const message = (error: unknown) =>
		error instanceof Error
			? error.message
			: "スケジュールを更新できませんでした。";
	const normalize = (input: Run, existing?: Run): Run => {
		if (!input || typeof input.title !== "string" || !input.title.trim())
			throw new Error("タイトルを入力してください。");
		if (
			typeof input.timestamp !== "string" ||
			!Number.isFinite(Date.parse(input.timestamp))
		)
			throw new Error("開催日時を入力してください。");
		if (!Array.isArray(input.runners))
			throw new Error("走者の指定が不正です。");
		if (input.type !== undefined && typeof input.type !== "string")
			throw new Error("typeの指定が不正です。");
		const type = input.type?.trim() ?? "";
		if (
			type &&
			type !== existing?.type &&
			!runnersRep.value?.some((runner) => runner.type?.trim() === type)
		)
			throw new Error("typeを一覧から選び直してください。");
		const ids = new Set<number>();
		const runners = input.runners.map((runner) => {
			const found =
				runnersRep.value?.find((item) => item.id === runner?.id) ??
				existing?.runners.find((item) => item.id === runner?.id);
			if (!found || ids.has(found.id))
				throw new Error("走者の指定が不正です。一覧から選び直してください。");
			ids.add(found.id);
			return {...found, finishTime: ""};
		});
		return {
			id: input.id,
			title: input.title.trim(),
			type,
			timestamp: new Date(input.timestamp).toISOString(),
			runners,
		};
	};
	const sort = (runs: Run[]) =>
		runs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
	nodecg.listenFor("schedule:add", (input, ack) => {
		try {
			const run = normalize(input);
			run.id =
				Math.max(
					0,
					currentRunRep.value?.id ?? 0,
					...(scheduleRep.value ?? []).map((item) => item.id),
				) + 1;
			scheduleRep.value = sort([...(scheduleRep.value ?? []), run]);
			if (ack && !ack.handled) ack(null);
		} catch (error) {
			if (ack && !ack.handled) ack(message(error));
		}
	});
	nodecg.listenFor("schedule:update", (input, ack) => {
		try {
			const existing = scheduleRep.value?.find((run) => run.id === input?.id);
			if (!existing) throw new Error("スケジュールが見つかりません。");
			const run = normalize(input, existing);
			scheduleRep.value = sort(
				scheduleRep.value!.map((item) => (item.id === run.id ? run : item)),
			);
			if (ack && !ack.handled) ack(null);
		} catch (error) {
			if (ack && !ack.handled) ack(message(error));
		}
	});
	nodecg.listenFor("schedule:remove", (id, ack) => {
		try {
			if (currentRunRep.value?.id === id)
				throw new Error("配信中のスケジュールは削除できません。");
			if (!scheduleRep.value?.some((run) => run.id === id))
				throw new Error("スケジュールが見つかりません。");
			scheduleRep.value = scheduleRep.value.filter((run) => run.id !== id);
			if (ack && !ack.handled) ack(null);
		} catch (error) {
			if (ack && !ack.handled) ack(message(error));
		}
	});
	nodecg.listenFor("current-run:set", (id, ack) => {
		try {
			if (timerRep.value?.state === "Running")
				throw new Error(
					"タイマーを停止してからスケジュールを反映してください。",
				);
			const run = scheduleRep.value?.find((item) => item.id === id);
			if (!run) throw new Error("スケジュールが見つかりません。");
			currentRunRep.value = klona({
				...run,
				runners: run.runners.map((runner) => ({...runner, finishTime: ""})),
			});
			nodecg.sendMessage("timer:reset");
			if (ack && !ack.handled) ack(null);
		} catch (error) {
			if (ack && !ack.handled) ack(message(error));
		}
	});
	const confirmRun = (id: number) => {
		currentRunRep.value?.runners.forEach((runner) => {
			if (runner.id === id) runner.finishTime = timerRep.value?.formattedTime;
		});
		if (
			currentRunRep.value?.runners.length &&
			currentRunRep.value.runners.every((runner) => runner.finishTime) &&
			timerRep.value?.state === "Running"
		)
			nodecg.sendMessage("timer:stop");
	};
	const undoConfirmRun = (id: number) => {
		currentRunRep.value?.runners.forEach((runner) => {
			if (runner.id === id) {
				runner.finishTime = "";
				if (timerRep.value?.state === "Paused")
					nodecg.sendMessage("timer:start");
			}
		});
	};
	nodecg.listenFor("current-run:player-confirm", confirmRun);
	nodecg.listenFor("current-run:player-undo", undoConfirmRun);
};
