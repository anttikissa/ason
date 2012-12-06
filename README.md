# ason

(This might be called CSON if it weren't already taken:
https://github.com/bevry/cson)

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
		// whether to enable debug features
		debug: true
		logLevel: /* 2 */ 4 


Dates, possibly looking like

	new Date(1354798123123)

or

	new Date('2012-12-06T09:15:50.644Z')

Maybe make writing ASON documents easier by abbreviating it with:

	D(1354798123123)

Binary buffers if needed.

Maybe regular expressions and Errors, too (but not likely as useful).

## API

	cson = require 'cson'

	# Like JSON

	cson.parse string
	cson.stringify value, replacer, space



