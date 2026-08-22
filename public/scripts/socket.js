(function () {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    const feedEl = document.getElementById('feed');
    const onlineUsersEl = document.getElementById('onlineUsers');
    const onlineCountEl = document.getElementById('onlineCount');
    const exportBtn = document.getElementById('exportCsv');

    function setAvatarFallback(img) {
        img.onerror = () => {
            img.src = "/images/avatar.png";
        };
    }

    function addToFeed(act) {
        const div = document.createElement('div');
        div.className = 'feed-item';

        const time = new Date(act.timestamp).toLocaleTimeString();

        div.innerHTML = `
            <div class="left">
                <img class="avatar-img" src="${act.avatar}">
            </div>

            <div class="body">
                <strong>${act.userName}</strong>
                <small>${act.activityType}</small>
                <div class="details">${act.details || act.url}</div>
            </div>

            <div class="time">${time}</div>
        `;

        const img = div.querySelector(".avatar-img");
        setAvatarFallback(img);

        feedEl.prepend(div);
        if (feedEl.children.length > 80) feedEl.removeChild(feedEl.lastChild);
    }

    ws.onopen = () => console.log('WS connected');
    ws.onclose = () => console.log('WS disconnected');
    ws.onerror = (e) => console.error('WS error', e);

    ws.onmessage = (evt) => {
        try {
            const msg = JSON.parse(evt.data);
            if (!msg || !msg.type) return;

            if (msg.type === 'newActivity') {
                addToFeed(msg.data);
            } else if (msg.type === 'onlineUsers') {
                const users = msg.data || [];
                onlineCountEl.textContent = users.length;
                onlineUsersEl.innerHTML = users.map(u => `
          <div class="online-item">
            <div class="flag">${u.flag || '🌍'}</div>
            <div class="info">
              <div class="name">${u.user_name || u.userName}</div>
              <div class="meta">${u.city || ''} ${u.country || ''}</div>
            </div>
            <div class="page">${(u.current_page || u.currentPage || '').slice(0, 40)}</div>
          </div>
        `).join('');
            }
        } catch (err) {
            alert('WS parse error');
        }
    };

    // Heatmap chart
    const ctx = document.getElementById('heatmapChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Page Views', data: [] }] },
        options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } }
    });

    function loadHeatmap() {
        fetch('/api/analytics/heatmap').then(r => r.json()).then(data => {
            chart.data.labels = data.map(x => x.page);
            chart.data.datasets[0].data = data.map(x => x.count);
            chart.update();
        }).catch(
            alert("error")
        );
    }
    loadHeatmap();

    exportBtn.onclick = () => {
        fetch('/api/analytics/export-csv').then(r => r.blob()).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    // Heartbeat for page durations (optional)
    let start = Date.now();
    setInterval(() => {
        if (document.hidden) return;
        fetch('/api/analytics/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page: window.location.pathname, duration: Date.now() - start })
        }).catch(() => { });
    }, 30000);

    window.addEventListener('beforeunload', () => {
        const data = JSON.stringify({
            page: window.location.pathname,
            duration: Date.now() - start
        });
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/exit', blob);
    });

})();