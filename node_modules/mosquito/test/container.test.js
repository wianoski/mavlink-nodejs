const assert = require('assert')
const { Container, ContainerClass, ServiceProvider } = require('../lib')

const NOOP = () => {}

describe('The container', () => {
	describe('when binding', () => {
		it('should resolve explicitly bound constructor params', () => {
			const provision = {
				ident: 123
			}

			const A = Container.bind(class {
				constructor(a, b, c) {
					assert(a === 'Hello')
					assert(b === provision)
					assert(c == null)
				}
			}, ['first', 'second'])

			const provider = new ServiceProvider()

			provider.register(app => {
				app.when('first').resultOf(() => 'Hello')
				app.when('second').object(provision)
			})

			new A
		})

		it('should tag bound classes', () => {
			const A = Container.bind(class {})
			assert(A.$$_Mosquito === true)
		})
	})

	describe('when resolving', () => {
		it('should proxy user provided constructor params', () => {
			const provision = {
				ident: 123
			}

			const A = Container.bind(class {
				constructor(a, b, c) {
					assert(a === provision)
					assert(b === 12)
					assert(c === 'Hi')
				}
			}, ['first'])

			const provider = new ServiceProvider()

			provider.register(app => {
				app.when('first').object(provision)
			})

			new A(12, 'Hi')
		})
	})
})

describe('In Scope', () => {
	describe('global', () => {
		it('should have added a container instance', () => {
			assert(global.Container instanceof ContainerClass)
			assert(global.Container === Container)
		})

		it('should have a version-scoped instance of container', () => {
			let containers = 0
			Object.getOwnPropertySymbols(global).forEach(symbol => {
				if (global[symbol] instanceof ContainerClass) {
					containers += 1
				}
			})
			assert(containers == 1)
		})
	})

	describe('isolation', () => {
		it('should provide resolutions bound to the context', () => {
			const A = Container.bind(class {
				constructor(a, b) {
					assert(a === 99)
					assert(b === 'Howdy')
				}
			}, ['contextual', 'param'])

			Container.resolveInContext(A, app => {
				app.when('contextual').resultOf(() => 99)
				app.when('param').copyOf('Howdy')
			}, () => {
				new A
			})
		})

		it('should provide resolutions from the parent container', () => {
			const provider = new ServiceProvider()
			provider.register(app => {
				app.when('parental').object('This is the parent')
			})

			const A = Container.bind(class {
				constructor(a) {
					assert(a === 'This is the parent')
				}
			}, ['parental'])

			Container.resolveInContext(A, NOOP, () => new A)
		})

		it('should shadow duplicate bindings', () => {
			const provider = new ServiceProvider()
			provider.register(app => app.when('fandango').object('This is the parent'))

			const A = Container.bind(class {
				constructor(a) {
					assert(a === 'This is the child')
				}
			}, ['fandango'])

			Container.resolveInContext(
				A,
				app => app.when('fandango').object('This is the child'),
				() => new A
			)
		})

		it('should only shadows bindings within the context function', () => {

			const provider = new ServiceProvider()
			provider.register(app => app.when('wongle').object('This is the parent'))

			const A = Container.bind(class {
				constructor(a, inContext) {
					if (inContext) {
						assert(a === 'This is the child')
					} else {
						assert(a === 'This is the parent')
					}
				}
			}, ['wongle'])

			new A(false)

			Container.resolveInContext(
				A,
				app => app.when('wongle').object('This is the child'),
				() => new A(true)
			)

			new A(false)
		})
	})
})
