import {
	createContext,
	createElement,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from "react";
import {
	UNSAFE_NavigationContext,
	useNavigate,
	NavigateFunction,
} from "react-router-dom";
import { isFunction, isPromise, debounce } from "./utils";
let listenCallF: ((e: PopStateEvent) => void) | null;
type GListenerT = ((params: NotifyParamsT) => void) | null;
export type NotifyDataT = { url: string; callFunc: () => void };
export type NotifyParamsT = {
	eTag?: string;
	hash?: string;
	pathname?: string;
	search?: string;
	isGuard?: boolean;
	popEvent?: PopStateEvent;
} | null;
type PreGuardHandlerAT = (props?: NotifyParamsT) => boolean;
type PreGuardHandlerBT = (props?: NotifyParamsT) => Promise<boolean>;
export type preGuardHandlerT =
	| Promise<boolean>
	| PreGuardHandlerAT
	| PreGuardHandlerBT
	| null;
type ListenerT = (params: NotifyDataT) => void;
export interface ContextT {
	apiRecord: {
		pushState: (
			data: any,
			unused: string,
			url?: string | URL | null | undefined
		) => void;
		replaceState: (
			data: any,
			unused: string,
			url?: string | URL | null | undefined
		) => void;
		[key: string]: any;
	};
	updateProxy: () => void;
	registerGuardAndListener: (
		id: string,
		guard: preGuardHandlerT,
		listener?: ListenerT
	) => void;
	unregisterGuardAndListener: (id: string) => void;
	flag: boolean;
	[key: string]: any;
	guardList: { [key: string]: preGuardHandlerT };
	listenerList: { [key: string]: ListenerT };
	tagNmae?: string;
	countFlag: number;
	navi?: NavigateFunction;
	notifyData?: NotifyParamsT;
	notifyAll: (notifyData: NotifyDataT) => void;
	gListener?: GListenerT;
	handleHistoryChange?: (e: PopStateEvent) => void;
}

export const processLoop = async (
	cfList: preGuardHandlerT[],
	params?: NotifyParamsT
) => {
	const results: Boolean[] = [];
	let isGuard = false;
	const judeGard = (r: boolean) => {
		!r && (isGuard = true);
	};
	for (let i = 0; i < cfList.length; i++) {
		const callF = cfList[i];
		if (isPromise(callF)) {
			const result = await callF;
			judeGard(result);
			results.push(result);
		} else if (isFunction(callF)) {
			let result = callF(params);
			if (isPromise(result)) {
				result = await result;
				judeGard(result);
				results.push(result);
			} else {
				judeGard(result);
				results.push(result);
			}
		}
	}
	return { results, isGuard };
};

const R6HelperContext = createContext<ContextT>({
	apiRecord: {
		pushState: history.pushState,
		replaceState: history.replaceState,
	},
	flag: false,
	unlock: null,
	guardList: {},
	listenerList: {},
	handleHistoryChange() {
		this.countFlag++;
		if (this.countFlag % 2 === 1) {
			// console.log("拦截抖了两次");
		}
	},
	notifyAll(notifyData: NotifyDataT) {
		Object.values(this.listenerList).forEach((callF) => {
			callF(notifyData);
		});
	},
	countFlag: 0,
	addPopListener() {
		if (listenCallF) {
			window.removeEventListener("popstate", listenCallF);
			listenCallF = null;
		}
		listenCallF = this.handleHistoryChange!.bind(this);
		window.addEventListener("popstate", listenCallF);
	},
	updateProxy() {
		const pArr: preGuardHandlerT[] = Object.values(this.guardList);
		// 没有拦截了
		if (!pArr.length) {
			this.navigator.push = null;
			this.navigator.push = this.apiRecord.push;
		} else {
			const self = this;
			this.navigator.push = new Proxy(this.apiRecord.push, {
				apply(target, arglist, newTarget) {
					self.notifyData = {
						eTag: "navigate",
						...newTarget[0],
					};
					processLoop(pArr, self.notifyData).then((data) => {
						const { isGuard } = data;
						if (!isGuard) {
							self.unlock && self.unlock();
							self.unlock = null;
							Reflect.apply(
								self.apiRecord.push,
								arglist,
								newTarget
							);
						} else {
							self.notifyData!.isGuard = isGuard;
							self.notifyAll({
								url: newTarget[0].pathname,
								callFunc: () => {
									self.unlock();
									Reflect.apply(
										self.apiRecord.push,
										arglist,
										newTarget
									);
								},
							});
							self.notifyData = null;
						}
					});
				},
			});
		}
	},
	gListener: null,
	registerGuardAndListener(
		id: string,
		guard?: preGuardHandlerT,
		listener?: ListenerT
	) {
		this.addPopListener();
		guard && (this.guardList[id] = guard);
		listener && (this.listenerList[id] = listener);
		this.updateProxy();
	},
	unregisterGuardAndListener(id: string) {
		delete this.guardList[id];
		if (!Object.values(this.guardList).length) {
			this.unlock?.();
			this.unlock = null;
		}
		delete this.listenerList[id];
		window.removeEventListener("popstate", listenCallF!);
		this.updateProxy();
	},
});

function useR6Helper(context: ContextT, children: React.ReactNode) {
	const naviCtx = useContext(UNSAFE_NavigationContext);
	const navigator = naviCtx.navigator;
	context.apiRecord = {
		...context.apiRecord,
		push: navigator.push,
	};
	context.navigator = navigator;
	const contextRef = useRef(context).current;
	useEffect(() => {
		const gCall = () => {
			if (!contextRef.unlock) {
				contextRef.gListener!(contextRef.notifyData!);
			}
		};
		window.addEventListener("popstate", gCall);
		return () => {
			window.removeEventListener("popstate", gCall);
		};
	}, []);
	useEffect(() => {
		const proxyApi = (apiName: string) => {
			return new Proxy(contextRef.apiRecord[apiName], {
				apply(target, arglist, newTarget) {
					contextRef.gListener!(contextRef.notifyData!);
					Reflect.apply(target, arglist, newTarget);
				},
			});
		};
		window.history.pushState = proxyApi("pushState");
		window.history.replaceState = proxyApi("replaceState");
	}, [Object.values(context.guardList).length]);
	return createElement(
		R6HelperContext.Provider,
		{
			value: contextRef,
		},
		children
	);
}

function R6Provider(props: {
	context?: { [key: string]: any };
	children: React.ReactNode;
	handleHistoryChange?: ListenerT;
}) {
	const navi: NavigateFunction = useNavigate();
	const naviLister: EventListenerOrEventListenerObject = useCallback(
		(event: CustomEventInit) => {
			const { pathName, options } = event.detail;
			navi(pathName, options);
		},
		[]
	);
	useEffect(() => {
		window.addEventListener("R6_GOTO", naviLister);
	}, []);
	const defaultContext = useContext(R6HelperContext);
	return useR6Helper(
		{
			...defaultContext,
			...props.context,
			navi: useNavigate(),
			gListener: debounce<ListenerT>(props.handleHistoryChange!, 100),
		},
		props.children
	);
}

// hook
function useR6Context() {
	return useContext(R6HelperContext);
}

export function sleep(time: number) {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

export { default as useGuard } from "./hooks/useGuard";
export { default as useHistoryListener } from "./hooks/useGuard";
export { default as useGo, goto } from "./hooks/useGo";
export { default as useSearch } from "./hooks/useSearch";
export { default as useHash } from "./hooks/useHash";
export type { WithRouterPropsT } from "./hocs/withRouter";
export { default as withRouter } from "./hocs/withRouter";
export { useR6Context, R6Provider };
