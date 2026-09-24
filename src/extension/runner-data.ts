import {Runner} from "../nodecg/generated/runners";

export type RunnerInput = Pick<
	Runner,
	"name" | "category" | "message" | "twitchId" | "type"
>;

export function normalizeRunner(input: RunnerInput): RunnerInput {
	if (!input || typeof input.name !== "string" || !input.name.trim())
		throw new Error("走者名を入力してください。");
	for (const key of ["category", "message", "twitchId", "type"] as const) {
		if (input[key] !== undefined && typeof input[key] !== "string")
			throw new Error("走者情報は文字列で入力してください。");
	}
	return {
		name: input.name.trim(),
		category: input.category?.trim() ?? "",
		type: input.type?.trim() ?? "",
		message: input.message ?? "",
		twitchId: input.twitchId?.trim() ?? "",
	};
}

export function parseRunnerRows(rows: unknown[][], maxId: number): Runner[] {
	const [header, ...data] = rows;
	const columns = (header ?? []).map((cell) => String(cell ?? "").trim());
	if (
		!["name", "category", "message", "twitch_id"].every(
			(name) => columns.filter((column) => column === name).length === 1,
		) ||
		columns.filter((column) => column === "type").length > 1
	) {
		throw new Error(
			"走者シートにname, category, message, twitch_idの見出しを用意し、typeを含め各見出しが重複しないようにしてください。",
		);
	}
	const runners: Runner[] = [];
	data.forEach((row, index) => {
		if (row.every((cell) => cell === "" || cell == null)) return;
		const value = (name: string) => String(row[columns.indexOf(name)] ?? "");
		if (!value("name").trim())
			throw new Error(
				"走者シートの" + (index + 2) + "行目に走者名がありません。",
			);
		runners.push({
			id: maxId + runners.length + 1,
			...normalizeRunner({
				name: value("name"),
				category: value("category"),
				type: value("type"),
				message: value("message"),
				twitchId: value("twitch_id"),
			}),
		});
	});
	if (!runners.length)
		throw new Error(
			"走者シートにデータがありません。既存の走者情報は保持しました。",
		);
	return runners;
}
