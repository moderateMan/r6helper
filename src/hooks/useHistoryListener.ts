import { useEffect, useRef } from "react";
import { useInRouterContext } from "react-router-dom";
import {
	useR6Context,
	ContextT,
	preGuardHandlerT,
	processLoop,
	NotifyDataT
} from "../index";
import { uuid } from "../utils";

interface PropsT {
	preGuardHandler?: preGuardHandlerT;
	guardedListener?: (params: NotifyDataT) => void;
}

const useGuard = (props: PropsT, depArr: any[] = []) => {
	const uuidRef = useRef<string>(uuid());
	const { preGuardHandler, guardedListener } = props;

	// 判断当前是否为路由环境
	if (!useInRouterContext()) {
		console.error("ERRROR!!! not in router component!!!");
	}

	const outletContext: ContextT = useR6Context();
	processLoop([preGuardHandler!]).then((data) => {
		const { isGuard } = data;
		if (isGuard && !outletContext.unlock) {
			const unblock = (outletContext.unlock = outletContext.navigator.block(
				(tx: any) => {
					outletContext.callFunc = () => {
						unblock();
						tx.retry();
					};
					const url = tx.location.pathname;
					setTimeout(() => {
						if (guardedListener) {
							guardedListener!({
								url,
								callFunc: () => {
									outletContext.gListener!(
										outletContext.notifyData!
									);
									outletContext.callFunc();
								}
							});
						} else {
							if (
								window.confirm(
									`Are you sure you want to go to 123 ${url}?`
								)
							) {
								// Unblock the navigation.
								unblock();
								// Retry the transition.
								tx.retry();
							}
						}
					}, 100);
				}
			));
		}
	});
	useEffect(() => {
		if (preGuardHandler || guardedListener) {
			outletContext.registerGuardAndListener(
				uuidRef.current,
				preGuardHandler!,
				guardedListener!
			);
		}
		return () => {
			outletContext.unregisterGuardAndListener(uuidRef.current);
		};
	}, [...depArr]);
};
export default useGuard;
