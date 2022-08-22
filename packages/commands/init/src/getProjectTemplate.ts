import { request } from "@moderate-cli/utils";
export default function<T>() {
	return request({
		url: "/cli/project/template",
	}).then((res:{data:T})=>{
    return res
  });
}
