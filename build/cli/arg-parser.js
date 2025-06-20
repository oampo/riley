import { printHelp } from "./help.js";
function isFlag(arg) {
    return isFullFlag(arg) || isFlagAlias(arg);
}
function isFullFlag(arg) {
    return /^--[a-z][a-z-]*$/.test(arg);
}
function isFlagAlias(arg) {
    return /^-[a-z][a-z-]*$/.test(arg);
}
export function parseArgs(argv, spec) {
    const { commands = [], args = [], flags = [], help, version } = spec;
    const result = { command: null, args: {}, flags: {} };
    let isHelpRequest = false;
    let isVersionRequest = false;
    for (const arg of args) {
        result.args[arg.name] = arg.default ? arg.default : null;
    }
    for (const flag of flags) {
        result.flags[flag.name] = flag.default ? flag.default : null;
    }
    for (const command of commands) {
        if (argv[0] === command.name) {
            const parsed = parseArgs(argv.slice(1), command.spec);
            result.command = {
                name: command.name,
                command: parsed.command,
                args: parsed.args,
                flags: parsed.flags,
            };
            return result;
        }
    }
    let argIndex = 0;
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (isFlag(arg)) {
            const isAlias = isFlagAlias(arg);
            const argName = isAlias ? arg.slice(1) : arg.slice(2);
            let found = false;
            if (argName === "help" || argName === "h") {
                isHelpRequest = true;
                continue;
            }
            if ((version !== undefined && argName === "version") || argName === "v") {
                isVersionRequest = true;
                continue;
            }
            for (const flag of flags) {
                if ((!isAlias && flag.name !== argName) ||
                    (isAlias && flag.alias !== argName)) {
                    continue;
                }
                if (flag.type === "boolean") {
                    result.flags[flag.name] = true;
                }
                else if (flag.type === "string") {
                    i++;
                    if (i === argv.length || isFlag(argv[i])) {
                        console.error(`Expected value following argument: ${arg}`);
                        console.error();
                        console.error(help.usage);
                        process.exit(1);
                    }
                    result.flags[flag.name] = argv[i];
                }
                found = true;
            }
            if (!found) {
                console.error(`Unknown argument: ${arg}`);
                console.error();
                console.error(help.usage);
                process.exit(1);
            }
        }
        else {
            if (argIndex === args.length) {
                console.error(`Unexpected argument: ${arg}`);
                console.error();
                console.error(help.usage);
                process.exit(1);
            }
            result.args[args[argIndex++].name] = arg;
        }
    }
    if (isHelpRequest) {
        printHelp(help);
        process.exit(0);
    }
    if (isVersionRequest) {
        console.log(version);
        process.exit(0);
    }
    if (commands.length && !result.command) {
        console.error("Expected command");
        console.error();
        console.error(help.usage);
        process.exit(1);
    }
    for (const arg of args) {
        if (arg.required && result.args[arg.name] === null) {
            console.error(`Expected argument: ${arg.name}`);
            console.error();
            console.error(help.usage);
            process.exit(1);
        }
    }
    for (const flag of flags) {
        if (flag.required && result.flags[flag.name] === null) {
            console.error(`Expected flag: ${flag.name}`);
            console.error();
            console.error(help.usage);
            process.exit(1);
        }
    }
    return result;
}
