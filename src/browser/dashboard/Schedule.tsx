import {
	Alert,
	Autocomplete,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	List,
	ListItemButton,
	ListItemText,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import {useState} from "react";
import {Run} from "../../nodecg/generated/schedule";
import {useReplicant} from "../use-replicant";

export const formatScheduleTime = (value: string) =>
	new Date(value).toLocaleString("ja-JP", {
		month: "numeric",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
export const toLocalDateTime = (value: string) => {
	const date = new Date(value);
	if (!Number.isFinite(date.getTime())) return "";
	const pad = (number: number) => String(number).padStart(2, "0");
	return (
		date.getFullYear() +
		"-" +
		pad(date.getMonth() + 1) +
		"-" +
		pad(date.getDate()) +
		"T" +
		pad(date.getHours()) +
		":" +
		pad(date.getMinutes())
	);
};

export const Schedule = () => {
	const schedule = useReplicant("schedule");
	const currentRun = useReplicant("currentRun");
	const runners = useReplicant("runners");
	const [draft, setDraft] = useState<Run | null>(null);
	const [creating, setCreating] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState("");
	const open = (run?: Run) => {
		setCreating(!run);
		setDraft(
			run
				? {...run, timestamp: toLocalDateTime(run.timestamp)}
				: {id: 0, title: "", timestamp: "", runners: []},
		);
		setError("");
		setSaved("");
	};
	const save = async () => {
		if (!draft) return;
		setBusy(true);
		setError("");
		try {
			const data = {
				...draft,
				timestamp: new Date(draft.timestamp).toISOString(),
			};
			if (creating) await nodecg.sendMessage("schedule:add", data);
			else await nodecg.sendMessage("schedule:update", data);
			setDraft(null);
			setSaved("スケジュールを保存しました。");
		} catch (error) {
			setError(error instanceof Error ? error.message : String(error));
		} finally {
			setBusy(false);
		}
	};
	const remove = async () => {
		if (!draft) return;
		setBusy(true);
		setError("");
		try {
			await nodecg.sendMessage("schedule:remove", draft.id);
			setDraft(null);
			setSaved("スケジュールを削除しました。");
		} catch (error) {
			setError(error instanceof Error ? error.message : String(error));
		} finally {
			setBusy(false);
		}
	};
	const choices = [...(runners ?? [])];
	for (const runner of draft?.runners ?? []) {
		if (!choices.some((item) => item.id === runner.id)) choices.push(runner);
	}
	return (
		<Stack spacing={2}>
			<Typography variant='h6'>スケジュール編集</Typography>
			{saved && <Alert severity='success'>{saved}</Alert>}
			<Button
				variant='contained'
				onClick={() => open()}
			>
				スケジュールを追加
			</Button>
			{!schedule?.length && (
				<Typography color='text.secondary'>
					スケジュールがありません。
				</Typography>
			)}
			<List
				disablePadding
				sx={{maxHeight: 520, overflowY: "auto"}}
			>
				{schedule?.map((run) => (
					<ListItemButton
						key={run.id}
						onClick={() => open(run)}
					>
						<ListItemText
							primary={run.title}
							secondary={
								formatScheduleTime(run.timestamp) +
								" ／ " +
								run.runners.map((runner) => runner.name).join("、")
							}
						/>
						{currentRun?.id === run.id && (
							<Chip
								label='配信中'
								size='small'
							/>
						)}
					</ListItemButton>
				))}
			</List>
			<Dialog
				open={!!draft}
				onClose={() => {
					if (!busy) setDraft(null);
				}}
				fullWidth
				maxWidth='sm'
			>
				<DialogTitle>
					{creating ? "スケジュールを追加" : "スケジュールを編集"}
				</DialogTitle>
				<DialogContent>
					<Stack
						spacing={2}
						sx={{pt: 1}}
					>
						{error && <Alert severity='error'>{error}</Alert>}
						{draft && (
							<>
								{currentRun?.id === draft.id && (
									<Alert severity='info'>
										保存後、配信管理で再反映してください。
									</Alert>
								)}
								<TextField
									label='開催日時'
									type='datetime-local'
									value={draft.timestamp}
									onChange={(event) =>
										setDraft({...draft, timestamp: event.target.value})
									}
									slotProps={{inputLabel: {shrink: true}}}
									disabled={busy}
									required
								/>
								<TextField
									label='タイトル'
									value={draft.title}
									onChange={(event) =>
										setDraft({...draft, title: event.target.value})
									}
									disabled={busy}
									required
								/>
								<Autocomplete
									multiple
									options={choices}
									value={draft.runners}
									getOptionLabel={(runner) =>
										runner.name +
										(runner.category ? " ／ " + runner.category : "")
									}
									isOptionEqualToValue={(a, b) => a.id === b.id}
									onChange={(_, value) => setDraft({...draft, runners: value})}
									disabled={busy}
									renderInput={(params) => (
										<TextField
											{...params}
											label='走者'
										/>
									)}
								/>
							</>
						)}
					</Stack>
				</DialogContent>
				<DialogActions sx={{flexWrap: "wrap", gap: 1}}>
					{!creating && (
						<Button
							color='error'
							onClick={() => void remove()}
							disabled={busy || currentRun?.id === draft?.id}
						>
							削除
						</Button>
					)}
					<Button
						disabled={busy}
						onClick={() => setDraft(null)}
					>
						キャンセル
					</Button>
					<Button
						variant='contained'
						disabled={
							busy ||
							!draft?.title.trim() ||
							!draft.timestamp ||
							!Number.isFinite(Date.parse(draft.timestamp))
						}
						onClick={() => void save()}
					>
						保存
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
};
