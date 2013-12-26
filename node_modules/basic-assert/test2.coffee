assert = require './index'

for x in [0..100]
	if false
		x++

fail = ->
	g()

g = ->
	assert.eq 2, "should fail on line 11"

module.exports.fail = fail

