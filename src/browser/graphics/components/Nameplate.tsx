import styled from "@emotion/styled";
import {useEffect, useState} from "react";
import {Runner} from "../../../nodecg/generated/currentRun";
import iconTwitch from "../image/icon/twitch.svg";

// 定数をコンポーネント外で定義
const NAMEPLATE_HEIGHT = 70;
const SWITCH_INTERVAL = 5000;

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
	padding: 8px 16px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 48px;
`;

const NameSection = styled.div<{isVisible: boolean}>`
	opacity: ${(props) => (props.isVisible ? 1 : 0)};
	/* TODO: 削除検討 */
	transform: translateY(${(props) => (props.isVisible ? "0px" : "0px")});
	transition:
		opacity 1.4s ease-in-out,
		transform 1.4s ease-in-out;
	display: flex;
	align-items: center;
	gap: 8px;
`;

const TwitchIcon = styled.img`
	width: 40px;
	height: 40px;
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
		// twitchIdが存在しない場合は切り替えない
		if (!props.runner.twitchId) return;

		const interval = setInterval(() => {
			setIsTransitioning(true);
			setTimeout(() => {
				setShowName((prev) => !prev);
				setIsTransitioning(false);
			}, 700); // アニメーションの半分の時間でコンテンツを切り替え
		}, SWITCH_INTERVAL);

		return () => clearInterval(interval);
	}, [props.runner.twitchId]);

	const currentText = showName ? props.runner.name : props.runner.twitchId;

	return (
		<Container
			x={props.x}
			y={props.y}
			width={props.w}
		>
			<NameSection isVisible={!isTransitioning}>
				{!showName && props.runner.twitchId && (
					<TwitchIcon
						src={iconTwitch}
						alt='Twitch'
					/>
				)}
				<span>{currentText}</span>
			</NameSection>
			{props.runner.finishTime && <span>{props.runner.finishTime}</span>}
		</Container>
	);
};
