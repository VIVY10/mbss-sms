/* =============================
   THEME TOGGLE
   ============================= */
(function() {
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;

    // Load saved theme or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        body.classList.toggle("light-mode", savedTheme === "light");
    } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        body.classList.toggle("light-mode", !prefersDark);
    }

    // Toggle button
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("light-mode");
        localStorage.setItem("theme", body.classList.contains("light-mode") ? "light" : "dark");
    });
})();

/* =============================
   STATE
   ============================= */
const state = { logs: [], page: 1, rowsPerPage: 50, totalPages: 1 };

/* =============================
   DEBOUNCE
   ============================= */
function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/* =============================
   FETCH LOGS
   ============================= */
async function loadLogs(filters = {}) {
    try {
        const url = new URL("/user-activity", window.location.origin);
        Object.keys(filters).forEach(k => filters[k] && url.searchParams.append(k, filters[k]));
        const res = await fetch(url);
        // if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!res.ok) console.log(`${res.error}`);
        state.logs = await res.json();
        state.page = 1;
        state.totalPages = Math.ceil(state.logs.length / state.rowsPerPage);
        renderLogs();
        renderPagination();
    } catch (err) { 
        alert("error loading user activity"); 
    }
}

/* =============================
   FILTER LOGS
   ============================= */
function getFilteredLogs() {
    const userFilter = document.getElementById("filterUser").value.toLowerCase();
    const activityFilter = document.getElementById("filterActivity").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    return state.logs.filter(log => {
        const matchUser = !userFilter || (log.user_name?.toLowerCase().includes(userFilter));
        const matchActivity = !activityFilter || log.activity_type === activityFilter;
        const logDate = new Date(log.created_at);
        const matchStart = !startDate || logDate >= new Date(`${startDate}T00:00:00`);
        const matchEnd = !endDate || logDate <= new Date(`${endDate}T23:59:59`);
        return matchUser && matchActivity && matchStart && matchEnd;
    });
}

/* =============================
   RENDER LOGS
   ============================= */
function renderLogs() {
    const tbody = document.querySelector("#activityTable tbody");
    tbody.innerHTML = "";
    const filteredLogs = getFilteredLogs();
    state.totalPages = Math.ceil(filteredLogs.length / state.rowsPerPage);
    const startIdx = (state.page-1)*state.rowsPerPage;
    const pageLogs = filteredLogs.slice(startIdx, startIdx+state.rowsPerPage);

    const fragment = document.createDocumentFragment();
    pageLogs.forEach(log => {
        const tr = document.createElement("tr");
        tr.className = "log-row";
        tr.dataset.logId = log.log_id;

        const userTd = document.createElement("td");
        userTd.innerHTML = `<b>${log.user_name||'Guest'}</b><br><small>${log.user_email||''}</small>`;

        const activityClass = `activity-${log.activity_type.replace(/\s/g,"_")}`;
        const activityTd = document.createElement("td");
        activityTd.innerHTML = `<span class="activity-badge ${activityClass}">${log.activity_type}</span>`;

        const dateTd = document.createElement("td");
        dateTd.textContent = new Date(log.created_at).toLocaleString();

        const toggleTd = document.createElement("td");
        toggleTd.textContent = "▶";

        tr.append(userTd, activityTd, dateTd, toggleTd);
        fragment.appendChild(tr);

        // Details
        const detailTr = document.createElement("tr");
        detailTr.className = "log-details";
        detailTr.id = `details-${log.log_id}`;
        detailTr.innerHTML = `
            <td colspan="4">
                <div><b>URL:</b> <span>${log.url}</span></div>
                <div><b>Details:</b> <span>${log.details}</span></div>
                <div><b>IP:</b> <span>${log.ip_address}</span></div>
                <div><b>User Agent:</b> <small>${log.user_agent}</small></div>
            </td>`;
        fragment.appendChild(detailTr);
    });
    tbody.appendChild(fragment);
}

/* =============================
   TOGGLE DETAILS
   ============================= */
document.querySelector("#activityTable tbody").addEventListener("click", e => {
    const tr = e.target.closest("tr.log-row");
    if (!tr) return;
    const detailsRow = document.getElementById(`details-${tr.dataset.logId}`);
    if (detailsRow) detailsRow.style.display = detailsRow.style.display==="table-row"?"none":"table-row";
});

/* =============================
   PAGINATION
   ============================= */
function renderPagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    for(let i=1;i<=state.totalPages;i++){
        const li = document.createElement("li");
        li.className = `page-item ${i===state.page?"active":""}`;
        const a = document.createElement("a");
        a.className="page-link"; a.href="#"; a.textContent=i;
        a.addEventListener("click", e=>{e.preventDefault(); state.page=i; renderLogs(); renderPagination();});
        li.appendChild(a); pagination.appendChild(li);
    }
}

/* =============================
   FILTER EVENTS
   ============================= */
