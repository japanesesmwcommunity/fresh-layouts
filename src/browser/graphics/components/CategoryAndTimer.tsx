import styled from "@emotion/styled";
import {ReactNode} from "react";
import {OUTLINE_COLOR} from "../colors";
import {Category} from "./Category";
import {Timer} from "./Timer";

const Container = styled.div<{x: number; y: number; w: number; h: number}>`
	position: absolute;
	left: ${(props) => props.x}px;
	top: ${(props) => props.y}px;
	width: ${(props) => props.w}px;
	height: ${(props) => props.h}px;
	box-sizing: border-box;
	padding: 12px 20px;
	background-color: rgb(20 20 20 / 80%);
	border: 3px solid ${OUTLINE_COLOR};
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 12px;
`;

const Separator = styled.hr`
	width: 100%;
	margin: 0;
	border: 0;
	border-top: 2px solid ${OUTLINE_COLOR};
`;

export const CategoryAndTimer = (props: {
	x: number;
	y: number;
	w: number;
	h: number;
	category: ReactNode;
}) => (
	<Container
		x={props.x}
		y={props.y}
		w={props.w}
		h={props.h}
	>
		<Category>{props.category}</Category>
		<Separator />
		<Timer fontSize={90} />
	</Container>
);
