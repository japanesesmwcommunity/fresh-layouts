import {
	BrowserNodecgConstructor,
	BrowserNodecgInstance,
} from "../nodecg/nodecg";

declare global {
	const nodecg: BrowserNodecgInstance;
	const NodeCG: BrowserNodecgConstructor;
}
