# basic-assert

Basically the simplest assert library you can get.

## Usage

	assert(something truthy)
	assert.not(something falsy)
	assert.is(something, expected)
	assert.isnt(something, unexpected)

	// Deep equality - circular data structures not supported
	assert.eq(something, expected)
	assert.neq(something, unexpected)

`basic-assert` is smart enough to display the offending source line.  It also
works with CoffeeScript (version >= 1.6.2).

How it looks like:

	% ./test

	Error: Got "[1,2,3]",
	Expected:  "[1,2,3,4]"

	File: test
	Line: 24

	assert.eq([1,2,3], [1,2,3,4]);
		   ^

		   <anonymous> (test:24:8)
		   Module._compile (module.js:456:26)
		   Module._extensions..js (module.js:474:10)
		   Module.load (module.js:356:32)
		   Module._load (module.js:312:12)
		   Module.runMain (module.js:497:10)
		   startup (node.js:119:16)
		   <anonymous> (node.js:901:3)

Normally, assert will just terminate the process when something unexpected
happens.  If you want it to go on, you can do:

	assert.fatal = false

## Shortcomings

Other JavaScript implementations than V8 are not supported.

