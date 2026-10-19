export interface CheckOptions {
  allowOklchPrefixes: readonly string[];
}

export interface Violation {
  file: string;
  lineNo: number;
  text: string;
  hint: string;
}

const BANNED_FUNCTIONS = [/\brgb\(/i, /\brgba\(/i, /\bhsl\(/i, /\bhsla\(/i, /\bhwb\(/i, /\blab\(/i, /\blch\(/i, /\bcolor\(/i, /\bcolor-mix\(/i];

const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/g;

const NAMED_COLORS = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood ' +
    'cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray ' +
    'darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen ' +
    'darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue ' +
    'firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew ' +
    'hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan ' +
    'lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
    'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue ' +
    'mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred ' +
    'midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid ' +
    'palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple ' +
    'rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue ' +
    'slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white ' +
    'whitesmoke yellow yellowgreen'
  ).split(' '),
);

const COLOR_PROPERTIES =
  '(?:color|background|background-color|border|border-color|border-top-color|border-right-color|border-bottom-color|' +
  'border-left-color|outline|outline-color|box-shadow|text-shadow|accent-color|caret-color|fill|stroke)';

const NAMED_COLOR_DECLARATION = new RegExp(`\\b${COLOR_PROPERTIES}\\s*:\\s*([a-zA-Z]+)\\s*[;}]`, 'gi');
const NAMED_COLOR_ATTR = /\b(fill|stroke|stop-color)\s*=\s*"([a-zA-Z]+)"/g;

const UNO_COLOR_CLASS = new RegExp(
  '^(?:bg|text|border|fill|stroke|shadow|outline|ring|accent|caret|decoration|divide)-' +
    '(?:(?:slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|' +
    'violet|purple|fuchsia|pink|rose)(?:-\\d{2,3})?|white|black|transparent|current)$',
);

const TOKEN_DECLARATION = /^\s*--[\w-]+\s*:/;

function bannedSyntax(line: string): string[] {
  const hints: string[] = [];
  for (const pattern of BANNED_FUNCTIONS) {
    const match = line.match(pattern);
    if (match) hints.push(`${match[0]} is banned — use a design token via var(--token)`);
  }
  for (const match of line.matchAll(HEX_COLOR)) hints.push(`hex color ${match[0]} is banned — use a design token via var(--token)`);
  for (const match of line.matchAll(NAMED_COLOR_DECLARATION)) {
    if (NAMED_COLORS.has((match[1] ?? '').toLowerCase())) hints.push(`named color "${match[1]}" is banned — use a design token via var(--token)`);
  }
  for (const match of line.matchAll(NAMED_COLOR_ATTR)) {
    if (NAMED_COLORS.has((match[2] ?? '').toLowerCase())) hints.push(`named color "${match[2]}" is banned — use a design token via var(--token)`);
  }
  return hints;
}

function oklchPlacement(file: string, line: string, options: CheckOptions): string[] {
  if (!line.includes('oklch(')) return [];
  const inTokenFile = options.allowOklchPrefixes.some((prefix) => file.startsWith(prefix));
  if (inTokenFile && TOKEN_DECLARATION.test(line)) return [];
  return [
    inTokenFile
      ? 'oklch() literals are only allowed in custom-property declarations — reference the token with var() instead'
      : 'oklch() literals belong only in the design token files — reference the token with var(--token) instead',
  ];
}

function utilityClasses(line: string): string[] {
  const hints: string[] = [];
  for (const attr of line.matchAll(/\bclass\s*=\s*"([^"]*)"/g)) {
    for (const token of (attr[1] ?? '').split(/\s+/)) {
      if (UNO_COLOR_CLASS.test(token)) hints.push(`utility class "${token}" sets a color outside the token set — use bg/fg/muted/line/accent-N`);
    }
  }
  return hints;
}

export function checkSource(file: string, text: string, options: CheckOptions): Violation[] {
  const isSvg = file.endsWith('.svg');
  const violations: Violation[] = [];
  text.split('\n').forEach((line, index) => {
    const hints = isSvg ? bannedSyntax(line) : [...bannedSyntax(line), ...oklchPlacement(file, line, options), ...utilityClasses(line)];
    for (const hint of hints) violations.push({ file, lineNo: index + 1, text: line.trim(), hint });
  });
  return violations;
}
