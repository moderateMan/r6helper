import { Spinner } from "cli-spinner";
declare function formatPath(p: string | undefined): string | undefined;
declare function isObject(o: unknown): boolean;
declare function spinnerStart(msg: string, spinnerString?: string): Spinner;
declare function sleep(timeout?: number): Promise<unknown>;
declare function exec(command: string, args: any[], options: any): any;
declare function execAsync(command: string, args: any[], options: any): Promise<unknown>;
declare function readFile(path: string, options?: any): string | {
    type: "Buffer";
    data: number[];
} | null;
declare function writeFile(path: string, data: any, { rewrite }?: {
    rewrite?: boolean | undefined;
}): boolean;
export * from "./get-npm-info";
export { default as log } from "./log";
export { default as request } from "./request";
export { isObject, spinnerStart, sleep, exec, execAsync, readFile, writeFile, formatPath, };
