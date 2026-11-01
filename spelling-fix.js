(()=>{
function clean(){const s=document.getElementById('spellingScreen'),c=document.getElementById('characters');if(!s||!c)return;const spellingActive=s.classList.contains('active');c.classList.toggle('active',false);if(spellingActive)s.style.display='block'}
new MutationObserver(clean).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});clean();
})();