import styled from "@emotion/styled";
import {ReactNode} from "react";

const CategoryContainer = styled.div<{
	fontSize?: number;
	x?: number;
	y?: number;
}>`
	font-family: "M PLUS Rounded 1c", monospace;
	-webkit-text-stroke: 3px white;
	color: #ff801f;
	font-weight: 900;
	line-height: 84px;
	position: absolute;
	width: 100%;
	text-align: center;
	padding: 5px;
	left: ${(props) => props.x}px;
	top: ${(props) => props.y}px;
	font-size: ${(props) => (props.fontSize ? props.fontSize : 128)}px;
`;

export const Category = (props: {
	fontSize: number;
	x: number;
	y: number;
	children: ReactNode;
}) => {
	return (
		<CategoryContainer
			fontSize={props.fontSize}
			x={props.x}
			y={props.y}
		>
			{props.children}
		</CategoryContainer>
	);
};
