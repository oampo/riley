import esbuild from "esbuild";
import * as path from "path";
import * as ts from "typescript";

import { checkExists, checkState } from "../base";

export interface Compiler {
  build(sketchPath: string): Promise<BuildResult>;
  watch(
    sketchPath: string,
    onBuild: (result: BuildResult) => void,
  ): Promise<void>;
}

export const enum BuildResultType {
  SUCCESS,
  ERROR,
}

export type BuildResult =
  | {
      type: BuildResultType.SUCCESS;
      text: string;
    }
  | {
      type: BuildResultType.ERROR;
      errors: BuildError[];
    };

type BuildError = {
  text: string;
  location:
    | {
        file: string;
        /** 1-based */
        line: number;
        /** 0-based, in bytes */
        column: number;
        lineText: string;
      }
    | undefined;
};

class CompilerImpl implements Compiler {
  async build(sketchDir: string): Promise<BuildResult> {
    const entryPoint = this.entryPoint(sketchDir);

    const tsErrors = this.typeCheck(entryPoint);
    if (tsErrors) {
      return {
        type: BuildResultType.ERROR,
        errors: tsErrors,
      };
    }
    try {
      const result = await esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        write: false,
        format: "esm",
      });
      if (result.errors.length) {
        return {
          type: BuildResultType.ERROR,
          errors: result.errors.map(({ text, location }) => ({
            text,
            location: location ?? undefined,
          })),
        };
      }

      // 4. Validate and return success output
      checkState(
        result.outputFiles != null && result.outputFiles.length != 0,
        "Expected result containing output files",
      );

      return {
        type: BuildResultType.SUCCESS,
        text: result.outputFiles[0].text,
      };
    } catch {
      throw new Error("Unexpected failure of initial build");
    }
  }

  async watch(
    sketchDir: string,
    onBuild: (result: BuildResult) => void,
  ): Promise<void> {
    const entryPoint = this.entryPoint(sketchDir);
    let ctx: esbuild.BuildContext;
    let tsErrors: BuildError[] | undefined;
    try {
      ctx = await esbuild.context({
        entryPoints: [entryPoint],
        bundle: true,
        write: false,
        format: "esm",
        plugins: [
          {
            name: "notifyPlugin",
            setup: (build): void => {
              build.onStart(() => {
                tsErrors = this.typeCheck(entryPoint);
              });
              build.onEnd((result) => {
                if (tsErrors) {
                  onBuild({
                    type: BuildResultType.ERROR,
                    errors: tsErrors,
                  });
                } else if (result.errors.length) {
                  onBuild({
                    type: BuildResultType.ERROR,
                    errors: result.errors.map(({ text, location }) => ({
                      text,
                      location: location ?? undefined,
                    })),
                  });
                } else {
                  checkState(
                    result.outputFiles != null &&
                      result.outputFiles.length != 0,
                    "Expected result containing output files",
                  );
                  onBuild({
                    type: BuildResultType.SUCCESS,
                    text: result.outputFiles[0].text,
                  });
                }
              });
            },
          },
        ],
      });
    } catch {
      throw new Error("Unexpected failure of initial build");
    }

    await ctx.watch();
  }

  private entryPoint(sketchDir: string): string {
    return path.join(sketchDir, "src", "index.ts");
  }

  private typeCheck(entryPoint: string): BuildError[] | undefined {
    const entryDir = path.dirname(path.resolve(entryPoint));
    const configFile = checkExists(
      ts.findConfigFile(entryDir, (f) => ts.sys.fileExists(f)),
      "Could not find tsconfig.json",
    );
    const configFileText = checkExists(
      ts.sys.readFile(configFile),
      "Could not read tsconfig.json",
    );
    const configJson = ts.parseConfigFileTextToJson(configFile, configFileText);
    checkState(!configJson.error, "Could not parse tsconfig.json");

    const config = ts.parseJsonConfigFileContent(
      configJson.config,
      ts.sys,
      path.dirname(configFile),
    );

    const program = ts.createProgram([entryPoint], {
      ...config.options,
      noEmit: true,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);

    const errors: BuildError[] = [];

    for (const diagnostic of diagnostics) {
      const text = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n",
      );
      let location: BuildError["location"] | undefined;

      if (diagnostic.file && diagnostic.start !== undefined) {
        const { line, character } =
          diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        location = {
          file: diagnostic.file.fileName,
          line: line + 1,
          column: character,
          lineText: diagnostic.file.text.split(/\r?\n/)[line],
        };
      }

      const error: BuildError = {
        text,
        location,
      };

      if (diagnostic.category === ts.DiagnosticCategory.Error) {
        errors.push(error);
      }
    }

    return errors.length ? errors : undefined;
  }
}

export function compiler(): Compiler {
  return new CompilerImpl();
}
