import {ThemeProvider} from "@emotion/react";
import {createTheme, CssBaseline} from "@mui/material";
import {render} from "../../render";
import {Column, Grid} from "../components/Dashboard";
import {Runners} from "../Runners";
import {Schedule} from "../Schedule";

const theme = createTheme();

const App = () => {
	return (
		<>
			<ThemeProvider theme={theme}>
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
		<CssBaseline />
		<App />
	</>,
);
