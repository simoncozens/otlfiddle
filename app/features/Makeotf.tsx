// const { execFile, ChildProcess } = require('child_process');

// const fs = require('fs').promises;
// const temp = require('temp');

// export class OTLServer {
//   outputFile: string;

//   child: ChildProcess;

//   constructor(origFile: string, errorCallback, okCallback) {
//     this.outputFile = temp.path({ suffix: '.otf' });
//     this.featureFile = temp.path({ suffix: 'fea' });

//     this.origFile = origFile;
//     this.okCallback = okCallback;
//     this.errorCallback = errorCallback;
//   }

//   compile(feature: string) {
//     fs.writeFile(this.featureFile, feature)
//       .then(() => {
//         return execFile('makeotf', [
//           '-o',
//           this.outputFile,
//           '-ff',
//           this.featureFile,
//           '-f',
//           this.origFile,
//         ]);
//       })
//       .then((child) => {
//         // child.stdout.on("data", (d) => {
//         //     console.log(`makeotf stdout: ${d}`)
//         //   });
//         // child.stderr.on("data", (d) => {
//         //     console.log(`makeotf stderr: ${d}`)
//         //   });
//         child.on('error', () => {
//           this.errorCallback();
//         });

//         child.on('close', (code) => {
//           if (code === 0) {
//             // console.log(`OK, written to ${this.outputFile}`);
//             this.okCallback(this.outputFile);
//           } else {
//             this.errorCallback();
//           }
//         });
//       });
//   }
// }
