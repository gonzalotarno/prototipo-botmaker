export type NodeKind = 'instruction' | 'condition' | 'loop'

export interface IntegrationAction {
  id: string
  name: string
  description: string
}

export interface ConfigField {
  key: string
  label: string
  type: 'text' | 'select' | 'textarea'
  placeholder?: string
  options?: string[]
  /**
   * Marks this field as a "resource selector" (e.g. spreadsheet URL, calendar ID).
   * When true the drawer shows a mode toggle: the user can pin the agent to a
   * specific resource OR leave it empty so the agent picks the resource from
   * whatever the user says in the prompt.
   */
  isResourceSelector?: boolean
}

export interface Integration {
  id: string
  name: string
  icon: string
  color: string
  bgColor: string
  category: string
  /** Fields for connecting the account (URL, API key, etc.) */
  connectionFields: ConfigField[]
  /** All capabilities this integration exposes to the agent */
  actions: IntegrationAction[]
}

export interface ActiveIntegration {
  integration: Integration
  /** IDs of actions explicitly disabled by the user. All others are enabled. */
  disabledActions: string[]
  /** Values for connectionFields */
  connectionConfig: Record<string, string>
  accountName?: string
}

export interface NodeData {
  kind: NodeKind
  label: string
  promptHtml: string
  integrations: ActiveIntegration[]
  [key: string]: unknown
}
