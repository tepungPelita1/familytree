import type { FamilyTree } from '@/types/family';
import { allIds, childIds, parentIds, partnerIds } from '@/lib/family-engine';

/**
 * Turns a family graph into placed nodes.
 *
 * Y carries the generation, X the order within a generation, and Z only adds
 * visual depth per branch so the scene reads as 3D when rotated. Z never
 * changes the structure.
 *
 * `layoutTree` is a pure function of the tree: the same input always produces
 * the same output, which is what FR-04 asks for and what the tests assert.
 */

export const NODE_WIDTH = 150;
export const SIBLING_GAP = 72;
export const PARTNER_GAP = 26;
export const GENERATION_GAP = 185;
export const BRANCH_DEPTH = 34;
const RELAX_PASSES = 14;

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  z: number;
  generation: number;
}

export interface LayoutEdge {
  /** `descent` joins a parent to a child, `union` joins two partners. */
  kind: 'descent' | 'union';
  from: string;
  to: string;
}

export interface Layout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  generations: { min: number; max: number };
}

/**
 * Generation number for everyone, 0 at the root, negative upwards.
 * Breadth-first over sorted neighbours, so ordering never depends on the order
 * relationships happen to sit in the array.
 */
export function computeGenerations(tree: FamilyTree): Map<string, number> {
  const generation = new Map<string, number>();
  const ids = allIds(tree);
  if (ids.length === 0) return generation;

  const walk = (start: string, base: number) => {
    generation.set(start, base);
    const queue = [start];
    while (queue.length) {
      const id = queue.shift()!;
      const g = generation.get(id)!;
      const visit = (next: string, value: number) => {
        if (generation.has(next) || !tree.people[next]) return;
        generation.set(next, value);
        queue.push(next);
      };
      for (const p of parentIds(tree, id)) visit(p, g - 1);
      for (const c of childIds(tree, id)) visit(c, g + 1);
      for (const q of partnerIds(tree, id)) visit(q, g);
    }
  };

  walk(tree.people[tree.rootId] ? tree.rootId : ids[0], 0);
  // Anyone in a disconnected component starts their own band at 0.
  for (const id of ids) if (!generation.has(id)) walk(id, 0);
  return generation;
}

/** The topmost ancestor reachable by always taking the lowest parent id. */
function branchKey(tree: FamilyTree, id: string): string {
  let current = id;
  const seen = new Set<string>();
  for (let i = 0; i < 64; i += 1) {
    if (seen.has(current)) break;
    seen.add(current);
    const parents = parentIds(tree, current);
    if (parents.length === 0) break;
    current = parents[0];
  }
  return current;
}

/**
 * Starting order inside each generation. Siblings sit together because they
 * share a parents key; birth year then insertion order break ties.
 */
