import type { FamilyTree } from '@/types/family';
import { type Layout, NODE_WIDTH } from '@/lib/tree-layout';

/**
 * A flat projection of real layout output.
 *
 * The landing page uses this rather than a picture, so what visitors see is
 * the actual arrangement their own tree will get. The WebGL scene renders the
 * same coordinates on the preview route.
 */

const NODE_HEIGHT = 46;
const PADDING = 110;
/** How far the branch depth leans the projection, purely for the 2D view. */
const Z_LEAN_X = 0.85;
const Z_LEAN_Y = 0.28;

function depthOpacity(generation: number): number {
  const distance = Math.abs(generation);
  if (distance === 0) return 1;
  if (distance === 1) return 0.9;
  if (distance === 2) return 0.74;
  return 0.6;
}

export function TreeFigure({
  tree,
  layout,
  className,
  highlightId,
}: {
  tree: FamilyTree;
  layout: Layout;
  className?: string;
  highlightId?: string;
}) {
  if (layout.nodes.length === 0) return null;

  const projected = layout.nodes.map((node) => ({
    ...node,
    px: node.x + node.z * Z_LEAN_X,
    py: node.y + node.z * Z_LEAN_Y,
  }));

  const at = new Map(projected.map((node) => [node.id, node]));
  const minX = Math.min(...projected.map((n) => n.px)) - PADDING;
  const maxX = Math.max(...projected.map((n) => n.px)) + PADDING;
  const minY = Math.min(...projected.map((n) => n.py)) - PADDING;
  const maxY = Math.max(...projected.map((n) => n.py)) + PADDING;
  const width = maxX - minX;
  const height = maxY - minY;

  const left = (px: number) => ((px - minX) / width) * 100;
  const top = (py: number) => ((py - minY) / height) * 100;

  const descent = layout.edges.filter((e) => e.kind === 'descent');
  const unions = layout.edges.filter((e) => e.kind === 'union');
  const focus = highlightId ?? tree.rootId;

  return (
    <div
      className={className}
      style={{ position: 'relative', aspectRatio: `${width} / ${height}` }}
      role="img"
      aria-label={`Family tree of ${Object.keys(tree.people).length} people across ${layout.generations.max - layout.generations.min + 1} generations`}
    >
      <svg
        viewBox={`${minX} ${minY} ${width} ${height}`}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        {unions.map((edge) => {
          const a = at.get(edge.from);
          const b = at.get(edge.to);
          if (!a || !b) return null;
          return (
            <line
              key={`u-${edge.from}-${edge.to}`}
              x1={Math.min(a.px, b.px) + NODE_WIDTH / 2 - 12}
              y1={(a.py + b.py) / 2}
              x2={Math.max(a.px, b.px) - NODE_WIDTH / 2 + 12}
              y2={(a.py + b.py) / 2}
              stroke="var(--bronze)"
              strokeWidth={1.25}
              strokeDasharray="5 4"
            />
          );
        })}

        {descent.map((edge) => {
          const parent = at.get(edge.from);
          const child = at.get(edge.to);
          if (!parent || !child) return null;
          const startY = parent.py + NODE_HEIGHT / 2;
          const endY = child.py - NODE_HEIGHT / 2;
          const midY = startY + (endY - startY) * 0.55;
          return (
            <path
              key={`d-${edge.from}-${edge.to}`}
              d={`M ${parent.px} ${startY} V ${midY} H ${child.px} V ${endY}`}
              fill="none"
              stroke="var(--gold)"
              strokeOpacity={0.42}
              strokeWidth={1.25}
            />
          );
        })}
      </svg>

      {projected.map((node) => {
        const person = tree.people[node.id];
        if (!person) return null;
        const isFocus = node.id === focus;
        return (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: `${left(node.px)}%`,
              top: `${top(node.py)}%`,
              transform: 'translate(-50%, -50%)',
              opacity: depthOpacity(node.generation),
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              padding: '0.4rem 0.7rem',
              borderRadius: '2px',
              border: `1px solid ${isFocus ? 'var(--gold)' : 'var(--rule)'}`,
              background: isFocus ? 'rgba(201, 164, 92, 0.14)' : 'var(--surface)',
              boxShadow: isFocus ? '0 0 26px rgba(201, 164, 92, 0.26)' : '0 8px 18px rgba(0, 0, 0, 0.4)',
              fontSize: 'clamp(0.5rem, 0.95vw, 0.8125rem)',
              fontWeight: isFocus ? 500 : 400,
              color: 'var(--ivory)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '5px',
                height: '5px',
                flex: '0 0 auto',
                borderRadius: '50%',
                background: person.gender === 'female' ? 'var(--gold)' : 'var(--bronze)',
              }}
            />
            {person.fullName}
          </div>
        );
      })}
    </div>
  );
}
