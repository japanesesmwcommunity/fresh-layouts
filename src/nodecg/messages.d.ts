import {Run} from "./generated/schedule";

export type MessageMap = {
	"timer:start": unknown;
	"timer:stop": unknown;
	"timer:reset": unknown;
	"runners:get": unknown;
	"schedule:add": {data: Run};
	"schedule:update": {data: {index: number; run: Run}};
	"schedule:remove": {data: number};
	"current-run:set": {data: number};
	"current-run:player-confirm": {data: number};
	"current-run:player-undo": {data: number};
};
