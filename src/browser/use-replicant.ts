import {klona as clone} from "klona/json";
import {useEffect, useState} from "react";
import {ReplicantMap} from "../nodecg/replicants";

export const useReplicant = <TRepName extends keyof ReplicantMap>(
	replicantName: TRepName,
) => {
	const replicant = nodecg.Replicant(replicantName);
	const [value, setValue] = useState<ReplicantMap[TRepName] | null>(null);

	useEffect(() => {
		const handleChange = (newValue: ReplicantMap[TRepName]) => {
			setValue((oldValue) => {
				if (newValue !== oldValue) {
					return newValue;
				}
				return clone(newValue);
			});
		};
		replicant.on("change", handleChange);
		return () => {
			replicant.removeListener("change", handleChange);
		};
	}, [replicant]);

	return value;
};
