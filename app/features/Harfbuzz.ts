// eslint-disable @typescript-eslint/dot-notation
import { Font, load, Path } from 'opentype.js';
import * as SVG from '@svgdotjs/svg.js';

const fs = require('fs');

interface Glyph {
  g: number;
  cl: number;
  ax: number;
  ay: number;
  dx: number;
  dy: number;
}

interface OTLFiddleFont {
  hbFont: any;
  otFont: Font;
  blob: any;
  face: any;
}

function json2txt(o: Glyph[], otFont): string {
  console.log(o);
  const txt = o.map((g: Glyph) => {
    const glyph = otFont && otFont.glyphs.get(g.g);
    const name = glyph ? glyph.name : g.g;
    let base = `${name}=${g.cl}`;
    if (g.ax) {
      base = `${base}+${g.ax}`;
    }
    if (g.dx || g.dy) {
      base = `${base}@${g.dx},${g.dy}`;
    }
    return base;
  });
  return `[${txt.join('|\u200B')}]`;
}

function getGlyphSVG(gid: number, font: OTLFiddleFont) {
  let svgText = font.hbFont.glyphToPath(gid);
  if (svgText.length < 10) {
    const glyph = font.otFont.getGlyph(gid);
    if (glyph) {
      svgText = (glyph.path as Path).toSVG(2);
    }
  } else {
    svgText = `<path d="${svgText}"/>`;
  }
  svgText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${svgText} </svg>`;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  return doc.documentElement;
}

function glyphstringToSVG(glyphstring: Glyph[], font: OTLFiddleFont): SVG.Svg {
  let curAX = 0;
  let curAY = 0;
  const totalSVG = SVG.SVG();
  const maingroup = totalSVG.group();
  glyphstring.forEach((g) => {
    const group = maingroup.group();
    const svgDoc = SVG.SVG(getGlyphSVG(g.g, font));
    svgDoc.children().forEach((c) => {
      group.add(c);
    });
    group.transform({ translate: [curAX + (g.dx || 0), curAY + (g.dy || 0)] });
    // group.attr({ fill: paletteFor(g.cl) });
    curAX += g.ax || 0;
    curAY += g.ay || 0;
  });
  maingroup.transform({ flip: 'y' });
  const box = maingroup.bbox();
  totalSVG.viewbox(box.x, box.y, box.width, box.height);
  return totalSVG;
}

export function shape(font: OTLFiddleFont, text: string): Record<string, any> {
  if (!font || !font.hbFont) {
    return {};
  }
  const buffer = window.hbjs.createBuffer();
  buffer.addText(text);
  buffer.guessSegmentProperties();
  window.hbjs.shape(font.hbFont, buffer, '', 0, 0);
  const json = buffer.json();
  buffer.destroy();
  return {
    text: json2txt(json, font.otFont),
    svg: glyphstringToSVG(json, font),
  };
}

export function createFont(filepath): OTLFiddleFont {
  const { hbjs } = window;
  const fontBlob = fs.readFileSync(filepath);
  if (!fontBlob) {
    return {};
  }
  const blob = hbjs.createBlob(fontBlob);
  const face = hbjs.createFace(blob, 0);
  const font = {
    hbFont: hbjs.createFont(face),
    blob,
    face,
  };
  load(filepath, (err, otFont) => {
    font.otFont = otFont;
  });
  return font;
}

export function destroyFont(font: OTLFiddleFont) {
  font.hbFont.destroy();
  font.blob.destroy();
  font.face.destroy();
  font.hbFont = null;
}
