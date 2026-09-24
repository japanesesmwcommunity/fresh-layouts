import {Box, Button, Stack, Typography} from "@mui/material";
import {useReplicant} from "../use-replicant";

export const PlayerControl = () => {
	const currentRun = useReplicant("currentRun");
	return (
		<Stack spacing={2}>
			{currentRun?.runners.map((runner) => (
				<Box
					key={runner.id}
					sx={{borderTop: "1px solid", borderColor: "divider", pt: 2}}
				>
					<Stack
						direction='row'
						justifyContent='space-between'
						spacing={1}
						sx={{mb: 1}}
					>
						<Typography sx={{overflowWrap: "anywhere"}}>
							{runner.name}
						</Typography>
						<Typography
							sx={{fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap"}}
						>
							{runner.finishTime || "未完走"}
						</Typography>
					</Stack>
					<Stack
						direction='row'
						spacing={1}
					>
						<Button
							variant='contained'
							onClick={() =>
								nodecg.sendMessage("current-run:player-confirm", runner.id)
							}
							disabled={!!runner.finishTime}
						>
							完走
						</Button>
						<Button
							variant='outlined'
							onClick={() =>
								nodecg.sendMessage("current-run:player-undo", runner.id)
							}
							disabled={!runner.finishTime}
						>
							取り消し
						</Button>
					</Stack>
				</Box>
			))}
		</Stack>
	);
};
