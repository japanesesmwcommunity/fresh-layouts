import {Example} from "./generated/example";

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
	example: Example;
};

export {ReplicantMap};
