import styled from "@emotion/styled";

export const Container = styled.div`
	padding: 16px;
`;

export const Grid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-auto-rows: max-content;
	gap: 16px;
	align-items: start;
`;

export const Column = styled.div`
	min-width: 330px;
	border: 1px solid #ddd;
	border-radius: 4px;
	padding: 8px;
`;
