import styled from "@emotion/styled";
import {Pause, PlayArrow, RestartAlt} from "@mui/icons-material";
import {Button} from "@mui/material";
import {useReplicant} from "../use-replicant";

const Container = styled.div`
	display: grid;
	grid-template-columns: 1fr auto;
	grid-template-rows: 72px 1fr;
	grid-template-areas:
		"timer"
		"ctrls";
	justify-items: center;
	align-items: center;
	gap: 8px 0;
`;

const Timer = styled.div<{color: string}>`
	grid-area: timer;
	padding: 0 16px;
	font-size: 48px;
	font-weight: 700;
	border-radius: 16px;
	color: ${(props) => props.color};
`;

const ButtonContainer = styled.div`
	display: grid;
	grid-area: ctrls;
	justify-items: center;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 0 8px;
`;

const PlayButton = (props: {onClick: () => void; disabled: boolean}) => {
	return (
		<Button
			variant='contained'
			startIcon={<PlayArrow />}
			onClick={props.onClick}
			disabled={props.disabled}
		>
			START
		</Button>
	);
};

const PauseButton = (props: {onClick: () => void; disabled: boolean}) => {
	return (
		<Button
			variant='contained'
			startIcon={<Pause />}
			onClick={props.onClick}
			disabled={props.disabled}
		>
			PAUSE
		</Button>
	);
};

const ResetButton = (props: {onClick: () => void; disabled: boolean}) => {
	return (
		<Button
			variant='contained'
			startIcon={<RestartAlt />}
			onClick={props.onClick}
			disabled={props.disabled}
		>
			RESET
		</Button>
	);
};
export const ControlTimer = () => {
	const timer = useReplicant("timer");

	const color = (): string => {
		if (timer) {
			if (timer.state === "Running") {
				return "green";
			}

			if (timer.state === "Paused") {
				return "grey";
			}

			return "";
		}
		return "";
	};

	return (
		<>
			<Container>
				<Timer color={color()}>{timer?.formattedTime}</Timer>
				<ButtonContainer>
					<PlayButton
						onClick={() => nodecg.sendMessage("timer:start")}
						disabled={timer?.state === "Running"}
					/>
					<PauseButton
						onClick={() => nodecg.sendMessage("timer:stop")}
						disabled={timer?.state !== "Running"}
					/>
					<ResetButton
						onClick={() => nodecg.sendMessage("timer:reset")}
						disabled={timer?.state === "NotRunning"}
					/>
				</ButtonContainer>
			</Container>
		</>
	);
};
