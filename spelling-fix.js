(()=>{
function clean(){const s=document.getElementById('spellingScreen'),c=document.getElementById('characters');if(!s||!c)return;if(s.classList.contains('active'))c.classList.remove('active')}
new MutationObserver(clean).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});clean();
})();