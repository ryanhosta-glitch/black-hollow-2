// Existing Forge imports retain their API; the pure writer is shared with the Game.
export {architecturalShapes} from '../casa_game/component_shapes.mjs';
export function architecturalPartMeters(part){const scale=v=>v.map(n=>n*.3048);return {...part,c:scale(part.c),s:scale(part.s),...(part.vertices?{vertices:part.vertices.map(scale)}:{}),...(part.triangles?{triangles:part.triangles.map(t=>t.map(scale))}:{})};}
