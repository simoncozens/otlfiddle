const { spawnSync, execFile, ChildProcess } = require('child_process');

const util = require('util');
const fs = require('fs').promises;
const temp = require('temp');
const shellEnv = require('shell-env').sync();
const path = require('path');
const electron = require('electron');

const app = process.type === 'renderer' ? electron.remote.app : electron.app;

shellEnv.PYTHONPATH = path.join(app.getAppPath(), '/public');
const execFilePromise = util.promisify(execFile);

const decompilepath = path.join(app.getAppPath(), '/public/decompile.py');

const pythonVersion = 'python';

export class OTLServer {
  outputFile: string;

  child: ChildProcess;

  constructor(origFile: string, errorCallback, okCallback) {
    this.outputFile = temp.path({ suffix: '.otf' });
    this.featureFile = temp.path({ suffix: '.fea' });
    this.origFile = origFile;
    this.errorCallback = errorCallback;
    this.okCallback = okCallback;
  }

  compile(feature: string) {
    // console.log('Writing feature');
    // console.log(this.child);
    // this.child.stdin.write(feature.length - 1 + '\n');
    // this.child.stdin.write(feature);
    let success = true;
    let error = '';
    let tables = ['GSUB', 'GPOS'];
    if (feature.indexOf('table GDEF') !== -1) {
      tables = ['GSUB', 'GPOS', 'GDEF'];
    }

    // eslint-disable-next-line promise/catch-or-return
    fs.writeFile(this.featureFile, feature)
      .then(() => {
        return execFile(
          pythonVersion,
          [
            '-m',
            'fontTools.feaLib',
            '-o',
            this.outputFile,
            '-t',
            ...tables,
            '--',
            this.featureFile,
            this.origFile,
          ],
          {
            env: shellEnv,
          }
        );
      })
      // eslint-disable-next-line promise/always-return
      .then((child) => {
        // child.stdout.on("data", (d) => {
        //     console.log(`makeotf stdout: ${d}`)
        //   });
        child.stderr.on('data', (d) => {
          success = false;
          error = d;
        });
        child.on('error', () => {
          this.errorCallback();
        });

        child.on('close', () => {
          if (success) {
            // console.log(`OK, written to ${this.outputFile}`);
            this.okCallback(this.outputFile);
          } else {
            this.errorCallback(error);
          }
        });
      });
  }
}

export function checkPythonLibs(): Record<string, unknown> {
  const res = spawnSync(pythonVersion, ['-c', 'import fontTools'], {
    env: shellEnv,
  });
  return res;
}

export function decompileOTF(file: string): Promise<Record<string, unknown>> {
  return execFilePromise(pythonVersion, [decompilepath, file], {
    env: shellEnv,
  });
}
