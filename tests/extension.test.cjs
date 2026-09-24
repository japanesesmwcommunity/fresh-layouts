const assert = require("node:assert/strict");
const fs = require("node:fs");
const {test} = require("node:test");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
	const {outputText} = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
			esModuleInterop: true,
		},
	});
	module._compile(outputText, filename);
};
const {
	parseRunnerRows,
	normalizeRunner,
} = require("../src/extension/runner-data.ts");

test("走者シートの4列を読み込み空行を除外する", () => {
	const runners = parseRunnerRows(
		[
			["name", "category", "message", "twitch_id"],
			["走者A", "Any%", "よろしくお願いします", "runner_a"],
			[],
			["走者B"],
		],
		10,
	);
	assert.deepEqual(runners, [
		{
			id: 11,
			name: "走者A",
			category: "Any%",
			message: "よろしくお願いします",
			twitchId: "runner_a",
		},
		{id: 12, name: "走者B", category: "", message: "", twitchId: ""},
	]);
});
test("不正な見出し・空データ・走者名欠損を拒否する", () => {
	assert.throws(() => parseRunnerRows([["name", "twitch_id", "message"]], 0));
	assert.throws(() =>
		parseRunnerRows([["name", "category", "message", "twitch_id"]], 0),
	);
	assert.throws(
		() =>
			parseRunnerRows(
				[
					["name", "category", "message", "twitch_id"],
					["", "Any%"],
				],
				0,
			),
		/2行目/,
	);
	assert.throws(() => normalizeRunner({name: " ", category: "Any%"}));
	assert.throws(() => normalizeRunner({name: "走者", twitchId: 123}));
});
test("走者情報は編集可能なフィールドだけを返す", () => {
	assert.deepEqual(
		normalizeRunner({
			id: 8,
			name: " 走者 ",
			category: "Any% ",
			message: " message ",
			twitchId: " runner ",
			finishTime: "9:00:00",
		}),
		{name: "走者", category: "Any%", message: " message ", twitchId: "runner"},
	);
});
