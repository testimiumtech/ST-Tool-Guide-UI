export interface OptionItem {
  label?: string;
  option?: string;
  desc?: string;
  description?: string;
  cmd?: string;
  usage_example?: string;
}

export interface DetailedUsage {
  label: string;
  desc: string;
  cmd: string;
}

export interface ProblemStatement {
  scenario?: string;
  problem?: string;
  goal?: string;
}

export interface ExampleItem {
  example_id?: string;
  command: string;
  description: string;
  output: string;
  problem_statement?: ProblemStatement;
  input_param?: Record<string, unknown> | Array<Record<string, unknown>>;
  assert_params?: Record<string, unknown>;
}

export interface CommandHierarchy {
  depth: number;
  path: string;
  segments: number[];
}

export interface ParamItem {
  label: string;
  desc: string;
  example: Record<string, unknown> | null;
}

export interface SchemaItem {
  label?: string;
  description?: string;
  data?: Record<string, unknown> | Array<Record<string, unknown>> | null;
  example?: Record<string, unknown> | Array<Record<string, unknown>> | null;
}

export interface ExpectedOutput {
  pass?: string;
  fail?: string;
}

export interface CommandPage {
  command_id: string;
  category: string;
  status?: string;
  is_new: boolean;
  order: number;
  options_count?: number;
  order_key?: string;
  parent_order_key?: string | null;
  hierarchy?: CommandHierarchy;
  title: string;
  description: string;
  keywords: string[];
  purpose: string;
  syntax: string;
  detailed_usage: DetailedUsage | DetailedUsage[] | null;
  options: OptionItem[];
  use_cases: string;
  examples: ExampleItem[];
  when_to_use: string;
  related_commands?: string[];
  expected_output?: ExpectedOutput;
  input_param_schema?: SchemaItem[] | Record<string, unknown> | null;
  assert_param_schema?: SchemaItem[] | Record<string, unknown> | null;
  comparison_modes?: Record<string, unknown> | null;
  last_updated?: string;
  troubleshooting_notes?: string;
  other_feature?: string;
  assert_params?: ParamItem[];
  input_params?: ParamItem[];
  exclude_patterns?: string;
}
