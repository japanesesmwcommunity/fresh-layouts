import {ServerNodecgInstance} from "../nodecg/nodecg";
import runner from "./runner";
import schedule from "./schedule";
import timer from "./timer";
import twitch from "./twitch";

export default (nodecg: ServerNodecgInstance) => {
	twitch(nodecg);
	runner(nodecg);
	schedule(nodecg);
	timer(nodecg);
};
