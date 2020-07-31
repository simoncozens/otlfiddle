import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import './app.global.css';
import Home from './components/Home';
import hbjs from './features/hbjs';

const path = require('path');
const fs = require('fs');

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

function readFile(p, type) {
  return new Promise((resolve, reject) =>
    fs.readFile(p, type, (err, data) => (err ? reject(err) : resolve(data)))
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const hbpath = path.join(__dirname, '/public/harfbuzz.wasm');
  console.log('Reading path ', hbpath);
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
    });
});
