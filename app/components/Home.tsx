import React, { useState, useRef } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
  createMuiTheme,
  ThemeProvider,
  makeStyles,
} from '@material-ui/core/styles';
import Split from 'react-split';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { DropzoneArea } from 'material-ui-dropzone';
import Container from '@material-ui/core/Container';
import {
  checkPythonLibs,
  decompileOTF,
  writeAndCompileFeature,
} from '../features/Python';
import { shape, createFont, destroyFont } from '../features/Harfbuzz';
import styles from './Home.css';

const { dialog } = require('electron').remote;
const { app } = require('electron');

const useStyles = makeStyles({
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
  shapeOutput: {
    // wordBreak: 'break-all',
  },
  svgDiv: {
    backgroundColor: 'white',
  },
});

function Alert(props: AlertProps) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function deleteAllChildren(e) {
  let child = e.lastElementChild;
  while (child) {
    e.removeChild(child);
    child = e.lastElementChild;
  }
}

export default function Home(): JSX.Element {
  const classes = useStyles();
  const [textToBeDrawn, setTextToBeDrawn] = useState('');
  const [fontName, setFontName] = useState('');
  const [fontPath, setFontPath] = useState('');
  const [hbFont, sethbFont] = useState();
  const [shaperOutput, setShaperOutput] = useState();
  const [spinning, setSpinning] = useState(false);
  const [featureCode, setFeatureCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const closeError = () => setErrorMessage('');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const svgDiv = useRef(document.createElement('div'));
  const validFea = () => {
    return true;
  };
  const textChanged = (text: string) => {
    if (hbFont && hbFont.hbFont) {
      const shapingResult = shape(hbFont, text);
      deleteAllChildren(svgDiv.current);
      shapingResult.svg.addTo(svgDiv.current);
      setShaperOutput(shapingResult);
    }
    setTextToBeDrawn(text);
  };
  const editFeaturecode = (text) => {
    if (validFea(text) && !spinning) {
      setSpinning(true);
      // eslint-disable-next-line promise/catch-or-return
      writeAndCompileFeature(text, fontPath).then((ff) => {
        // if (hbFont) {
        // destroyFont(hbFont);
        // }
        setFontPath(ff);
        sethbFont(createFont(ff));
        textChanged(textToBeDrawn);
        return setSpinning(false);
      });
    }
    setFeatureCode(text);
  };
  const fontChanged = (fontFile: string) => {
    if (hbFont) {
      destroyFont(hbFont);
    }
    setFontName(fontFile.name);
    setFontPath(fontFile.path);
    sethbFont(createFont(fontFile.path));
    decompileOTF(fontFile.path)
      .then((res) => {
        const { stdout } = res;
        setFeatureCode(stdout);
        return stdout;
      })
      .catch((fail) => {
        setErrorMessage(fail);
      });
    textChanged(textToBeDrawn);
  };

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  );

  if (!checkPythonLibs()) {
    dialog.showErrorBox(
      'Python libraries not installed',
      `This isn't going to work. Use "pip install fontTools fontFeatures" from the command line to get the libraries we need installed.`
    );
    app.quit();
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" className={classes.fullHeight}>
        <DropzoneArea
          acceptedFiles={['.otf', '.ttf']}
          dropzoneText={fontName || 'Drag and drop a font here or click'}
          dropzoneClass="notTooBig"
          filesLimit={1}
          showPreviewsInDropzone={false}
          onChange={(files) => {
            console.log(files);
            if (!files[0]) return;
            fontChanged(files[0]);
          }}
        />
        <Split
          className={`${styles.flex} ${classes.fullHeight}`}
          sizes={[50, 50]}
          elementStyle={(dimension, size, gutterSize) => ({
            'flex-basis': `calc(${size}% - ${gutterSize}px)`,
          })}
          gutterStyle={(dimension, gutterSize) => ({
            'flex-basis': `${gutterSize}px`,
          })}
        >
          <Card variant="outlined">
            <textarea
              className={`${classes.fullHeight} ${classes.fullWidth}`}
              disabled={fontName.length === 0}
              value={featureCode}
              onChange={(e) => editFeaturecode(e.target.value)}
            />
          </Card>
          <div>
            <TextField
              value={textToBeDrawn}
              className={classes.fullWidth}
              label="Text"
              onChange={(e) => textChanged(e.target.value)}
              variant="outlined"
            />
            <Card variant="outlined">
              <div className={classes.shapeOutput}>
                {shaperOutput && shaperOutput.text}
              </div>
              <div ref={svgDiv} className={classes.svgDiv} />
            </Card>
          </div>
        </Split>
      </Container>
      <Snackbar
        open={errorMessage.length > 0}
        autoHideDuration={6000}
        onClose={closeError}
      >
        <Alert onClose={closeError} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
