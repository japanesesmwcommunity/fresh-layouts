import {CssBaseline, ThemeProvider} from "@mui/material";
import {render} from "../../render";
import {Column, Grid} from "../components/Dashboard";
import {Runners} from "../Runners";
import {Schedule} from "../Schedule";
import {theme} from "../theme";

const App = () => {
	return (
		<>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Grid>
					<Column>
						<Runners />
					</Column>
					<Column>
						<Schedule />
					</Column>
				</Grid>
			</ThemeProvider>
		</>
	);
};

render(
	<>
		<App />
	</>,
);
