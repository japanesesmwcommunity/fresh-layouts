import styled from "@emotion/styled";
import {ReactNode} from "react";

const InfoBoxContainer = styled.div<{
	x: number;
	y: number;
	w: number;
	h: number;
}>`
	background-color: rgb(20 20 20/80%);
	border: 3px solid rgb(50 194 174);
	box-sizing: border-box;
	font-size: 96px;
	position: absolute;
	left: ${(props) => props.x}px;
	top: ${(props) => props.y}px;
	width: ${(props) => props.w}px;
	height: ${(props) => props.h}px;
`;

export const InfoBox = (props: {
	x: number;
	y: number;
	w: number;
	h: number;
	children?: ReactNode;
}) => {
	return (
		<InfoBoxContainer
			x={props.x}
			y={props.y}
			w={props.w}
			h={props.h}
		>
			{props.children}
		</InfoBoxContainer>
	);
};
