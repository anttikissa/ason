var log = require('basic-log');

var eofToken = {
	type: 'eof'
};

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
//		log("tokens now:", tokens);
		var c = char();
//		log("read char", c);

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

			log("pushing id", chars);
			tokens.push({ type: 'id', value: chars });
			continue;
		}

		// looks like a delimiter?
		if (c.match(/[,:{}\[\]]/)) {
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

	// Eat token and return it
	function token() {
		return tokens[i++] || eofToken;
	}

	// Pretend we didn't eat that token
	function putBack() {
		i--;
	}

	// What would be the next token?
	function peek() {
		return tokens[i] || eofToken;
	}

	var result = undefined;

	// Parse one of
	// 123, // number
	// id, // identifier
	// 'abc' // string
	// { ... } // object
	// [ ... ] // array
	// null // etc
	function parseExplicit() {
		var tok = token();

		if (tok.type === 'string') {
			return tok.value;
		}
		
		if (tok.type === 'number') {
			return tok.value;
		}

		// TODO null, NaN etc.
		
		if (tok.delim === '[') {
			log("parse array");
			var result = [];
			while (true) {
				var next = peek();
				if (next.delim === ']') {
					token();
					return result;
				} 
				var value = parseExplicit();
				log("array value returned", value);
				if (typeof value === 'undefined') {
					error('error while parsing array');
				}
				result.push(value);
				// eat the next comma, optionally
				if (peek().delim === ',') {
					token();
				}
			}
		}

		if (tok.delim === '{') {
			log("parse object");
			var result = {};
			while (true) {
				var next = peek();
				// TODO replace this and similar with
				// consumeIfNextIs() or something
				if (next.delim === '}') {
					token();
					return result;
				}

				var first = token();
				if (first.type !== 'id' && first.type !== 'string') {
					log('token is', first);
					error('expecting id or string while parsing object');
				}

				// TODO what if first is NaN, Infinity, undefined, null or
				// something hideous?

				var second = token();
				if (second.delim !== ':') {
					error('expecting ":" while parsing object');
				}

				var third = parseExplicit();
				if (typeof third === 'undefined') {
					error('error while parsing object');
				}

				result[first.value] = third;

				// eat the next comma, optionally
				if (peek().delim === ',') {
					token();
				}
				
			}
		}

		return;
	}

	function parseAny() {
		var result;
		var currentObject;
		var currentArray;

		function getCurrentArray() {
			return currentArray || (currentArray = []);
		}

		function getCurrentObject() {
			return currentObject || (currentObject = {});
		}

		while (true) {
			var explicit = parseExplicit();
			log("parseAny tried explicit, gave", explicit);

			var next = peek();
			if (next.type === 'eof') {
				log('eof');
				// TODO handle currentObject, currentArray
				if (currentArray) {
					currentArray.push(explicit);
					return currentArray;
				}

				return explicit;
			}

			if (next.delim === ',') {
				getCurrentArray().push(explicit);
			}

			// part of an object?
//			if ((tok.type === 'string' || tok.type === 'id')
//				&& next.delim == ':') {
//				log("Parsing an object!");
//			}
		}
	}

	result = parseAny();
	log('parseAny gave', result);

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

