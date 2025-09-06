import styled from "@emotion/styled";
import "@fontsource/m-plus-rounded-1c";
import {ReactNode} from "react";
import overlayImage from "../image/fresh-layout.png";

const Container = styled.div<{bgImg: string; clipPath: string}>`
	position: absolute;
	width: 1920px;
	height: 1080px;
	background-image: url(${(props) => props.bgImg});
	font-family: "M PLUS Rounded 1c", sans-serif;
	font-weight: 800;
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
