import styled from "@emotion/styled";
import {ReactNode} from "react";

const CategoryContainer = styled.div<{
	fontSize?: number;
	x?: number;
	y?: number;
}>`
	font-family: "Luckiest Guy", system-ui;
	-webkit-text-stroke: 1px white;
	position: absolute;
	width: 100%;
	text-align: center;
	left: ${(props) => props.x}px;
	top: ${(props) => props.y}px;

	font-size: ${(props) => (props.fontSize ? props.fontSize : 128)}px;
	font-weight: 1000;
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
