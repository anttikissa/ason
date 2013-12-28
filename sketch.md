
# Examples of things ASON has to handle (when parsing)

## Numbers

123
5.
.5
-.1e-234
Infinity
-Infinity
NaN
-0

## Identifiers

clientName
client_name
client-name
knäckebröd
$

## Strings (also allowed wherever identifiers are)

"hello world\n"
"Rock 'n roll"
'"Fabulous," she said.'
""

## Null

null

## Dates

date(1388058731494)
date('2013-12-26 11:52:11.494')
date('2013-12-26 11:52:11')
date('2013-12-26 11:52')
date('2013-12-26')
date("2013-12-26") 

Dates are in UTC.

## Arrays

Arrays come in two forms: plain and explicit.

The plain form looks like:

	1, 'Hello', 3

The explicit form looks like:

	[1, 'Hello', 3]

You'll need to use the explicit form when:

- if the array only has one element (or zero elements)
- you want to nest arrays, in which case the nested array needs to use the
  explicit form
- you want to nest arrays within objects (see below for details)

ASON is liberal about trailing commas:

	[
		1,
		2,
		3, // perfectly fine
	]

Two consecutive commas are an error, however.

## Objects:

Like arrays, objects come in two forms.

The plain form:

	name: "bob", score: 1234000, born: Date(401234567890), parents: ['mary', 'joe']

The explicit form:

	{ name: "bob", score: 1234000 }

You'll need to use the explicit form when:

	- you want to nest objects within objects, in which case the nested form
	  needs to use the explicit form
ones:
	- you want to nest object within arrays (or vice versa)

score: 123456, name: { first: 'John', last: 'Smith' }

You can, however, use the plain form inside arrays

1, 2, 3, name: 'bob', age: 32, 

Trailing commas are, again, fine:

{
	mode: 'prod',
	host: 'example.com',
	port: 8080, // works like a charm
	// debug: true
}

## Nesting arrays within objects and objects within arrays

	1, foo: 'bar', zot: 2, 3

translates into

	[1, { foo: 'bar', zot: 2 }, 3]

and 

	numbers: [1, 2, 3], names: ['Abe', 'Belle', 'Carl']

translates into

	{ numbers: [1, 2, 3], names: ['Abe', 'Belle', 'Carl'] }

However,

	numbers: 1, 2, 3, names: 'Abe', 'Belle', 'Carl'

translates into

	[{ numbers: 1 }, 2, 3, { names: 'Abe' }, 'Belle', 'Carl' ]

This
	
	name: 'Bob', age: 24, name: 'Zoe', age: 25

translates into

	{ name: 'Zoe', age: 25 }
	

So the basic rules are:

- when nesting arrays within objects, you need to use the explicit form.
- when nesting objects within arrays, you need to use the explicit form if
  TODO ...



## Objects

Occasionally you need to create other than plain objects.  

	Date(1234567)
	RegExp('hello (.*) world')

In fact, Date already works like this.

Probably the types that can be used like this need to be added to the parser
explicitly, security and all that.

## Making commas optional?

Would the whole thing work without any commas at all?

Test with all example things.


## Binary blobs?

## Comments

{
	// standard end-of-line comments
	// debug: true
},

/* plus multi-line comments 
 * like this */
{
	// ...
}
