# Mosquito

[![Build Status](https://travis-ci.org/Commander-lol/mosquito.svg?branch=develop)](https://travis-ci.org/Commander-lol/mosquito)

(( These docs are still being written, if there's anything you need to know as a priority, open an issue and I'll get right on it ))

Dependency Injection that doesn't need any fanagle or weirdness. Simply put: Define what the container should provide when a constructor declares a certain parameter, and...well, that's it really.

Supports Node 6+ and LTS

## Installation

Now that you know everything you need to know about mosquito, you can install it and get started. Pretty simple through npm:

```
npm i --save mosquito
```
or your favourite alternative installation method such as `ied install -S mosquito` or `yarn add mosquito`

## Usage

Using mosquito is incredibly simple. By annotating the properties of your constructor with [flow](https://flowtype.org/) types, mosquito will automatially provide as a parameter the specific object that has been registered in the container under that name. 

The name resolution process is described below, but the basic gist is that any objects, functions or classes you've created in your code that you want to be injected have to be registered with the container via a `ServiceProvider`. 

Injecting node builtins and npm packages comes free, but you may need to register an alias for a libaray if its name is not a valid js identifier

```js
// myfile.js
// Somewhat contrived example
class MyController {
	constructor(repo: MyRepository, moment: moment) {
		this.repo = repo
		this.moment = moment
	}
}

class MyRepository {
	constructor(db: Database) {
		this.db = db
	}
}

module.exports = {
	MyController,
	MyRepository,
}
```
```js
// app.js
// Application entry point that initialises the container
const { ServiceProvider } = require('mosquito')
const repoProvider = new ServiceProvider()

const { MyRepository, MyController } = require('./myfile')
repoProvider.when('MyRepository').singleton(MyRepository)
repoProvider.when('Database').resultOf(function() {
	return something_that_gets_a_db_connection()
})

// usually this happens elsewhere in the codebase
const controller = new MyController()
// typeof controller.repo is 'MyRepository'
// typeof controller.moment is the result of `require('moment')`
// typeof controller.repo.db is whatever was returned by `#something_that_gets_a_db_connection()`
```

### Service Provider

The Service Provider is where you'll be doing a fair whack of the work. It's the easiest way to register resolutions with the container, through a series of helper functions. To start, you'll need to import the ServiceProvider object, and create a new one (don't worry, no parameters):

```js
const { ServiceProvider } = require('mosquito')
const provider = new ServiceProvider
```

This provides the contract for easily registering dependancies with the container. To kick start the process, you'll need to call the `#register` method, and provide it with a function that accepts a `ProviderBuilder`

The provider builder itself only exposes one method, `when`, which defines the name of the dependancy. It then returns a set of helpers, each of which provides a different type of object when the dependancy is resolved.

helper | takes | provides
-------|-------|-----
`#singleton` | A class | The same instance of that class to all dependees
`#instanceOf` | A class | A new instance of the class when a dependee is instantiated
`#object` | Any object | The passed in object
`#copyOf` | Any object | A copy of the passed in object, created with `lodash.deepclone`
`#resultOf` | A function | The return value of invoking the given function, which is invoked when a dependee is instantiated
`#library` | A string | Returns the result of `require` being called with the provided string. This is also the fallback behaviour for unregistered injections, and so generally only needs to be used to shadow one installed module with another one (e.g. hinting for `fs` but injecting a package such as `fs-extra`)

An example of registering a singleton class and, essentially, an app-level constant:

```js
provider.register((app) => {
	app.when('MyRepo').singleton(MyRepoImplementation)
	app.when('ThatStringINeed').object('This is that string')
})
```
