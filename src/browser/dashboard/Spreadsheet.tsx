import {Alert, Button, Stack, Typography} from "@mui/material";
import {useState} from "react";

export const Spreadsheet = () => {
	const [busy, setBusy] = useState(false);
	const [notice, setNotice] = useState<{
		severity: "success" | "error";
		text: string;
	} | null>(null);
	const fetchRunners = async () => {
		setBusy(true);
		setNotice(null);
		try {
			const count = await nodecg.sendMessage("runners:get");
			setNotice({
				severity: "success",
				text: count + "人の走者情報を取得しました。",
			});
		} catch (error) {
			setNotice({
				severity: "error",
				text: error instanceof Error ? error.message : String(error),
			});
		} finally {
			setBusy(false);
		}
	};
	return (
		<Stack spacing={2}>
			<Typography variant='h6'>スプレッドシート取得</Typography>
			<Alert severity='info'>
				取得すると走者一覧を置き換えます。
			</Alert>
			{notice && <Alert severity={notice.severity}>{notice.text}</Alert>}
			<Button
				variant='contained'
				disabled={busy}
				onClick={() => void fetchRunners()}
			>
				{busy ? "取得中…" : "走者情報を取得"}
			</Button>
		</Stack>
	);
};
