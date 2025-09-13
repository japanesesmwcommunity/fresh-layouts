import {CssBaseline} from "@mui/material";
import {useMemo} from "react";
import {Runner} from "../../../nodecg/generated/currentRun";
import {render} from "../../render";
import {useReplicant} from "../../use-replicant";
import {Category} from "../components/Category";
import {Footer} from "../components/Footer";
import {InfoBox} from "../components/InfoBox";
import {Logo} from "../components/Logo";
import {Nameplate} from "../components/Nameplate";
import {RunnerMessages} from "../components/RunnerMessages";
import {Timer} from "../components/Timer";
import {Box, calculateClipPath} from "../util/clipPath";
import {Overlay} from "./OverlayTemplate";

// 定数をコンポーネント外で定義
const GAME_WIDTH = 720; // 3枠逆L字レイアウトでの個別ゲーム画面の幅
const GAME_HEIGHT = (GAME_WIDTH / 16) * 9;
const GAME_OFFSET_X = 445;
const NAMEPLATE_OFFSET_Y = 0; // ゲーム画面からのオフセット
const GAP = 20; // 各枠の間のギャップ

const ThreePlayer = () => {
	const getPlayerPosition = (playerIndex: number) => {
		// 逆L字レイアウトの配置計算
		// Player 0: 上段右（右寄せ）, Player 1: 下段左, Player 2: 下段右
		if (playerIndex === 0) {
			// 上段右（右寄せ）
			return {
				game: {
					x: GAME_OFFSET_X,
					y: 15,
					width: GAME_WIDTH,
					height: GAME_HEIGHT,
				},
				nameplate: {
					x: GAME_OFFSET_X + GAME_WIDTH + GAP,
					y: 15 + GAME_HEIGHT + NAMEPLATE_OFFSET_Y,
					width: GAME_WIDTH,
				},
			};
		} else if (playerIndex === 1) {
			// 下段左
			return {
				game: {
					x: GAME_OFFSET_X + GAP + GAME_WIDTH,
					y: 15,
					width: GAME_WIDTH,
					height: GAME_HEIGHT,
				},
				nameplate: {
					x: GAME_OFFSET_X,
					y: 15 + GAME_HEIGHT + NAMEPLATE_OFFSET_Y,
					width: GAME_WIDTH,
				},
			};
		} else if (playerIndex === 2) {
			// 下段右
			const bottomY = 15 + GAME_HEIGHT + 80 + GAP; // 上段 + nameplate高さ + ギャップ
			return {
				game: {
					x: GAME_OFFSET_X,
					y: bottomY,
					width: GAME_WIDTH,
					height: GAME_HEIGHT,
				},
				nameplate: {
					x: GAME_OFFSET_X,
					y: bottomY + GAME_HEIGHT + NAMEPLATE_OFFSET_Y,
					width: GAME_WIDTH,
				},
			};
		}

		// フォールバック（使用されない）
		return {
			game: {x: 0, y: 0, width: GAME_WIDTH, height: GAME_HEIGHT},
			nameplate: {x: 0, y: 0, width: GAME_WIDTH},
		};
	};

	const getPlayerGamePosition = (playerIndex: number): Box[] => {
		const {game} = getPlayerPosition(playerIndex);
		return [[game.x, game.x + game.width, game.y, game.y + game.height]];
	};

	const clipPath = useMemo(() => {
		// 3つの枠のclipPathを結合
		const allBoxes: Box[] = [];
		for (let i = 0; i < 3; i++) {
			allBoxes.push(...getPlayerGamePosition(i));
		}
		return calculateClipPath(allBoxes);
	}, []);

	const currentRun = useReplicant("currentRun");

	return (
		<Overlay clipPath={clipPath}>
			{currentRun?.runners.map((runner: Runner, index: number) => {
				// 3つの枠のみ配置
				if (index < 3) {
					const {nameplate} = getPlayerPosition(index);
					return (
						<Nameplate
							key={runner.id || `placeholder-${index}`}
							x={nameplate.x}
							y={nameplate.y}
							w={nameplate.width}
							runner={runner}
						/>
					);
				}
				return null;
			})}
			<Logo
				w={400}
				h={400}
			/>
			<InfoBox
				x={10}
				y={160}
				w={420}
				h={835}
			>
				<Category
					fontSize={72}
					x={5}
					y={580}
				>
					{currentRun?.title}
				</Category>
			</InfoBox>
			<Timer
				x={35}
				y={825}
				fontSize={96}
			/>
			<RunnerMessages
				x={GAME_OFFSET_X + GAME_WIDTH + GAP}
				y={GAME_HEIGHT + GAP + 95}
				width={720}
				height={475}
				fontSize={42}
			/>
			<Footer>RTA新人大会 自称新人の部 - {currentRun?.title}</Footer>
		</Overlay>
	);
};

render(
	<>
		<CssBaseline />
		<ThreePlayer />
	</>,
);
