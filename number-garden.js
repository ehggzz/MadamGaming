(function(){
  const $=id=>document.getElementById(id);
  let active=false,round=0,score=0,total=5,target=0,choices=[],difficulty='easy',character=null;
  const settings={easy:{max:5,choices:3},medium:{max:10,choices:4},hard:{max:15,choices:4}};
  function shuffle(a){return a.sort(()=>Math.random()-.5)}
  function makeRound(){
    const s=settings[difficulty];
    target=1+Math.floor(Math.random()*s.max);
    const set=new Set([target]);
    while(set.size<s.choices){set.add(1+Math.floor(Math.random()*s.max))}
    choices=shuffle([...set]);
    $('numberPrompt').textContent=difficulty==='easy'?'How many?':difficulty==='medium'?'How many are in the garden?':'Count carefully! How many?';
    $('numberScore').textContent=score;
    $('numberRound').textContent=`${round}/${total}`;
    $('numberCharacter').src=character.src;
    $('numberCharacter').alt=character.name;
    const garden=$('numberGarden');
    garden.innerHTML='';
    garden.classList.add('counting-layout');

    // Every round gets a fresh set of shuffled positions, so the answer
    // cannot be recognised from the icons' familiar formation.
    const columns=4;
    const cellCount=difficulty==='easy'?12:difficulty==='medium'?16:20;
    const cells=shuffle(Array.from({length:cellCount},(_,i)=>i)).slice(0,target);
    for(let i=0;i<target;i++){
      const item=document.createElement('span');
      item.className='garden-item';
      item.textContent=['🌸','🌼','🌻','🍎','🍓','🌷','🪻'][Math.floor(Math.random()*7)];
      item.style.setProperty('--r',`${(Math.random()*16-8).toFixed(1)}deg`);
      item.style.gridColumn=String((cells[i]%columns)+1);
      item.style.gridRow=String(Math.floor(cells[i]/columns)+1);
      garden.appendChild(item);
    }

    const answer=$('numberAnswers');answer.innerHTML='';
    choices.forEach(n=>{
      const b=document.createElement('button');b.className='number-answer';b.textContent=n;
      b.onclick=()=>choose(n,b);answer.appendChild(b);
    });
  }
  function choose(n,button){
    if(!active)return;
    [...$('numberAnswers').children].forEach(b=>b.disabled=true);
    if(n===target){score++;button.classList.add('correct');$('numberFeedback').textContent='🌟 Brilliant!';}
    else{button.classList.add('wrong');$('numberFeedback').textContent=`💡 It was ${target}!`}
    $('numberScore').textContent=score;
    setTimeout(()=>{if(!active)return;round++;if(round>total){end()}else{ $('numberFeedback').textContent='';makeRound()}},650);
  }
  function startNumberGarden(opts){
    if(!opts||!opts.character)return;
    character=opts.character;difficulty=opts.difficulty||'easy';active=true;round=1;score=0;
    $('numberScore').textContent='0';$('numberBest').textContent=localStorage.getItem('numberGardenBest_'+difficulty)||'0';
    makeRound();
    $('numberGardenScreen').classList.add('active');
  }
  function end(){
    active=false;
    const key='numberGardenBest_'+difficulty,best=Number(localStorage.getItem(key)||0),wasBest=score>best;
    if(wasBest)localStorage.setItem(key,score);
    $('numberFinalScore').textContent=`${score}/${total}`;
    $('numberResultCharacter').src=character.src;$('numberResultCharacter').alt=character.name;
    $('numberNewBest').hidden=!wasBest;
    $('numberGardenScreen').classList.remove('active');$('numberGardenOver').classList.add('active');
  }
  window.startNumberGarden=startNumberGarden;
  window.stopNumberGarden=()=>{active=false};
  window.numberGardenAgain=()=>{if(character)startNumberGarden({character,difficulty})};
})();
