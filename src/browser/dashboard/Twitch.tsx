import {
	Alert,
	Autocomplete,
	Button,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import {useEffect, useState} from "react";
import type {
	TwitchCategory,
	TwitchChannel,
} from "../../nodecg/generated/twitch";

export const Twitch = () => {
	const [channel, setChannel] = useState<TwitchChannel | null>(null);
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState<TwitchCategory | null>(null);
	const [query, setQuery] = useState("");
	const [options, setOptions] = useState<TwitchCategory[]>([]);
	const [busy, setBusy] = useState(false);
	const [notice, setNotice] = useState<{
		severity: "success" | "error";
		text: string;
	} | null>(null);
	const errorText = (error: unknown) =>
		error instanceof Error ? error.message : String(error);
	const applyChannel = (value: TwitchChannel) => {
		setChannel(value);
		setTitle(value.title);
		setCategory(value.category.id ? value.category : null);
	};
	const load = async () => {
		setBusy(true);
		setNotice(null);
		try {
			applyChannel(await nodecg.sendMessage("twitch:get"));
		} catch (error) {
			setNotice({severity: "error", text: errorText(error)});
		} finally {
			setBusy(false);
		}
	};
	useEffect(() => {
		void load();
	}, []);
	const search = async () => {
		setBusy(true);
		setNotice(null);
		try {
			setOptions(await nodecg.sendMessage("twitch:search-categories", query));
		} catch (error) {
			setNotice({severity: "error", text: errorText(error)});
		} finally {
			setBusy(false);
		}
	};
	const save = async () => {
		if (!channel) return;
		setBusy(true);
		setNotice(null);
		try {
			await nodecg.sendMessage("twitch:update", {
				title: title.trim(),
				gameId: category?.id ?? "",
			});
			setChannel({
				...channel,
				title: title.trim(),
				category: category ?? {id: "", name: ""},
			});
			setTitle(title.trim());
			setNotice({
				severity: "success",
				text: "Twitchの配信情報を更新しました。",
			});
		} catch (error) {
			setNotice({severity: "error", text: errorText(error)});
		} finally {
			setBusy(false);
		}
	};
	const categories =
		category && !options.some((item) => item.id === category.id)
			? [category, ...options]
			: options;
	const dirty =
		channel &&
		(title.trim() !== channel.title ||
			(category?.id ?? "") !== channel.category.id);
	return (
		<Stack spacing={2}>
			<Typography variant='h6'>Twitch配信情報</Typography>
			{channel && (
				<Typography variant='body2'>
					配信先：{channel.broadcasterName}
				</Typography>
			)}
			{notice && <Alert severity={notice.severity}>{notice.text}</Alert>}
			<TextField
				label='配信タイトル'
				value={title}
				onChange={(event) => setTitle(event.target.value)}
				disabled={busy || !channel}
				helperText={[...title.trim()].length + " / 140文字"}
				error={[...title.trim()].length > 140}
				multiline
				minRows={2}
			/>
			<Stack
				direction='row'
				spacing={1}
			>
				<TextField
					fullWidth
					label='カテゴリー検索'
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					disabled={busy || !channel}
					slotProps={{htmlInput: {maxLength: 100}}}
					onKeyDown={(event) => {
						if (event.key === "Enter" && query.trim() && !busy) void search();
					}}
				/>
				<Button
					onClick={() => void search()}
					disabled={busy || !channel || !query.trim()}
				>
					検索
				</Button>
			</Stack>
			<Autocomplete
				options={categories}
				value={category}
				getOptionLabel={(option) => option.name}
				isOptionEqualToValue={(a, b) => a.id === b.id}
				onChange={(_, value) => setCategory(value)}
				disabled={busy || !channel}
				noOptionsText='カテゴリーを検索してください'
				renderInput={(params) => (
					<TextField
						{...params}
						label='配信カテゴリー'
					/>
				)}
			/>
			<Stack
				direction='row'
				spacing={1}
			>
				<Button
					variant='outlined'
					disabled={busy}
					onClick={() => void load()}
				>
					再取得
				</Button>
				<Button
					variant='contained'
					disabled={
						busy || !dirty || !title.trim() || [...title.trim()].length > 140
					}
					onClick={() => void save()}
				>
					{busy ? "処理中…" : "Twitchに反映"}
				</Button>
			</Stack>
		</Stack>
	);
};
