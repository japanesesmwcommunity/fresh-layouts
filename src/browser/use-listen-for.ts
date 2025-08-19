import {useEffect} from "react";
import {MessageMap} from "../nodecg/messages";

export const useListenFor = <TMessageName extends keyof MessageMap>(
	messageName: TMessageName,
	handler: (message: TMessageName) => void,
): void => {
	useEffect(() => {
		nodecg.listenFor(messageName, handler);
		return () => {
			nodecg.unlisten(messageName, handler);
		};
	}, [handler, messageName]);
};
