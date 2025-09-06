import {Button, Typography} from "@mui/material";
import {useReplicant} from "../use-replicant";

export const Runners = () => {
	const getRunnerData = () => {
		nodecg.sendMessage("runners:get");
	};

	const runners = useReplicant("runners");

	return (
		<>
			<Typography variant='h4'>走者一覧</Typography>
			{runners?.map((r, index) => (
				<div key={index}>{r.name}</div>
			))}
			<Button
				variant='contained'
				color='success'
				onClick={() => getRunnerData()}
			>
				更新
			</Button>
		</>
	);
};
