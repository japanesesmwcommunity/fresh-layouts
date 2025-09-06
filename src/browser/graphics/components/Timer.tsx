import styled from "@emotion/styled";
import "@fontsource/luckiest-guy";
import {useReplicant} from "../../use-replicant";

const TimerContainer = styled.div<{
	fontSize?: number;
	textColor: string;
	x?: number;
	y?: number;
}>`
	font-family: "Luckiest Guy", system-ui;
	color: ${(props) => props.textColor};
	-webkit-text-stroke: 2px white;
	position: absolute;
	left: ${(props) => props.x}px;
	top: ${(props) => props.y}px;

	transition:
		-webkit-text-stroke 0.3s ease,
		color 0.3s ease;

	font-size: ${(props) => (props.fontSize ? props.fontSize : 128)}px;
`;

export const Timer = (props: {fontSize?: number; x?: number; y?: number}) => {
	const timer = useReplicant("timer");

	const color = (): string => {
		if (timer) {
			if (timer.state === "Running") {
				return "rgb(0, 186, 69)";
			}

			if (timer.state === "Paused") {
				return "rgb(230, 176, 0)";
			}

			return "#525252";
		}
		return "#525252";
	};

	return (
		<TimerContainer
			fontSize={props.fontSize}
			textColor={color()}
			x={props.x}
			y={props.y}
		>
			{timer?.formattedTime}
		</TimerContainer>
	);
};
