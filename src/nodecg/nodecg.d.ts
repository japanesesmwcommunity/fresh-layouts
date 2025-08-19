import Browser from "ts-nodecg/browser";
import Server from "ts-nodecg/server";
import {Configschema as BundleConfig} from "./generated/configschema";
import {MessageMap} from "./messages";
import {ReplicantMap} from "./replicants";

export type ServerNodecgInstance = Server.CreateNodecgInstance<
	"nodecg-react-template",
	BundleConfig,
	ReplicantMap,
	MessageMap
>;

export type BrowserNodecgInstance = Browser.CreateNodecgInstance<
	"nodecg-react-template",
	BundleConfig,
	ReplicantMap,
	MessageMap
>;

export type BrowserNodecgConstructor = Browser.CreateNodecgConstructor<
	"nodecg-react-template",
	BundleConfig,
	ReplicantMap,
	MessageMap
>;
