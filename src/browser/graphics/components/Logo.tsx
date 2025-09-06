import styled from "@emotion/styled";
import LogoImage from "../image/logo.png";

const LogoContainer = styled.div<{
	src: string;
	w?: number;
	h?: number;
	x?: number;
	y?: number;
}>`
	position: absolute;
	background-image: url(${(props) => props.src});
	background-size: contain;
	background-repeat: no-repeat;
	width: ${(props) => props.w || 200}px;
	height: ${(props) => props.h || 200}px;
	left: ${(props) => props.x || 20}px;
	top: ${(props) => props.y || 20}px;
`;

export const Logo = (props: {w?: number; h?: number; x?: number; y?: number}) => {
	return <LogoContainer src={LogoImage} {...props}></LogoContainer>;
};
