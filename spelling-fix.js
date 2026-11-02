(()=>{
function clean(){const s=document.getElementById('spellingScreen'),c=document.getElementById('characters'),maze=document.getElementById('playMaze'),dynamicMaze=document.getElementById('mazeMunchCard'),spelling=document.getElementById('playSpelling');if(s&&c&&s.classList.contains('active'))c.classList.remove('active');if(maze&&dynamicMaze)dynamicMaze.remove();if(maze)maze.style.marginTop='14px';if(spelling)spelling.style.marginTop='14px'}
new MutationObserver(clean).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});clean();
})();