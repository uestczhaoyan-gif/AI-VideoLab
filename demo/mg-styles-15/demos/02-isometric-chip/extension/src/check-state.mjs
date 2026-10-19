import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stateAt} from './state.mjs';
const c=JSON.parse(fs.readFileSync(new URL('./cues.json',import.meta.url)));
for(const t of [0,6.5,9.5,10,11,13,14.999,15,17.99]){
 const s=stateAt(t,c);assert.equal(s.x1,3);assert.equal(s.x2,5);assert.equal(s.x3,t>=15?8:0);assert.equal(s.aluResult,t>=11?8:null);
}
assert(c.read<9.5&&9.5<c.execute&&c.execute+1<c.write&&c.write<c.commit&&c.commit<c.duration);
console.log('Instruction semantics: sources preserved; ALU result precedes write-back; x3 changes only at commit.');
