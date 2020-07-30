import React, { useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
  createMuiTheme,
  ThemeProvider,
  makeStyles,
} from '@material-ui/core/styles';
import Split from 'react-split';
import Card from '@material-ui/core/Card';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { DropzoneArea } from 'material-ui-dropzone';
import Container from '@material-ui/core/Container';
import { checkPythonLibs, decompileOTF } from '../features/Python';
import styles from './Home.css';

const { dialog } = require('electron').remote;
const { app } = require('electron');

const useStyles = makeStyles({
  textarea: {
    width: '100%',
  },
});

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function Home(): JSX.Element {
  const classes = useStyles();
  const [glyphStringToBeDrawn, setGlyphStringToBeDrawn] = useState('');
  const [fontName, setFontName] = useState('');
  const [fontPath, setFontPath] = useState('');
  const [featureCode, setFeatureCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const closeError = () => setErrorMessage('');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const editFeaturecode = (text) => {
    setFeatureCode(text);
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
      <Container maxWidth="lg">
        <DropzoneArea
          acceptedFiles={['.otf', '.ttf']}
          dropzoneText={fontName || 'Drag and drop a font here or click'}
          dropzoneClass="notTooBig"
          filesLimit={1}
          showPreviewsInDropzone={false}
          onChange={(files) => {
            console.log(files);
            if (!files[0]) return;
            setFontName(files[0].name);
            setFontPath(files[0].path);
            decompileOTF(files[0].path)
              .then((res) => {
                const { stdout } = res;
                setFeatureCode(stdout);
                return stdout;
              })
              .catch((fail) => {
                setErrorMessage(fail);
              });
          }}
        />
        <Split
          className={styles.flex}
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
              className={classes.textarea}
              disabled={fontName.length === 0}
              value={featureCode}
              onChange={(e) => editFeaturecode(e.target.value)}
            />
          </Card>
          <div>
            <Card variant="outlined">
              <div> Two </div>
            </Card>
            <Card variant="outlined">
              <div> Three </div>
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
