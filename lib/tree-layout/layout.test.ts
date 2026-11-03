import { describe, expect, it } from 'vitest';
import { sampleTree } from '@/lib/sample-tree';
import { NODE_WIDTH, computeGenerations, layoutTree } from '@/lib/tree-layout';
import { partnerIds } from '@/lib/family-engine';

describe('computeGenerations', () => {
  it('puts the root at 0, ancestors above and descendants below', () => {
    const tree = sampleTree();
    const g = computeGenerations(tree);
    expect(g.get('aizam')).toBe(0);
    expect(g.get('shukor')).toBe(-1);
    expect(g.get('ismail')).toBe(-2);
    expect(g.get('imran')).toBe(1);
  });

  it('gives partners the same generation', () => {
    const tree = sampleTree();
    const g = computeGenerations(tree);
    expect(g.get('farah')).toBe(g.get('aizam'));
    expect(g.get('aminah')).toBe(g.get('ismail'));
  });

  it('reaches every person', () => {
    const tree = sampleTree();
    const g = computeGenerations(tree);
    expect(g.size).toBe(Object.keys(tree.people).length);
  });
});

describe('layoutTree', () => {
  it('is deterministic', () => {
    expect(layoutTree(sampleTree())).toEqual(layoutTree(sampleTree()));
  });

  it('does not depend on the order relationships are stored in', () => {
    const tree = sampleTree();
    const shuffled = { ...tree, relationships: [...tree.relationships].reverse() };
    expect(layoutTree(shuffled)).toEqual(layoutTree(tree));
  });

  it('places the root at the origin', () => {
    const root = layoutTree(sampleTree()).nodes.find((n) => n.id === 'aizam');
    expect(root?.x).toBe(0);
    expect(root?.y).toBe(0);
  });

  it('never overlaps two people in the same generation', () => {
    const { nodes } = layoutTree(sampleTree());
    const rows = new Map<number, number[]>();
    for (const node of nodes) {
      rows.set(node.generation, [...(rows.get(node.generation) ?? []), node.x]);
    }
    for (const xs of rows.values()) {
      const sorted = [...xs].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i += 1) {
        expect(sorted[i] - sorted[i - 1]).toBeGreaterThanOrEqual(NODE_WIDTH);
      }
    }
  });

  it('keeps partners side by side', () => {
    const tree = sampleTree();
    const { nodes } = layoutTree(tree);
    const at = new Map(nodes.map((n) => [n.id, n]));
    for (const id of ['aizam', 'shukor', 'ismail']) {
      for (const partner of partnerIds(tree, id)) {
        const gap = Math.abs(at.get(id)!.x - at.get(partner)!.x);
        expect(gap).toBeLessThan(NODE_WIDTH * 2);
      }
    }
  });

  it('spans five generations once a great-grandchild is added', () => {
    const tree = sampleTree();
    tree.people.zara = { id: 'zara', fullName: 'Zara', gender: 'female', birthYear: 2044, createdAt: 99 };
    tree.relationships.push({ id: 'pc-imran-zara', type: 'parent-child', parentId: 'imran', childId: 'zara' });
    const { generations } = layoutTree(tree);
    expect(generations.max - generations.min + 1).toBe(5);
  });

  it('emits one edge per relationship', () => {
    const tree = sampleTree();
    expect(layoutTree(tree).edges).toHaveLength(tree.relationships.length);
  });
});
