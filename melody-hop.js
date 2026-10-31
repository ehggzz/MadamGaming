(()=>{
const canvas=document.getElementById('melodyCanvas'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
let active=false,raf=0,last=0,score=0,best=Number(localStorage.getItem('madamMelodyBest')||0);
let width=0,height=0,dpr=1,playerLane=1,platforms=[],speed=2.1,spacing=250,platformWidth=112,character=null,audio=null,musicTimer=null,noteIndex=0,lives=3,hopPulse=0;
let playerX=0,playerY=0,hopTime=0;
$('melodyBest').textContent=best;
const notes=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46];
function resize(){dpr=Math.min(window.devicePixelRatio||1,2);width=window.innerWidth;height=window.innerHeight;canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);playerY=height*.76;playerX=laneX(playerLane)}
function laneX(lane){return width*(.19+lane*.31)}
window.addEventListener('resize',resize);resize();
function tone(freq,duration=.13,volume=.035){if(!audio)return;const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(volume,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration)}
function startMusic(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=audio||new AC();audio.resume();clearInterval(musicTimer);noteIndex=0;musicTimer=setInterval(()=>{if(active){tone(notes[noteIndex%notes.length],.19,.018);noteIndex++}},340)}catch(e){}}
function stop(){active=false;cancelAnimationFrame(raf);clearInterval(musicTimer);if(audio&&audio.state==='running')audio.suspend()}
function chooseLane(delta){if(!active)return;playerLane=Math.max(0,Math.min(2,playerLane+delta));playerX=laneX(playerLane);$('melodyHint').style.display='none';tone(playerLane===0?440:playerLane===1?554:659,.08,.018)}
function makePlatform(y){const previous=platforms.length?platforms[platforms.length-1].lane:1;let lane=Math.floor(Math.random()*3);if(Math.random()<.28)lane=previous;return{y,lane,passed:false,w:platformWidth}}
function begin(config){stop();character=config.character;const mode=config.difficulty||'easy';const settings={easy:{speed:1.45,spacing:210,w:132,lives:3},normal:{speed:2.25,spacing:250,w:112,lives:2},hard:{speed:3.05,spacing:285,w:98,lives:1}}[mode];speed=settings.speed;spacing=settings.spacing;platformWidth=settings.w;lives=settings.lives;hopPulse=0;hopTime=0;score=0;playerLane=1;resize();platforms=[makePlatform(-40),makePlatform(-40-spacing),makePlatform(-40-spacing*2)];$('melodyScore').textContent='0';$('melodyBest').textContent=best;$('melodyLives').textContent=lives;$('melodyHint').style.display='block';active=true;last=performance.now();startMusic();raf=requestAnimationFrame(loop)}
function finish(){if(!active)return;stop();const wasBest=score>best;if(wasBest){best=score;localStorage.setItem('madamMelodyBest',best)}if(window.__melodyEnd)window.__melodyEnd(score,best,wasBest)}
function loop(t){if(!active)return;const dt=Math.min((t-last)/16.67,2);last=t;update(dt);draw(t);if(active)raf=requestAnimationFrame(loop)}
function update(dt){hopPulse=Math.max(0,hopPulse-.075*dt);hopTime=Math.max(0,hopTime-dt/60);platforms.forEach(p=>{p.y+=speed*dt;if(!p.passed&&p.y>=playerY-12){p.passed=true;if(p.lane===playerLane){score++;hopPulse=1;hopTime=.48;$('melodyScore').textContent=score;tone(880,.12,.04)}else{lives--;$('melodyLives').textContent=lives;tone(220,.2,.025);if(lives<=0)finish()}}});platforms=platforms.filter(p=>p.y<height+30);while(platforms.length<4){const topY=Math.min(...platforms.map(p=>p.y));platforms.push(makePlatform(topY-spacing))}}
function rounded(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function draw(t){ctx.clearRect(0,0,width,height);const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,'#a9e8ed');sky.addColorStop(1,'#e8f7d9');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
ctx.fillStyle='#ffffff88';for(let i=0;i<5;i++){const x=(i*155+35);const y=((height*(.17+(i%2)*.1)+(t*.035))%(height+90))-45;ctx.beginPath();ctx.arc(x,y,19,0,7);ctx.arc(x+22,y-7,25,0,7);ctx.arc(x+48,y,18,0,7);ctx.fill()}
for(let i=0;i<3;i++){ctx.strokeStyle=i===playerLane?'#ffffffaa':'#ffffff33';ctx.lineWidth=i===playerLane?3:1;ctx.setLineDash([7,9]);ctx.beginPath();ctx.moveTo(laneX(i),0);ctx.lineTo(laneX(i),height);ctx.stroke()}ctx.setLineDash([]);
platforms.forEach(p=>{const x=laneX(p.lane)-p.w/2;ctx.fillStyle='#4d9f78';rounded(x,p.y,p.w,22,11);ctx.fillStyle='#a8e6a0';rounded(x+5,p.y-7,p.w-10,12,7);ctx.fillStyle='#ffffffaa';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x+22+i*28,p.y+7,3,0,7);ctx.fill()}});
const bob=Math.sin(t*.012)*3;const jump=hopTime>0?Math.sin((1-hopTime/.48)*Math.PI)*92:0;const size=Math.min(70,width*.16);if(character&&character.image&&character.image.complete&&character.image.naturalWidth){ctx.save();ctx.shadowColor='#244b3b55';ctx.shadowBlur=14;ctx.drawImage(character.image,playerX-size/2,playerY-size-8+bob-jump,size,size);ctx.restore()}else{ctx.fillStyle='#4b9b5c';ctx.beginPath();ctx.arc(playerX,playerY-28+bob-jump,25,0,7);ctx.fill()}
ctx.fillStyle='#244b3b';ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillText('JUMP UP TO THE NEXT PLATFORM!',width/2,height*.91)}
let pointerStart=null;
canvas.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY}});
canvas.addEventListener('pointerup',e=>{if(!active||!pointerStart)return;const dx=e.clientX-pointerStart.x;if(Math.abs(dx)>18)chooseLane(dx>0?1:-1);pointerStart=null});
$('laneLeft').addEventListener('click',()=>chooseLane(-1));$('laneRight').addEventListener('click',()=>chooseLane(1));
window.startMelodyHop=config=>{window.__melodyEnd=config.onEnd;begin(config)};
window.stopMelodyHop=stop;
})();