declare class Command {
    _argv: any;
    _cmd: string;
    constructor(argv: any);
    initArgs(): void;
    checkNodeVersion(): void;
    init(): void;
    exec(): void;
}
export default Command;
