import {
	uuid,
	debounce,
	isString,
	isFunction,
	isObject,
	isPromise
} from '../src/utils'
describe('utils', () => {
	test('is obj', () => {
		class Person { }
		 expect(isObject({})).toBe(true);
		expect(isObject({ a: 1 })).toBe(true);
		expect(isObject({ 1: 1 })).toBe(true);
		expect(isObject(undefined)).toBe(false);
		expect(isObject(null)).toBe(false);
		expect(isObject([])).toBe(true);
		expect(isObject(function () { })).toBe(false);
		expect(isObject(() => { })).toBe(false);
		expect(isObject(new Person())).toBe(true);
		expect(isObject(new String())).toBe(true);
	})
	test('is fn', () => {
		expect(isFunction(new Function())).toBe(true);
		expect(isFunction(() => { })).toBe(true);
		expect(isFunction(null)).toBe(false);
		expect(isFunction(undefined)).toBe(false);
		expect(isFunction(1)).toBe(false);
		expect(isFunction('1')).toBe(false);
		expect(isFunction([])).toBe(false);
		expect(isFunction({})).toBe(false);
		expect(isFunction(new Date())).toBe(false);
	})
	test('is promise', () => {
		expect(isPromise(new Promise(() => { }))).toBe(true);
		expect(isPromise(Promise.resolve(true))).toBe(true);
		expect(isPromise({})).toBe(false);
		expect(isPromise({ a: 1 })).toBe(false);
		expect(isPromise({ 1: 1 })).toBe(false);
		expect(isPromise(undefined)).toBe(false);
		expect(isPromise(null)).toBe(false);
		expect(isPromise([])).toBe(false);
		expect(isPromise(function () { })).toBe(false);
		expect(isPromise(() => { })).toBe(false);
	})
	test('is isString', () => {
		expect(isString("")).toBe(true);
		expect(isString(String(''))).toBe(true);
		expect(isString(new Promise(() => { }))).toBe(false);
		expect(isString(Promise.resolve(true))).toBe(false);
		expect(isString({})).toBe(false);
		expect(isString({ a: 1 })).toBe(false);
		expect(isString({ 1: 1 })).toBe(false);
		expect(isString(undefined)).toBe(false);
		expect(isString(null)).toBe(false);
		expect(isString([])).toBe(false);
		expect(isString(function () { })).toBe(false);
		expect(isString(() => { })).toBe(false);
	})
	test('is uuid', () => {
		expect(uuid()).toBeTruthy()
	})
	test('test debounce', () => {
		let flag = 0
		let testFunc = () => {
			flag = ++flag
		}
		testFunc = debounce(testFunc, 1000)
		testFunc()
		testFunc()
		testFunc()
		testFunc()
		testFunc()
		testFunc()
		expect(flag).toBe(1);
	})
})
