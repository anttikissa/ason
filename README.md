# ason

(This might be called CSON if it weren't already taken:
https://github.com/bevry/cson)

## Goal

Maximally human-readable, human-writable notation for objects that supports all
kinds of objects, comments, and other things that JSON is lacking.

	ason.parse 'foo: 1, bar: 2' => { foo: 1, bar: 2 }
	ason.parse '"a string"' => "a string"

Basically the guidelines are here: http://pmuellr.blogspot.fi/2008/08/better-than-json.html

## A sketch

Main differences from JSON:

- naked keywords are allowed, and commas not necessary, much like CoffeeScript
  does it:

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


- any object is valid for ASONification:

	["foo", "bar", { zot: 'wux' }]

	null

	"foo"

so you don't need to worry whether you can return a string from a remote method
that is serialized (for instance).

- single quotes, too:

	foo: 'wux'

- comments:

	options:
		// whether to enable debug features
		debug: true
		logLevel: /* 2 */ 4 


- dates, possibly in form of

	new Date(1354798123123)

or

	new Date('2012-12-06T09:15:50.644Z')

Possibly make writing ASON documents easier by abbreviating it with:

	D(1354798123123)

- binary buffers if needed

- maybe regular expressions and Errors, too (but not likely as useful)

## API

	cson = require 'cson'

	# Like 
	cson.parse string

	cson.stringify value, replacer, space



