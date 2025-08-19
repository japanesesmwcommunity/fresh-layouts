import {ServerNodecgInstance} from "../nodecg/nodecg";

export const example = (nodecg: ServerNodecgInstance) => {
	const exampleReplicant = nodecg.Replicant("example");

	setInterval(() => {
		if (exampleReplicant.value) {
			exampleReplicant.value.age++;
		}
	}, 5000);

	nodecg.listenFor("resetAge", () => {
		if (!exampleReplicant.value) return;
		exampleReplicant.value.age = 0;
		nodecg.log.info("age has been reset!");
	});

	exampleReplicant.on("change", (newVal) => {
		nodecg.log.info(newVal);
	});
};
