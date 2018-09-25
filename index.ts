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

function edgeLength(edge: Edge): number {
	const r = edge.a.r - edge.b.r;
	const g = edge.a.g - edge.b.g;
	const b = edge.a.b - edge.b.b;
	return Math.sqrt(r * r + g * g + b * b);
}

function edgeLengthSquared(edge: Edge): number {
	const r = edge.a.r - edge.b.r;
	const g = edge.a.g - edge.b.g;
	const b = edge.a.b - edge.b.b;
	return r * r + g * g + b * b;
}

function interpolate(edge: Edge, factor: number): Color {
	const factor2 = 1 - factor;
	return {
		r: edge.a.r * factor + edge.b.r * factor2,
		g: edge.a.g * factor + edge.b.g * factor2,
		b: edge.a.b * factor + edge.b.b * factor2,
	};
}

function offCenterPoint(edge: Edge): Color {
	return interpolate(edge, 0.55);
}

function edgesEqual(a: Edge, b: Edge): boolean {
	return (a.a == b.a && a.b == b.b) || (a.a == b.b && a.b == b.a);
}

function tetrahedronHasEdge(tetrahedron: Tetrahedron, edge: Edge): boolean {
	return edgesInTetrahedron(tetrahedron).some(edgeInTetrahedron =>
		edgesEqual(edgeInTetrahedron, edge),
	);
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
	edge: Edge,
	newPoint: { point?: Color },
): ReadonlyArray<Tetrahedron> {
	if (!newPoint.point) {
		newPoint.point = offCenterPoint(edge);
	}

	const a = { ...tetrahedron };
	const b = { ...tetrahedron };

	a[nameOfCorner(a, edge.a)!] = newPoint.point;
	b[nameOfCorner(b, edge.b)!] = newPoint.point;

	return [a, b];
}

function splitEdge(
	edge: Edge,
	tetrahedrons: ReadonlyArray<Tetrahedron>,
): { newTetrahedrons: ReadonlyArray<Tetrahedron>; newPoint: Color } {
	const affectedTetrahedrons = tetrahedrons.filter(tetrahedron =>
		tetrahedronHasEdge(tetrahedron, edge),
	);

	const unAffectedTetrahedrons = tetrahedrons.filter(
		tetrahedron => !tetrahedronHasEdge(tetrahedron, edge),
	);

	let newPoint: { point: Color | undefined } = { point: undefined };

	return {
		newTetrahedrons: [
			...unAffectedTetrahedrons,
			...affectedTetrahedrons
				.map(affectedTetrahedron =>
					splitTetrahedron(affectedTetrahedron, edge, newPoint),
				)
				.reduce((soFar, current) => [...soFar, ...current], []),
		],
		newPoint: newPoint.point!,
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

function addPoint(
	tetrahedrons: ReadonlyArray<Tetrahedron>,
): { newTetrahedrons: ReadonlyArray<Tetrahedron>; newPoint: Color } {
	const allEdges = tetrahedrons
		.map(edgesInTetrahedron)
		.reduce((soFar, current) => [...soFar, ...current], []);

	const longestEdge = findMax(
		allEdges,
		(a, b) => edgeLengthSquared(a) > edgeLengthSquared(b),
	);

	return splitEdge(longestEdge, tetrahedrons);
}

function* makeColorSeries(): IterableIterator<Color> {
	const white: Color = { r: 1, g: 1, b: 1 };
	const gray: Color = { r: 0.5, g: 0.5, b: 0.5 };
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

	// yield white;
	// yield gray;
	// yield black;
	yield red;
	yield magenta;
	yield blue;
	yield cyan;
	yield green;
	yield yellow;

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
