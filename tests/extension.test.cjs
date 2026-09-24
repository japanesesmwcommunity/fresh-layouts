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
const {validateTwitchUpdate} = require("../src/extension/twitch-client.ts");

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
			type: "",
			message: "よろしくお願いします",
			twitchId: "runner_a",
		},
		{id: 12, name: "走者B", category: "", type: "", message: "", twitchId: ""},
	]);
});
test("type列を見出しで読み込み列順の変更と空欄を扱う", () => {
	const runners = parseRunnerRows(
		[
			["type", "twitch_id", "name", "message", "category"],
			[" 新人 ", "runner_a", "走者A", "応援お願いします", "Any%"],
			["", "runner_b", "走者B"],
		],
		0,
	);
	assert.deepEqual(runners[0], {
		id: 1,
		name: "走者A",
		type: "新人",
		twitchId: "runner_a",
		message: "応援お願いします",
		category: "Any%",
	});
	assert.equal(runners[1].type, "");
	for (const duplicate of ["name", "type"]) {
		assert.throws(() =>
			parseRunnerRows(
				[
					["name", "category", "message", "twitch_id", "type", duplicate],
					["走者A"],
				],
				0,
			),
		);
	}
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
	assert.throws(() => normalizeRunner({name: "走者", type: 123}));
});
test("走者情報は編集可能なフィールドだけを返す", () => {
	assert.deepEqual(
		normalizeRunner({
			id: 8,
			name: " 走者 ",
			category: "Any% ",
			type: " 新人 ",
			message: " message ",
			twitchId: " runner ",
			finishTime: "9:00:00",
		}),
		{
			name: "走者",
			category: "Any%",
			type: "新人",
			message: " message ",
			twitchId: "runner",
		},
	);
});
test("TwitchタイトルとカテゴリーIDの境界を検証する", () => {
	assert.deepEqual(validateTwitchUpdate({title: " 配信 ", gameId: "509658"}), {
		title: "配信",
		gameId: "509658",
	});
	assert.equal(validateTwitchUpdate({title: "配信", gameId: ""}).gameId, "");
	assert.equal(
		[...validateTwitchUpdate({title: "🎮".repeat(140), gameId: "1"}).title]
			.length,
		140,
	);
	assert.throws(() =>
		validateTwitchUpdate({title: "🎮".repeat(141), gameId: "1"}),
	);
	assert.throws(() => validateTwitchUpdate({title: " ", gameId: "1"}));
	assert.throws(() =>
		validateTwitchUpdate({title: "配信", gameId: "Game name"}),
	);
	assert.throws(() => validateTwitchUpdate(null));
});
