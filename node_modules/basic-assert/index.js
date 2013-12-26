var path = require('path');

var log = function() { console.log.apply(console, arguments); }

// Format values so that the type is evident
function fmt(value) {
	if (typeof value === 'string') {
		return "'" + value + "'";
	}

	if (Object.prototype.toString.apply(value) === '[object Array]') {
		return JSON.stringify(value);
	}

	if (Object.prototype.toString.apply(value) === '[object Date]') {
		return "(Date) " + JSON.stringify(value);
	}

	if (typeof value === 'object') {
		return JSON.stringify(value);
	}

	return value;
}

function assert(value) {
	if (!value) {
		error('Got ' + fmt(value) + ',\nExpected:  a truthy value');
	}
}

assert.not = function(value) {
	if (value) {
		error('Got ' + fmt(value) + ',\nExpected:  a falsy value');
	}
};

assert.is = function(lhs, rhs) {
	if (lhs !== rhs) {
		error('Got ' + fmt(lhs) + ',\nExpected:  ' + fmt(rhs));
	}
};

assert.isnt = function(lhs, rhs) {
	if (lhs === rhs) {
		error('Got ' + fmt(lhs) + ',\nbut shouldn\'t have!');
	}
};

assert.eq = function(lhs, rhs) {
	var lhsS = JSON.stringify(lhs);
	var rhsS = JSON.stringify(rhs);
	if (lhsS !== rhsS) {
		error('Got ' + lhsS + ',\nExpected:  ' + rhsS);
	}
};

assert.neq = function(lhs, rhs) {
	var lhsS = JSON.stringify(lhs);
	var rhsS = JSON.stringify(rhs);
	if (lhsS === rhsS) {
		error('Got ' + lhsS + ',\nbut shouldn\'t have!');
	}
};

assert.lt = function(lhs, rhs) {
	if (lhs >= rhs) {
		error('Expected ' + fmt(lhs) + ' < ' + fmt(rhs));
	}
}

assert.lte = function(lhs, rhs) {
	if (lhs > rhs) {
		error('Expected ' + fmt(lhs) + ' <= ' + fmt(rhs));
	}
}

assert.gt = function(lhs, rhs) {
	if (lhs <= rhs) {
		error('Expected ' + fmt(lhs) + ' > ' + fmt(rhs));
	}
}

assert.gte = function(lhs, rhs) {
	if (lhs < rhs) {
		error('Expected ' + fmt(lhs) + ' >= ' + fmt(rhs));
	}
}

assert.type = function(lhs, expectedType) {
	var actualType = typeof lhs;
	if (actualType !== expectedType) {
		error('Type of ' + fmt(lhs) + ' was ' + actualType + ',\n' +
			'Expected type: ' + expectedType + '');
	}
};

assert.fatal = true;

function error(msg) {
    var err = new Error();
    var lines = err.stack.trim().split('\n').slice(1);
    var offendingLine = lines[2];
    var match = offendingLine.match(/\((.*):([0-9]+):([0-9]+), <js>:.*\)/);
    if (match) {
//        log("Looks like CoffeeScript", match);
        // Help IntelliJ IDEA to linkify this
        lines[2] = lines[2].replace(/, <js>.*\)/, ')');
    }

    if (!match) {
        var match = offendingLine.match(/\((.*):([0-9]+):([0-9]+)\)/);
    }

//    if (match) {
//        log("Looks like JavaScript", match);
//    }

    if (match) {
        var filename = match[1];
        var line = Number(match[2]);
        var column = Number(match[3]);
    } else {
        log("Can't parse stack trace line", offendingLine);
        throw err;
    }

	var file = require('fs').readFileSync(filename, 'utf8');
	var relative = path.relative(process.cwd(), filename);

	log("\nFile: " + relative);
	log("Line: " + line);
    log("\n" + msg);
	log("\n" + file.split('\n')[line - 1].replace(/\t/g, ' '));
	log(Array(column).join(' ') + "^");
    log();

    for (var i = 2; i < lines.length; i++) {
        log(lines[i]);
    }

	if (assert.fatal) {
		process.exit(1);
	}
}

module.exports = assert;
