export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  type: "design" | "system";
}

export function makeParticles(n = 30): Particle[] {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0004, vy: (Math.random() - 0.5) * 0.0004,
    r: Math.random() * 2 + 1, phase: Math.random() * Math.PI * 2,
    type: (i < n / 2 ? "design" : "system") as "design" | "system",
  }));
}

export function drawParticleFrame(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, particles: Particle[]) {
  const lgD = ctx.createRadialGradient(W*0.25,H*0.5,0,W*0.25,H*0.5,W*0.4);
  lgD.addColorStop(0,"rgba(26,111,196,0.10)"); lgD.addColorStop(1,"rgba(26,111,196,0)");
  ctx.fillStyle=lgD; ctx.fillRect(0,0,W,H);
  const lgS = ctx.createRadialGradient(W*0.75,H*0.5,0,W*0.75,H*0.5,W*0.4);
  lgS.addColorStop(0,"rgba(15,31,46,0.08)"); lgS.addColorStop(1,"rgba(15,31,46,0)");
  ctx.fillStyle=lgS; ctx.fillRect(0,0,W,H);
  const lgC = ctx.createLinearGradient(W*0.4,0,W*0.6,0);
  lgC.addColorStop(0,"rgba(26,111,196,0)");
  lgC.addColorStop(0.5,`rgba(26,111,196,${0.06+Math.sin(t*0.8)*0.03})`);
  lgC.addColorStop(1,"rgba(26,111,196,0)");
  ctx.fillStyle=lgC; ctx.fillRect(0,0,W,H);
  particles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0||p.x>1)p.vx*=-1; if(p.y<0||p.y>1)p.vy*=-1;
  });
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const a=particles[i],b=particles[j];
      const dx=(a.x-b.x)*W,dy=(a.y-b.y)*H,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<130){
        ctx.strokeStyle=a.type===b.type?`rgba(26,111,196,${(1-dist/130)*0.12})`:`rgba(58,84,112,${(1-dist/130)*0.08})`;
        ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(a.x*W,a.y*H); ctx.lineTo(b.x*W,b.y*H); ctx.stroke();
      }
    }
  }
  particles.forEach(p=>{
    const pulse=Math.sin(t*1.5+p.phase)*0.5+0.5;
    ctx.beginPath(); ctx.arc(p.x*W,p.y*H,p.r*(1+pulse*0.5),0,Math.PI*2);
    ctx.fillStyle=p.type==="design"?`rgba(26,111,196,${0.28+pulse*0.35})`:`rgba(15,31,46,${0.18+pulse*0.28})`;
    ctx.fill();
  });
}
