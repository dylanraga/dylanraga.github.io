function handleClick() {
	document.getElementById('textarea').style.fontSize = '24pt';
}

function handleFancyChange() {
	if (document.getElementById('fancyshmancy').checked) {
		document.getElementById('textarea').style.fontWeight = 'bold';
		document.getElementById('textarea').style.color = 'blue';
		document.getElementById('textarea').style.textDecoration = 'underline';
	}
}

function handleBoringChange() {
	if (document.getElementById('boringbetty').checked) {
		document.getElementById('textarea').style.fontWeight = 'initial';
		document.getElementById('textarea').style.color = 'initial';
		document.getElementById('textarea').style.textDecoration = 'initial';
	}
}

function handleMoo() {
	var text = document.getElementById('textarea').value;
	var sentences = text.split('.');
	text = sentences.join('.-Moo');

	document.getElementById('textarea').value = text.toUpperCase();
}
