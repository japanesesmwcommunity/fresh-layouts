import {CssBaseline, Stack, ThemeProvider, Typography} from "@mui/material";
import {render} from "../../render";
import {Column, Container, Grid} from "../components/Dashboard";
import {PlayerControl} from "../PlayerControl";
import {ScheduleControl} from "../ScheduleControl";
import {theme} from "../theme";
import {ControlTimer} from "../Timer";
import {Twitch} from "../Twitch";

export const Run = () => (
	<Container>
		<Grid>
			<Column>
				<Stack spacing={2}>
					<Typography variant='h6'>タイマー</Typography>
					<ControlTimer />
					<PlayerControl />
				</Stack>
			</Column>
			<Column>
				<ScheduleControl />
			</Column>
			<Column>
				<Twitch />
			</Column>
		</Grid>
	</Container>
);

render(
	<ThemeProvider theme={theme}>
		<CssBaseline />
		<Run />
	</ThemeProvider>,
);
