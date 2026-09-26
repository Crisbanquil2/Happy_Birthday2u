(() => {
  const $ = (s) => document.querySelector(s);
  const pages = ['#page1','#page2','#page3','#page4'].map($);
  const treeBtn = $('#treeBtn'), wishBtn = $('#wishBtn'), wishText = $('#wishText');
  const cakeStage = $('#cakeStage'), toFlowersBtn = $('#toFlowersBtn');
  const canvas = $('#fx'), ctx = canvas.getContext('2d');
  let musicStarted = false, audioCtx = null, fireworks = [], particles = [], treeDone = false, wished = false;

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  addEventListener('resize', resize); resize();

  // Hidden Happy Birthday melody. Starts after a real user interaction for mobile compatibility.
  const melody = [[392,.28],[392,.28],[440,.55],[392,.55],[523,.55],[494,.85],[392,.28],[392,.28],[440,.55],[392,.55],[587,.55],[523,.85],[392,.28],[392,.28],[784,.55],[659,.55],[523,.55],[494,.55],[440,.85],[698,.28],[698,.28],[659,.55],[523,.55],[587,.55],[523,1]];
  function startMusic(){
    if(musicStarted) return; musicStarted=true;
    try{
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const play = () => {
        let t = audioCtx.currentTime + .05;
        melody.forEach(([f,d]) => {
          const o=audioCtx.createOscillator(), g=audioCtx.createGain();
          o.type='triangle'; o.frequency.value=f;
          g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.05,t+.025); g.gain.exponentialRampToValueAtTime(.0001,t+d-.03);
          o.connect(g).connect(audioCtx.destination); o.start(t); o.stop(t+d); t += d+.035;
        });
      };
      if(audioCtx.state==='suspended') audioCtx.resume().then(play); else play();
    }catch(e){}
  }

  function showPage(index){
    pages.forEach((p,i)=>p.classList.toggle('active',i===index));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function confetti(x,y,count=100){
    const chars=['💗','💖','💕','✨','🌸','♥','✦','🎈','🌷'];
    for(let i=0;i<count;i++){
      const s=document.createElement('span'); s.className='confetti'; s.textContent=chars[(Math.random()*chars.length)|0];
      s.style.left=x+'px'; s.style.top=y+'px';
      s.style.setProperty('--x',((Math.random()-.5)*innerWidth*1.2)+'px');
      s.style.setProperty('--y',(100+Math.random()*innerHeight*.72)+'px');
      document.body.appendChild(s); setTimeout(()=>s.remove(),2200);
    }
  }
  function heartBurst(x,y){
    for(let i=0;i<26;i++){
      const h=document.createElement('span'); h.className='burst-heart'; h.textContent=['💗','💖','💕','♥'][i%4];
      h.style.left=x+'px'; h.style.top=y+'px';
      h.style.setProperty('--x',((Math.random()-.5)*420)+'px'); h.style.setProperty('--y',((Math.random()-.5)*360)+'px');
      document.body.appendChild(h); setTimeout(()=>h.remove(),1700);
    }
  }

  // Visible fireworks on the whole screen.
  function launchFirework(x, targetY){
    const startY = innerHeight + 10;
    fireworks.push({x,y:startY,targetY,vy:-9-Math.random()*2.5,phase:'rise',hue:Math.random()*360,life:0});
  }
  function burstFirework(x,y,hue){
    for(let i=0;i<75;i++){
      const a=Math.random()*Math.PI*2, speed=1.5+Math.random()*6;
      particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:70+Math.random()*35,hue,drag:.985,gravity:.075});
    }
  }
  function fireworksShow(big=false){
    const n=big?9:5;
    for(let i=0;i<n;i++) setTimeout(()=>launchFirework(innerWidth*(.12+Math.random()*.76), innerHeight*(.14+Math.random()*.35)), i*180);
  }
  function animateFX(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    fireworks = fireworks.filter(f=>f.life<180);
    fireworks.forEach(f=>{
      f.life++;
      if(f.phase==='rise'){
        f.y += f.vy; f.vy += .09;
        ctx.beginPath(); ctx.arc(f.x,f.y,3,0,Math.PI*2); ctx.fillStyle=`hsl(${f.hue},100%,70%)`; ctx.fill();
        if(f.y<=f.targetY){f.phase='burst'; burstFirework(f.x,f.y,f.hue);}
      }
    });
    particles = particles.filter(p=>p.life>0);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vx*=p.drag; p.vy=p.vy*p.drag+p.gravity; p.life--;
      const a=Math.max(0,p.life/100);
      ctx.beginPath(); ctx.arc(p.x,p.y,2.2,0,Math.PI*2); ctx.fillStyle=`hsla(${p.hue},100%,70%,${a})`; ctx.fill();
    });
    requestAnimationFrame(animateFX);
  }
  animateFX();

  function treeCelebration(){
    if(treeDone) return; treeDone=true;
    startMusic();
    const r=$('#treeScene').getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height*.45;
    heartBurst(x,y); confetti(innerWidth/2,innerHeight*.35,110); fireworksShow(false);
    document.querySelectorAll('.fruit').forEach((f,i)=>{f.classList.add('fruit-pop'); f.style.animationDelay=(i*.04)+'s';});
    setTimeout(()=>showPage(1),2400);
  }
  treeBtn.addEventListener('click', treeCelebration);
  $('#treeScene').addEventListener('click', treeCelebration);

  wishBtn.addEventListener('click',()=>{
    if(wished) return; wished=true; startMusic();
    cakeStage.classList.add('wished');
    wishText.textContent='Your wish is in the air. ✨💗';
    wishBtn.disabled=true;
    const r=cakeStage.getBoundingClientRect();
    heartBurst(innerWidth/2, r.top+r.height*.42); confetti(innerWidth/2,r.top+r.height*.35,140); fireworksShow(true);
    setTimeout(()=>showPage(2),3000);
  });

  toFlowersBtn.addEventListener('click',()=>{
    startMusic();
    showPage(3);
    setTimeout(()=>{ confetti(innerWidth/2,innerHeight*.25,90); heartBurst(innerWidth/2,innerHeight*.32); fireworksShow(true); },300);
  });
})();
