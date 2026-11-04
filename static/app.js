(() => {
  const $ = id => document.getElementById(id);
  const STORAGE_KEY = "nova-ide-project-v1";
  const starter = {
    "index.html": `<!doctype html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hello Nova</title></head>
<body>
  <main class="card">
    <div class="spark">✦</div>
    <p class="tag">YOUR FIRST CREATION</p>
    <h1>Hello, <span>Nova.</span></h1>
    <p>Your ideas deserve a beautiful place to grow.</p>
    <button onclick="document.querySelector('h1').innerHTML='You did it, <span>Creator.</span>'">Tap to interact</button>
  </main>
</body>
</html>`,
    "style.css": `*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(145deg,#10182c,#17132b);font-family:system-ui;color:#f5f6ff;padding:20px}.card{text-align:center;padding:35px 25px;border:1px solid #ffffff20;border-radius:28px;background:#ffffff0b;box-shadow:0 25px 80px #0006;max-width:420px}.spark{font-size:35px;color:#8ceaff}.tag{font-size:10px;letter-spacing:2px;color:#a8b5d4}h1{font-size:36px;letter-spacing:-2px}h1 span{color:#8ceaff}p{color:#aeb8d0;line-height:1.6}button{border:0;border-radius:12px;padding:12px 18px;background:linear-gradient(90deg,#8ceaff,#b3a0ff);font-weight:700}`,
    "script.js": `console.log("Welcome to Nova IDE!");`
  };
  let project = loadProject(), active = Object.keys(project)[0], dirty = false, modalAction = null, toastTimer;
  function loadProject(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));return saved&&Object.keys(saved).length?saved:{...starter};}catch{return {...starter};}}
  function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(project));dirty=false;$("dirtyDot").classList.remove("show");$("saveState").innerHTML="<i></i> Saved";}
  function notify(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2100);}
  function ext(name){return name.split(".").pop().toLowerCase();}
  function icon(name){return ({html:"◇",css:"✿",js:"⌘",py:"🐍",txt:"≡",md:"▤"})[ext(name)]||"▧";}
  function renderTabs(){
    $("fileStrip").innerHTML="";
    Object.keys(project).forEach(name=>{const b=document.createElement("button");b.className="file-tab"+(name===active?" active":"");b.setAttribute("role","tab");b.setAttribute("aria-selected",name===active);b.textContent=icon(name)+" "+name;b.onclick=()=>switchFile(name);b.oncontextmenu=e=>{e.preventDefault();if(confirm(`Delete ${name}?`))deleteFile(name);};$("fileStrip").appendChild(b);});
    $("fileCount").textContent=`${Object.keys(project).length} files · Local project`;
  }
  function switchFile(name){if(dirty){project[active]=$("codeEditor").value;save();}active=name;$("codeEditor").value=project[name];$("activeFileName").textContent=name;$("fileIcon").textContent=icon(name);$("languageLabel").textContent=ext(name).toUpperCase()+" FILE";$("dirtyDot").classList.remove("show");renderTabs();updateLines();}
  function updateLines(){const n=$("codeEditor").value.split("\n").length;$("lineNumbers").textContent=Array.from({length:n},(_,i)=>i+1).join("\n");}
  function current(){project[active]=$("codeEditor").value;}
  function deleteFile(name){delete project[name];if(!Object.keys(project).length)project["index.html"]="";active=Object.keys(project)[0];save();switchFile(active);notify("File deleted");}
  function createFile(name){if(!/^[\w .-]+\.(html|css|js|py|txt|md)$/i.test(name)){notify("Use .html, .css, .js, .py, .txt or .md");return;}if(project[name]!==undefined){notify("That file already exists");return;}project[name]="";save();switchFile(name);notify("File created");}
  function openModal(title,hint,placeholder,action){$("modalTitle").textContent=title;$("modalHint").textContent=hint;$("modalInput").placeholder=placeholder;$("modalInput").value="";modalAction=action;$("modalBackdrop").classList.add("open");$("modalInput").focus();}
  $("closeModal").onclick=$("cancelModal").onclick=()=>$("modalBackdrop").classList.remove("open");
  $("confirmModal").onclick=()=>{const val=$("modalInput").value.trim();if(val&&modalAction)modalAction(val);$("modalBackdrop").classList.remove("open");};
  $("newFileBtn").onclick=()=>openModal("Create a file","Name it with a supported extension.","example.py",createFile);
  $("codeEditor").addEventListener("input",()=>{dirty=true;$("dirtyDot").classList.add("show");$("saveState").textContent="● Unsaved";updateLines();current();save();});
  $("codeEditor").addEventListener("scroll",()=>$("lineNumbers").scrollTop=$("codeEditor").scrollTop);
  $("codeEditor").addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();const el=e.target,start=el.selectionStart,end=el.selectionEnd;el.setRangeText("  ",start,end,"end");el.dispatchEvent(new Event("input"));}});
  function runPreview(){
    current();save();const html=project["index.html"]||`<h2>Nova IDE</h2><p>Create an index.html file to preview your website.</p>`;
    const css=project["style.css"]||"",js=project["script.js"]||"";
    const doc=html.replace(/<\/head>/i,`<style>${css.replace(/<\/style/gi,"<\\/style")}</style></head>`).replace(/<\/body>/i,`<script>${js.replace(/<\/script/gi,"<\\/script") }<\/script></body>`);
    $("previewFrame").srcdoc=doc;$("previewPlaceholder").style.display="none";$("outputStatus").textContent="Running";$("consoleOutput").textContent="Preview updated successfully.\nNote: browser console output is isolated from this panel.";notify("Preview updated");
  }
  $("runBtn").onclick=runPreview;$("refreshBtn").onclick=runPreview;
  $("clearConsole").onclick=()=>$("consoleOutput").textContent="Console cleared.";
  $("downloadBtn").onclick=()=>{current();save();const blob=new Blob([project[active]],{type:"text/plain"});downloadBlob(blob,active);};
  function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  $("importBtn").onclick=()=>$("fileInput").click();
  $("fileInput").onchange=async e=>{for(const file of e.target.files){if(file.size>2*1024*1024){notify(file.name+" is too large");continue;}project[file.name]=await file.text();}active=e.target.files[0]?.name||active;save();switchFile(active);notify("Files imported");e.target.value="";};
  $("exportBtn").onclick=async()=>{current();save();try{const JSZip=await loadZip();const zip=new JSZip();Object.entries(project).forEach(([n,c])=>zip.file(n,c));const blob=await zip.generateAsync({type:"blob"});downloadBlob(blob,"nova-project.zip");notify("Project ZIP exported");}catch{notify("ZIP library unavailable. Save files individually.");}};
  function loadZip(){return new Promise((resolve,reject)=>{if(window.JSZip)return resolve(window.JSZip);const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";s.onload=()=>resolve(window.JSZip);s.onerror=reject;document.head.appendChild(s);});}
  $("expandPreview").onclick=()=>{const w=window.open("about:blank","_blank");if(!w){notify("Allow pop-ups to open preview");return;}w.document.write($("previewFrame").srcdoc);w.document.close();};
  $("settingsBtn").onclick=()=>notify("Files are saved in this browser only.");
  window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue="";}});
  switchFile(active);
  // Add Python execution with Pyodide on demand.
  function runPython(code){
    $("outputStatus").textContent="Loading Python…";$("consoleOutput").textContent="Loading Python runtime (first run needs internet)…";
    const start=async()=>{try{if(!window.loadPyodide){await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});}window.novaPyodide=window.novaPyodide||await loadPyodide();let output="";window.novaPyodide.setStdout({batched:s=>output+=s+"\n"});window.novaPyodide.setStderr({batched:s=>output+="Error: "+s+"\n"});await window.novaPyodide.runPythonAsync(code);$("consoleOutput").textContent=output||"Python finished with no output.";$("outputStatus").textContent="Python done";}catch(err){$("consoleOutput").textContent=String(err);$("outputStatus").textContent="Python error";}};
    start();
  }
  $("runBtn").addEventListener("click",()=>{if(ext(active)==="py")runPython($("codeEditor").value);});
  $("languageLabel").textContent=ext(active).toUpperCase()+" FILE";
})();
