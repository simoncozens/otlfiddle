import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import validFeatureFile from '../features/featgram';

const useStyles = makeStyles({
  fullWidth: {
    width: '100%',
    fontSize: '1.2em',
    fontFamily: 'monospace',
  },
  fullHeight: {
    height: '100%',
  },
  valid: {
    border: '1px solid #030',
  },
  error: {
    border: '1px solid red',
  },
  shapeOutput: {
    // wordBreak: 'break-all',
  },
  svgDiv: {
    backgroundColor: 'white',
  },
});

interface FeatureCodeEditorProps {
  onChange: (s: string) => void;
  validityChanged: (v: boolean) => void;
  initialState: string;
  disabled: boolean;
  errorAnnotations: any[];
}
export default function FeatureCodeEditor(
  props: FeatureCodeEditorProps
): JSX.Element {
  const classes = useStyles();
  const {
    initialState,
    disabled,
    errorAnnotations,
    onChange,
    validityChanged,
  } = props;

  const [featureCode, setFeatureCode] = useState(initialState);
  const [valid, setValid] = useState(true);
  const editFeaturecode = (code) => {
    setFeatureCode(code);
    if (validFeatureFile(code)) {
      validityChanged(true);
      onChange(code);
      setValid(true);
    } else {
      setValid(false);
      validityChanged(false);
    }
  };
  return (
    <Card variant="outlined" className={classes.fullHeight}>
      <AceEditor
        theme="monokai"
        onChange={(e) => editFeaturecode(e)}
        className={valid ? classes.valid : classes.error}
        name="featureCodeEditor"
        value={featureCode}
        editorProps={{ $blockScrolling: true }}
        annotations={errorAnnotations}
        disabled={disabled}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
        }}
      />
    </Card>
  );
}
