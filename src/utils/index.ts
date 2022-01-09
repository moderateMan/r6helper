export function uuid() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
		/[xy]/g,
		function (c) {
			const r = (Math.random() * 16) | 0,
				v = c == "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		}
	);
}

export function debounce<T extends (...args: any) => any>(
	fn: T,
	delay: number,
	target?: any
) {
	// 定时器，用来 setTimeout
	let timer: any;
	return function (...args: any) {
		// 存在timer说明不久前执行了操作
		if (!timer) {
			// 立刻执行，不等的那种
			fn.apply(target, Array.from(args));
			// 下面的单纯就是一个切换flag的逻辑
			timer = setTimeout(function () {
				clearTimeout(timer);
				timer = null;
			}, delay);
		}
	};
}

export const isString = (val: unknown): val is string =>
	typeof val === "string";
export const isFunction = (val: unknown): val is Function =>
	typeof val === "function";
export const isObject = (val: unknown): val is Record<any, any> =>
	val !== null && typeof val === "object";
export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
	return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};

export function getQueryVariable({ targetStr, variable, splitStr='&' }: { targetStr: string, variable: string, splitStr?: string }) {
	const query = targetStr;
	const vars = query.split(splitStr);
	debugger
	for (let i = 0; i < vars.length; i++) {
		const pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	}
	return '';
}