import {CssBaseline, ThemeProvider} from "@mui/material";
import {render} from "../../render";
import {Column, Container, Grid} from "../components/Dashboard";
import {Runners} from "../Runners";
import {Schedule} from "../Schedule";
import {Spreadsheet} from "../Spreadsheet";
import {theme} from "../theme";

const Info = () => (
	<Container>
		<Grid>
			<Column>
				<Schedule />
			</Column>
			<Column>
				<Runners />
			</Column>
			<Column>
				<Spreadsheet />
			</Column>
		</Grid>
	</Container>
);

render(
	<ThemeProvider theme={theme}>
		<CssBaseline />
		<Info />
	</ThemeProvider>,
);
