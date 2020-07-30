const { spawnSync, execFile } = require('child_process');

const util = require('util');

const execFilePromise = util.promisify(execFile);

export function checkPythonLibs(): boolean {
  const res = spawnSync('python3', [
    '-c',
    'import fontFeatures; import fontTools',
  ]);
  return res.status === 0;
}

export function decompileOTF(file: string): Promise<Record<string, unknown>> {
  return execFilePromise('python3', [
    '-c',
    'from fontTools.ttLib import TTFont;import sys;from fontFeatures.ttLib import unparse; print(unparse(TTFont(sys.argv[1])).asFea())',
    file,
  ]);
}
