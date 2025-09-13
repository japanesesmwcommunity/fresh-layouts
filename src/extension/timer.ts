import {ServerNodecgInstance} from "../nodecg/nodecg";

const formatTime = (ms: number | null | undefined) => {
	if (typeof ms !== "number") {
		return "";
	} else {
		const totalSeconds = Math.floor(ms / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		const formattedHours = String(hours).padStart(1, "0");
		const formattedMinutes = String(minutes).padStart(2, "0");
		const formattedSeconds = String(seconds).padStart(2, "0");

		return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
	}
};

export default (nodecg: ServerNodecgInstance) => {
	const timerRep = nodecg.Replicant("timer");

	let startTime: Date | null = null;
	let timerInterval: NodeJS.Timeout | null = null;

	const startTimer = () => {
		if (timerInterval || !timerRep.value) {
			return;
		}
		startTime = new Date();
		timerRep.value.state = "Running";
		timerInterval = setInterval(() => {
			if (!timerRep.value) return;
			timerRep.value.raw =
				new Date().getTime() -
				startTime!.getTime() +
				timerRep.value.timeAtPaused;
			timerRep.value.formattedTime = formatTime(timerRep.value.raw);
		}, 500);
		nodecg.log.info("timer start");
	};

	const stopTimer = () => {
		if (!timerRep.value) {
			return;
		}

		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
			timerRep.value.timeAtPaused = timerRep.value.raw;
			timerRep.value.state = "Paused";
		}
		nodecg.log.info("timer stop");
	};

	const resetTimer = () => {
		if (!timerRep.value) {
			return;
		}

		stopTimer();
		timerRep.value.raw = 0;
		timerRep.value.formattedTime = formatTime(timerRep.value.raw);
		timerRep.value.timeAtPaused = 0;
		timerRep.value.state = "NotRunning";
		nodecg.log.info("timer reset");
	};
	nodecg.listenFor("timer:start", startTimer);
	nodecg.listenFor("timer:stop", stopTimer);
	nodecg.listenFor("timer:reset", resetTimer);
};
