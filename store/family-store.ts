'use client';

import { create } from 'zustand';
import type { FamilyTree, Gender, Person } from '@/types/family';
import {
  createPerson,
  emptyTree,
  linkParentChild,
  linkPartners,
  removePerson as removePersonFrom,
} from '@/lib/family-engine';

/**
 * The working tree.
 *
 * Deliberately not persisted: no zustand `persist` middleware, no localStorage.
 * The tree lives in memory until the user saves a file (FR-09).
 */

interface PersonInput {
  fullName: string;
  gender?: Gender;
  birthYear?: number;
  deathYear?: number;
  notes?: string;
}

interface FamilyState {
  tree: FamilyTree;
  /** Set once anything changes, so we can warn before the tab closes. */
  dirty: boolean;
  selectedId: string | null;
  lastRemoved: { tree: FamilyTree } | null;

  reset: (rootName?: string) => void;
  load: (tree: FamilyTree) => void;
  addPerson: (input: PersonInput, links?: { parentIds?: string[]; partnerIds?: string[] }) => string;
  updatePerson: (id: string, patch: Partial<Omit<Person, 'id' | 'createdAt'>>) => void;
  removePerson: (id: string) => void;
  undoRemove: () => void;
  addParentLink: (parentId: string, childId: string) => void;
  addPartnerLink: (aId: string, bId: string) => void;
  unlink: (relationshipId: string) => void;
  select: (id: string | null) => void;
  markClean: () => void;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  tree: emptyTree(),
  dirty: false,
  selectedId: null,
  lastRemoved: null,

  reset: (rootName = '') => set({ tree: emptyTree(rootName), dirty: false, selectedId: null, lastRemoved: null }),

  load: (tree) => set({ tree, dirty: false, selectedId: tree.rootId, lastRemoved: null }),

  addPerson: (input, links) => {
    const person = createPerson(input, Date.now());
    set((state) => {
      const relationships = [...state.tree.relationships];
      for (const parentId of links?.parentIds ?? []) {
        relationships.push(linkParentChild(parentId, person.id));
      }
      for (const partnerId of links?.partnerIds ?? []) {
        relationships.push(linkPartners(person.id, partnerId));
      }
      return {
        tree: {
          ...state.tree,
          people: { ...state.tree.people, [person.id]: person },
          relationships,
        },
        dirty: true,
      };
    });
    return person.id;
  },

  updatePerson: (id, patch) =>
    set((state) => {
      const current = state.tree.people[id];
      if (!current) return state;
      return {
        tree: {
          ...state.tree,
          people: { ...state.tree.people, [id]: { ...current, ...patch } },
        },
        dirty: true,
      };
    }),

  removePerson: (id) =>
    set((state) => {
      if (id === state.tree.rootId) return state;
      return {
        tree: removePersonFrom(state.tree, id),
        dirty: true,
        lastRemoved: { tree: state.tree },
        selectedId: state.selectedId === id ? null : state.selectedId,
      };
    }),

  undoRemove: () => {
    const snapshot = get().lastRemoved;
    if (!snapshot) return;
    set({ tree: snapshot.tree, lastRemoved: null, dirty: true });
  },

  addParentLink: (parentId, childId) =>
    set((state) => ({
      tree: {
        ...state.tree,
        relationships: [...state.tree.relationships, linkParentChild(parentId, childId)],
      },
      dirty: true,
    })),

  addPartnerLink: (aId, bId) =>
    set((state) => ({
      tree: {
        ...state.tree,
        relationships: [...state.tree.relationships, linkPartners(aId, bId)],
      },
      dirty: true,
    })),

  unlink: (relationshipId) =>
    set((state) => ({
      tree: {
        ...state.tree,
        relationships: state.tree.relationships.filter((r) => r.id !== relationshipId),
      },
      dirty: true,
    })),

  select: (id) => set({ selectedId: id }),

  markClean: () => set({ dirty: false }),
}));
