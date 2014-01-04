var log = require('basic-log');

log.setLevel('info');

var eofToken = {
	type: 'eof'
};

// for debugging
function s(o) { return JSON.stringify(o); };

function tokenize(str) {
	log.d('TOKENIZE("' + str + '")');
	var i = 0;
	var tokens = [];

	function error(msg) {
		throw new Error(msg);
	}

	function char() {
		return str[i++];
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
//		log.d("tokens now:", tokens);
		var c = char();
//		log.d("read char", c);

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

			log.d("token number", number);
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

			log.d("token id", chars);
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

function parse(str) {
	var tokens = tokenize(str);

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
	// 'abc' // string (if not part of name-pair value)
	// { ... } // object
	// [ ... ] // array
	// null // etc
	function parseExplicit() {
		var tok = token();

		if (tok.type === 'string') {
			// Don't take a string if it's part of
			// <string> ':' <value>
			if (peek().delim !== ':') {
				return tok.value;
			}
		}
		
		if (tok.type === 'number') {
			return tok.value;
		}

		// TODO null, NaN etc.
		
		if (tok.delim === '[') {
			log.d("parse array");
			var result = [];
			while (true) {
				var next = peek();
				if (next.delim === ']') {
					token();
					return result;
				} 
				var value = parseExplicit();
				log.d("array value returned", s(value));
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
			log.d("parse object");
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
					log.d('token is', s(first));
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

		// return implicit undefined, signaling "can't parse an explicit value"
		putBack();
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
			log.d("parse loop, current token", peek());
//			log.d("currentArray", s(currentArray));
//			log.d("currentObject", s(currentObject));

			var next = peek();
			if (next.type === 'eof') {
				error('TODO got eof at the beginning, dunno what now!');
			}

			// Attempt to parse explicit value.
			var explicit = parseExplicit();

			// Did we get an explicit value?
			if (typeof explicit !== 'undefined') {
				log.d('got explicit', JSON.stringify(explicit));

				next = peek();

				// The whole form consisted of a single explicit object
				if (!currentArray && !currentObject && next.type === 'eof') {
					return explicit;
				}

				// If the previous thing was an object, make it an object
				// and push it first.
				if (currentObject) {
					getCurrentArray().push(currentObject);
					currentObject = null;
				}
				getCurrentArray().push(explicit);

				next = peek();

				// Eat following comma if there is one.
				if (next.delim === ',') {
					token();
					next = peek();
				}

				// If at end, deal with it.
				if (next.type === 'eof') {
					log.d('dealing with eof');
					// Did we have an array of objects?
					if (currentArray) {
						return currentArray;
					}

					// No, just one explicit object
					return explicit;
				}
				
				// Otherwise, continue parsing.
				continue;
			}

			// Parsing an explicit value failed; the other
			// possibility is a name-value pair.
			
			next = peek();

			if (next.type === 'string' || next.type === 'id') {
				// Our plan is to inject this thing into the current object.
				var obj = getCurrentObject();

				// TODO this code is copy & paste from parseExplicit()
				var first = token();
				if (first.type !== 'id' && first.type !== 'string') {
					log.d('token is', first);
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

				obj[first.value] = third;

				next = peek();

				// Eat the next comma, optionally
				if (peek().delim === ',') {
					token();
					next = peek();
				}

				// If at end, deal with it.
				if (next.type === 'eof') {
					log.d('dealing with eof after object');
					if (currentArray) {
						currentArray.push(currentObject)
						return currentArray;
					} else {
						return currentObject;
					}
				}

				// Otherwise, move on
				continue;
			}

			// Saw nothing good.
			error('syntax error');
		}
	}

	result = parseAny();
	log.d('parseAny gave', result);

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

