import {CurrentRun} from "./generated/currentRun";
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
	"assets:bg": Assets[];
	"assets:logo": Assets[];
	schedule: Schedule;
	timer: Timer;
	currentRun: CurrentRun;
	runners: Runners;
};

export {ReplicantMap};
