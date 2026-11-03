export type Gender = 'male' | 'female' | 'unspecified';

export interface Person {
  /** Stable unique id. Never derived from the name, so renaming is safe. */
  id: string;
  fullName: string;
  gender: Gender;
  birthYear?: number;
  deathYear?: number;
  notes?: string;
  /** Insertion order. Used to break ties so the layout stays deterministic. */
  createdAt: number;
}

export interface FamilyTree {
  schemaVersion: 1;
  /** The person the wizard starts from. Relative labels are computed from them. */
  rootId: string;
  people: Record<string, Person>;
  relationships: Relationship[];
}

export const SCHEMA_VERSION = 1 as const;

import type { Relationship } from './relationship';
export type { Relationship };
