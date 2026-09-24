import {CssBaseline} from "@mui/material";
import {useMemo} from "react";
import {Runner} from "../../../nodecg/generated/currentRun";
import {render} from "../../render";
import {useReplicant} from "../../use-replicant";
import {CategoryAndTimer} from "../components/CategoryAndTimer";
import {Footer} from "../components/Footer";
import {InfoBox} from "../components/InfoBox";
import {Logo} from "../components/Logo";
import {NAMEPLATE_HEIGHT, Nameplate} from "../components/Nameplate";
import {RunnerMessages} from "../components/RunnerMessages";
import {Box, calculateClipPath} from "../util/clipPath";
import {Overlay} from "./OverlayTemplate";

// 定数をコンポーネント外で定義
const GAME_WIDTH = 720; // 3枠逆L字レイアウトでの個別ゲーム画面の幅
const GAME_HEIGHT = (GAME_WIDTH / 16) * 9;
const CONTENT_BOTTOM = 995;
const CATEGORY_AND_TIMER_Y = 765;
const LOWER_ROW_Y = CONTENT_BOTTOM - GAME_HEIGHT - NAMEPLATE_HEIGHT;
const GAME_OFFSET_X = 445;
const NAMEPLATE_OFFSET_Y = 0; // ゲーム画面からのオフセット
const GAP = 20; // 各枠の間のギャップ

const ThreePlayer = () => {
	const getPlayerPosition = (playerIndex: number) => {
		const x =
			playerIndex === 1 ? GAME_OFFSET_X + GAME_WIDTH + GAP : GAME_OFFSET_X;
		const y = playerIndex === 2 ? LOWER_ROW_Y : 15;
		return {
			game: {x, y, width: GAME_WIDTH, height: GAME_HEIGHT},
			nameplate: {
				x,
				y: y + GAME_HEIGHT + NAMEPLATE_OFFSET_Y,
				width: GAME_WIDTH,
			},
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
				w={600}
				h={120}
				x={-45}
				y={40}
			/>
			<InfoBox
				x={10}
				y={160}
				w={420}
				h={585}
			/>
			<CategoryAndTimer
				x={10}
				y={CATEGORY_AND_TIMER_Y}
				w={420}
				h={CONTENT_BOTTOM - CATEGORY_AND_TIMER_Y}
				category={currentRun?.title}
			/>
			<RunnerMessages
				x={GAME_OFFSET_X + GAME_WIDTH + GAP}
				y={LOWER_ROW_Y}
				width={720}
				height={GAME_HEIGHT + NAMEPLATE_HEIGHT}
				fontSize={42}
			/>
			<Footer>RTA新人大会 {currentRun?.type}</Footer>
		</Overlay>
	);
};

render(
	<>
		<CssBaseline />
		<ThreePlayer />
	</>,
);
