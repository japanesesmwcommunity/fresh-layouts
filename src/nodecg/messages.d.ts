import {Runner} from "./generated/runners";
import {Run} from "./generated/schedule";
import type {
	TwitchCategory,
	TwitchChannel,
	TwitchUpdate,
} from "./generated/twitch";

export type MessageMap = {
	"twitch:get": {result: TwitchChannel; error: string};
	"twitch:update": {data: TwitchUpdate; error: string};
	"twitch:search-categories": {
		data: string;
		result: TwitchCategory[];
		error: string;
	};
	"timer:start": unknown;
	"timer:stop": unknown;
	"timer:reset": unknown;
	"runners:get": {result: number; error: string};
	"runners:update": {data: Runner; error: string};
	"schedule:add": {data: Run; error: string};
	"schedule:update": {data: Run; error: string};
	"schedule:remove": {data: number; error: string};
	"current-run:set": {data: number; error: string};
	"current-run:player-confirm": {data: number};
	"current-run:player-undo": {data: number};
};
