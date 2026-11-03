import type { FamilyTree } from '@/types/family';
import { allIds, childIds, isAncestor, parentIds, partnerIds } from '@/lib/family-engine';

export type IssueCode =
  | 'unknownPerson'
  | 'selfParent'
  | 'circularAncestry'
  | 'tooManyParents'
  | 'duplicateLink'
  | 'partnerAndParent'
  | 'selfPartner'
  | 'emptyName'
  | 'disconnected'
  | 'missingParents';

export interface Issue {
  code: IssueCode;
  severity: 'error' | 'warning';
  /** People the issue is about, so the UI can link straight to them. */
  personIds: string[];
}

/**
 * Checks the graph before anything is drawn. Errors block generation; warnings
 * describe a tree that renders but has gaps the user may want to fill.
 */
export function validateTree(tree: FamilyTree): Issue[] {
  const issues: Issue[] = [];
  const known = new Set(Object.keys(tree.people));
  const seenLinks = new Set<string>();

  for (const r of tree.relationships) {
    if (r.type === 'parent-child') {
      for (const id of [r.parentId, r.childId]) {
        if (!known.has(id)) issues.push({ code: 'unknownPerson', severity: 'error', personIds: [id] });
      }
      if (r.parentId === r.childId) {
        issues.push({ code: 'selfParent', severity: 'error', personIds: [r.parentId] });
        continue;
      }
      const key = `pc:${r.parentId}>${r.childId}`;
      if (seenLinks.has(key)) {
        issues.push({ code: 'duplicateLink', severity: 'error', personIds: [r.parentId, r.childId] });
      }
      seenLinks.add(key);
    } else {
      for (const id of [r.aId, r.bId]) {
        if (!known.has(id)) issues.push({ code: 'unknownPerson', severity: 'error', personIds: [id] });
      }
      if (r.aId === r.bId) {
        issues.push({ code: 'selfPartner', severity: 'error', personIds: [r.aId] });
        continue;
      }
      const key = `pt:${[r.aId, r.bId].sort().join('>')}`;
      if (seenLinks.has(key)) {
        issues.push({ code: 'duplicateLink', severity: 'error', personIds: [r.aId, r.bId] });
      }
      seenLinks.add(key);
    }
  }

  for (const id of allIds(tree)) {
    const person = tree.people[id];
    if (!person.fullName.trim()) {
      issues.push({ code: 'emptyName', severity: 'error', personIds: [id] });
    }

    const parents = parentIds(tree, id);
    if (parents.length > 2) {
      issues.push({ code: 'tooManyParents', severity: 'error', personIds: [id, ...parents] });
    }
    if (isAncestor(tree, id, id)) {
      issues.push({ code: 'circularAncestry', severity: 'error', personIds: [id] });
    }

    for (const partner of partnerIds(tree, id)) {
      if (parents.includes(partner) || childIds(tree, id).includes(partner)) {
        issues.push({ code: 'partnerAndParent', severity: 'error', personIds: [id, partner] });
      }
    }

    if (parents.length === 1) {
      issues.push({ code: 'missingParents', severity: 'warning', personIds: [id] });
    }
  }

  for (const id of unreachableFromRoot(tree)) {
    issues.push({ code: 'disconnected', severity: 'warning', personIds: [id] });
  }

  return dedupe(issues);
}

export function errorsOnly(issues: Issue[]): Issue[] {
  return issues.filter((i) => i.severity === 'error');
}

/** People no chain of parent, child or partner links connects to the root. */
export function unreachableFromRoot(tree: FamilyTree): string[] {
  if (!tree.people[tree.rootId]) return allIds(tree);
  const seen = new Set<string>([tree.rootId]);
  const queue = [tree.rootId];
  while (queue.length) {
    const id = queue.shift()!;
    for (const next of [...parentIds(tree, id), ...childIds(tree, id), ...partnerIds(tree, id)]) {
      if (seen.has(next) || !tree.people[next]) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return allIds(tree).filter((id) => !seen.has(id));
}

function dedupe(issues: Issue[]): Issue[] {
  const out: Issue[] = [];
  const seen = new Set<string>();
  for (const issue of issues) {
    const key = `${issue.code}:${[...issue.personIds].sort().join(',')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(issue);
  }
  return out;
}
