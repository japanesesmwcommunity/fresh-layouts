import styled from "@emotion/styled";
import {CssBaseline, Typography} from "@mui/material";
import {useMemo} from "react";
import {render} from "../../render";
import {useReplicant} from "../../use-replicant";
import {Footer} from "../components/Footer";
import {Logo} from "../components/Logo";
import {RunnerMessages} from "../components/RunnerMessages";
import {Overlay} from "./OverlayTemplate";

const ScheduleContainer = styled.div`
	font-family: "M PLUS Rounded 1c", monospace;
	position: absolute;
	border: 4px solid #fff;
	background-color: rgba(0, 0, 0, 0.35);
	border-radius: 15px;
	padding: 30px;
	top: 20px;
	left: 1100px;
	width: 800px;
	height: 980px;
	color: white;
`;

const RunContainer = styled.div`
	font-family: "M PLUS Rounded 1c", monospace;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border: 1px solid #fff;
	border-radius: 5px;
	height: 100px;
	background-color: rgba(0, 0, 0, 0.35);
	padding: 30px;
	margin: 10px;
`;

/* 
const AssetsContainer = styled.div`
	position: absolute;
	width: 630px;
	height: 500px;
	border: 4px solid #fff;
	background-color: rgba(0, 0, 0, 0.35);
	border-radius: 15px;
	top: 475px;
	left: 130px;
`;

const AssetImage = styled.img<{isVisible: boolean}>`
	width: 100%;
	height: 100%;
	object-fit: contain;
	opacity: ${(props) => (props.isVisible ? 1 : 0)};
	transition: all 1.5s ease-in-out;
`;

const Assets = () => {
	const assets = useReplicant("assets:display");
	const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
	const [showAsset, setShowAsset] = useState(true);

	const fadeSeconds = 10;

	useEffect(() => {
		if (!assets || assets.length === 0) return;

		if (assets.length === 1) {
			setCurrentAssetIndex(0);
			setShowAsset(true);
			return;
		}

		const interval = setInterval(() => {
			setShowAsset(false);
			setTimeout(() => {
				setCurrentAssetIndex((prevIndex) => (prevIndex + 1) % assets.length);
				setShowAsset(true);
			}, 1500);
		}, fadeSeconds * 1000);

		return () => clearInterval(interval);
	}, [assets, fadeSeconds]);

	if (!assets || assets.length === 0) {
		return null;
	}

	const currentAsset = assets[currentAssetIndex];

	if (!currentAsset) return;

	return (
		<AssetsContainer>
			<AssetImage
				src={currentAsset.url}
				isVisible={showAsset}
				alt={currentAsset.name}
			/>
		</AssetsContainer>
	);
};
*/

const Schedule = () => {
	const currentRun = useReplicant("currentRun");
	const schedule = useReplicant("schedule");

	const upcomingRun = useMemo(() => {
		if (!currentRun) return;

		return schedule?.filter((run) => run.timestamp > currentRun?.timestamp);
	}, [currentRun, schedule]);

	const formatDateTime = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleString("ja-JP", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};
	return (
		<ScheduleContainer>
			<Typography
				variant='h2'
				sx={{
					fontFamily: '"M PLUS Rounded 1c", sans-serif',
					fontWeight: 600,
					marginBottom: 5,
					textAlign: "center",
				}}
			>
				今後のスケジュール
			</Typography>
			{upcomingRun?.map((run) => (
				<RunContainer>
					<Typography
						variant='h4'
						sx={{fontFamily: '"M PLUS Rounded 1c", sans-serif'}}
					>
						{formatDateTime(run.timestamp)}
					</Typography>
					<Typography
						variant='h4'
						sx={{
							fontFamily: '"M PLUS Rounded 1c", sans-serif',
							fontWeight: 400,
						}}
					>
						{run.title}
					</Typography>
				</RunContainer>
			))}
		</ScheduleContainer>
	);
};

const App = () => {
	const currentRun = useReplicant("currentRun");
	return (
		<>
			<Overlay>
				<Schedule />
				<Logo
					w={400}
					h={400}
					x={1470}
					y={860}
				/>
				<RunnerMessages
					x={15}
					y={85}
					width={1070}
					height={850}
					fontSize={56}
				/>
				<Footer>RTA新人大会 自称新人の部 - {currentRun?.title}</Footer>
			</Overlay>
		</>
	);
};

render(
	<>
		<CssBaseline />
		<App />
	</>,
);
