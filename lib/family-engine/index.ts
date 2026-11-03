import { nanoid } from 'nanoid';
import type { FamilyTree, Gender, Person } from '@/types/family';
import { SCHEMA_VERSION } from '@/types/family';
import type { Relationship, RelativeLabel } from '@/types/relationship';

/**
 * Graph helpers over a FamilyTree.
 *
 * Every accessor returns ids sorted, so any traversal built on them visits
 * people in the same order every time. The layout engine depends on that.
 */

export function createPerson(
  input: { fullName: string; gender?: Gender; birthYear?: number; deathYear?: number; notes?: string },
  createdAt = Date.now(),
): Person {
  return {
    id: nanoid(10),
    fullName: input.fullName.trim(),
    gender: input.gender ?? 'unspecified',
    birthYear: input.birthYear,
    deathYear: input.deathYear,
    notes: input.notes,
    createdAt,
  };
}

export function emptyTree(rootName = ''): FamilyTree {
  const root = createPerson({ fullName: rootName }, 0);
  return {
    schemaVersion: SCHEMA_VERSION,
    rootId: root.id,
    people: { [root.id]: root },
    relationships: [],
  };
}

export function linkParentChild(parentId: string, childId: string): Relationship {
  return { id: nanoid(10), type: 'parent-child', parentId, childId };
}

export function linkPartners(aId: string, bId: string): Relationship {
  return { id: nanoid(10), type: 'partner', aId, bId };
}

export function allIds(tree: FamilyTree): string[] {
  return Object.keys(tree.people).sort();
}

export function parentIds(tree: FamilyTree, id: string): string[] {
  return tree.relationships
    .filter((r) => r.type === 'parent-child' && r.childId === id)
    .map((r) => (r as { parentId: string }).parentId)
    .sort();
}

export function childIds(tree: FamilyTree, id: string): string[] {
  return tree.relationships
    .filter((r) => r.type === 'parent-child' && r.parentId === id)
    .map((r) => (r as { childId: string }).childId)
    .sort();
}

export function partnerIds(tree: FamilyTree, id: string): string[] {
  const out: string[] = [];
  for (const r of tree.relationships) {
    if (r.type !== 'partner') continue;
    if (r.aId === id) out.push(r.bId);
    else if (r.bId === id) out.push(r.aId);
  }
  return out.sort();
}

export function siblingIds(tree: FamilyTree, id: string): string[] {
  const parents = parentIds(tree, id);
  const out = new Set<string>();
  for (const p of parents) for (const c of childIds(tree, p)) if (c !== id) out.add(c);
  return [...out].sort();
}

export function people(tree: FamilyTree, ids: string[]): Person[] {
  return ids.map((id) => tree.people[id]).filter((p): p is Person => Boolean(p));
}

export function nameOf(tree: FamilyTree, id: string): string {
  return tree.people[id]?.fullName ?? '';
}

/** True when `ancestorId` appears anywhere up `descendantId`'s parent chain. */
export function isAncestor(tree: FamilyTree, ancestorId: string, descendantId: string): boolean {
  const seen = new Set<string>();
  const stack = [...parentIds(tree, descendantId)];
  while (stack.length) {
    const id = stack.pop()!;
    if (id === ancestorId) return true;
    if (seen.has(id)) continue;
    seen.add(id);
    stack.push(...parentIds(tree, id));
  }
  return false;
}

/** Ancestors of `id` keyed by how many steps up they sit. */
export function ancestorDepths(tree: FamilyTree, id: string): Map<string, number> {
  const depths = new Map<string, number>();
  let frontier = parentIds(tree, id);
  let depth = 1;
  while (frontier.length && depth < 64) {
    const next: string[] = [];
    for (const p of frontier) {
      if (depths.has(p)) continue;
      depths.set(p, depth);
      next.push(...parentIds(tree, p));
    }
    frontier = [...new Set(next)].sort();
    depth += 1;
  }
  return depths;
}

function descendantDepth(tree: FamilyTree, fromId: string, targetId: string): number | null {
  const seen = new Set<string>([fromId]);
  let frontier = childIds(tree, fromId);
  let depth = 1;
  while (frontier.length && depth < 64) {
    if (frontier.includes(targetId)) return depth;
    const next: string[] = [];
    for (const c of frontier) {
      if (seen.has(c)) continue;
      seen.add(c);
      next.push(...childIds(tree, c));
    }
    frontier = [...new Set(next)].sort();
    depth += 1;
  }
  return null;
}

function byGender(gender: Gender, male: RelativeLabel, female: RelativeLabel, neutral: RelativeLabel): RelativeLabel {
  if (gender === 'male') return male;
  if (gender === 'female') return female;
  return neutral;
}

/**
 * How `id` is related to the tree's root, as a label key the UI translates.
 * Covers the relations the wizard collects; anything further out falls back to
 * ancestor / descendant / relative rather than inventing a kinship term.
 */
export function relativeLabel(tree: FamilyTree, id: string): RelativeLabel {
  const rootId = tree.rootId;
  const person = tree.people[id];
  if (!person) return 'relative';
  if (id === rootId) return 'self';

  const g = person.gender;
  if (partnerIds(tree, rootId).includes(id)) return 'spouse';

  const up = ancestorDepths(tree, rootId);
  const upDepth = up.get(id);
  if (upDepth === 1) return byGender(g, 'father', 'mother', 'parent');
  if (upDepth === 2) {
    const fatherSide = parentIds(tree, rootId).filter((p) => tree.people[p]?.gender === 'male');
    const onFatherSide = fatherSide.some((f) => parentIds(tree, f).includes(id));
    if (onFatherSide) return byGender(g, 'paternalGrandfather', 'paternalGrandmother', 'grandparent');
    const motherSide = parentIds(tree, rootId).filter((p) => tree.people[p]?.gender === 'female');
    const onMotherSide = motherSide.some((m) => parentIds(tree, m).includes(id));
    if (onMotherSide) return byGender(g, 'maternalGrandfather', 'maternalGrandmother', 'grandparent');
    return 'grandparent';
  }
  if (upDepth && upDepth > 2) return 'ancestor';

  const down = descendantDepth(tree, rootId, id);
  if (down === 1) return byGender(g, 'son', 'daughter', 'child');
  if (down === 2) return byGender(g, 'grandson', 'granddaughter', 'grandchild');
  if (down && down > 2) return 'descendant';

  if (siblingIds(tree, rootId).includes(id)) return byGender(g, 'brother', 'sister', 'sibling');

  // Child of a grandparent but not a parent: uncle or aunt.
  for (const [ancestorId, depth] of up) {
    if (depth !== 2) continue;
    if (childIds(tree, ancestorId).includes(id)) return byGender(g, 'uncle', 'aunt', 'relative');
  }
  // Child of an uncle or aunt.
  for (const [ancestorId, depth] of up) {
    if (depth !== 2) continue;
    for (const auncle of childIds(tree, ancestorId)) {
      if (childIds(tree, auncle).includes(id)) return 'cousin';
    }
  }
  return 'relative';
}

export function memberCount(tree: FamilyTree): number {
  return Object.keys(tree.people).length;
}

/** Removes a person and every relationship that mentioned them. */
export function removePerson(tree: FamilyTree, id: string): FamilyTree {
  const people = { ...tree.people };
  delete people[id];
  return {
    ...tree,
    people,
    relationships: tree.relationships.filter((r) =>
      r.type === 'parent-child' ? r.parentId !== id && r.childId !== id : r.aId !== id && r.bId !== id,
    ),
  };
}
