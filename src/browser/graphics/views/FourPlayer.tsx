import {CssBaseline} from "@mui/material";
import {useMemo} from "react";
import {Runner} from "../../../nodecg/generated/currentRun";
import {render} from "../../render";
import {useReplicant} from "../../use-replicant";
import {Nameplate} from "../components/Nameplate";
import {Timer} from "../components/Timer";
import {Box, calculateClipPath} from "../util/clipPath";
import {Overlay} from "./OverlayTemplate";

// 定数をコンポーネント外で定義
const GAME_WIDTH = 720; // 2x2レイアウトでの個別ゲーム画面の幅
const GAME_HEIGHT = (GAME_WIDTH / 16) * 9;
const NAMEPLATE_OFFSET_Y = 0; // ゲーム画面からのオフセット
const GAP = 20; // 各枠の間のギャップ

const FourPlayer = () => {
	const getPlayerPosition = (playerIndex: number) => {
		// 2x2レイアウトの配置計算
		const row = Math.floor(playerIndex / 2); // 0: 上段, 1: 下段
		const col = playerIndex % 2; // 0: 左, 1: 右

		const baseX = 445 + col * (GAME_WIDTH + GAP);
		const baseY = 15 + row * (GAME_HEIGHT + GAP + 80); // Nameplateの高さ分も考慮

		return {
			game: {x: baseX, y: baseY, width: GAME_WIDTH, height: GAME_HEIGHT},
			nameplate: {
				x: baseX,
				y: baseY + GAME_HEIGHT + NAMEPLATE_OFFSET_Y,
				width: GAME_WIDTH,
			},
		};
	};

	const getPlayerGamePosition = (playerIndex: number): Box[] => {
		const {game} = getPlayerPosition(playerIndex);
		return [[game.x, game.x + game.width, game.y, game.y + game.height]];
	};

	const clipPath = useMemo(() => {
		// 4つの枠のclipPathを結合
		const allBoxes: Box[] = [];
		for (let i = 0; i < 4; i++) {
			allBoxes.push(...getPlayerGamePosition(i));
		}
		return calculateClipPath(allBoxes);
	}, []);

	const currentRun = useReplicant("currentRun");

	return (
		<Overlay clipPath={clipPath}>
			{currentRun?.runners.map((runner: Runner, index: number) => {
				// 4つの枠があるので、runnerが3人以下でも4つのNameplateを配置
				if (index < 4) {
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

			{/* 4つ目の枠が必要な場合（3プレイヤーでも4枠表示） */}
			{currentRun?.runners && currentRun.runners.length === 3 && (
				<Nameplate
					key='placeholder-4'
					x={getPlayerPosition(3).nameplate.x}
					y={getPlayerPosition(3).nameplate.y}
					w={getPlayerPosition(3).nameplate.width}
					runner={{
						id: 0,
						name: "",
					}}
				/>
			)}

			<Timer
				x={960}
				y={650}
			/>
		</Overlay>
	);
};

render(
	<>
		<CssBaseline />
		<FourPlayer />
	</>,
);
