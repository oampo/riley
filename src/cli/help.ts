export interface CommandHelp {
  name: string;
  description?: string;
  usage: string;
}

export const help: CommandHelp = {
  name: "riley",
  usage: `Usage:
  riley start
  riley create sketchbook <directory>
  riley create sketch [--directory <dir>] <name>
  riley export <directory>
  riley optimize <file>
  riley plotter list
  riley plotter [--port <port>] [--nickname <nickname>] home
  riley --help
  riley --version

Options:
  --help    Show this help information
  --version Show the version number`,
};

export const startHelp: CommandHelp = {
  name: "riley start",
  description: "Start developing a sketch",
  usage: `Usage:
  riley start
  riley start --help

Options:
  --help Show this help information`,
};

export const createHelp: CommandHelp = {
  name: "riley create",
  description: "Create a new sketchbook or sketch",
  usage: `Usage:
  riley create sketchbook <directory>
  riley create sketch [--directory <dir>] <name>
  riley create --help

Options:
  --help Show this help information`,
};

export const createSketchbookHelp: CommandHelp = {
  name: "riley create sketchbook",
  description: "Create a new sketchbook",
  usage: `Usage:
  riley create sketchbook <directory>
  riley create sketchbook --help

Options:
  directory The directory to create the sketchbook
  --help    Show this help information`,
};

export const createSketchHelp: CommandHelp = {
  name: "riley create sketchbook",
  description: "Create a new sketchbook",
  usage: `Usage:
  riley create sketch [--directory <dir>] <name>
  riley create sketch --help

Options:
  name        The name of the sketch
  --directory The directory which should contain the sketch
  --help      Show this help information`,
};

export const plotterHelp: CommandHelp = {
  name: "riley plotter",
  description: "Work with a plotter",
  usage: `Usage:
  riley plotter list
  riley plotter home [--directory <dir>]
  riley plotter --help

Options:
  --help Show this help information`,
};

export const plotterListHelp: CommandHelp = {
  name: "riley plotter list",
  description: "List attached plotters",
  usage: `Usage:
  riley plotter list
  riley plotter list --help

Options:
  --help Show this help information`,
};

export const plotterHomeHelp: CommandHelp = {
  name: "riley plotter home",
  description: "Moves the plotter to the home position",
  usage: `Usage:
  riley plotter home [--directory <dir>]
  riley plotter home --help

Options:
  --directory The sketch directory 
  --help     Show this help information`,
};

export const exportHelp: CommandHelp = {
  name: "riley export",
  description: "Export a sketch as JSON",
  usage: `Usage:
  riley export [--directory <dir>] [--outdir dir]
  riley export --help

Options:
  --directory The sketch directory
  --outdir  The directory to output the JSON 
  --help    Show this help information`,
};

export const optimizeHelp: CommandHelp = {
  name: "riley optimize",
  description: "Optimize exported JSON for plotting",
  usage: `Usage:
  riley optimize [--directory <dir>] [--outdir dir] <file>
  riley optimize --help

Options:
  file   The exported JSON to optimize for plotting 
  --directory The sketch directory
  --outdir    The directory to output optimized JSON
  --help Show this help information`,
};

export function printHelp(help: CommandHelp): void {
  console.log(help.name);
  console.log();
  if (help.description) {
    console.log(help.description);
    console.log();
  }
  console.log(help.usage);
}