function initialOrder(tree: FamilyTree, generation: Map<string, number>): Map<number, string[]> {
  const rows = new Map<number, string[]>();
  for (const id of allIds(tree)) {
    const g = generation.get(id);
    if (g === undefined) continue;
    const row = rows.get(g) ?? [];
    row.push(id);
    rows.set(g, row);
  }

  for (const [g, row] of rows) {
    const sortKey = (id: string) => {
      const person = tree.people[id];
      const parents = parentIds(tree, id).join(',');
      const born = person.birthYear ?? 9999;
      return `${parents}|${String(born).padStart(5, '0')}|${String(person.createdAt).padStart(16, '0')}|${id}`;
    };
    row.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

    // Pull each partner in beside their other half so couples stay adjacent.
    const placed: string[] = [];
    const taken = new Set<string>();
    for (const id of row) {
      if (taken.has(id)) continue;
      placed.push(id);
      taken.add(id);
      for (const partner of partnerIds(tree, id)) {
        if (taken.has(partner) || generation.get(partner) !== g) continue;
        placed.push(partner);
        taken.add(partner);
      }
    }
    rows.set(g, placed);
  }

  return rows;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Negating generation 0 yields -0, which breaks equality and JSON round-trips. */
function noNegativeZero(value: number): number {
  return value + 0;
}

export function layoutTree(tree: FamilyTree): Layout {
  const generation = computeGenerations(tree);
  const rows = initialOrder(tree, generation);
  const rowKeys = [...rows.keys()].sort((a, b) => a - b);
  const x = new Map<string, number>();

  // Seed each row left to right.
  for (const g of rowKeys) {
    const row = rows.get(g)!;
    let cursor = 0;
    row.forEach((id, index) => {
      if (index > 0) {
        const previous = row[index - 1];
        const together = partnerIds(tree, id).includes(previous);
        cursor += NODE_WIDTH + (together ? PARTNER_GAP : SIBLING_GAP);
      }
      x.set(id, cursor);
    });
  }

  // Pull people towards their relatives, then push them apart again so the row
  // keeps its order and nothing overlaps. Alternating direction settles both
  // the ancestor side and the descendant side.
  for (let pass = 0; pass < RELAX_PASSES; pass += 1) {
    const order = pass % 2 === 0 ? rowKeys : [...rowKeys].reverse();
    for (const g of order) {
      const row = rows.get(g)!;
      const target = new Map<string, number>();

      for (const id of row) {
        const pull: number[] = [];
        const kids = mean(childIds(tree, id).map((c) => x.get(c)).filter((v): v is number => v !== undefined));
        const parents = mean(parentIds(tree, id).map((p) => x.get(p)).filter((v): v is number => v !== undefined));
        const mates = mean(partnerIds(tree, id).map((p) => x.get(p)).filter((v): v is number => v !== undefined));
        if (kids !== null) pull.push(kids);
        if (parents !== null) pull.push(parents);
        if (mates !== null) pull.push(mates);
        const own = x.get(id) ?? 0;
        target.set(id, pull.length ? (own + pull.reduce((a, b) => a + b, 0) / pull.length) / 2 : own);
      }

      let cursor = target.get(row[0]) ?? 0;
      row.forEach((id, index) => {
        if (index === 0) {
          x.set(id, cursor);
          return;
        }
        const previous = row[index - 1];
        const together = partnerIds(tree, id).includes(previous);
        const minimum = cursor + NODE_WIDTH + (together ? PARTNER_GAP : SIBLING_GAP);
        cursor = Math.max(target.get(id) ?? minimum, minimum);
        x.set(id, cursor);
      });
    }
  }

  // Put the root at the origin so the camera has a stable place to look.
  const rootX = x.get(tree.rootId) ?? 0;
  const branches = [...new Set(allIds(tree).map((id) => branchKey(tree, id)))].sort();
  const branchZ = new Map(branches.map((key, index) => [key, ((index % 3) - 1) * BRANCH_DEPTH]));

  const nodes: LayoutNode[] = allIds(tree)
    .filter((id) => generation.has(id))
    .map((id) => ({
      id,
      x: noNegativeZero(Math.round((x.get(id) ?? 0) - rootX)),
      y: noNegativeZero(-(generation.get(id) ?? 0) * GENERATION_GAP),
      z: branchZ.get(branchKey(tree, id)) ?? 0,
      generation: generation.get(id) ?? 0,
    }));

  const edges: LayoutEdge[] = tree.relationships
    .map((r): LayoutEdge =>
      r.type === 'parent-child'
        ? { kind: 'descent', from: r.parentId, to: r.childId }
        : { kind: 'union', from: r.aId, to: r.bId },
    )
    .filter((e) => generation.has(e.from) && generation.has(e.to))
    .sort((a, b) => `${a.kind}${a.from}${a.to}`.localeCompare(`${b.kind}${b.from}${b.to}`));

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const gens = nodes.map((n) => n.generation);

  return {
    nodes,
    edges,
    bounds: {
      minX: xs.length ? Math.min(...xs) : 0,
      maxX: xs.length ? Math.max(...xs) : 0,
      minY: ys.length ? Math.min(...ys) : 0,
      maxY: ys.length ? Math.max(...ys) : 0,
    },
    generations: {
      min: gens.length ? Math.min(...gens) : 0,
      max: gens.length ? Math.max(...gens) : 0,
    },
  };
}
