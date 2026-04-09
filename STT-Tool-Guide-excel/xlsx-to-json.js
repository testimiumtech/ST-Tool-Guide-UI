const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════
//  Excel → JSON Converter  (v5 — Parent-Child Ex # Support)
//
//  Excel structure (v5):
//    • One row per EXAMPLE (not per command)
//    • "Ex #" uses parent-child format: 1.1, 1.2, 4.3 …
//      Left of dot = Command Order, Right = Example index
//    • Command-level fields appear only on the FIRST example row
//    • Order + Command ID are repeated on every row for linking
//
//  Grouping logic:
//    Rows are grouped by the parent number in "Ex #".
//    Ex # "4.5" → parent Order = 4 → added under command #4.
//    No need for Command ID on every row.
//    First row with command fields (Syntax/Description) → command-level data.
//    Every row in the group → one example entry.
// ══════════════════════════════════════════════════════════════

// Path to XLSX file
const xlsxPath = path.join(__dirname, 'public', 'data', 'commands.xlsx');

// Read workbook and resolve source sheet
const wb = XLSX.readFile(xlsxPath);
const preferredSheetName = 'All Commands';
const availableSheetNames = wb.SheetNames || [];

let sourceSheetName = preferredSheetName;
let ws = wb.Sheets[sourceSheetName];

if (!ws) {
  if (availableSheetNames.length === 0) {
    console.error('❌ No worksheets found in XLSX file');
    process.exit(1);
  }

  sourceSheetName = availableSheetNames[0];
  ws = wb.Sheets[sourceSheetName];
  console.warn(
    `⚠️ Preferred sheet "${preferredSheetName}" not found. Using "${sourceSheetName}" instead.`
  );
}

if (!ws) {
  console.error(
    `❌ Unable to read worksheet. Available sheets: ${availableSheetNames.join(', ') || '(none)'}`
  );
  process.exit(1);
}

// Convert sheet to JSON array of rows (skip hint row automatically — empty "Command ID" rows are filtered)
const rawData = XLSX.utils.sheet_to_json(ws);

// ── Column name constants (match Excel header exactly) ──
const COL = {
  ORDER:          'Order',
  COMMAND_ID:     'Command ID',
  TITLE:          'Title',
  CATEGORY:       'Category',
  STATUS:         'Status',
  SYNTAX:         'Syntax',
  DESCRIPTION:    'Description',
  PURPOSE:        'Purpose',
  WHEN_TO_USE:    'When to Use',
  USE_CASES:      'Use Cases',
  OPTIONS_COUNT:  'Options Count',
  OPTIONS:        'Options',
  EX_NUM:         'Ex #',
  SCENARIO:       'Scenario (What is happening?)',
  PROBLEM:        'Problem (Why is this command needed?)',
  GOAL:           'Goal (What should the command do?)',
  EXAMPLE_CMD:    'Example Command',
  EXAMPLE_DESC:   'Example Description',
  INPUT_PARAM:    'Input Param',
  ASSERT_PARAMS:  'Assert Params',
  INPUT_SCHEMA:   'Input Param Schema',
  ASSERT_SCHEMA:  'Assert Param Schema',
  COMP_MODES:     'Comparison Modes',
  EXPECTED_OUT:   'Expected Output',
  DETAILED_USAGE: 'Detailed Usage',
  KEYWORDS:       'Keywords',
  RELATED_CMDS:   'Related Commands',
  IS_NEW:         'Is New',
  LAST_UPDATED:   'Last Updated',
};

// ══════════════════════════════════════════════════════════════
//  Step 1: Identify command rows (first example = X.1)
//          Build a lookup:  Order number → command-level data
//
//  A row is a "command row" when Ex # = "X.1" AND it has
//  command-level fields (Syntax, Description, etc.).
//  All other rows are pure example rows.
// ══════════════════════════════════════════════════════════════
const commandMap = new Map();   // Order (number) → { cmdData, exampleRows[] }

for (const row of rawData) {
  const exRaw = (row[COL.EX_NUM] || '').toString().trim();
  if (!exRaw || !exRaw.includes('.')) continue;  // skip hint row, header echo, empty

  const dotIdx      = exRaw.indexOf('.');
  const parentOrder = Number(exRaw.substring(0, dotIdx));
  if (!Number.isFinite(parentOrder) || parentOrder <= 0) continue;

  // ── First encounter of this Order? Register the command ──
  if (!commandMap.has(parentOrder)) {
    // Pull command-level fields from whatever row has them
    // (normally the X.1 row, but we'll also accept them from any row in the group)
    commandMap.set(parentOrder, { cmdData: null, exampleRows: [] });
  }

  const entry = commandMap.get(parentOrder);

  // If this row carries command-level data (Syntax or Description present), capture it
  const hasCmdFields = row[COL.SYNTAX] || row[COL.DESCRIPTION];
  if (!entry.cmdData && hasCmdFields) {
    entry.cmdData = row;
  }

  entry.exampleRows.push(row);
}

