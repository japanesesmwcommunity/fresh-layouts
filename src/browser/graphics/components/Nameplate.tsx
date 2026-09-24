import styled from "@emotion/styled";
import {useEffect, useState} from "react";
import {Runner} from "../../../nodecg/generated/currentRun";
import iconTwitch from "../image/icon/twitch.svg";

const NAMEPLATE_HEIGHT = 60;
const SWITCH_INTERVAL = 20000;

const Container = styled.div<{
	x: number;
	y: number;
	width: number;
}>`
	position: absolute;
	left: ${(props) => props.x}px;
	top: ${(props) => props.y}px;
	width: ${(props) => props.width}px;
	height: ${NAMEPLATE_HEIGHT}px;
	background-color: rgba(0, 0, 0, 0.7);
	color: white;
	padding: 4px 16px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 40px;
	line-height: 1;
`;

const NameSection = styled.div<{isVisible: boolean}>`
	opacity: ${(props) => (props.isVisible ? 1 : 0)};
	transition: opacity 1.4s ease-in-out;
	position: relative;
	height: 40px;
	line-height: 40px;
`;

const NameText = styled.span<{withIcon: boolean}>`
	display: block;
	padding-left: ${(props) => (props.withIcon ? 44 : 0)}px;
	white-space: nowrap;
`;

const TimeSection = styled.div`
	color: rgb(255 208 54);
`;

const TwitchIcon = styled.img`
	position: absolute;
	left: 0;
	top: 50%;
	transform: translateY(-50%);
	display: block;
	width: 36px;
	height: 36px;
`;

export const Nameplate = (props: {
	x: number;
	y: number;
	w: number;
	runner: Runner;
}) => {
	const [showName, setShowName] = useState(true);
	const [isTransitioning, setIsTransitioning] = useState(false);

	useEffect(() => {
		setShowName(true);
		setIsTransitioning(false);
		if (!props.runner.twitchId) return;

		const interval = setInterval(() => {
			setIsTransitioning(true);
		}, SWITCH_INTERVAL);

		return () => clearInterval(interval);
	}, [props.runner.id, props.runner.name, props.runner.twitchId]);

	const currentText = showName ? props.runner.name : props.runner.twitchId;

	return (
		<Container
			x={props.x}
			y={props.y}
			width={props.w}
		>
			<NameSection
				isVisible={!isTransitioning}
				onTransitionEnd={(event) => {
					if (
						event.target !== event.currentTarget ||
						event.propertyName !== "opacity" ||
						!isTransitioning
					)
						return;
					setShowName((prev) => !prev);
					setIsTransitioning(false);
				}}
			>
				{!showName && props.runner.twitchId && (
					<TwitchIcon
						src={iconTwitch}
						alt='Twitch'
					/>
				)}
				<NameText withIcon={!showName && !!props.runner.twitchId}>
					{currentText}
				</NameText>
			</NameSection>
			<TimeSection>
				{props.runner.finishTime && <span>{props.runner.finishTime}</span>}
			</TimeSection>
		</Container>
	);
};
