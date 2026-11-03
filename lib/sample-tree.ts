import type { FamilyTree, Person } from '@/types/family';
import type { Relationship } from '@/types/relationship';
import { SCHEMA_VERSION } from '@/types/family';

/**
 * A small tree used by the landing page and the "load an example" button.
 * Fixed ids and createdAt values, so the layout it produces never shifts.
 */

interface Seed {
  id: string;
  fullName: string;
  gender: Person['gender'];
  birthYear?: number;
  deathYear?: number;
  parents?: string[];
  partner?: string;
}

const seeds: Seed[] = [
  { id: 'ismail', fullName: 'Ismail bin Hassan', gender: 'male', birthYear: 1928, deathYear: 2004, partner: 'aminah' },
  { id: 'aminah', fullName: 'Aminah binti Daud', gender: 'female', birthYear: 1931, deathYear: 2011 },
  { id: 'yusof', fullName: 'Yusof bin Rahman', gender: 'male', birthYear: 1930, deathYear: 2009, partner: 'zainab' },
  { id: 'zainab', fullName: 'Zainab binti Omar', gender: 'female', birthYear: 1934, deathYear: 2018 },

  { id: 'shukor', fullName: 'Abdul Shukor', gender: 'male', birthYear: 1958, parents: ['ismail', 'aminah'], partner: 'norhayati' },
  { id: 'norhayati', fullName: 'Norhayati', gender: 'female', birthYear: 1961, parents: ['yusof', 'zainab'] },
  { id: 'rashid', fullName: 'Rashid', gender: 'male', birthYear: 1962, parents: ['ismail', 'aminah'] },

  { id: 'aisyah', fullName: 'Aisyah', gender: 'female', birthYear: 1984, parents: ['shukor', 'norhayati'] },
  { id: 'aizam', fullName: 'Norshuaizam', gender: 'male', birthYear: 1988, parents: ['shukor', 'norhayati'], partner: 'farah' },
  { id: 'farah', fullName: 'Farah', gender: 'female', birthYear: 1989 },
  { id: 'hakim', fullName: 'Hakim', gender: 'male', birthYear: 1992, parents: ['shukor', 'norhayati'] },
  { id: 'nabil', fullName: 'Nabil', gender: 'male', birthYear: 1990, parents: ['rashid'] },

  { id: 'imran', fullName: 'Imran', gender: 'male', birthYear: 2016, parents: ['aizam', 'farah'] },
  { id: 'sofea', fullName: 'Sofea', gender: 'female', birthYear: 2019, parents: ['aizam', 'farah'] },
];

export function sampleTree(): FamilyTree {
  const people: Record<string, Person> = {};
  const relationships: Relationship[] = [];

  seeds.forEach((seed, index) => {
    people[seed.id] = {
      id: seed.id,
      fullName: seed.fullName,
      gender: seed.gender,
      birthYear: seed.birthYear,
      deathYear: seed.deathYear,
      createdAt: index,
    };
  });

  for (const seed of seeds) {
    for (const parent of seed.parents ?? []) {
      relationships.push({ id: `pc-${parent}-${seed.id}`, type: 'parent-child', parentId: parent, childId: seed.id });
    }
    if (seed.partner) {
      relationships.push({ id: `pt-${seed.id}-${seed.partner}`, type: 'partner', aId: seed.id, bId: seed.partner });
    }
  }

  return { schemaVersion: SCHEMA_VERSION, rootId: 'aizam', people, relationships };
}
