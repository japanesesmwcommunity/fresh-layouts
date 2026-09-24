import styled from "@emotion/styled";
import "@fontsource-variable/google-sans-flex/wght.css";
import "@fontsource/m-plus-1p/900.css";
import {ReactNode, useLayoutEffect, useRef} from "react";

const CategoryContainer = styled.div<{
	fontSize?: number;
	x?: number;
	y?: number;
}>`
	font-family: "Google Sans Flex Variable", "M PLUS 1p", sans-serif;
	color: #ffffff;
	font-weight: 900;
	line-height: 1.3;
	position: ${(props) =>
		props.x !== undefined || props.y !== undefined ? "absolute" : "relative"};
	width: 100%;
	box-sizing: border-box;
	white-space: nowrap;
	text-align: center;
	padding: 5px;
	left: ${(props) => props.x}px;
	top: ${(props) => props.y}px;
	font-size: ${(props) => (props.fontSize ? props.fontSize : 64)}px;
`;

export const Category = (props: {
	fontSize?: number;
	x?: number;
	y?: number;
	children: ReactNode;
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLSpanElement>(null);

	useLayoutEffect(() => {
		const container = containerRef.current;
		const text = textRef.current;
		if (!container || !text) return;
		let active = true;

		const fitText = () => {
			if (!active) return;
			const style = getComputedStyle(container);
			const availableWidth =
				container.clientWidth -
				parseFloat(style.paddingLeft) -
				parseFloat(style.paddingRight);
			if (availableWidth <= 0) return;
			let upper = props.fontSize || 64;
			let lower = 0;
			text.style.fontSize = upper + "px";
			if (text.getBoundingClientRect().width <= availableWidth) return;

			while (upper - lower > 0.1) {
				const size = (lower + upper) / 2;
				text.style.fontSize = size + "px";
				if (text.getBoundingClientRect().width > availableWidth) {
					upper = size;
				} else {
					lower = size;
				}
			}
			text.style.fontSize = lower + "px";
		};

		fitText();
		const observer = new ResizeObserver(fitText);
		observer.observe(container);
		void document.fonts.ready.then(fitText);
		document.fonts.addEventListener("loadingdone", fitText);
		return () => {
			active = false;
			observer.disconnect();
			document.fonts.removeEventListener("loadingdone", fitText);
		};
	}, [props.children, props.fontSize]);

	return (
		<CategoryContainer
			ref={containerRef}
			fontSize={props.fontSize}
			x={props.x}
			y={props.y}
		>
			<span
				ref={textRef}
				style={{display: "inline-block"}}
			>
				{props.children}
			</span>
		</CategoryContainer>
	);
};
