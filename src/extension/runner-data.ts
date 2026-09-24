import {Runner} from "../nodecg/generated/runners";

export type RunnerInput = Pick<
	Runner,
	"name" | "category" | "message" | "twitchId"
>;

export function normalizeRunner(input: RunnerInput): RunnerInput {
	if (!input || typeof input.name !== "string" || !input.name.trim())
		throw new Error("走者名を入力してください。");
	for (const key of ["category", "message", "twitchId"] as const) {
		if (input[key] !== undefined && typeof input[key] !== "string")
			throw new Error("走者情報は文字列で入力してください。");
	}
	return {
		name: input.name.trim(),
		category: input.category?.trim() ?? "",
		message: input.message ?? "",
		twitchId: input.twitchId?.trim() ?? "",
	};
}

export function parseRunnerRows(rows: unknown[][], maxId: number): Runner[] {
	const [header, ...data] = rows;
	if (
		!["name", "category", "message", "twitch_id"].every(
			(name, index) => String(header?.[index] ?? "").trim() === name,
		)
	) {
		throw new Error(
			"走者シートのA〜D列の見出しをname, category, message, twitch_idにしてください。",
		);
	}
	const runners: Runner[] = [];
	data.forEach((row, index) => {
		if (row.every((cell) => cell === "" || cell == null)) return;
		if (!String(row[0] ?? "").trim())
			throw new Error(
				"走者シートの" + (index + 2) + "行目に走者名がありません。",
			);
		runners.push({
			id: maxId + runners.length + 1,
			...normalizeRunner({
				name: String(row[0] ?? ""),
				category: String(row[1] ?? ""),
				message: String(row[2] ?? ""),
				twitchId: String(row[3] ?? ""),
			}),
		});
	});
	if (!runners.length)
		throw new Error(
			"走者シートにデータがありません。既存の走者情報は保持しました。",
		);
	return runners;
}
