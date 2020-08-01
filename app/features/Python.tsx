const { spawnSync, execFile } = require('child_process');

const util = require('util');
const fs = require('fs').promises;
const temp = require('temp');

const openTempPromise = util.promisify(temp.open);
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

export function writeAndCompileFeature(
  feature: string,
  fontPath: string
): Promise<string> {
  let feaFilename = '';
  const fontFilename = temp.path({ suffix: '.otf' });

  return openTempPromise('featurefile')
    .then((info) => {
      feaFilename = info.path;
      console.log('Writing fea on ', feaFilename);
      return fs.writeFile(info.path, feature);
    })
    .then(() => {
      return execFilePromise('python3', [
        '-m',
        'fontTools.feaLib',
        '-o',
        fontFilename,
        feaFilename,
        fontPath,
      ]);
    })
    .then(() => {
      return fontFilename;
    })
    .catch((e) => {
      console.log(e);
    });
}
