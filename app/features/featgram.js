/* eslint-disable */
const featureUse = new RegExp('\\s*feature\\s+\\w{4}\\s*');
const scriptAssign = new RegExp('\\s*script\\s+\\w{4}\\s*');
const languageAssign = new RegExp('\\s*language\\s+\\w{4}\\s*');
const lookupflagAssign = new RegExp('\\s*lookupflag\\s+[^;]\\s*');
const languagesystemAssign = new RegExp(
  '\\s*languagesystem\\s+\\w{3,4}s*\\w{3,4}\\s*'
);
const randomCrap = new RegExp('\\s*(?:parameters|sizemenuname)\\s+[^;]s*');

// Warning: the following seven rules are terrible
const glyphclassAssign = new RegExp('@[A-Za-z_0-9.-]+\\s*=\\s*[^;]+');
const anchorDef = new RegExp('anchorDef\\s+[^;]+');
const valueRecordDef = new RegExp('valueRecordDef\\s+[^;]+');
const ignoresub_or_pos = new RegExp(
  'ignore\\s(?:substitute|sub|reversesub|rsub|position|pos)[^+;]'
);
const substitute = new RegExp('(sub|substitute)\\s+[^;]+');
const mark_statement = new RegExp('markClass\\s+[^;]+');
const position = new RegExp('(enum\\s+)?pos(ition)?\\s+[^;]+');

const subtable = new RegExp('\\s*subtable\\s*');
const statement = new RegExp(
  '\\s*(?:' +
    featureUse.source +
    '|' +
    scriptAssign.source +
    '|' +
    languagesystemAssign.source +
    '|' +
    glyphclassAssign.source +
    '|' +
    ignoresub_or_pos.source +
    '|' +
    substitute.source +
    '|' +
    mark_statement.source +
    '|' +
    position.source +
    '|' +
    randomCrap.source +
    '|' +
    subtable.source +
    ')?\\s*;'
);
const lookupBlockStandalone = new RegExp(
  'lookup\\s+(?<label>\\w+)(\\s+useExtension)?\\s+\\{\\s*(?:' +
    statement.source +
    ')+\\s*}\\s*\\k<label>\\s*;'
);
const lookupBlockOrUse = new RegExp(
  'lookup\\s+(?<label2>\\w+)(?:(\\s+useExtension)?\\s*\\{\\s*(?:' +
    statement.source +
    ')+\\s*} \\k<label2>)?\\s*;'
);
const tableBlock = new RegExp('table (?<tag>\\w{4}).*?\\k<tag>s*;');
const cvParameterBlock = new RegExp('cvParameterss*\\{.*?\\}s*;');
const featureBlock = new RegExp(
  'feature (?<flabel>\\w+)(\\s+useExtension)?\\s*\\{\\s*(' +
    statement.source +
    '|' +
    lookupBlockOrUse.source +
    '|' +
    cvParameterBlock +
    ')+\\s*}\\s*\\k<flabel>\\s*;'
);

const topLevelStatement = new RegExp(
  '(?:' +
    glyphclassAssign.source +
    '|' +
    languagesystemAssign.source +
    '|' +
    mark_statement.source +
    '|' +
    anchorDef.source +
    '|' +
    valueRecordDef.source +
    ')?\\s*;'
);
const featureFile = new RegExp(
  '^((?:' +
    topLevelStatement.source +
    '|' +
    featureBlock.source +
    '|' +
    tableBlock.source +
    '|' +
    lookupBlockStandalone.source +
    ')\\s*)*$'
);

function validFeatureFile(code) {
  var ff = code;
  ff = ff.replace(/#.*/g, '');
  ff = ff.replace(/\s+/g, ' ');
  return ff.match(featureFile);
}

try {
  module.exports = validFeatureFile;
} catch (e) {}
