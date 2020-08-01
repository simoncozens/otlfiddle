import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import './app.global.css';

import hbjs from './features/hbjs';

const electron = require('electron');

const path = require('path');
const fs = require('fs');
const process = require('process');

// const electron = null;

const app = process.type === 'renderer' ? electron.remote.app : electron.app;

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

function readFile(p, type) {
  return new Promise((resolve, reject) =>
    fs.readFile(p, type, (err, data) => (err ? reject(err) : resolve(data)))
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const hbpath = path.join(app.getAppPath(), '/public/harfbuzz.wasm');
  // eslint-disable-next-line global-require
  const Home = require('./components/Home').default;
  // eslint-disable-next-line promise/catch-or-return
  readFile(hbpath)
    .then((hbcode) => {
      return WebAssembly.instantiate(hbcode);
    })
    .then((results) => {
      results.instance.exports.memory.grow(800);
      const hb = hbjs(results.instance);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      window['harfbuzz'] = results.instance;
      // eslint-disable-next-line @typescript-eslint/dot-notation
      window['hbjs'] = hb;
      return hb;
    })
    .catch((error) => {
      return render(
        <div>
          Got error
          {JSON.stringify(error)}
        </div>,
        document.getElementById('root')
      );
    })
    .then(() => {
      return render(
        <AppContainer>
          <Home />
        </AppContainer>,
        document.getElementById('root')
      );
      //   return true;
    });

  /*

  console.log('Reading path ', hbpath);
  const error = '';
  // eslint-disable-next-line promise/catch-or-return
  readFile(hbpath)
    .then((hbcode) => {
      console.log('Got HB code', hbcode);
      return WebAssembly.instantiate(hbcode);
    })
    .then((results) => {
      console.log('Instatieted', results);
      results.instance.exports.memory.grow(800);
      const hb = hbjs(results.instance);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      window['harfbuzz'] = results.instance;
      // eslint-disable-next-line @typescript-eslint/dot-notation
      window['hbjs'] = hb;

      return render(
        <AppContainer>
          <Home />
        </AppContainer>,
        document.getElementById('root')
      );
    })
    .catch((error) => {
      return render(
        <div>
          It all went wrong. Path: {hbpath} <br />
          Error: {JSON.stringify(error)} <br />
        </div>,
        document.getElementById('root')
      );
    });
*/
});
