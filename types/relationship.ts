export interface ParentChild {
  id: string;
  type: 'parent-child';
  parentId: string;
  childId: string;
}

export interface Partnership {
  id: string;
  type: 'partner';
  aId: string;
  bId: string;
}

export type Relationship = ParentChild | Partnership;

export type RelationshipKind = Relationship['type'];

/** Labels the wizard shows. Computed from the graph, never stored on a person. */
export type RelativeLabel =
  | 'self'
  | 'father'
  | 'mother'
  | 'parent'
  | 'paternalGrandfather'
  | 'paternalGrandmother'
  | 'maternalGrandfather'
  | 'maternalGrandmother'
  | 'grandparent'
  | 'brother'
  | 'sister'
  | 'sibling'
  | 'son'
  | 'daughter'
  | 'child'
  | 'grandson'
  | 'granddaughter'
  | 'grandchild'
  | 'spouse'
  | 'uncle'
  | 'aunt'
  | 'cousin'
  | 'ancestor'
  | 'descendant'
  | 'relative';
