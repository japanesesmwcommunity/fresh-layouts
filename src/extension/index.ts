import {ServerNodecgInstance} from "../nodecg/nodecg";
import schedule from "./schedule";
import timer from "./timer";

export default (nodecg: ServerNodecgInstance) => {
	schedule(nodecg);
	timer(nodecg);
};
