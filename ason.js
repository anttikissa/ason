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
			continue;
		}

		// looks like a number?
		// TODO this is pretty sloppy, make it better
		// matches anything that starts with -, ., or a number
		// and goes in any combination of +, -, ., number, e, and E
		// i.e. 1.23e+123 is valid, like it should, but so is
		// -1.e+3E-+-+-0
		if (c.match(/[-.0-9]/)) {
			var chars = '';
			while (c && c.match(/[-+.0-9eE]/)) {
				chars += c;
				c = char();
			}

			putBack();

			var number = parseFloat(chars);
			if (isNaN(number)) {
				error('invalid number "' + chars + '"');
			}

//			log("pushing number", number);
			tokens.push({ type: 'number', value: number });
			
			continue;
		}

		// looks like an identifier?
		if (c.match(/[a-zA-Z_]/)) {
			var chars = '';
			while (c && c.match(/[a-zA-Z_0-9-$]/)) {
				chars += c;
				c = char();
			}

			putBack();

//			log("pushing id", chars);
			tokens.push({ type: 'id', value: chars });
			continue;
		}

		// looks like a delimiter?
		if (c.match(/[:{}\[\]]/)) {
			tokens.push({ type: 'delim', delim: c });
			continue;
		}

		// looks like a comment?
		error("syntax error");
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

	function parseExplicit() {
	}

	function parseAny() {
		var result = undefined;

		while (true) {
			var tok = token();
			var next = peek();

			log("got token", tok, "next", next);

			if (!tok) {
				return result;
			}

			if (tok.type === 'string') {
				result = tok.value;
				// TODO what next? ':' or ','?
			}

			if (tok.type === 'number') {
				result = tok.value;
				// TODO what next? ','?
			}
			
			// TODO peek and stuff to figure out what's coming
			// parseAny() is this
			// '[' -> parseList() 
			// '{' -> parseObject()
			// id ':' parseSomething() and then what?
			// maintain a stack of parsed things.
		}
	}

	result = parseAny();

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
	stringify: stringify,
	tokenize: tokenize
}

