export function stateAt(t,c){
 const phase=t<c.decode?0:t<c.read?1:t<c.execute?2:t<c.write?3:4;
 return {phase,x1:3,x2:5,x3:t>=c.commit?8:0,aluResult:t>=c.execute+1?8:null,committed:t>=c.commit};
}
