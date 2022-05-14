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
  --directory The directory to create the sketchbook
  --help      Show this help information`,
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

export function printHelp(help: CommandHelp): void {
  console.log(help.name);
  console.log();
  if (help.description) {
    console.log(help.description);
    console.log();
  }
  console.log(help.usage);
}
