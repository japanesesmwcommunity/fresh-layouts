import {render} from "../../render";
import {useListenFor} from "../../use-listen-for";
import {useReplicant} from "../../use-replicant";

const App = () => {
	const example = useReplicant("example");
	useListenFor("resetAge", () => {
		window.alert("resetAge :)");
	});

	return (
		<div id='container'>
			<div>This is Panel.</div>
			<div>text: {example?.text}</div>
			<div>age: {example?.age}</div>
			<button onClick={() => nodecg.sendMessage("resetAge")}>reset age</button>
		</div>
	);
};

render(
	<>
		<App />
	</>,
);
