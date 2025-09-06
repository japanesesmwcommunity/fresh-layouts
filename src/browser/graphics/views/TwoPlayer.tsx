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
const GAME_WIDTH = 945;
const GAME_HEIGHT = (GAME_WIDTH / 16) * 9;
const NAMEPLATE_OFFSET_Y = 0; // ゲーム画面からのオフセット

const TwoPlayer = () => {
	const getPlayerPosition = (playerIndex: number) => {
		const baseX = playerIndex === 0 ? 10 : 965;
		const baseY = 65;

		return {
			game: {x: baseX, y: baseY, width: GAME_WIDTH, height: GAME_HEIGHT},
			nameplate: {
				x: baseX,
				y: baseY + GAME_HEIGHT + NAMEPLATE_OFFSET_Y,
				width: GAME_WIDTH,
			},
		};
	};

	const player1GamePosition = (): Box[] => {
		const {game} = getPlayerPosition(0);
		return [[game.x, game.x + game.width, game.y, game.y + game.height]];
	};

	const player2GamePosition = (): Box[] => {
		const {game} = getPlayerPosition(1);
		return [[game.x, game.x + game.width, game.y, game.y + game.height]];
	};

	const clipPath = useMemo(
		() =>
			calculateClipPath([...player1GamePosition(), ...player2GamePosition()]),
		[],
	);

	const currentRun = useReplicant("currentRun");

	return (
		<Overlay clipPath={clipPath}>
			{currentRun?.runners.map((runner: Runner, index: number) => {
				const {nameplate} = getPlayerPosition(index);
				return (
					<Nameplate
						key={runner.id}
						x={nameplate.x}
						y={nameplate.y}
						w={nameplate.width}
						runner={runner}
					/>
				);
			})}

			<Timer
				x={730}
				y={650}
			/>
		</Overlay>
	);
};

render(
	<>
		<CssBaseline />
		<TwoPlayer />
	</>,
);
