const path = require('path')

class ExampleInjectionClass {
	constructor(a: fs, b: http) {
		this.fs = a
		this.http = b
	}

	absolute(relative: string) {
		return path.join(this.fs.cwd(), relative)
	}
}

module.exports = ExampleInjectionClass
