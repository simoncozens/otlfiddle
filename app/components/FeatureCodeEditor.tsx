import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
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
    border: '4px solid #030',
  },
  error: {
    border: '4px solid red',
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
  initialState: string;
  disabled: boolean;
}
export default function FeatureCodeEditor(
  props: FeatureCodeEditorProps
): JSX.Element {
  const classes = useStyles();
  const { initialState, disabled, onChange } = props;

  const [featureCode, setFeatureCode] = useState(initialState);
  const [valid, setValid] = useState(true);
  const editFeaturecode = (code) => {
    setFeatureCode(code);
    if (validFeatureFile(code)) {
      onChange(code);
      setValid(true);
    } else {
      setValid(false);
    }
  };
  return (
    <Card variant="outlined">
      <textarea
        className={`${classes.fullHeight} ${classes.fullWidth} ${
          valid ? classes.valid : classes.error
        }`}
        disabled={disabled}
        value={featureCode}
        onChange={(e) => editFeaturecode(e.target.value)}
      />
    </Card>
  );
}
