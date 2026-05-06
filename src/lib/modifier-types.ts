// ─── Modifier Types & Helpers ─────────────────────────────────────────────────
// Shared types for the product modifier system.
// Used across editor, minisite, cart, and API routes.

export type SelectionType = "single" | "multiple" | "quantity"

export interface ModifierOptionData {
  id: string
  groupId: string
  name: string
  extraCost: number
  hasExtraCost: boolean
  isActive: boolean
  sortOrder: number
}

export interface ModifierGroupData {
  id: string
  siteId: string
  productId: string | null // null = global group
  name: string
  selectionType: SelectionType
  isRequired: boolean
  isActive: boolean
  sortOrder: number
  isTemplate: boolean
  options: ModifierOptionData[]
}

export interface SelectedModifier {
  groupId: string
  groupName: string
  optionId: string
  optionName: string
  extraCost: number
  quantity: number // for "quantity" type
}

// Cart item extended with modifiers
export interface CartItemWithModifiers {
  menuItemId: string
  name: string
  price: number
  quantity: number
  modifiers: SelectedModifier[]
}

// Selection state for the modifier selector UI
export interface ModifierSelectionState {
  [groupId: string]: {
    groupName: string
    selectionType: SelectionType
    selected: SelectedModifier[]
  }
}

// Helper to calculate total modifier cost
export function calculateModifierCost(modifiers: SelectedModifier[]): number {
  return modifiers.reduce((sum, m) => sum + m.extraCost * m.quantity, 0)
}

// Helper to validate modifier selections meet requirements
export function validateModifierSelections(
  groups: ModifierGroupData[],
  selections: ModifierSelectionState
): { valid: boolean; missingGroups: string[] } {
  const missingGroups: string[] = []

  for (const group of groups) {
    if (!group.isRequired || !group.isActive) continue
    const state = selections[group.id]
    if (!state || state.selected.length === 0) {
      missingGroups.push(group.name)
    }
  }

  return { valid: missingGroups.length === 0, missingGroups }
}

// Helper to check if an item has modifiers
export function itemHasModifiers(
  itemProductId: string,
  groups: ModifierGroupData[]
): boolean {
  return groups.some(
    (g) =>
      g.isActive &&
      (g.productId === itemProductId || g.productId === null) &&
      g.options.some((o) => o.isActive)
  )
}

// Get applicable modifier groups for a specific product
export function getModifierGroupsForProduct(
  productId: string,
  allGroups: ModifierGroupData[]
): ModifierGroupData[] {
  return allGroups
    .filter(
      (g) =>
        g.isActive &&
        (g.productId === productId || g.productId === null) &&
        g.options.some((o) => o.isActive)
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((g) => ({
      ...g,
      options: g.options
        .filter((o) => o.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
}
