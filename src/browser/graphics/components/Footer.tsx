import styled from "@emotion/styled";
import {ReactNode} from "react";
import {Message} from "../components/Message";
import {Clock} from "./Clock";

const Container = styled.div`
	display: grid;
	position: absolute;
	width: 100%;
	height: 70px;
	left: 0;
	bottom: 0;
	background-color: rgb(0 0 0/80%);
	font-size: 40px;
	grid-template-columns: 1fr 1fr;
	grid-template-areas: "message clock";
	align-items: center;
	padding: 0 20px;
`;

export const Footer = (props: {children?: ReactNode}) => {
	return (
		<Container>
			<Message>{props.children}</Message>
			<Clock />
		</Container>
	);
};
