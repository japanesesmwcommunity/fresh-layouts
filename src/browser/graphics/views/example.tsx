import {render} from "../../render";
import {useReplicant} from "../../use-replicant";

const App = () => {
	const example = useReplicant("example");
	const testAssets = useReplicant("assets:test");

	return (
		<div id='container'>
			<div>This is example.</div>
			<p>Age: {example?.age}</p>
			<p>Text: {example?.text}</p>
			<img src={testAssets?.[0]?.url} />
		</div>
	);
};

render(<App />);