// ══════════════════════════════════════════════════════════════
//  Step 2: Build structured command objects with nested examples
//          Ex # "4.5" → parentOrder = 4 → goes under command #4
// ══════════════════════════════════════════════════════════════
const commands = [];
let totalExamples = 0;

for (const [order, { cmdData, exampleRows }] of commandMap) {
  // Use cmdData (first row with command fields), or fall back to first example row
  const first = cmdData || exampleRows[0];

  // ── Build examples array from ALL rows whose Ex # starts with this Order ──
  const examples = exampleRows.map((row) => {
    const exNum = (row[COL.EX_NUM] || '').toString().trim();

    const example = {
      example_id: exNum, // e.g. "1.1", "4.5"
      problem_statement: {
        scenario: row[COL.SCENARIO] || '',
        problem:  row[COL.PROBLEM] || '',
        goal:     row[COL.GOAL] || '',
      },
      command:     row[COL.EXAMPLE_CMD] || '',
      description: row[COL.EXAMPLE_DESC] || '',
    };

    // Optional per-example fields (only if present)
    const inputParam = parseJsonField(row[COL.INPUT_PARAM]);
    if (inputParam) example.input_param = inputParam;

    const assertParams = parseJsonField(row[COL.ASSERT_PARAMS]);
    if (assertParams) example.assert_params = assertParams;

    return example;
  }).filter(ex => ex.command || ex.description || ex.problem_statement.scenario);

  // Sort examples by their child index (the part after the dot)
  examples.sort((a, b) => {
    const aChild = Number(a.example_id.split('.')[1]) || 0;
    const bChild = Number(b.example_id.split('.')[1]) || 0;
    return aChild - bChild;
  });

  totalExamples += examples.length;

  // ── Build command object ──
  const command = {
    order,
    command_id: (first[COL.COMMAND_ID] || '').toString().trim(),
    title:      first[COL.TITLE] || '',
    category:   first[COL.CATEGORY] || 'Other',
    status:     first[COL.STATUS] || '',
    syntax:     first[COL.SYNTAX] || '',

    description: first[COL.DESCRIPTION] || '',
    purpose:     first[COL.PURPOSE] || '',
    when_to_use: first[COL.WHEN_TO_USE] || '',
    use_cases:   first[COL.USE_CASES] || '',

    options_count: toNumber(first[COL.OPTIONS_COUNT]),
    options:       parseOptions(first[COL.OPTIONS]),

    // ── Examples linked by parent-child Ex # ──
    examples,

    // ── Schemas & output (command-level, from first row) ──
    input_param_schema:  parseJsonField(first[COL.INPUT_SCHEMA]),
    assert_param_schema: parseJsonField(first[COL.ASSERT_SCHEMA]),
    comparison_modes:    parseJsonField(first[COL.COMP_MODES]),
    expected_output:     parseJsonField(first[COL.EXPECTED_OUT]),
    detailed_usage:      parseDetailedUsage(first[COL.DETAILED_USAGE]),

    keywords: first[COL.KEYWORDS]
      ? first[COL.KEYWORDS].toString().split(',').map(k => k.trim()).filter(Boolean)
      : [],
    related_commands: first[COL.RELATED_CMDS]
      ? first[COL.RELATED_CMDS].toString().split(',').map(c => c.trim()).filter(Boolean)
      : [],

    is_new:       parseBool(first[COL.IS_NEW]),
    last_updated: parseDate(first[COL.LAST_UPDATED]),
  };

  commands.push(command);
}

// Sort commands by Order
commands.sort((a, b) => a.order - b.order);

// ══════════════════════════════════════════════════════════════
//  Step 3: Validate parent-child integrity
//          Ex # "X.Y" → X must match the command's Order
// ══════════════════════════════════════════════════════════════
let validationErrors = 0;

for (const cmd of commands) {
  for (const ex of cmd.examples) {
    const parts = ex.example_id.split('.');
    const parentOrder = Number(parts[0]);

    if (parentOrder !== cmd.order) {
      console.error(
        `❌ INTEGRITY ERROR: Ex # "${ex.example_id}" has parent ${parentOrder} but belongs to command "${cmd.command_id}" (Order ${cmd.order})`
      );
      validationErrors++;
    }
  }

  // Check for duplicate example IDs within a command
  const exIds = cmd.examples.map(e => e.example_id);
  const dupes = exIds.filter((id, i) => exIds.indexOf(id) !== i);
  if (dupes.length > 0) {
    console.error(
      `❌ DUPLICATE Ex #: Command "${cmd.command_id}" has duplicate example IDs: ${dupes.join(', ')}`
    );
    validationErrors++;
  }
}

