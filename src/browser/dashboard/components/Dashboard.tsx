import styled from "@emotion/styled";

export const Container = styled.div`
	padding: 24px;
	background: #f5f7fa;
	min-height: 100vh;
	@media (max-width: 600px) {
		padding: 12px;
	}
`;
export const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 16px;
	align-items: start;
	@media (max-width: 1100px) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	@media (max-width: 720px) {
		grid-template-columns: minmax(0, 1fr);
	}
`;
export const Column = styled.section`
	min-width: 0;
	border: 1px solid #dfe3e8;
	border-radius: 0;
	padding: 20px;
	background: #fff;
`;
