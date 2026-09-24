import {
	Alert,
	Button,
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
import {Runner} from "../../nodecg/generated/runners";
import {useReplicant} from "../use-replicant";

export const Runners = () => {
	const runners = useReplicant("runners");
	const [draft, setDraft] = useState<Runner | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState(false);
	const save = async () => {
		if (!draft) return;
		setBusy(true);
		setError("");
		try {
			await nodecg.sendMessage("runners:update", draft);
			setDraft(null);
			setSaved(true);
		} catch (error) {
			setError(error instanceof Error ? error.message : String(error));
		} finally {
			setBusy(false);
		}
	};
	return (
		<Stack spacing={2}>
			<Typography variant='h6'>走者情報</Typography>
			{saved && <Alert severity='success'>走者情報を保存しました。</Alert>}
			{!runners?.length && (
				<Typography color='text.secondary'>走者情報がありません。</Typography>
			)}
			<List
				disablePadding
				sx={{maxHeight: 520, overflowY: "auto"}}
			>
				{runners?.map((runner) => (
					<ListItemButton
						key={runner.id}
						onClick={() => {
							setDraft({...runner});
							setError("");
							setSaved(false);
						}}
					>
						<ListItemText
							primary={runner.name}
							secondary={[runner.category, runner.type, runner.twitchId]
								.filter(Boolean)
								.join(" ／ ")}
						/>
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
				<DialogTitle>走者情報の編集</DialogTitle>
				<DialogContent>
					<Stack
						spacing={2}
						sx={{pt: 1}}
					>
						{error && <Alert severity='error'>{error}</Alert>}
						{draft && (
							<>
								<TextField
									label='走者名'
									value={draft.name}
									required
									disabled={busy}
									onChange={(event) =>
										setDraft({...draft, name: event.target.value})
									}
								/>
								<TextField
									label='カテゴリー'
									value={draft.category ?? ""}
									disabled={busy}
									onChange={(event) =>
										setDraft({...draft, category: event.target.value})
									}
								/>
								<TextField
									label='type'
									value={draft.type ?? ""}
									disabled={busy}
									onChange={(event) =>
										setDraft({...draft, type: event.target.value})
									}
								/>
								<TextField
									label='メッセージ'
									value={draft.message ?? ""}
									multiline
									minRows={3}
									disabled={busy}
									onChange={(event) =>
										setDraft({...draft, message: event.target.value})
									}
								/>
								<TextField
									label='Twitch ID'
									value={draft.twitchId ?? ""}
									disabled={busy}
									onChange={(event) =>
										setDraft({...draft, twitchId: event.target.value})
									}
								/>
							</>
						)}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button
						disabled={busy}
						onClick={() => setDraft(null)}
					>
						キャンセル
					</Button>
					<Button
						variant='contained'
						disabled={busy || !draft?.name.trim()}
						onClick={() => void save()}
					>
						保存
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
};