if (validationErrors > 0) {
  console.error(`\n⛔ ${validationErrors} validation error(s) found. Fix the Excel file before using the JSON output.`);
} else {
  console.log(`✅ Validation passed: all Ex # values match their parent command Order`);
}

// ══════════════════════════════════════════════════════════════
//  Helpers
// ══════════════════════════════════════════════════════════════

function toNumber(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function parseBool(val) {
  if (val === true || val === false) return val;
  const s = (val || '').toString().trim().toUpperCase();
  return s === 'TRUE' || s === 'YES' || s === '1';
}

function parseDate(dateVal) {
  if (!dateVal) return new Date().toISOString().split('T')[0];
  if (typeof dateVal === 'number') {
    const date = XLSX.SSF.parse_date_code(dateVal);
    if (date) {
      return new Date(Date.UTC(date.y, date.m - 1, date.d)).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  }
  const parsed = new Date(dateVal);
  return isNaN(parsed) ? new Date().toISOString().split('T')[0] : parsed.toISOString().split('T')[0];
}

function parseDetailedUsage(detailedUsageStr) {
  if (!detailedUsageStr || detailedUsageStr.toString().trim() === '') {
    return { label: '', desc: '', cmd: '' };
  }

  const raw = detailedUsageStr.toString().trim();

  try {
    const parsed = JSON.parse(raw);
    // Could be object or array
    if (Array.isArray(parsed)) return parsed;
    return {
      label: parsed.label || '',
      desc:  parsed.desc || '',
      cmd:   parsed.cmd || ''
    };
  } catch {
    const recovered = {
      label: extractLooseObjectValue(raw, 'label'),
      desc:  extractLooseObjectValue(raw, 'desc'),
      cmd:   extractLooseObjectValue(raw, 'cmd')
    };

    if (recovered.label || recovered.desc || recovered.cmd) {
      return recovered;
    }

    console.warn(`⚠️ Failed to parse Detailed Usage: ${raw.substring(0, 80)}…`);
    return { label: '', desc: '', cmd: '' };
  }
}

function extractLooseObjectValue(text, key) {
  const keyToken = `"${key}"`;
  const keyIndex = text.indexOf(keyToken);
  if (keyIndex === -1) return '';

  const colonIndex = text.indexOf(':', keyIndex + keyToken.length);
  if (colonIndex === -1) return '';

  let i = colonIndex + 1;
  while (i < text.length && /\s/.test(text[i])) i += 1;
  if (text[i] !== '"') return '';

  i += 1;
  let value = '';

  while (i < text.length) {
    const ch = text[i];

    if (ch === '\\' && i + 1 < text.length) {
      value += text[i + 1];
      i += 2;
      continue;
    }

    if (ch === '"') {
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j])) j += 1;
      if (j >= text.length || text[j] === ',' || text[j] === '}') {
        break;
      }
      value += '"';
      i += 1;
      continue;
    }

    value += ch;
    i += 1;
  }

  return value.trim();
}

function parseOptions(optionsStr) {
  if (!optionsStr || optionsStr.toString().trim() === '') return [];
  try {
    const parsed = JSON.parse(optionsStr.toString());
    if (Array.isArray(parsed)) {
      return parsed.map(opt => ({
        label:         opt.label || '',
        desc:          opt.desc || '',
        cmd:           opt.cmd || '',
        usage_example: opt.usage_example || ''
      })).filter(o => o.label);
    }
    // Single object (some commands store options as one object)
    if (parsed && typeof parsed === 'object') {
      return [parsed];
    }
    return [];
  } catch {
    console.warn(`⚠️ Failed to parse Options JSON`);
    return [];
  }
}

function parseJsonField(fieldStr) {
  if (!fieldStr || fieldStr.toString().trim() === '') return null;
  try {
    return JSON.parse(fieldStr.toString());
  } catch {
    // Return raw string if not valid JSON
    return fieldStr.toString().trim() || null;
  }
}

// ══════════════════════════════════════════════════════════════
//  Write output JSON
// ══════════════════════════════════════════════════════════════
const output = {
  metadata: {
    version: 'v5',
    generated: new Date().toISOString(),
    total_commands: commands.length,
    total_examples: totalExamples,
    source_sheet: sourceSheetName,
    ex_num_format: 'Order.ExampleIndex (e.g. 1.1, 4.3 — left of dot = command Order, right = example index)'
  },
  commands
};

const jsonPath = path.join(__dirname, 'public', 'data', 'commands_version.json');
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`✅ Converted ${commands.length} commands (${totalExamples} examples) from XLSX to JSON`);
console.log(`📄 Source sheet: ${sourceSheetName}`);
console.log(`📁 File saved: ${jsonPath}`);
console.log(`📊 File size: ${(fs.statSync(jsonPath).size / 1024).toFixed(2)} KB`);
console.log(`🔗 Ex # format: Order.Index (parent-child linking)`);