(()=>{
const canvas=document.getElementById('melodyCanvas'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
let active=false,raf=0,last=0,score=0,best=Number(localStorage.getItem('madamMelodyBest')||0);
let width=0,height=0,dpr=1,playerLane=1,playerY=0,platforms=[],speed=2.1,spacing=250,platformWidth=112,character=null,audio=null,musicTimer=null,noteIndex=0,lives=3,hopPulse=0;
$('melodyBest').textContent=best;
const notes=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46];
function resize(){dpr=Math.min(window.devicePixelRatio||1,2);width=window.innerWidth;height=window.innerHeight;canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
window.addEventListener('resize',resize);resize();
function laneY(lane){return height*(.40+lane*.17)}
function tone(freq,duration=.13,volume=.035){if(!audio)return;const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(volume,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration)}
function startMusic(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=audio||new AC();audio.resume();clearInterval(musicTimer);noteIndex=0;musicTimer=setInterval(()=>{if(active){tone(notes[noteIndex%notes.length],.19,.018);noteIndex++}},340)}catch(e){}}
function stop(){active=false;cancelAnimationFrame(raf);clearInterval(musicTimer);if(audio&&audio.state==='running')audio.suspend()}
function chooseLane(delta){if(!active)return;playerLane=Math.max(0,Math.min(2,playerLane+delta));$('melodyHint').style.display='none';tone(playerLane===0?440:playerLane===1?554:659,.08,.018)}
function makePlatform(x){const lastLane=platforms.length?platforms[platforms.length-1].lane:1;let lane=Math.floor(Math.random()*3);if(Math.random()<.28)lane=lastLane;return{x,lane,passed:false,w:platformWidth}}
function begin(config){stop();character=config.character;const mode=config.difficulty||'easy';const settings={easy:{speed:1.45,spacing:300,w:132,lives:3},normal:{speed:2.25,spacing:255,w:112,lives:2},hard:{speed:3.05,spacing:220,w:98,lives:1}}[mode];speed=settings.speed;spacing=settings.spacing;platformWidth=settings.w;lives=settings.lives;hopPulse=0;score=0;playerLane=1;playerY=laneY(1);platforms=[makePlatform(width*.58),makePlatform(width*.58+spacing),makePlatform(width*.58+spacing*2)];$('melodyScore').textContent='0';$('melodyBest').textContent=best;$('melodyLives').textContent=lives;$('melodyHint').style.display='block';active=true;last=performance.now();startMusic();raf=requestAnimationFrame(loop)}
function finish(){if(!active)return;stop();const wasBest=score>best;if(wasBest){best=score;localStorage.setItem('madamMelodyBest',best)}if(window.__melodyEnd)window.__melodyEnd(score,best,wasBest)}
function loop(t){if(!active)return;const dt=Math.min((t-last)/16.67,2);last=t;update(dt);draw(t);if(active)raf=requestAnimationFrame(loop)}
function update(dt){hopPulse=Math.max(0,hopPulse-.075*dt);platforms.forEach(p=>{p.x-=speed*dt;if(!p.passed&&p.x+p.w<width*.29){p.passed=true;if(p.lane===playerLane){score++;hopPulse=1;$('melodyScore').textContent=score;tone(880,.12,.04)}else{lives--;$('melodyLives').textContent=lives;tone(220,.2,.025);if(lives<=0)finish()}}});platforms=platforms.filter(p=>p.x+p.w>-20);while(platforms.length<4){const lastP=platforms[platforms.length-1];platforms.push(makePlatform(lastP.x+spacing))}playerY+=(laneY(playerLane)-playerY)*Math.min(1,.22*dt)}
function rounded(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function draw(t){ctx.clearRect(0,0,width,height);const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,'#a9e8ed');sky.addColorStop(1,'#e8f7d9');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
ctx.fillStyle='#ffffff88';for(let i=0;i<5;i++){const x=(i*155+35-(t*.012)%155);const y=height*(.17+(i%2)*.1);ctx.beginPath();ctx.arc(x,y,19,0,7);ctx.arc(x+22,y-7,25,0,7);ctx.arc(x+48,y,18,0,7);ctx.fill()}
platforms.forEach(p=>{const y=laneY(p.lane);ctx.fillStyle='#4d9f78';rounded(p.x,y,width*.0+ p.w,22,11);ctx.fillStyle='#a8e6a0';rounded(p.x+5,y-7,p.w-10,12,7);ctx.fillStyle='#ffffffaa';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(p.x+22+i*28,y+7,3,0,7);ctx.fill()}});
ctx.fillStyle='#ffffff55';for(let i=0;i<3;i++){ctx.strokeStyle=i===playerLane?'#ffffffaa':'#ffffff33';ctx.lineWidth=i===playerLane?3:1;ctx.setLineDash([7,9]);ctx.beginPath();ctx.moveTo(0,laneY(i)+33);ctx.lineTo(width,laneY(i)+33);ctx.stroke()}ctx.setLineDash([]);
const bob=Math.sin(t*.012)*4;const jump=Math.sin((1-hopPulse)*Math.PI)*42*hopPulse;const size=Math.min(70,width*.16);if(character&&character.image&&character.image.complete&&character.image.naturalWidth){ctx.save();ctx.shadowColor='#244b3b55';ctx.shadowBlur=14;ctx.drawImage(character.image,width*.29-size/2,playerY-size-10+bob-jump,size,size);ctx.restore()}else{ctx.fillStyle='#4b9b5c';ctx.beginPath();ctx.arc(width*.29,playerY-30+bob,25,0,7);ctx.fill()}
ctx.fillStyle='#244b3b';ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillText('CHOOSE YOUR NEXT PLATFORM',width/2,height*.88)}
let pointerStart=null;
canvas.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY}});
canvas.addEventListener('pointerup',e=>{if(!active||!pointerStart)return;const dx=e.clientX-pointerStart.x;if(Math.abs(dx)>18)chooseLane(dx>0?1:-1);pointerStart=null});
$('laneLeft').addEventListener('click',()=>chooseLane(-1));$('laneRight').addEventListener('click',()=>chooseLane(1));
window.startMelodyHop=config=>{window.__melodyEnd=config.onEnd;begin(config)};
window.stopMelodyHop=stop;
})();