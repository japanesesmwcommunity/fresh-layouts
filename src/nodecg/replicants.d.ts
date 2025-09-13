import {Runners} from "./generated/runners";
import {Schedule} from "./generated/schedule";
import {Timer} from "./generated/timer";

type Assets = {
	base: string;
	bundleName: string;
	category: string;
	ext: string;
	name: string;
	sum: string;
	url: string;
};

type ReplicantMap = {
	"assets:test": Assets[];
	schedule: Schedule;
	timer: Timer;
	currentRun: Run;
	runners: Runners;
};

export {ReplicantMap};
