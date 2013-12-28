var log = require('basic-log');

function tokenize(s) {
	log('tokenize "' + s + '"');
	var i = 0;
	var tokens = [];

	function error(msg) {
		throw new Error(msg);
	}

	function char() {
		return s[i++];
	}

	function putBack() {
		i--;
	}

	function readString(terminator) {
		var result = "";

		while (true) {
			var c = char();
			if (!c) {
				error('unterminated string');
			}
			if (c === terminator) {
				return { type: 'string', value: result };
			}
			result += c;
		}
	}

	while (true) {
		var c = char();
		log("read char", c);

		if (!c) {
			break;
		}

		// eat whitespace
		if (c.match(/\s/)) {
			continue;
		}

		// looks like a string?
		if (c === '"' || c === "'") {
			tokens.push(readString(c));
		}

		// looks like a number?
		// TODO this is pretty sloppy, make it better
		if (c.match(/[-.0-9]/)) {
			var chars = '';
			// TODO continue from here...
			while (c && c.match(/[-.0-9e]/)) {
				chars += c;
				c = char();
				log("chars is", chars);
			}

			putBack();

			var number = parseFloat(chars);
			if (isNaN(number)) {
				error('invalid number "' + chars + '"');
			}

			log("pushing number", number);
			tokens.push({ type: 'number', value: number });
			
			continue;
		}

		// looks like an identifier?
		
		// looks like a delimiter?

	}

	return tokens;
}

function parse(s) {
	var tokens = tokenize(s);

	var i = 0;

	function error(msg) {
		throw new Error(msg);
	}

	function token() {
		return tokens[i++];
	}

	function peek() {
		return tokens[i];
	}

	var result = undefined;

	while (true) {
		var tok = token();
		var next = peek();

		log("got token", tok, "next", next);

		if (!tok) {
			break;
		}

		if (tok.type === 'string') {
			result = tok.value;
		}

		if (tok.type === 'number') {
			result = tok.value;
		}
	}

	if (typeof result === 'undefined') {
		error('unexpected input');
	}

	return result;
}

function stringify(o) {
	return "";
}

module.exports = {
	parse: parse,
	stringify: stringify
}
