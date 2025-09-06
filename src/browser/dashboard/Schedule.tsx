import {NavigateBefore, NavigateNext} from "@mui/icons-material";
import {
	Autocomplete,
	Box,
	Button,
	Chip,
	Dialog,
	DialogContent,
	DialogTitle,
	FormControl,
	IconButton,
	TextField,
	Typography,
} from "@mui/material";
import {useEffect, useState} from "react";
import {Run, Runner} from "../../nodecg/generated/schedule";
import {useReplicant} from "../use-replicant";

export const Schedule = () => {
	const schedule = useReplicant("schedule");
	const currentRun = useReplicant("currentRun");
	const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
	const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);

	const formatDateTime = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleString("ja-JP", {
			month: "numeric",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const seekToPrevRun = () => {
		if (!schedule?.length) return;
		setSelectedIndex((prev) => (prev - 1 + schedule.length) % schedule.length);
	};

	const seekToNextRun = () => {
		if (!schedule?.length) return;
		setSelectedIndex((prev) => (prev + 1) % schedule.length);
	};

	const setCurrentRun = () => {
		if (!schedule?.length || selectedIndex >= schedule.length) return;
		const selectedRun = schedule[selectedIndex];

		if (!selectedRun) return;
		nodecg.sendMessage("current-run:set", selectedRun.id);
	};

	const removeRun = () => {
		if (!selectedRun || !schedule) return;
		nodecg.sendMessage("schedule:remove", selectedRun.id);
		// 削除後のインデックス調整
		const newLength = schedule.length - 1;
		if (newLength === 0) {
			setSelectedIndex(0);
		} else if (selectedIndex >= newLength) {
			setSelectedIndex(newLength - 1);
		}
	};

	const editRun = () => {
		setEditModalOpen(true);
	};

	const createRun = () => {
		setCreateModalOpen(true);
	};

	const selectedRun = schedule?.[selectedIndex];
	const isCurrentlyRunning =
		selectedRun && currentRun && selectedRun.id === currentRun.id;

	return (
		<Box
			sx={{
				border: "1px solid #ddd",
				borderRadius: 2,
				p: 2,
				bgcolor: "background.paper",
			}}
		>
			<Typography
				variant='h6'
				sx={{mb: 2}}
			>
				スケジュール管理
			</Typography>

			{/* スケジュール切り替えボタン */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					mb: 2,
				}}
			>
				<IconButton
					onClick={seekToPrevRun}
					disabled={!schedule?.length || schedule.length <= 1}
					size='small'
				>
					<NavigateBefore />
				</IconButton>
				<Typography
					variant='body2'
					color='text.secondary'
				>
					{schedule?.length ? selectedIndex + 1 : 0} / {schedule?.length || 0}
				</Typography>
				<IconButton
					onClick={seekToNextRun}
					disabled={!schedule?.length || schedule.length <= 1}
					size='small'
				>
					<NavigateNext />
				</IconButton>
			</Box>

			{/* 現在選択中のスケジュール表示 */}
			{selectedRun ? (
				<Box
					sx={{
						mb: 2,
						p: 2,
						border: "1px solid #e0e0e0",
						borderRadius: 2,
						bgcolor: "grey.50",
					}}
				>
					<Typography
						variant='h6'
						sx={{mb: 1}}
					>
						{selectedRun.title}
					</Typography>
					<Typography
						variant='body2'
						color='text.secondary'
						sx={{mb: 1}}
					>
						{formatDateTime(selectedRun.timestamp)}
					</Typography>
					{selectedRun.runners && selectedRun.runners.length > 0 && (
						<Typography
							variant='body2'
							color='text.secondary'
						>
							走者: {selectedRun.runners.map((r: Runner) => r.name).join(", ")}
						</Typography>
					)}
				</Box>
			) : (
				<Box
					sx={{
						mb: 2,
						p: 2,
						border: "1px solid #e0e0e0",
						borderRadius: 2,
						bgcolor: "grey.100",
						textAlign: "center",
					}}
				>
					<Typography
						variant='body2'
						color='text.secondary'
					>
						スケジュールがありません
					</Typography>
				</Box>
			)}

			{/* 操作ボタン */}
			<Box
				sx={{
					display: "flex",
					gap: 1,
					mb: 2,
					justifyContent: "center",
					flexWrap: "wrap",
				}}
			>
				<Button
					variant='contained'
					color='success'
					onClick={setCurrentRun}
					disabled={!selectedRun || !!isCurrentlyRunning}
					size='small'
				>
					開始
				</Button>
				<Button
					variant='contained'
					color='primary'
					onClick={editRun}
					disabled={!selectedRun || !!isCurrentlyRunning}
					size='small'
				>
					編集
				</Button>
				<Button
					variant='contained'
					color='error'
					onClick={removeRun}
					disabled={!selectedRun}
					size='small'
				>
					削除
				</Button>
				<Button
					variant='contained'
					color='info'
					onClick={createRun}
					size='small'
				>
					追加
				</Button>
			</Box>

			{/* スケジュール一覧 */}
			{schedule && schedule.length > 0 && (
				<>
					<Typography
						variant='subtitle2'
						sx={{mb: 1}}
					>
						全スケジュール一覧
					</Typography>
					<Box sx={{maxHeight: 200, overflowY: "auto"}}>
						{schedule.map((item, index) => (
							<Box
								key={item.id}
								sx={{
									p: 1,
									mb: 1,
									borderRadius: 1,
									bgcolor:
										index === selectedIndex ? "primary.light" : "transparent",
									color:
										index === selectedIndex
											? "primary.contrastText"
											: "inherit",
									cursor: "pointer",
								}}
								onClick={() => setSelectedIndex(index)}
							>
								<Typography
									variant='body2'
									sx={{
										fontWeight: index === selectedIndex ? "bold" : "normal",
									}}
								>
									{formatDateTime(item.timestamp)} - {item.title}
								</Typography>
							</Box>
						))}
					</Box>
				</>
			)}

			{/* モーダル */}
			<ScheduleCreateModal
				open={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
			/>
			<ScheduleEditModal
				open={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				initialEditRun={selectedRun}
				initialEditIndex={selectedIndex}
			/>
		</Box>
	);
};

// ScheduleCreateModalコンポーネント
type ScheduleCreateModalProps = {
	open: boolean;
	onClose: () => void;
};

const ScheduleCreateModal = ({open, onClose}: ScheduleCreateModalProps) => {
	const schedule = useReplicant("schedule");
	const runners = useReplicant("runners");
	const [formData, setFormData] = useState<Run>({
		id: 0,
		title: "",
		timestamp: "",
		runners: [],
	});

	// 新規ID生成
	const generateNewId = () => {
		if (!schedule?.length) return 1;
		return Math.max(...schedule.map((run) => run.id)) + 1;
	};

	// フォームリセット
	const resetForm = () => {
		setFormData({
			id: 0,
			title: "",
			timestamp: "",
			runners: [],
		});
	};

	// モーダル開閉でリセット
	useEffect(() => {
		if (!open) {
			resetForm();
		}
	}, [open]);

	// 新規追加
	const handleAdd = () => {
		if (formData.title.trim() && formData.timestamp.trim()) {
			const newRun: Run = {
				id: generateNewId(),
				title: formData.title,
				timestamp: new Date(formData.timestamp).toISOString(),
				runners: formData.runners || [],
			};

			nodecg.sendMessage("schedule:add", newRun);
			resetForm();
			onClose();
		}
	};

	// バリデーション
	const isFormValid =
		formData.title.trim().length > 0 && formData.timestamp.trim().length > 0;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth='sm'
			PaperProps={{
				sx: {borderRadius: 3, width: "400px"},
			}}
		>
			<DialogTitle>新しいスケジュール追加</DialogTitle>
			<DialogContent>
				<Box sx={{mb: 3, mt: 1}}>
					{/* 日時入力 */}
					<FormControl
						fullWidth
						sx={{mb: 2}}
					>
						<TextField
							label='開催日時'
							type='datetime-local'
							value={formData.timestamp}
							onChange={(e) =>
								setFormData({...formData, timestamp: e.target.value})
							}
							InputLabelProps={{shrink: true}}
						/>
					</FormControl>

					{/* タイトル入力 */}
					<FormControl
						fullWidth
						sx={{mb: 2}}
					>
						<TextField
							label='タイトル'
							value={formData.title}
							onChange={(e) =>
								setFormData({...formData, title: e.target.value})
							}
							slotProps={{htmlInput: {maxLength: 50}}}
						/>
					</FormControl>

					{/* 走者選択 */}
					<FormControl
						fullWidth
						sx={{mb: 2}}
					>
						<Autocomplete
							multiple
							options={runners || []}
							getOptionLabel={(option) => option.name}
							value={formData.runners || []}
							onChange={(_, newValue) =>
								setFormData({...formData, runners: newValue})
							}
							renderTags={(value, getTagProps) =>
								value.map((option, index) => (
									<Chip
										{...getTagProps({index})}
										key={option.id}
										label={option.name}
										variant='outlined'
									/>
								))
							}
							renderInput={(params) => (
								<TextField
									{...params}
									label='走者選択'
									placeholder='走者を選択...'
								/>
							)}
						/>
					</FormControl>

					{/* ボタン */}
					<Box sx={{display: "flex", justifyContent: "flex-end", gap: 1}}>
						<Button
							variant='outlined'
							onClick={onClose}
						>
							キャンセル
						</Button>
						<Button
							variant='contained'
							onClick={handleAdd}
							disabled={!isFormValid}
						>
							追加
						</Button>
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

// ScheduleEditModalコンポーネント
type ScheduleEditModalProps = {
	open: boolean;
	onClose: () => void;
	initialEditRun?: Run;
	initialEditIndex?: number;
};

type RunFormData = {
	id: number;
	title: string;
	timestamp: string;
	runners?: Runner[];
};

const ScheduleEditModal = ({
	open,
	onClose,
	initialEditRun,
	initialEditIndex,
}: ScheduleEditModalProps) => {
	const runners = useReplicant("runners");
	const [formData, setFormData] = useState<RunFormData>({
		id: 0,
		title: "",
		timestamp: "",
		runners: [],
	});
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	// モーダル開閉と初期編集設定
	useEffect(() => {
		if (open && initialEditRun && initialEditIndex !== undefined) {
			// モーダル開時：選択中スケジュールを編集状態で開く
			setFormData({
				...initialEditRun,
				timestamp: new Date(initialEditRun.timestamp)
					.toISOString()
					.slice(0, 16),
			});
			setEditingIndex(initialEditIndex);
		} else if (!open) {
			// モーダル閉時：編集状態をリセット
			resetForm();
		}
	}, [open, initialEditRun, initialEditIndex]);

	// フォームリセット
	const resetForm = () => {
		setFormData({
			id: 0,
			title: "",
			timestamp: "",
			runners: [],
		});
		setEditingIndex(null);
	};

	// 更新
	const handleUpdate = () => {
		if (
			editingIndex !== null &&
			formData.title.trim() &&
			formData.timestamp.trim()
		) {
			const updatedRun: Run = {
				id: formData.id,
				title: formData.title,
				timestamp: new Date(formData.timestamp).toISOString(),
				runners: formData.runners || [],
			};

			nodecg.sendMessage("schedule:update", {
				index: editingIndex,
				run: updatedRun,
			});
			resetForm();
			onClose();
		}
	};

	// バリデーション
	const isFormValid =
		formData.title.trim().length > 0 && formData.timestamp.trim().length > 0;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth='sm'
			PaperProps={{
				sx: {borderRadius: 3, width: "400px"},
			}}
		>
			<DialogTitle>スケジュール編集</DialogTitle>
			<DialogContent>
				<Box sx={{mb: 3, mt: 1}}>
					{/* 日時入力 */}
					<FormControl
						fullWidth
						sx={{mb: 2}}
					>
						<TextField
							label='開催日時'
							type='datetime-local'
							value={formData.timestamp}
							onChange={(e) =>
								setFormData({...formData, timestamp: e.target.value})
							}
							InputLabelProps={{shrink: true}}
						/>
					</FormControl>

					{/* タイトル入力 */}
					<FormControl
						fullWidth
						sx={{mb: 2}}
					>
						<TextField
							label='タイトル'
							value={formData.title}
							onChange={(e) =>
								setFormData({...formData, title: e.target.value})
							}
							slotProps={{htmlInput: {maxLength: 50}}}
						/>
					</FormControl>

					{/* 走者選択 */}
					<FormControl
						fullWidth
						sx={{mb: 2}}
					>
						<Autocomplete
							multiple
							options={runners || []}
							getOptionLabel={(option) => option.name}
							value={formData.runners || []}
							onChange={(_, newValue) =>
								setFormData({...formData, runners: newValue})
							}
							renderTags={(value, getTagProps) =>
								value.map((option, index) => (
									<Chip
										{...getTagProps({index})}
										key={option.id}
										label={option.name}
										variant='outlined'
									/>
								))
							}
							renderInput={(params) => (
								<TextField
									{...params}
									label='走者選択'
									placeholder='走者を選択...'
								/>
							)}
						/>
					</FormControl>

					{/* ボタン */}
					<Box sx={{display: "flex", justifyContent: "flex-end", gap: 1}}>
						<Button
							variant='outlined'
							onClick={onClose}
						>
							キャンセル
						</Button>
						<Button
							variant='contained'
							onClick={handleUpdate}
							disabled={!isFormValid}
						>
							更新
						</Button>
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	);
};
