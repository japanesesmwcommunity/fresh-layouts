import {ServerNodecgInstance} from "../nodecg/nodecg";
import runner from "./runner";
import schedule from "./schedule";
import timer from "./timer";

export default (nodecg: ServerNodecgInstance) => {
	runner(nodecg);
	schedule(nodecg);
	timer(nodecg);
};
