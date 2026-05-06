/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const ROOT = path.resolve(__dirname);
const DATA_DIR = path.join(ROOT, 'public', 'data');
const COMMANDS_JSON = path.join(DATA_DIR, 'commands.json');
const COMMANDS_XLSX = path.join(DATA_DIR, 'commands.xlsx');

// ---------------------------------------------------------------------------
// CLI helpers
// ---------------------------------------------------------------------------
function readFlag(args, names) {
  const aliases = Array.isArray(names) ? names : [names];
  const index = args.findIndex((arg) => aliases.includes(arg));
  if (index < 0) return null;
  const next = args[index + 1];
  return next && !next.startsWith('-') ? next : null;
}

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------
function writeJson(filePath, val) {
  fs.writeFileSync(filePath, JSON.stringify(val, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// Workbook helpers
// ---------------------------------------------------------------------------
function readSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

function requireSheets(workbook, sheetNames) {
  const missing = sheetNames.filter((n) => !workbook.Sheets[n]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required sheet(s): ${missing.join(', ')}. Available: ${workbook.SheetNames.join(', ') || '(none)'}`
    );
  }
}


const args = process.argv.slice(2);
const fileArg = readFlag(args, ['--file', '-f']);
const outArg = readFlag(args, ['--out', '-o']);

const xlsxPath = fileArg ? path.resolve(process.cwd(), fileArg) : COMMANDS_XLSX;
const jsonPath = outArg ? path.resolve(process.cwd(), outArg) : COMMANDS_JSON;

const REQUIRED_SHEETS = ['Commands', 'Input Fields', 'Assert Fields', 'Examples'];

function main() {
  const workbook = XLSX.readFile(xlsxPath);
  requireSheets(workbook, REQUIRED_SHEETS);

  const commandRows = readSheet(workbook, 'Commands');
  const inputFieldRows = readSheet(workbook, 'Input Fields');
  const assertFieldRows = readSheet(workbook, 'Assert Fields');
  const exampleRows = readSheet(workbook, 'Examples');

  const inputsByCommand = groupBy(inputFieldRows, 'command_id');
  const assertsByCommand = groupBy(assertFieldRows, 'command_id');
  const examplesByCommand = groupBy(exampleRows, 'command_id');

  const commands = commandRows
    .filter((row) => value(row.command_id))
    .map((row) => buildCommand(row, inputsByCommand, assertsByCommand, examplesByCommand))
    .sort((a, b) => a.order - b.order);

  const duplicateIds = findDuplicates(commands.map((command) => command.command_id));
  if (duplicateIds.length > 0) {
    console.error(`Duplicate command_id value(s): ${duplicateIds.join(', ')}`);
    process.exit(1);
  }

  const totalExamples = commands.reduce((sum, command) => sum + command.examples.length, 0);
  const output = {
    metadata: {
      version: 'v6-normalized-sheets',
      generated: new Date().toISOString(),
      total_commands: commands.length,
      total_examples: totalExamples,
      source_workbook: path.basename(xlsxPath),
      source_sheets: REQUIRED_SHEETS,
      structure: 'normalized-sheets',
    },
    commands,
  };

  writeJson(jsonPath, output);

  console.log(
    `Converted ${commands.length} commands (${totalExamples} examples) from normalized XLSX sheets`
  );
  console.log(`Workbook: ${xlsxPath}`);
  console.log(`JSON: ${jsonPath}`);
}

function buildCommand(row, inputsByCommand, assertsByCommand, examplesByCommand) {
  const commandId = value(row.command_id);
  const options = (inputsByCommand.get(commandId) || [])
    .sort((a, b) => toNumber(a.field_order) - toNumber(b.field_order))
    .map((field) => ({
      label: value(field.field_name),
      desc: value(field.description),
      cmd: value(field.field_name),
      required: normalizeYesNo(field.required),
      json_example: parseJsonField(field.input_json_object),
    }))
    .filter((field) => field.label);

  const assertParamSchema = buildAssertParamSchema(assertsByCommand.get(commandId) || []);
  const examples = (examplesByCommand.get(commandId) || [])
    .sort((a, b) => toNumber(a.example_order) - toNumber(b.example_order))
    .map((example, index) => buildExample(commandId, example, index))
    .filter((example) => example.command || example.description || hasProblemStatement(example));

  return {
    order: toNumber(row.order),
    command_id: commandId,
    title: value(row.title),
    category: value(row.category) || 'Other',
    status: value(row.status),
    syntax: joinSyntax(row),
    description: value(row.description),
    purpose: value(row.purpose),
    when_to_use: value(row.when_to_use),
    use_cases: value(row.use_case),
    options_count: options.length,
    options,
    examples,
    input_param_schema: null,
    assert_param_schema: assertParamSchema,
    assert_params: schemaToParamItems(assertParamSchema),
    comparison_modes: null,
    expected_output: null,
    detailed_usage: buildDetailedUsage(options),
    keywords: splitCsv(row.keywords),
    related_commands: splitCsv(row.related_commands),
    is_new: parseBool(row.is_new),
    last_updated: parseDate(row.last_updated),
  };
}

function buildExample(commandId, exampleRow, index) {
  const exampleId = value(exampleRow.example_id) || `${commandId}-${index + 1}`;
  const description = value(exampleRow.description);
  const inputParam = parseJsonField(exampleRow.input_param);
  const assertParams = parseJsonField(exampleRow.assert_params);

  return {
    example_id: exampleId,
    problem_statement: {
      scenario: value(exampleRow.scenario),
      problem: value(exampleRow.problem),
      goal: value(exampleRow.goal),
    },
    command: value(exampleRow.test_step_text),
    description,
    output: value(exampleRow.expected_output),
    ...(inputParam ? { input_param: inputParam } : {}),
    ...(assertParams ? { assert_params: assertParams } : {}),
  };
}

function buildDetailedUsage(options) {
  const usageItems = options
    .map((option) => ({
      label: option.label,
      desc: option.desc,
      cmd: option.cmd,
    }))
    .filter((item) => item.label || item.desc || item.cmd);

  return usageItems.length > 0 ? usageItems : null;
}

function schemaToParamItems(schema) {
  if (!Array.isArray(schema)) {
    return [];
  }

  return schema.map((item) => ({
    label: item.label || '',
    desc: item.description || '',
    example: buildParamExample(item.data),
    json_example: item.json_object || null,
  }));
}

function buildParamExample(data) {
  if (!data) return null;
  return typeof data === 'string' ? { jsonKey: data } : data;
}

function buildAssertParamSchema(rows) {
  const sortedRows = rows
    .filter((row) => value(row.field_name))
    .sort((a, b) => toNumber(a.field_order) - toNumber(b.field_order));

  if (sortedRows.length === 0) {
    return null;
  }

  return sortedRows.map((row) => ({
    label: value(row.field_name),
    description: value(row.description),
    data: null,
    json_object: parseJsonField(row.input_json_object),
    required: normalizeYesNo(row.required),
  }));
}

function groupBy(rows, key) {
  const grouped = new Map();
  for (const row of rows) {
    const groupKey = value(row[key]);
    if (!groupKey) {
      continue;
    }

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, []);
    }
    grouped.get(groupKey).push(row);
  }
  return grouped;
}

function joinSyntax(row) {
  return [row.syntax_1, row.syntax_2, row.syntax_3, row.syntax_4]
    .map(value)
    .filter(Boolean)
    .join('\n');
}

function splitCsv(text) {
  return value(text)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseJsonField(rawValue) {
  const text = value(rawValue);
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeYesNo(rawValue) {
  const text = value(rawValue).toLowerCase();
  if (['yes', 'true', '1', 'required'].includes(text)) return 'Yes';
  if (['no', 'false', '0', 'optional'].includes(text)) return 'No';
  return value(rawValue) || 'No';
}

function parseBool(rawValue) {
  const text = value(rawValue).toLowerCase();
  return ['yes', 'true', '1', 'new'].includes(text);
}

function parseDate(rawValue) {
  if (!rawValue) return new Date().toISOString().split('T')[0];

  if (typeof rawValue === 'number') {
    const parsed = XLSX.SSF.parse_date_code(rawValue);
    if (parsed) {
      return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)).toISOString().split('T')[0];
    }
  }

  const date = new Date(rawValue);
  return Number.isNaN(date.getTime()) ? value(rawValue) : date.toISOString().split('T')[0];
}

function toNumber(rawValue) {
  const number = Number(rawValue);
  return Number.isFinite(number) ? number : 0;
}

function value(rawValue) {
  if (rawValue == null) return '';
  return String(rawValue).trim();
}

function hasProblemStatement(example) {
  return Boolean(
    example.problem_statement.scenario ||
      example.problem_statement.problem ||
      example.problem_statement.goal
  );
}

function findDuplicates(items) {
  return items.filter((item, index) => item && items.indexOf(item) !== index);
}

main();
