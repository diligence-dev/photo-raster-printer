module.exports = function(varObj) {
	let pub = {}

	for (let iprop in varObj) {
		varObj[iprop + 'callbacks'] = []

		;(function(prop) {
			pub['on_' + prop + '_changed'] = function(func) {
				varObj[iprop + '_callbacks'].push(func)
			}

			pub[prop] = function(v) {
				if (typeof v == 'undefined') {
					return varObj[prop]
				} else {
					varObj[prop] = v
					for (let ifunc of varObj[iprop + '_callbacks']) {
						ifunc()
					}
				}
			}
		})(iprop)
	}

	return pub
}
