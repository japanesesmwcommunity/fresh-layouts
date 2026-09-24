import {
	Alert,
	Button,
	List,
	ListItemButton,
	ListItemText,
	Stack,
	Typography,
} from "@mui/material";
import {useState} from "react";
import {useReplicant} from "../use-replicant";
import {formatScheduleTime} from "./Schedule";

export const ScheduleControl = () => {
	const schedule = useReplicant("schedule");
	const current = useReplicant("currentRun");
	const timer = useReplicant("timer");
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState(false);
	const selected = schedule?.find((run) => run.id === selectedId);
	const apply = async () => {
		if (!selected) return;
		setBusy(true);
		setError("");
		setSaved(false);
		try {
			await nodecg.sendMessage("current-run:set", selected.id);
			setSaved(true);
		} catch (error) {
			setError(error instanceof Error ? error.message : String(error));
		} finally {
			setBusy(false);
		}
	};
	return (
		<Stack spacing={2}>
			<Typography variant='h6'>スケジュール操作</Typography>
			<Typography variant='body2'>
				配信中：{current?.title || "未選択"}
			</Typography>
			{error && <Alert severity='error'>{error}</Alert>}
			{saved && (
				<Alert severity='success'>スケジュールを配信に反映しました。</Alert>
			)}
			{!schedule?.length && (
				<Typography color='text.secondary'>
					スケジュールがありません。
				</Typography>
			)}
			<List
				disablePadding
				sx={{maxHeight: 420, overflowY: "auto"}}
			>
				{schedule?.map((run) => (
					<ListItemButton
						key={run.id}
						selected={selectedId === run.id}
						disabled={busy}
						onClick={() => {
							setSelectedId(run.id);
							setSaved(false);
						}}
					>
						<ListItemText
							primary={run.title}
							secondary={
								formatScheduleTime(run.timestamp) +
								" ／ " +
								run.runners.map((runner) => runner.name).join("、")
							}
						/>
					</ListItemButton>
				))}
			</List>
			<Typography
				variant='body2'
				color='text.secondary'
			>
				反映時にタイマー・完走記録をリセットします。
			</Typography>
			{timer?.state === "Running" && (
				<Alert severity='info'>
					反映にはタイマーの停止が必要です。
				</Alert>
			)}
			<Button
				variant='contained'
				disabled={busy || !selected || !timer || timer.state === "Running"}
				onClick={() => void apply()}
			>
				{selected?.id === current?.id
					? "選択中のスケジュールを再反映"
					: "選択中のスケジュールを配信に反映"}
			</Button>
		</Stack>
	);
};
