import { useRef } from "react";
import { useNavigate, NavigateFunction, NavigateOptions } from "react-router";

const useGo = () => {
	const goto = useRef<NavigateFunction>(useNavigate()).current;
	return goto;
};

export const goto = (pathName: string, options?: NavigateOptions) => {
	const event = new CustomEvent("R6_GOTO", {
		detail: {
			pathName,
			options,
		},
	});
	setTimeout(() => {
		window.dispatchEvent(event);
	});
};

export default useGo;
