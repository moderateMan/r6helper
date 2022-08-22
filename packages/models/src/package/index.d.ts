declare class Package {
    targetPath: string;
    storeDir: string;
    packageName: string;
    packageVersion: string;
    cacheFilePathPrefix: string;
    constructor(options: any);
    prepare(): Promise<void>;
    get cacheFilePath(): string;
    getSpecificCacheFilePath(packageVersion: string): string;
    exists(): Promise<boolean>;
    install(): Promise<any>;
    update(): Promise<void>;
    getRootFilePath(): any;
}
export default Package;
