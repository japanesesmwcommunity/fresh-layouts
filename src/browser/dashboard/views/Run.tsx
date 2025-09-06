import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import {render} from "../../render";
import {Column, Container, Grid} from "../components/Dashboard";
import {PlayerControl} from "../PlayerControl";
import {ControlTimer} from "../Timer";

const theme = createTheme({
	palette: {
		mode: "light",
	},
});

export const Run = () => {
	return (
		<>
			<Container>
				<Grid>
					<Column>
						<ControlTimer />
						<PlayerControl />
					</Column>
				</Grid>
			</Container>
		</>
	);
};

render(
	<>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Run />
		</ThemeProvider>
	</>,
);
