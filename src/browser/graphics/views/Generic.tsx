import {CssBaseline} from "@mui/material";
import {render} from "../../render";
import {Footer} from "../components/Footer";
import {Overlay} from "./OverlayTemplate";

const Generic = () => {
	return (
		<Overlay>
			<Footer>RTA新人大会 - 新人の部</Footer>
		</Overlay>
	);
};

render(
	<>
		<CssBaseline />
		<Generic />
	</>,
);
