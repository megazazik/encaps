<a name="0.7.0"></a>
# [0.7.0](https://github.com/megazazik/encaps/compare/v0.6.0...v0.7.0) (2019-07-07)


### Features

* add full support of external reducer and action creators ([6e70cd2](https://github.com/megazazik/encaps/commit/6e70cd2))
* **actions:** add toString method of action creators which returns an action type ([8c961a1](https://github.com/megazazik/encaps/commit/8c961a1))
* **build:** removed deprecated methods setInitState, action and markAsActionCreatorsGetter ([a3291c7](https://github.com/megazazik/encaps/commit/a3291c7))


### BREAKING CHANGES

* **actions:** removed a type property of action creators
* **build:** removed deprecated methods setInitState, action and markAsActionCreatorsGetter
* functions which are passed to subActions method receive a full action object as the
first argument instead of payload



<a name="0.6.0"></a>
# [0.6.0](https://github.com/megazazik/encaps/compare/v0.5.3...v0.6.0) (2019-06-23)


### Features

* removed actions to manipulate maps and lists ([3d8d11a](https://github.com/megazazik/encaps/commit/3d8d11a))
* **bindActionCreators:** add bindActionCreators function ([536ad95](https://github.com/megazazik/encaps/commit/536ad95))


### BREAKING CHANGES

* Removed old actions for map and lists like: add, remove, insert and so on



<a name="0.5.3"></a>
## [0.5.3](https://github.com/megazazik/encaps/compare/v0.5.2...v0.5.3) (2019-06-20)


### Bug Fixes

* fixed js error when a passed reducer has not been created by encaps ([1560d00](https://github.com/megazazik/encaps/commit/1560d00))



<a name="0.5.2"></a>
## [0.5.2](https://github.com/megazazik/encaps/compare/v0.5.1...v0.5.2) (2019-06-20)


### Bug Fixes

* **build:** fix build to commonjs modules ([0deb039](https://github.com/megazazik/encaps/commit/0deb039))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/megazazik/encaps/compare/v0.5.0...v0.5.1) (2019-06-16)


### Bug Fixes

* fix excess child reducer call, add export of IModel interface, add es5 build ([1e7f74d](https://github.com/megazazik/encaps/commit/1e7f74d))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/megazazik/encaps/compare/v0.4.1...v0.5.0) (2019-05-17)


### Features

* **handlers:** add posibility to set a string instead of a handler ([ecccf1b](https://github.com/megazazik/encaps/commit/ecccf1b))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/megazazik/encaps/compare/v0.4.0...v0.4.1) (2018-12-07)


### Bug Fixes

* **build:** fix build bug ([7a418eb](https://github.com/megazazik/encaps/commit/7a418eb))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/megazazik/encaps/compare/v0.3.2...v0.4.0) (2018-12-07)


### Features

* add effects ([4c84b82](https://github.com/megazazik/encaps/commit/4c84b82))
* add effects method of Builder ([3fe1c64](https://github.com/megazazik/encaps/commit/3fe1c64))
* **actions:** add action creator's types ([cb3acd2](https://github.com/megazazik/encaps/commit/cb3acd2))
* **controller:** add effect method to builder ([1e27cdc](https://github.com/megazazik/encaps/commit/1e27cdc))
* **controller:** change interface ([e08ee4e](https://github.com/megazazik/encaps/commit/e08ee4e))
* **effects:** add select function to effects ([456b4ba](https://github.com/megazazik/encaps/commit/456b4ba))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/megazazik/encaps/compare/v0.3.1...v0.3.2) (2018-09-06)



<a name="0.3.1"></a>
## [0.3.1](https://github.com/megazazik/encaps/compare/v0.3.0...v0.3.1) (2018-07-15)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/megazazik/encaps/compare/v0.2.1...v0.3.0) (2018-07-15)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/megazazik/encaps/compare/v0.2.0...v0.2.1) (2018-03-04)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/megazazik/encaps/compare/v0.1.0...v0.2.0) (2017-11-30)



<a name="0.1.0"></a>
# 0.1.0 (2017-08-24)



