import { useRef } from "react";
import { useNavigate, NavigateFunction, NavigateOptions } from "react-router-dom";

const useGo = () => {
	const goto = useRef<NavigateFunction>(useNavigate()).current;
	return goto;
};

export const goto = (pathName: string, options?: NavigateOptions) => {
	const event = new CustomEvent('R6_GOTO', {
		detail: {
			pathName,
			options
		}
	})
	window.dispatchEvent(event)
};

export default useGo;
