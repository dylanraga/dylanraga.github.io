const resultTxt = document.getElementById('result-txt');

document.getElementById('form').addEventListener('submit', (e) => {
	e.preventDefault();
	const whiteLevel = document.getElementById('whiteLevel').value;
	const gammaPower = document.getElementById('gammaPower').value;
	resultTxt.value = genlut(whiteLevel, gammaPower);
});

function genlut(whiteLevel, gammaPower) {
	let contents = `CAL

ORIGINATOR "vcgt"
DEVICE_CLASS "DISPLAY"
COLOR_REP "RGB"

NUMBER_OF_FIELDS 4
BEGIN_DATA_FORMAT
RGB_I RGB_R RGB_G RGB_B
END_DATA_FORMAT

NUMBER_OF_SETS 1024
BEGIN_DATA`;

	for (let i = 0; i < 1024; i++) {
		const input = i / 1023;
		const luminance = pqEotf(input);

		let output = pqInvEotf(
			whiteLevel * srgbInvEotf(luminance / whiteLevel) ** gammaPower
		);

		if (i === 0) {
			output = 0;
		}
		if (luminance >= whiteLevel) {
			output = input;
		}

		contents += `\n${input.toFixed(14)}\t${output.toFixed(
			14
		)}\t${output.toFixed(14)}\t${output.toFixed(14)}`;
	}

	contents += '\nEND_DATA\n';

	return contents;
}

const m1 = 0.1593017578125;
const m2 = 78.84375;
const c1 = 0.8359375;
const c2 = 18.8515625;
const c3 = 18.6875;

function pqEotf(V) {
	const L =
		10000 *
		(Math.max(V ** (1 / m2) - c1, 0) / (c2 - c3 * V ** (1 / m2))) ** (1 / m1);
	return L;
}

function pqInvEotf(L) {
	const V =
		((c1 + c2 * (L / 10000) ** m1) / (1 + c3 * (L / 10000) ** m1)) ** m2;
	return V;
}

function srgbInvEotf(L) {
	const X2 = 0.00313066844250063;
	const V = L <= X2 ? L * 12.92 : 1.055 * L ** (1 / 2.4) - 0.055;

	return V;
}
