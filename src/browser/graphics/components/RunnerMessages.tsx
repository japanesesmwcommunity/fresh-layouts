import styled from "@emotion/styled";
import {useEffect, useState} from "react";
import {useReplicant} from "../../use-replicant";

// 定数をコンポーネント外で定義
const SWITCH_INTERVAL = 20000;
const TRANSITION_DURATION = 1400;

const MessagesContainer = styled.div<{
	x: number;
	y: number;
	width: number;
	height: number;
	fontSize?: number;
}>`
	position: absolute;
	left: ${(props) => props.x}px;
	top: ${(props) => props.y}px;
	width: ${(props) => props.width}px;
	background-color: rgba(0, 0, 0, 0.8);
	color: white;
	padding: 16px 20px;
	border-radius: 16px;
	border: 3px solid #fff;
	font-size: ${(props) => props.fontSize ?? 24}px;
	line-height: 1.4;
	height: ${(props) => props.height ?? 100}px;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
`;

const MessageSection = styled.div<{isVisible: boolean}>`
	opacity: ${(props) => (props.isVisible ? 1 : 0)};
	transform: translateX(${(props) => (props.isVisible ? "0px" : "10px")});
	transition:
		opacity ${TRANSITION_DURATION / 2000}s ease-in-out,
		transform ${TRANSITION_DURATION / 2000}s ease-in-out;
	width: 100%;
	height: 100%;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	justify-content: center;
`;

const RunnerName = styled.div`
	font-weight: 700;
	font-size: 1.5em;
	color: #ff801f;
	margin-bottom: 8px;
	flex-shrink: 0;
`;

const MessageText = styled.div<{dynamicFontSize: number}>`
	word-wrap: break-word;
	word-break: break-word;
	white-space: pre-wrap;
	overflow: hidden;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: ${(props) => props.dynamicFontSize}px;
`;

export const RunnerMessages = (props: {
	x: number;
	y: number;
	width: number;
	height: number;
	fontSize?: number;
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const runners = useReplicant("runners");

	// 文字数に応じて動的フォントサイズを計算
	const calculateDynamicFontSize = (message: string, baseFontSize: number) => {
		const messageLength = message.length;

		// 文字数に応じてフォントサイズを段階的に調整
		if (messageLength <= 30) {
			return baseFontSize; // 短いメッセージはベースサイズ
		} else if (messageLength <= 60) {
			return Math.max(baseFontSize * 0.85, 18); // 少し小さく
		} else if (messageLength <= 100) {
			return Math.max(baseFontSize * 0.7, 16); // さらに小さく
		} else {
			return Math.max(baseFontSize * 0.6, 14); // 最小サイズ
		}
	};

	// メッセージの長さに基づく制限を計算
	const calculateMaxLength = (fontSize: number) => {
		// フォントサイズに応じて最大文字数を調整
		const baseLength = Math.floor((props.width * 0.8) / (fontSize * 0.6));
		const lineHeight = fontSize * 1.4;
		const availableHeight = props.height - 40 - 32; // height - name section - padding
		const maxLines = Math.floor(availableHeight / lineHeight);
		return Math.min(baseLength * maxLines, 300); // 最大300文字まで
	};

	const formatMessage = (message: string, maxLength: number) => {
		if (message.length <= maxLength) {
			// 連続する感嘆符・疑問符をグループ化してから改行
			return message
				.replace(/([！？]+)/g, "$1\n") // 連続する感嘆符・疑問符の最後で改行
				.replace(/([。、,\s])/g, "$1\n") // その他の句読点、スペースで改行
				.replace(/\n\n+/g, "\n"); // 連続する改行を一つにまとめる
		}
		// 長すぎる場合は省略
		return message.substring(0, maxLength - 3) + "...";
	};

	// メッセージがあるランナーのみをフィルタリング
	const runnersWithMessages =
		runners?.filter(
			(runner) => runner.message && runner.message.trim() !== "",
		) ?? [];

	useEffect(() => {
		// メッセージがない場合は切り替えない
		if (!runnersWithMessages.length) return;
		if (runnersWithMessages.length <= 1) return;

		const interval = setInterval(() => {
			setIsTransitioning(true);
			setTimeout(() => {
				setCurrentIndex((prev) => (prev + 1) % runnersWithMessages.length);
				setIsTransitioning(false);
			}, TRANSITION_DURATION / 2); // アニメーションの半分の時間でコンテンツを切り替え
		}, SWITCH_INTERVAL);

		return () => clearInterval(interval);
	}, [runnersWithMessages.length]);

	// メッセージがない場合は何も表示しない
	if (!runnersWithMessages.length) {
		return null;
	}

	const currentRunner = runnersWithMessages[currentIndex];
	const baseFontSize = props.fontSize ?? 24;
	const rawMessage = currentRunner?.message || "";
	const dynamicFontSize = calculateDynamicFontSize(rawMessage, baseFontSize);
	const maxLength = calculateMaxLength(dynamicFontSize);
	const formattedMessage = formatMessage(rawMessage, maxLength);

	return (
		<MessagesContainer
			x={props.x}
			y={props.y}
			width={props.width}
			height={props.height}
			fontSize={baseFontSize}
		>
			<MessageSection isVisible={!isTransitioning}>
				<RunnerName>{currentRunner?.name}</RunnerName>
				<MessageText dynamicFontSize={dynamicFontSize}>
					{formattedMessage}
				</MessageText>
			</MessageSection>
		</MessagesContainer>
	);
};
