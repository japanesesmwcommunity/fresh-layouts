import styled from "@emotion/styled";
import {useEffect, useState} from "react";

const ClockContainer = styled.div`
	grid-area: clock;
	justify-self: end;
	color: white;
	line-height: 70px;
`;

const formatTime = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1);
	const day = String(date.getDate());
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

export const Clock = () => {
	const [time, setTime] = useState<string>("");

	useEffect(() => {
		const updateClock = () => {
			const now = new Date();
			setTime(formatTime(now));
		};

		updateClock();

		const timerId = setInterval(updateClock, 1000);
		return () => clearInterval(timerId);
	}, []);

	return <ClockContainer>{time}</ClockContainer>;
};