["filterUser","filterActivity","startDate","endDate"].forEach(id=>{
    document.getElementById(id).addEventListener("input", debounce(()=>{
        state.page=1; renderLogs(); renderPagination();
    }));
});
document.getElementById("applyFilters").addEventListener("click", ()=>{state.page=1; renderLogs(); renderPagination();});
document.getElementById("resetFiltersBtn").addEventListener("click", ()=>{
    ["filterUser","filterActivity","startDate","endDate"].forEach(id=>document.getElementById(id).value="");
    state.page=1; renderLogs(); renderPagination();
});

/* =============================
   INITIAL LOAD
   ============================= */
loadLogs();

/* =============================
   REAL-TIME FEED + WEBSOCKET
   ============================= */
(function(){
    const feedEl = document.getElementById("feed");
    const onlineUsersEl = document.getElementById("onlineUsers");
    const onlineCountEl = document.getElementById("onlineCount");
    const exportBtn = document.getElementById("exportCsv");
    let wsRetry = 1000;

    function addToFeed(act){
        const div = document.createElement("div"); div.className="feed-item";
        const img = document.createElement("img"); img.src=`/images/profile/${act.avatar}`; img.onerror=()=>{img.src="/images/profile/avatar.png"};
        const body = document.createElement("div"); body.className="body";
        body.innerHTML=`<strong>${act.userName}</strong><small>${act.activityType}</small><div class="details">${act.details||act.url}</div>`;
        const timeDiv=document.createElement("div");timeDiv.className="time";timeDiv.textContent=new Date(act.timestamp).toLocaleTimeString();
        div.append(img,body,timeDiv); feedEl.prepend(div);
        if(feedEl.children.length>80) feedEl.removeChild(feedEl.lastChild);
    }

    function createOnlineUser(u){
        const div=document.createElement("div"); div.className="online-item";
        div.innerHTML=`<div class="flag">${u.flag||"🌍"}</div><div class="info"><div class="name">${u.user_name||u.userName}</div><div class="meta">${u.city||""} ${u.country||""}</div></div><div class="page">${(u.current_page||u.currentPage||"").slice(0,40)}</div>`;
        return div;
    }

    function updateOnlineUsers(users){
        onlineCountEl.textContent=users.length;
        onlineUsersEl.innerHTML="";
        const frag=document.createDocumentFragment(); users.forEach(u=>frag.appendChild(createOnlineUser(u)));
        onlineUsersEl.appendChild(frag);
    }

    function createWebSocket(){
        const protocol = window.location.protocol==="https:"?"wss:":"ws:";
        const ws = new WebSocket(`${protocol}//${window.location.host}`);

        ws.addEventListener("open",()=>{wsRetry=1000;});
        ws.addEventListener("close",()=>{setTimeout(createWebSocket, wsRetry); wsRetry=Math.min(wsRetry*2,30000);});
        ws.addEventListener("message",(evt)=>{
            try{
                const msg = JSON.parse(evt.data);
                if(!msg?.type) return;
                if(msg.type==="newActivity") addToFeed(msg.data);
                if(msg.type==="onlineUsers") updateOnlineUsers(msg.data||[]);
            }catch(e){}
        });
    }
    createWebSocket();

    /* Heatmap Chart */
    const ctx=document.getElementById("heatmapChart").getContext("2d");
    const chart=new Chart(ctx,{type:"bar",data:{labels:[],datasets:[{label:"Page Views",data:[]}]},options:{indexAxis:"y",responsive:true,plugins:{legend:{display:false}}}});
    async function loadHeatmap(){
        try{
            const res=await fetch("/heatmap"); if(!res.ok)throw new Error(res.status);
            const data=await res.json();
            chart.data.labels=data.map(x=>x.page);
            chart.data.datasets[0].data=data.map(x=>x.count);
            chart.update();
        }catch(e){
            alert("error loading heatmap");
        }
    }
    loadHeatmap();

    /* Export CSV */
    exportBtn.addEventListener("click",async()=>{
        try{
            const res=await fetch("/export-csv");
            const blob=await res.blob();
            const url=URL.createObjectURL(blob);
            const a=document.createElement("a"); a.href=url;
            a.download=`analytics-${new Date().toISOString().slice(0,10)}.csv`;
            a.click(); URL.revokeObjectURL(url);
        }catch(e){
            alert("error exporting");
        }
    });

    /* Page duration */
    const start=Date.now();
    setInterval(()=>{
        if(document.hidden)return;
        navigator.sendBeacon("/heartbeat", new Blob([JSON.stringify({page:window.location.pathname,duration:Date.now()-start})],{type:"application/json"}));
    },30000);
    window.addEventListener("beforeunload",()=>navigator.sendBeacon("/api/analytics/exit", new Blob([JSON.stringify({page:window.location.pathname,duration:Date.now()-start})],{type:"application/json"})));

})();
