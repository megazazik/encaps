## [0.8.1](https://github.com/megazazik/encaps/compare/v0.8.0...v0.8.1) (2019-12-01)


### Bug Fixes

* **types:** fix IActionCreator interface bug ([e8f4e70](https://github.com/megazazik/encaps/commit/e8f4e70d51a528897fc0bc9cfe11d7b773427b33))



# [0.8.0](https://github.com/megazazik/encaps/compare/v0.7.0...v0.8.0) (2019-08-11)


### Features

* add children function, add wrap method, rename effects to actionCreators, fix bugs, subAction ([7295961](https://github.com/megazazik/encaps/commit/729596133a170bcd0e9028310d958dd74f9e0349))


### BREAKING CHANGES

* effects method was renamed to actionCreators



# [0.7.0](https://github.com/megazazik/encaps/compare/v0.6.0...v0.7.0) (2019-07-07)


### Features

* **actions:** add toString method of action creators which returns an action type ([8c961a1](https://github.com/megazazik/encaps/commit/8c961a18204f6163e2eca9d577aba3dd16f41186))
* **build:** removed deprecated methods setInitState, action and markAsActionCreatorsGetter ([a3291c7](https://github.com/megazazik/encaps/commit/a3291c73f6fa0b347c8ca6874cae3aceeb696a1b))
* add full support of external reducer and action creators ([6e70cd2](https://github.com/megazazik/encaps/commit/6e70cd2b720be249af8a3ade62a0b69df84a1fa8))


### BREAKING CHANGES

* **actions:** removed a type property of action creators
* **build:** removed deprecated methods setInitState, action and markAsActionCreatorsGetter
* functions which are passed to subActions method receive a full action object as the
first argument instead of payload



# [0.6.0](https://github.com/megazazik/encaps/compare/v0.5.3...v0.6.0) (2019-06-23)


### Features

* **bindActionCreators:** add bindActionCreators function ([536ad95](https://github.com/megazazik/encaps/commit/536ad95b4c5681076e549b4a5cf635978d992cea))
* removed actions to manipulate maps and lists ([3d8d11a](https://github.com/megazazik/encaps/commit/3d8d11a5eaba4dab201b861d97012d9da12fba69))


### BREAKING CHANGES

* Removed old actions for map and lists like: add, remove, insert and so on



## [0.5.3](https://github.com/megazazik/encaps/compare/v0.5.2...v0.5.3) (2019-06-20)


### Bug Fixes

* fixed js error when a passed reducer has not been created by encaps ([1560d00](https://github.com/megazazik/encaps/commit/1560d0000a5e402a0d9c76ca325941e0dfaad29a))



## [0.5.2](https://github.com/megazazik/encaps/compare/v0.5.1...v0.5.2) (2019-06-20)


### Bug Fixes

* **build:** fix build to commonjs modules ([0deb039](https://github.com/megazazik/encaps/commit/0deb0391a09ba006fa5fe347eb46ae18fb882927))



## [0.5.1](https://github.com/megazazik/encaps/compare/v0.5.0...v0.5.1) (2019-06-16)


### Bug Fixes

* fix excess child reducer call, add export of IModel interface, add es5 build ([1e7f74d](https://github.com/megazazik/encaps/commit/1e7f74db3a7d72838a25e73785f11e98a689d543))



# [0.5.0](https://github.com/megazazik/encaps/compare/v0.4.1...v0.5.0) (2019-05-17)


### Features

* **handlers:** add posibility to set a string instead of a handler ([ecccf1b](https://github.com/megazazik/encaps/commit/ecccf1b4d34e35c8260fda1b1a4c7868acd4b459))



## [0.4.1](https://github.com/megazazik/encaps/compare/v0.4.0...v0.4.1) (2018-12-07)


### Bug Fixes

* **build:** fix build bug ([7a418eb](https://github.com/megazazik/encaps/commit/7a418ebddb67a92e9f83b94aa6c8406db9c8b40f))



# [0.4.0](https://github.com/megazazik/encaps/compare/v0.3.2...v0.4.0) (2018-12-07)


### Features

* **actions:** add action creator's types ([cb3acd2](https://github.com/megazazik/encaps/commit/cb3acd2ed4a33fd5b65bd7c36d663918ea5506fd))
* **controller:** add effect method to builder ([1e27cdc](https://github.com/megazazik/encaps/commit/1e27cdc333a4f39fd3af7fbbe114f4c6349eec25))
* **controller:** change interface ([e08ee4e](https://github.com/megazazik/encaps/commit/e08ee4ea2a727f84a6eda3995c8d66f99b85a7c8))
* **effects:** add select function to effects ([456b4ba](https://github.com/megazazik/encaps/commit/456b4bafbf06cc193d226edc01dceca752fb31e5))
* add effects ([4c84b82](https://github.com/megazazik/encaps/commit/4c84b82cbb7cfd06a7b2261e413b7cc76ac9c434))
* add effects method of Builder ([3fe1c64](https://github.com/megazazik/encaps/commit/3fe1c64db3b764619503c749daed9e24da1d0071))



## [0.3.2](https://github.com/megazazik/encaps/compare/v0.3.1...v0.3.2) (2018-09-06)



## [0.3.1](https://github.com/megazazik/encaps/compare/v0.3.0...v0.3.1) (2018-07-15)



# [0.3.0](https://github.com/megazazik/encaps/compare/v0.2.1...v0.3.0) (2018-07-15)



## [0.2.1](https://github.com/megazazik/encaps/compare/v0.2.0...v0.2.1) (2018-03-04)



# [0.2.0](https://github.com/megazazik/encaps/compare/v0.1.0...v0.2.0) (2017-11-30)



# 0.1.0 (2017-08-24)



