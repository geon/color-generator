interface Color {
	r: number;
	g: number;
	b: number;
}

interface Edge {
	a: Color;
	b: Color;
}

interface Tetrahedron {
	a: Color;
	b: Color;
	c: Color;
	d: Color;
}

function edgesInTetrahedron(tetrahedron: Tetrahedron): ReadonlyArray<Edge> {
	const edges: ReadonlyArray<Edge> = [
		{ a: tetrahedron.a, b: tetrahedron.b },
		{ a: tetrahedron.a, b: tetrahedron.c },
		{ a: tetrahedron.a, b: tetrahedron.d },
		{ a: tetrahedron.b, b: tetrahedron.c },
		{ a: tetrahedron.b, b: tetrahedron.d },
		{ a: tetrahedron.c, b: tetrahedron.d },
	];

	return edges;
}

function interpolate(a: Color, b: Color, factor: number): Color {
	const factor2 = 1 - factor;
	return {
		r: a.r * factor + b.r * factor2,
		g: a.g * factor + b.g * factor2,
		b: a.b * factor + b.b * factor2,
	};
}

function offCenterPoint(tetrahedron: Tetrahedron): Color {
	const offCenter = 0.65;
	const a = interpolate(tetrahedron.a, tetrahedron.b, offCenter);
	const b = interpolate(tetrahedron.c, tetrahedron.d, offCenter);
	return interpolate(a, b, offCenter);
}

function nameOfCorner(
	tetrahedron: Tetrahedron,
	point: Color,
): (keyof Tetrahedron) | undefined {
	for (const pointName of ["a", "b", "c", "d"] as ReadonlyArray<
		keyof Tetrahedron
	>) {
		if (tetrahedron[pointName] == point) {
			return pointName;
		}
	}

	return undefined;
}

function splitTetrahedron(
	tetrahedron: Tetrahedron,
): { newTetrahedrons: ReadonlyArray<Tetrahedron>; newPoint: Color } {
	const newPoint = offCenterPoint(tetrahedron);

	const a = { ...tetrahedron };
	const b = { ...tetrahedron };
	const c = { ...tetrahedron };
	const d = { ...tetrahedron };

	a[nameOfCorner(a, tetrahedron.a)!] = newPoint;
	b[nameOfCorner(b, tetrahedron.b)!] = newPoint;
	c[nameOfCorner(c, tetrahedron.c)!] = newPoint;
	d[nameOfCorner(d, tetrahedron.d)!] = newPoint;

	return {
		newTetrahedrons: [a, b, c, d],
		newPoint,
	};
}

function findMax<T>(
	array: ReadonlyArray<T>,
	comparator: (a: T, b: T) => boolean,
): T {
	let max = array[0];
	for (const current of array) {
		if (comparator(current, max)) {
			max = current;
		}
	}
	return max;
}

function subColor(a: Color, b: Color) {
	return {
		r: a.r - b.r,
		g: a.g - b.g,
		b: a.b - b.b,
	};
}

// https://en.wikipedia.org/wiki/Tetrahedron#Volume
function tetrahedronVolume(tetrahedron: Tetrahedron) {
	const A = subColor(tetrahedron.a, tetrahedron.d);
	const B = subColor(tetrahedron.b, tetrahedron.d);
	const C = subColor(tetrahedron.c, tetrahedron.d);

	// https://en.wikipedia.org/wiki/Determinant
	const determinant =
		A.r * B.g * C.b +
		A.g * B.b * C.r +
		A.b * B.r * C.g -
		A.b * B.g * C.r -
		A.g * B.r * C.b -
		A.r * B.b * C.g;

	return determinant / 6;
}

function addPoint(
	tetrahedrons: ReadonlyArray<Tetrahedron>,
): { newTetrahedrons: ReadonlyArray<Tetrahedron>; newPoint: Color } {
	const largestTetrahedron = findMax(
		tetrahedrons,
		(a, b) => tetrahedronVolume(a) > tetrahedronVolume(b),
	);

	let { newTetrahedrons: splitTetrahedrons, newPoint } = splitTetrahedron(
		largestTetrahedron,
	);

	const newTetrahedrons = [...tetrahedrons];
	newTetrahedrons.splice(
		tetrahedrons.indexOf(largestTetrahedron),
		1,
		...splitTetrahedrons,
	);

	return { newTetrahedrons, newPoint };
}

function* makeColorSeries(): IterableIterator<Color> {
	const white: Color = { r: 1, g: 1, b: 1 };
	// const gray: Color = { r: 0.5, g: 0.5, b: 0.5 };
	// Gray is offset from the center, to make all initial tetrahedrons diffrent sizes, and hence deterministic.
	const gray: Color = { r: 0.4, g: 0.6, b: 0.45 };
	const black: Color = { r: 0, g: 0, b: 0 };

	const red: Color = { r: 1, g: 0, b: 0 };
	const magenta: Color = { r: 1, g: 0, b: 1 };
	const blue: Color = { r: 0, g: 0, b: 1 };
	const cyan: Color = { r: 0, g: 1, b: 1 };
	const green: Color = { r: 0, g: 1, b: 0 };
	const yellow: Color = { r: 1, g: 1, b: 0 };

	let tetrahedrons: ReadonlyArray<Tetrahedron> = [
		{
			a: white,
			b: gray,
			c: red,
			d: magenta,
		},
		{
			a: white,
			b: gray,
			c: magenta,
			d: blue,
		},
		{
			a: white,
			b: gray,
			c: blue,
			d: cyan,
		},
		{
			a: white,
			b: gray,
			c: cyan,
			d: green,
		},
		{
			a: white,
			b: gray,
			c: green,
			d: yellow,
		},
		{
			a: white,
			b: gray,
			c: yellow,
			d: red,
		},
		{
			a: black,
			b: gray,
			c: red,
			d: magenta,
		},
		{
			a: black,
			b: gray,
			c: magenta,
			d: blue,
		},
		{
			a: black,
			b: gray,
			c: blue,
			d: cyan,
		},
		{
			a: black,
			b: gray,
			c: cyan,
			d: green,
		},
		{
			a: black,
			b: gray,
			c: green,
			d: yellow,
		},
		{
			a: black,
			b: gray,
			c: yellow,
			d: red,
		},
	];

	// We could yield the primary colors too, but they are ugly.
	// yield white;
	// yield gray;
	// yield black;
	// yield red;
	// yield cyan;
	// yield magenta;
	// yield green;
	// yield blue;
	// yield yellow;

	for (;;) {
		const { newTetrahedrons, newPoint } = addPoint(tetrahedrons);
		tetrahedrons = newTetrahedrons;
		yield newPoint;
	}
}

function componentToHex(c: number): string {
	var hex = Math.floor(c * 255).toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(color: Color): string {
	return (
		"#" +
		componentToHex(color.r) +
		componentToHex(color.g) +
		componentToHex(color.b)
	);
}

const colorGenerator = makeColorSeries();
for (const color of colorGenerator) {
	console.log(rgbToHex(color));
}
