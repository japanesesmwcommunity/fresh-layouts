import styled from "@emotion/styled";
import "@fontsource-variable/google-sans-flex/wght.css";
import {useReplicant} from "../../use-replicant";

const TimerContainer = styled.div<{
	fontSize?: number;
	textColor: string;
	x?: number;
	y?: number;
	width?: number;
	textAlign?: "left" | "center" | "right";
}>`
	font-family: "Google Sans Flex Variable", sans-serif;
	font-weight: 900;
	font-variant-numeric: tabular-nums;
	color: ${(props) => props.textColor};
	position: ${(props) =>
		props.x !== undefined || props.y !== undefined ? "absolute" : "relative"};
	left: ${(props) => props.x}px;
	top: ${(props) => props.y}px;
	width: ${(props) =>
		props.width !== undefined
			? `${props.width}px`
			: props.x !== undefined || props.y !== undefined
				? "350px"
				: "100%"};
	text-align: ${(props) => props.textAlign ?? "right"};
	transition:
		text-shadow 0.3s ease,
		color 0.3s ease;
	font-size: ${(props) => (props.fontSize ? props.fontSize : 128)}px;
`;

export const Timer = (props: {
	fontSize?: number;
	x?: number;
	y?: number;
	width?: number;
	textAlign?: "left" | "center" | "right";
}) => {
	const timer = useReplicant("timer");

	const color = (): string => {
		if (timer) {
			if (timer.state === "Running") {
				return "#80d5e7";
			}

			if (timer.state === "Paused") {
				return "rgb(230, 176, 0)";
			}

			return "#b0b0b0";
		}
		return "#b0b0b0";
	};

	return (
		<TimerContainer
			fontSize={props.fontSize}
			textColor={color()}
			x={props.x}
			y={props.y}
			width={props.width}
			textAlign={props.textAlign}
		>
			{timer?.formattedTime}
		</TimerContainer>
	);
};
