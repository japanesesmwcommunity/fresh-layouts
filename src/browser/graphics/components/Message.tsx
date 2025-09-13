import styled from "@emotion/styled";
import {ReactNode} from "react";

const MessageContainer = styled.div`
	grid-area: message;
	justify-self: start;
	color: white;
	line-height: 70px;
`;

export const Message = (props: {children: ReactNode}) => {
	return <MessageContainer>{props.children}</MessageContainer>;
};
