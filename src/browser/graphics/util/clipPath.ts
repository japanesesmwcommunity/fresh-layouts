/*
 * Copyright (c) 2024 yagamuu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export type X = number;
export type Y = number;

export type Coordinate = [X, Y];
export type BoxCornerCoordinates = [
	Coordinate,
	Coordinate,
	Coordinate,
	Coordinate,
];

export type Box = [X, X, Y, Y];

const calcCorners = ([x1, x2, y1, y2]: Box) => {
	const boxCorners: BoxCornerCoordinates = [
		[x1, y1],
		[x1, y2],
		[x2, y1],
		[x2, y2],
	];

	boxCorners.sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));
	return [
		boxCorners[0],
		boxCorners[1],
		boxCorners[3],
		boxCorners[2],
		boxCorners[0],
	];
};

export const calculateClipPath = (boxes: Box[]) => {
	const boxCornersList = boxes.map((box) => calcCorners(box));

	boxCornersList.sort((a, b) => {
		if (!a[0]?.[0] || !b[0]?.[0]) {
			return 0;
		}
		return a[0][0] - b[0][0];
	});

	const clipPath: Coordinate[] = [[0, 0]];

	for (const boxCorners of boxCornersList) {
		if (!boxCorners[0]?.[0] && boxCorners[0]?.[0] !== 0) {
			throw new Error("first element of boxCorners is empty");
		}
		const entryCoordinate: Coordinate = [boxCorners[0][0], 0];
		clipPath.push(entryCoordinate, ...boxCorners, entryCoordinate);
	}

	clipPath.push([1920, 0], [1920, 1080], [0, 1080], [0, 0]);

	return `${clipPath.map((coor) => coor.map((n) => `${n}px`).join(" ")).join(",")}`;
};
