import styled from "@emotion/styled";
import {Button, Typography} from "@mui/material";
import {Runner} from "../../nodecg/generated/currentRun";
import {useReplicant} from "../use-replicant";

const RunnerContainer = styled.div`
	display: flex;
	justify-items: center;
	grid-template-columns: 1fr 1fr 1fr;
	justify-content: space-between;
	margin: 8px;
`;

const ButtonContainer = styled.div`
	display: flex;
	justify-items: center;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 0 8px;
`;

export const PlayerControl = () => {
	const currentRun = useReplicant("currentRun");
	return (
		<>
			{currentRun?.runners.map((r: Runner) => (
				<RunnerContainer>
					<Typography variant='h6'>{r.name}</Typography>
					<ButtonContainer>
						<Typography variant='h6'>{r.finishTime}</Typography>
						<Button
							variant='contained'
							onClick={() =>
								nodecg.sendMessage("current-run:player-confirm", r.id)
							}
							disabled={r.finishTime !== undefined && r.finishTime !== ""}
						>
							完走
						</Button>
						<Button
							variant='contained'
							onClick={() =>
								nodecg.sendMessage("current-run:player-undo", r.id)
							}
							disabled={!r.finishTime}
						>
							キャンセル
						</Button>
					</ButtonContainer>
				</RunnerContainer>
			))}
		</>
	);
};
