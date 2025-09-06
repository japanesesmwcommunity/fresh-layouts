import Browser from "ts-nodecg/browser";
import Server from "ts-nodecg/server";
import {Configschema as BundleConfig} from "./generated/configschema";
import {MessageMap} from "./messages";
import {ReplicantMap} from "./replicants";

export type ServerNodecgInstance = Server.CreateNodecgInstance<
	"fresh-layouts",
	BundleConfig,
	ReplicantMap,
	MessageMap
>;

export type BrowserNodecgInstance = Browser.CreateNodecgInstance<
	"fresh-layouts",
	BundleConfig,
	ReplicantMap,
	MessageMap
>;

export type BrowserNodecgConstructor = Browser.CreateNodecgConstructor<
	"fresh-layouts",
	BundleConfig,
	ReplicantMap,
	MessageMap
>;
