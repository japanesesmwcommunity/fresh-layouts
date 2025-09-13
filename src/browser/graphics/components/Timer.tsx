import styled from "@emotion/styled";
import "@fontsource/fira-code/700.css";
import {useReplicant} from "../../use-replicant";

const TimerContainer = styled.div<{
	fontSize?: number;
	textColor: string;
	x?: number;
	y?: number;
	width?: number;
}>`
	font-family: "Fira Code", monospace;
	color: ${(props) => props.textColor};
	text-shadow: 
		-1px -1px 0 white,
		0px -1px 0 white,
		1px -1px 0 white,
		-1px 0px 0 white,
		1px 0px 0 white,
		-1px 1px 0 white,
		0px 1px 0 white,
		1px 1px 0 white,
		-2px -2px 0 white,
		0px -2px 0 white,
		2px -2px 0 white,
		-2px 0px 0 white,
		2px 0px 0 white,
		-2px 2px 0 white,
		0px 2px 0 white,
		2px 2px 0 white;
	position: absolute;
	left: ${(props) => props.x}px;
	top: ${(props) => props.y}px;
	width: ${(props) => props.width ?? 350}px;
	text-align: right;
	transition:
		text-shadow 0.3s ease,
		color 0.3s ease;
	font-size: ${(props) => (props.fontSize ? props.fontSize : 128)}px;
`;

export const Timer = (props: {fontSize?: number; x?: number; y?: number; width?: number}) => {
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
			width={props.width}
		>
			{timer?.formattedTime}
		</TimerContainer>
	);
};
