(()=>{
const canvas=document.getElementById('melodyCanvas'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
let active=false,raf=0,last=0,score=0,best=Number(localStorage.getItem('madamMelodyBest')||0);
let width=0,height=0,dpr=1,lane=1,platforms=[],speed=1.5,gap=220,platformWidth=132,character=null,lives=3,jump=0,audio=null,musicTimer=null,noteIndex=0;
const notes=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46];
$('melodyBest').textContent=best;
function laneX(n){return width*(n===0?.2:n===1?.5:.8)}
function resize(){dpr=Math.min(devicePixelRatio||1,2);width=innerWidth;height=innerHeight;canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize);resize();
function tone(f,d=.13,v=.03){if(!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=f;g.gain.setValueAtTime(v,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d)}
function music(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=audio||new AC();audio.resume();clearInterval(musicTimer);noteIndex=0;musicTimer=setInterval(()=>active&&tone(notes[noteIndex++%notes.length],.18,.016),340)}catch(e){}}
function stop(){active=false;cancelAnimationFrame(raf);clearInterval(musicTimer)}
function platform(y){return{y,lane:Math.floor(Math.random()*3),passed:false,w:platformWidth}}
function begin(config){stop();character=config.character;const s={easy:[1.5,220,132,3],medium:[2.3,250,112,2],hard:[3.1,285,98,1]}[config.difficulty||'easy'];[speed,gap,platformWidth,lives]=s;score=0;lane=1;jump=0;platforms=[];let y=-30;for(let i=0;i<5;i++){platforms.push(platform(y));y-=gap}resize();$('melodyScore').textContent=0;$('melodyLives').textContent=lives;$('melodyBest').textContent=best;$('melodyHint').style.display='block';active=true;last=performance.now();music();raf=requestAnimationFrame(loop)}
function choose(d){if(!active)return;lane=Math.max(0,Math.min(2,lane+d));$('melodyHint').style.display='none';tone([440,554,659][lane],.08,.018)}
function loop(t){if(!active)return;const dt=Math.min((t-last)/16.67,2);last=t;update(dt);draw(t);if(active)raf=requestAnimationFrame(loop)}
function update(dt){jump=Math.max(0,jump-dt/60);for(const p of platforms){p.y+=speed*dt;if(!p.passed&&p.y>=height*.76){p.passed=true;if(p.lane===lane){score++;jump=.5;tone(880,.12,.04)}else{lives--;$('melodyLives').textContent=lives;tone(220,.2,.025);if(lives<=0){end();return}}$('melodyScore').textContent=score}}platforms=platforms.filter(p=>p.y<height+40);while(platforms.length<5){const top=Math.min(...platforms.map(p=>p.y));platforms.unshift(platform(top-gap))}}
function end(){if(!active)return;stop();const nb=score>best;if(nb){best=score;localStorage.setItem('madamMelodyBest',best)}if(window.__melodyEnd)window.__melodyEnd(score,best,nb)}
function draw(t){ctx.clearRect(0,0,width,height);const g=ctx.createLinearGradient(0,0,0,height);g.addColorStop(0,'#a9e8ed');g.addColorStop(1,'#e8f7d9');ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
ctx.fillStyle='#ffffff99';for(let i=0;i<5;i++){const x=40+i*120,y=80+(i%3)*85;ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.arc(x+20,y-7,24,0,Math.PI*2);ctx.arc(x+43,y,17,0,Math.PI*2);ctx.fill()}
for(let i=0;i<3;i++){ctx.strokeStyle=i===lane?'#ffffffaa':'#ffffff33';ctx.lineWidth=i===lane?3:1;ctx.setLineDash([7,9]);ctx.beginPath();ctx.moveTo(laneX(i),0);ctx.lineTo(laneX(i),height);ctx.stroke()}ctx.setLineDash([]);
for(const p of platforms){const x=laneX(p.lane)-p.w/2;ctx.fillStyle='#4d9f78';ctx.roundRect(x,p.y,p.w,22,11);ctx.fill();ctx.fillStyle='#a8e6a0';ctx.roundRect(x+5,p.y-7,p.w-10,12,7);ctx.fill()}
const size=Math.min(70,width*.16),py=height*.76-size-8-(jump?Math.sin((.5-jump)/.5*Math.PI)*100:0);if(character?.image?.complete&&character.image.naturalWidth){ctx.drawImage(character.image,laneX(lane)-size/2,py,size,size)}else{ctx.fillStyle='#4b9b5c';ctx.beginPath();ctx.arc(laneX(lane),py+size/2,25,0,Math.PI*2);ctx.fill()}
ctx.fillStyle='#244b3b';ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillText('JUMP UP TO THE NEXT PLATFORM!',width/2,height*.91)}
let startX=null;canvas.addEventListener('pointerdown',e=>startX=e.clientX);canvas.addEventListener('pointerup',e=>{if(startX!==null){const dx=e.clientX-startX;if(Math.abs(dx)>18)choose(dx>0?1:-1);startX=null}});
$('laneLeft').addEventListener('click',()=>choose(-1));$('laneRight').addEventListener('click',()=>choose(1));
window.startMelodyHop=config=>{window.__melodyEnd=config.onEnd;begin(config)};window.stopMelodyHop=stop;
})();
