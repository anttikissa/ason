# ASON 

ASON is a JSON replacement that

- is designed to be read and written by humans (comments, trailing commas, both
  kinds of string literals, etc.)
- supports all JavaScript types and values, including Date, RegExp, `undefined`
  and special floating point values such as `Infinity`.

## Why ASON?

1. Designed for human consumption.

You can use comments:

	// Fill in details here
	{
		/* blah blah */
		name: 'Bob'
	}

ASON treats trailing commas like JavaScript does:

	[
		1,
		2,
		3, // perfectly ok
	]

Both single and double quotes are ok:

	{
		greeting: "How's it going?",
		delimiter: '"'
	}

Keys don't have to be quoted unless it is really necessary:

	ssh-hosts: {
		ns1.example.com: { user: 'bob', pass: '...', port: 22 }
	}

	pollFiles: {
		.gitignore: 100,
		tmp/*: 1000
	}

	deps: {
		$: 'lib/jquery',
		_: 'lib/underscore'
	}

	operatorPrecedences: {
		*: 10,
		/: 10,
		+: 9,
		-: 9,
		/* ... */
	}

	'minimum password length': 8

You can leave out `{}` and `[]` if the result is unambiguous:

	// equivalent to [1, 2, 'three']
	1, 2, 'three' 

	// equivalent to { firstName: 'Bob', lastName: 'Smith' }
	firstName: 'Bob', lastName: 'Smith'

	// equivalent to ['foo', { name: 'bob' }, 100]
	'foo', name: 'Bob', 100

	// equivalent to [1, 2, { x: 1, y: 2 }]
	1, 2, x: 1, y: 2

	// ERROR: ambiguous, since you could have meant either
	// { name: { first: 'Bob' } last: 'Smith' }, or 
	// { name: { first: 'Bob', last: 'Smith' } }
	name: first: 'Bob', last: 'Smith'

2. More complete support for JavaScript types

In addition to everything that JSON supports, you can serialize the values
Infinity, -Infinity, NaN, and undefined.  

Date types are also supported using two different formats:

	Date('2013-12-26 11:52:11.494'), // for humans
	Date(1388058731494) // for machines

TODO figure out if any user-defined types, plus RegExp, Error, Function etc. can
be supported

3. Backwards compatible

All JSON documents are also valid ASON documents.

ASON provides a JSON-compatible API.  Just replace `JSON.{parse,stringify}` with
`ason.{parse,stringify}` and you're good to go.

Simplified versions of ason.stringify:

ason.stringify(object); // human-readable output
ason.stringify(object, 'compact'); // no whitespace
ason.stringify(object, 2); // indent with two spaces
ason.stringify(object, '\t'); // indent with '\t'

Note that unlike JSON, ASON is not a subset of JavaScript. Therefore it cannot
be `eval`ed or accessed though a JSONP-like `script` technique.

TODO revise from here onwards

## Goal

Maximally human-readable, human-writable notation for objects that supports all
kinds of objects, comments, and other things that JSON is lacking.

	ason.parse 'foo: 1, bar: 2' => { foo: 1, bar: 2 }
	ason.parse '"a string"' => "a string"

Basically follow the guidelines here:
http://pmuellr.blogspot.fi/2008/08/better-than-json.html

## A sketch

Main differences from JSON:

Naked keywords are allowed, and commas not necessary, much like in CoffeeScript:

	{
		name:
			first: "William"
			last: "Shakespeare"
		works: [
			"Romeo and Juliet"
			"Hamlet"
			"A Midsummer Night's Dream"
		]
	}

Any object is valid for ASONification, so you don't need to worry whether you
can return a string from a remote method that is serialized:

	["foo", "bar", { zot: 'wux' }]

	null

	"foo"

Single quotes, too:

	metaGreeting: '"Hello world", he said.\n'

Comments:

	options:
		# whether to enable debug features
		debug: true
		# maybe enable inline comments as well:
		logLevel: /* 2 */ 4 


Dates, possibly looking like

	new Date(1354798123123)

or

	new Date('2012-12-06T09:15:50.644Z')

Maybe make writing ASON documents easier by abbreviating it with:

	D(1354798123123)

Binary buffers if needed.

Maybe regular expressions and Errors, too (but not likely as useful).

For browser use, provide a parser for a strict subset of ASON for over-the-wire
data.

## API

	ason = require 'ason'

	# Like JSON

	ason.stringify value, replacer, space
	ason.parse string

	# But since pretty-printing JSON is tedious, have shorthands:

	ason.to = (value, space) -> ason.stringify value, null, space
	ason.from = (string) -> ason.parse string

