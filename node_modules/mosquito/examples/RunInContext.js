/* eslint-disable no-console, no-undef */
const { ServiceProvider } = require('../lib/index')
const provider = new ServiceProvider()

provider.register(app => {
	app.when('fs').library('fs-jetpack')
})

const ExampleClass = require('./example')

const instance = new ExampleClass
console.log(instance.absolute('foo.js'))

Container.resolveInContext(
	ExampleClass,
	app => {
		app.when('fs').object({
			cwd() {
				return '/foo/bar'
			}
		})
	},
	() => {
		const containedInstance = new ExampleClass
		console.log(containedInstance.absolute('baz.js'))
	}
)

const thirdInstance = new ExampleClass
console.log(thirdInstance.absolute('baz.js'))
