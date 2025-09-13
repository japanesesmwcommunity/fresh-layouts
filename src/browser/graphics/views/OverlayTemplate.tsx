import styled from "@emotion/styled";
import "@fontsource/m-plus-rounded-1c/400.css";
import "@fontsource/m-plus-rounded-1c/700.css";
import "@fontsource/m-plus-rounded-1c/800.css";
import "@fontsource/m-plus-rounded-1c/900.css";
import {ReactNode} from "react";
import overlayImage from "../image/fresh-layout.png";

const Container = styled.div<{bgImg: string; clipPath: string}>`
	position: absolute;
	width: 1920px;
	height: 1080px;
	background-image: url(${(props) => props.bgImg});
	font-family: "M PLUS Rounded 1c", sans-serif;
	font-weight: 700;
	clip-path: polygon(${(props) => props.clipPath});
`;

export const Overlay = (props?: {clipPath?: string; children?: ReactNode}) => {
	return (
		<Container
			bgImg={overlayImage}
			clipPath={props?.clipPath || ""}
		>
			{props?.children}
		</Container>
	);
};
