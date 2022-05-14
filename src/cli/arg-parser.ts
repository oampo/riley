import type { CommandHelp } from "./help.js";
import { printHelp } from "./help.js";

interface Command {
  readonly name: string;
  readonly spec: InterfaceSpecification;
}

interface BaseArgument {
  readonly name: string;
  readonly required?: boolean;
}

interface StringArgument extends BaseArgument {
  readonly type: "string";
  readonly default?: string;
}

type Argument = StringArgument;

interface BaseFlag {
  readonly name: string;
  readonly alias?: string;
  readonly required?: boolean;
}

interface BooleanFlag extends BaseFlag {
  readonly type: "boolean";
  readonly default?: boolean;
}

interface StringFlag extends BaseFlag {
  readonly type: "string";
  readonly default?: string;
}

type Flag = BooleanFlag | StringFlag;

interface InterfaceSpecification {
  readonly commands?: readonly Command[];
  readonly args?: readonly Argument[];
  readonly flags?: readonly Flag[];
  readonly help: CommandHelp;
  readonly version?: string;
}

type IndexKeys<T> = T extends readonly unknown[]
  ? Exclude<keyof T, keyof []>
  : never;

type Name<T> = T extends { name: infer N }
  ? N extends string
    ? N
    : never
  : never;

type BooleanArgValue<T extends BooleanFlag> = T["required"] extends true
  ? boolean
  : T["default"] extends boolean
  ? boolean
  : boolean | null;

type StringArgValue<T extends StringArgument | StringFlag> =
  T["required"] extends true
    ? string
    : T["default"] extends string
    ? string
    : string | null;

type ParsedPositionalArgs<T extends readonly Argument[]> = {
  [Key in IndexKeys<T> as Name<T[Key]>]: T[Key] extends StringArgument
    ? StringArgValue<T[Key]>
    : never;
};

type ParsedFlagArgs<T extends readonly Flag[]> = {
  [Key in IndexKeys<T> as Name<T[Key]>]: T[Key] extends BooleanFlag
    ? BooleanArgValue<T[Key]>
    : T[Key] extends StringFlag
    ? StringArgValue<T[Key]>
    : never;
};

type ParsedCommandArgs<T extends readonly Command[]> = {
  [Key in IndexKeys<T>]: {
    name: Name<T[Key]>;
    command: T[Key] extends Command
      ? ParsedArgs<T[Key]["spec"]>["command"]
      : never;
    args: T[Key] extends Command ? ParsedArgs<T[Key]["spec"]>["args"] : never;
    flags: T[Key] extends Command ? ParsedArgs<T[Key]["spec"]>["flags"] : never;
  };
}[IndexKeys<T>];

type ParsedArgs<T extends InterfaceSpecification> = {
  command: T["commands"] extends readonly Command[]
    ? ParsedCommandArgs<T["commands"]>
    : null;
  args: T["args"] extends readonly Argument[]
    ? ParsedPositionalArgs<T["args"]>
    : Record<string, never>;
  flags: T["flags"] extends readonly Flag[]
    ? ParsedFlagArgs<T["flags"]>
    : Record<string, never>;
};

type ParsedArgsUnsafe = {
  command:
    | ({
        name: string;
      } & ParsedArgsUnsafe)
    | null;
  args: Record<string, string | null>;
  flags: Record<string, string | boolean | null>;
};

function isFlag(arg: string): boolean {
  return isFullFlag(arg) || isFlagAlias(arg);
}

function isFullFlag(arg: string): boolean {
  return /^--[a-z][a-z-]*$/.test(arg);
}

function isFlagAlias(arg: string): boolean {
  return /^-[a-z][a-z-]*$/.test(arg);
}

export function parseArgs<T extends InterfaceSpecification>(
  argv: string[],
  spec: T
): ParsedArgs<T> {
  const { commands = [], args = [], flags = [], help, version } = spec;
  const result: ParsedArgsUnsafe = { command: null, args: {}, flags: {} };

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
      return result as ParsedArgs<T>;
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
        if (
          (!isAlias && flag.name !== argName) ||
          (isAlias && flag.alias !== argName)
        ) {
          continue;
        }

        if (flag.type === "boolean") {
          result.flags[flag.name] = true;
        } else if (flag.type === "string") {
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
    } else {
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

  return result as ParsedArgs<T>;
}
