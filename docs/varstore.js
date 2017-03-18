module.exports = function(varObj) {
	const pub = {}

	for (const iprop in varObj) {
		varObj[iprop + '_callbacks'] = []

		;(function(prop) {
			pub['on_' + prop + '_changed'] = function(func) {
				varObj[iprop + '_callbacks'].push(func)
			}

			pub[prop] = function(v) {
				if (typeof v == 'undefined') {
					return varObj[prop]
				} else {
					varObj[prop] = v
					for (const ifunc of varObj[iprop + '_callbacks']) {
						ifunc()
					}
				}
			}
		})(iprop)
	}

	return pub
}
