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
import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { DropzoneArea } from 'material-ui-dropzone';
import Container from '@material-ui/core/Container';
import FeatureCodeEditor from './FeatureCodeEditor';
import { checkPythonLibs, decompileOTF, OTLServer } from '../features/Python';
// import { OTLServer } from '../features/Makeotf';
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
  spaceTopBottom: {
    margin: '10px',
  },
  spinning: {},
  spinner: {
    position: 'absolute',
    margin: 0,
    top: '50%',
    zIndex: 1000,
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

let font;
const setFont = (x) => {
  font = x;
};

export default function Home(): JSX.Element {
  const classes = useStyles();
  const [textToBeDrawn, setTextToBeDrawn] = useState('');
  const [automatic, setAutomatic] = useState(false);
  const [valid, setValid] = useState(true);
  const [featureCode, setFeatureCode] = useState('');
  const [fontName, setFontName] = useState('');
  // const [fontPath, setFontPath] = useState('');
  const [otlServer, setOtlServer] = useState('');
  // const [font, setFont] = useState();
  const [shaperOutput, setShaperOutput] = useState();
  const [spinning, setSpinning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const closeError = () => setErrorMessage('');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const inputEl = useRef(null);

  const svgDiv = useRef(document.createElement('div'));
  const toggleAutomatic = () => {
    setAutomatic(!automatic);
  };
  const textChanged = (text: string) => {
    // console.log('Text changed, redrawing');
    if (font && font.hbFont) {
      // console.log('We have a font');
      // console.log(font);
      const shapingResult = shape(font, text);
      deleteAllChildren(svgDiv.current);
      shapingResult.svg.addTo(svgDiv.current);
      setShaperOutput(shapingResult);
    }
    setTextToBeDrawn(text);
    setSpinning(false);
  };

  const fontCompiledOk = (newfile) => {
    // console.log('Got OK notification');
    // setFontPath(newfile);
    if (font) {
      destroyFont(font);
    }
    // console.log(`Reading from ${newfile}`);
    setFont(createFont(newfile));
    setTimeout(() => textChanged(inputEl.current), 0);
  };
  const fontCompileFailure = (err) => {
    const errShort = err.replace(/^.*?\.fea:/, '');
    setErrorMessage(`Failed to compile font: ${errShort}`);
    setSpinning(false);
  };
  const doCompile = (text) => {
    setSpinning(true);
    inputEl.current = textToBeDrawn;
    // console.log(inputEl);
    otlServer.compile(text);
  };
  const editFeaturecode = (text) => {
    setFeatureCode(text);
    if (automatic && !spinning) {
      doCompile(text);
    }
  };

  const fontChanged = (fontFile: string) => {
    if (font) {
      destroyFont(font);
    }
    setFontName(fontFile.name);
    // setFontPath(fontFile.path);
    setFont(createFont(fontFile.path));
    setOtlServer(
      new OTLServer(fontFile.path, fontCompileFailure, fontCompiledOk)
    );
    decompileOTF(fontFile.path)
      .then((res) => {
        const { stdout } = res;
        setFeatureCode(stdout);
        return stdout;
      })
      .catch((fail) => {
        // console.log(fail);
        setErrorMessage(fail);
      });
    // console.log('Font changed, redrawing');

    setTimeout(() => textChanged(textToBeDrawn), 0);
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

  const res = checkPythonLibs();
  if (res.status !== 0) {
    dialog.showErrorBox(
      'Python libraries not installed',
      `Code: ${res.status} stdout: ${res.stdout} Code: ${res.stderr} Error: ${res.error}`
      // `This isn't going to work. Use "pip install fontTools fontFeatures" from the command line to get the libraries we need installed.`
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
            // console.log(files);
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
          <div>
            <div className={classes.spaceTopBottom}>
              <FormControlLabel
                control={
                  <Switch checked={automatic} onChange={toggleAutomatic} />
                }
                label="Autocompile"
              />
              <Button
                variant="contained"
                disabled={automatic || !valid}
                onClick={() => doCompile(featureCode)}
              >
                Compile
              </Button>
            </div>
            <FeatureCodeEditor
              disabled={fontName.length === 0}
              initialState={featureCode}
              onChange={(code) => editFeaturecode(code)}
              validityChanged={(validNow) => setValid(validNow)}
              className={classes.fullHeight}
            />
          </div>
          <div>
            <TextField
              value={textToBeDrawn}
              className={classes.fullWidth}
              label="Text"
              onChange={(e) => textChanged(e.target.value)}
              variant="outlined"
            />
            <Card
              variant="outlined"
              className={spinning ? classes.spinning : ''}
            >
              {spinning && (
                <Backdrop open>
                  <CircularProgress />
                </Backdrop>
              )}
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
