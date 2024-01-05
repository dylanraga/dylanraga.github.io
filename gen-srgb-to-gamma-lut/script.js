const resultTxt = document.getElementById('result-txt');

document.getElementById('result-txt').addEventListener('click', (e) => {
	e.currentTarget.focus();
	e.currentTarget.select();
});

document.getElementById('whiteLevel').addEventListener('change', (e) => {
	document.getElementById('cbv').value = Math.round(
		(e.currentTarget.value - 80) / 4
	);
});

document.getElementById('cbv').addEventListener('change', (e) => {
	document.getElementById('whiteLevel').value = Math.round(
		80 + e.currentTarget.value * 4
	);
});

document.getElementById('form').addEventListener('submit', (e) => {
	e.preventDefault();
	const formData = new FormData(e.currentTarget);

	const whiteLevel = parseFloat(formData.get('whiteLevel'));
	const blackLevel = parseFloat(formData.get('blackLevel'));
	const gamma = parseFloat(formData.get('gammaPower'));
	const method = formData.get('method');
	resultTxt.value = genlut({ whiteLevel, blackLevel, gamma, method });
});

function genlut({ whiteLevel, blackLevel, gamma, method }) {
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

		let output = transformToGamma(input, {
			whiteLevel,
			blackLevel,
			gamma,
			method,
		});

		// console.log(output);

		contents += `\n${input.toFixed(14)}\t${output.toFixed(
			14
		)}\t${output.toFixed(14)}\t${output.toFixed(14)}`;
	}

	contents += '\nEND_DATA\n';

	return contents;
}

function transformToGamma(input, { whiteLevel, blackLevel, gamma, method }) {
	let output;
	if (input === 0) return 0;
	switch (method) {
		case 'nvidia':
			{
				const luminanceOriginal = pqEotf(input);

				if (luminanceOriginal < blackLevel || luminanceOriginal > whiteLevel) {
					output = input;
					break;
				}

				const inputSrgb = srgbInvEotf(luminanceOriginal / whiteLevel);
				const gammaLuminance =
					(whiteLevel - blackLevel) * inputSrgb ** gamma + blackLevel;

				output = pqInvEotf(gammaLuminance);
			}
			break;
		case 'amd':
			{
				if (blackLevel) {
					const luminanceOriginal = whiteLevel * srgbEotf(input);
					console.log({ blackLevel, luminanceOriginal });
					if (luminanceOriginal < blackLevel) {
						output = input;
						break;
					}
				}

				const gammaLuminance =
					(whiteLevel - blackLevel) * input ** gamma + blackLevel;
				output = srgbInvEotf(gammaLuminance / whiteLevel);
			}
			break;
	}
	return output;
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

const X1 = 0.0404482362771082;
const X2 = 0.00313066844250063;

function srgbInvEotf(L) {
	const V = L <= X2 ? L * 12.92 : 1.055 * L ** (1 / 2.4) - 0.055;
	return V;
}

function srgbEotf(V) {
	const L = V <= X1 ? V / 12.92 : ((V + 0.055) / 1.055) ** 2.4;
	return L;
}
