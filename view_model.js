class WeatherViewModel {
    constructor() {
        this.viewMode = 'CARD';
        this.chartInstance = null;
    }

    setViewMode(mode) {
        this.viewMode = mode;
    }

    render(containerId, chartId, data, metric = 'temp') {
        const mainContainer = document.getElementById(containerId);
        mainContainer.innerHTML = ''; 
        mainContainer.className = ''; 

        this.renderChart(chartId, data, metric);

        const groupedData = this._groupByDate(data);

        Object.keys(groupedData).forEach(dateKey => {
            const forecasts = groupedData[dateKey];
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';

            const dateHeader = document.createElement('h3');
            dateHeader.className = 'date-header';
            dateHeader.innerText = dateKey;
            dateGroup.appendChild(dateHeader);

            const itemContainer = document.createElement('div');
            itemContainer.className = this.viewMode === 'CARD' ? 'forecast-grid' : 'forecast-list-container';

            forecasts.forEach(item => {
                // --- UPDATE: Menambahkan onclick event ---
                // Kita encode objek item menjadi string JSON aman agar bisa dimasukkan ke HTML attribute
                const jsonString = encodeURIComponent(JSON.stringify(item));
                
                const htmlString = this.viewMode === 'CARD' 
                    ? this._getCardTemplate(item, jsonString) 
                    : this._getListTemplate(item, jsonString);
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlString.trim();
                itemContainer.appendChild(tempDiv.firstChild);
            });

            dateGroup.appendChild(itemContainer);
            mainContainer.appendChild(dateGroup);
        });
    }

    // --- TEMPLATE UPDATED WITH ONCLICK ---
    _getCardTemplate(fc, jsonString) {
        const weatherClass = this._getWeatherClass(fc.condition);
        const iconHtml = this._getIconHtml(fc);
        
        // Perhatikan penambahan onclick="broadcastData(...)" dan style cursor: pointer
        return `
        <div class="weather-card ${weatherClass}" style="cursor: pointer;" onclick="broadcastData('${jsonString}')">
            <div class="card-header"><span class="card-time">🕒 ${fc.timeStr} WIB</span></div>
            <div class="main-weather">${iconHtml}<div class="temp-display">${fc.temp}°C</div></div>
            <div class="condition-text">${fc.condition}</div>
            <div class="details-grid">
                <div class="detail-item"><span>Kelembapan</span>💧 ${fc.humidity}</div>
                <div class="detail-item"><span>Angin</span>💨 ${fc.wind}</div>
                <div class="detail-item"><span>Awan</span>☁️ ${fc.clouds}%</div>
                <div class="detail-item"><span>Jarak</span>👁️ ${fc.visibility}</div>
            </div>
        </div>`;
    }

    _getListTemplate(fc, jsonString) {
        const weatherClass = this._getWeatherClass(fc.condition);
        const iconHtml = this._getIconHtml(fc);
        
        return `
        <div class="weather-list-item ${weatherClass}" style="cursor: pointer;" onclick="broadcastData('${jsonString}')">
            <div class="list-left"><span class="list-time">${fc.timeStr}</span></div>
            <div class="list-center">${iconHtml}<div class="list-temp-group"><span class="list-temp">${fc.temp}°C</span><span class="list-condition">${fc.condition}</span></div></div>
            <div class="list-right">
                <div class="list-stat">💧 ${fc.humidity}</div>
                <div class="list-stat">💨 ${fc.wind}</div>
                <div class="list-stat">👁️ ${fc.visibility}</div>
            </div>
        </div>`;
    }

    // ... (Sisa metode di bawah ini SAMA PERSIS dengan sebelumnya, tidak perlu diubah) ...
    renderChart(chartId, data, metric) {
        // [PASTE KODE renderChart DARI JAWABAN SEBELUMNYA DI SINI]
        // Agar singkat, saya asumsikan Anda menyalin logika renderChart, _groupByDate, 
        // _getWeatherClass, dll dari file view_model.js terakhir.
        // Pastikan Anda menyalin semuanya agar tidak error.
        const ctx = document.getElementById(chartId).getContext('2d');
        if (this.chartInstance) { this.chartInstance.destroy(); }
        const labels = data.map(d => {
            const shortDate = d.dateStr.split(',')[1].trim().split(' ').slice(0, 2).join(' ');
            return `${shortDate} ${d.timeStr}`;
        });
        const pointColors = data.map(d => this._getWeatherColor(d.condition));
        const hasTempMinMax = data.length > 0 && data[0].raw.temp_min !== undefined && data[0].raw.temp_min !== data[0].raw.temp_max;
        const hasHumidMinMax = data.length > 0 && data[0].raw.humidity_min !== undefined && data[0].raw.humidity_min !== data[0].raw.humidity_max;
        let datasets = [];
        if (metric === 'temp' && hasTempMinMax) {
            datasets = [
                { label: 'Suhu Max (°C)', data: data.map(d => d.raw.temp_max), borderColor: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.1)', borderWidth: 2, pointBackgroundColor: pointColors, pointBorderColor: '#fff', pointRadius: 5, tension: 0.4, fill: false },
                { label: 'Suhu Min (°C)', data: data.map(d => d.raw.temp_min), borderColor: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.1)', borderWidth: 2, pointBackgroundColor: pointColors, pointBorderColor: '#fff', pointRadius: 5, tension: 0.4, fill: false }
            ];
        } else if (metric === 'humidity' && hasHumidMinMax) {
            datasets = [
                { label: 'Kelembapan Max (%)', data: data.map(d => d.raw.humidity_max), borderColor: '#2980b9', backgroundColor: 'rgba(41, 128, 185, 0.1)', borderWidth: 2, pointBackgroundColor: pointColors, pointBorderColor: '#fff', pointRadius: 5, tension: 0.4, fill: false },
                { label: 'Kelembapan Min (%)', data: data.map(d => d.raw.humidity_min), borderColor: '#1abc9c', backgroundColor: 'rgba(26, 188, 156, 0.1)', borderWidth: 2, pointBackgroundColor: pointColors, pointBorderColor: '#fff', pointRadius: 5, tension: 0.4, fill: false }
            ];
        } else {
            const metricsConfig = { 'temp': { label: 'Suhu (°C)', color: '#e67e22', bg: 'rgba(230, 126, 34, 0.1)', key: 'temp' }, 'humidity': { label: 'Kelembapan (%)', color: '#3498db', bg: 'rgba(52, 152, 219, 0.1)', key: 'humidity' }, 'wind': { label: 'Kecepatan Angin (m/s)', color: '#27ae60', bg: 'rgba(39, 174, 96, 0.1)', key: 'wind' }, 'clouds': { label: 'Tutupan Awan (%)', color: '#95a5a6', bg: 'rgba(149, 165, 166, 0.1)', key: 'clouds' }, 'visibility': { label: 'Visibilitas (km)', color: '#9b59b6', bg: 'rgba(155, 89, 182, 0.1)', key: 'visibility' } };
            const config = metricsConfig[metric] || metricsConfig['temp'];
            const datasetData = data.map(d => { let val = d.raw[config.key]; if (metric === 'visibility' && val > 100) val = val / 1000; return val; });
            datasets = [{ label: config.label, data: datasetData, borderColor: config.color, backgroundColor: config.bg, borderWidth: 2, pointBackgroundColor: pointColors, pointBorderColor: '#fff', pointRadius: 5, pointHoverRadius: 7, tension: 0.4, fill: true }];
        }
        const predictionAreaPlugin = {
            id: 'predictionArea',
            beforeDraw: (chart) => {
                const { ctx, chartArea: { top, bottom, right, height }, scales: { x } } = chart;
                if (data.length === 0) return;
                const baseDateStr = new Date(data[0].rawDate).toDateString();
                let startPixel = null;
                const meta = chart.getDatasetMeta(0);
                for (let i = 1; i < data.length; i++) {
                    const currentDateStr = new Date(data[i].rawDate).toDateString();
                    if (currentDateStr !== baseDateStr) {
                        if(meta.data[i-1] && meta.data[i]) { const prevX = meta.data[i-1].x; const currX = meta.data[i].x; startPixel = (prevX + currX) / 2; }
                        break;
                    }
                }
                if (startPixel !== null) {
                    ctx.save(); ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'; ctx.fillRect(startPixel, top, right - startPixel, height); ctx.beginPath(); ctx.moveTo(startPixel, top); ctx.lineTo(startPixel, bottom); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.font = 'bold 12px "Segoe UI", sans-serif'; ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.textAlign = 'left'; ctx.fillText("PREDIKSI", startPixel + 10, top + 20); ctx.restore();
                }
            }
        };
        this.chartInstance = new Chart(ctx, { type: 'line', data: { labels: labels, datasets: datasets }, plugins: [predictionAreaPlugin], options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { family: "'Segoe UI', sans-serif" } } }, tooltip: { mode: 'index', intersect: false, callbacks: { afterLabel: function(context) { const index = context.dataIndex; return 'Kondisi: ' + data[index].condition; } } } }, scales: { x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45 } }, y: { beginAtZero: false, grid: { borderDash: [2, 4] } } }, interaction: { mode: 'nearest', axis: 'x', intersect: false } } });
    }
    _groupByDate(data) { return data.reduce((groups, item) => { const date = item.dateStr; if (!groups[date]) groups[date] = []; groups[date].push(item); return groups; }, {}); }
    _getIconHtml(fc) { if (fc.iconUrl) return `<img src="${fc.iconUrl}" alt="${fc.condition}" class="weather-icon-img" onerror="this.style.display='none'">`; else return `<div class="weather-icon-display">${this._getEmojiIcon(fc.condition)}</div>`; }
    _getWeatherClass(condition) { if (!condition) return 'cloudy'; const c = String(condition).toLowerCase(); if (c.includes('hujan')) return 'rain'; if (c.includes('petir')) return 'thunder'; if (c.includes('berawan')) return 'cloudy'; if (c.includes('cerah berawan')) return 'sunny'; if (c.includes('cerah')) return 'clear'; if (c.includes('kabut') || c.includes('asap')) return 'fog'; return 'cloudy'; }
    _getWeatherColor(condition) { if (!condition) return '#bdc3c7'; const c = String(condition).toLowerCase(); if (c.includes('hujan')) return '#3498db'; if (c.includes('petir')) return '#8e44ad'; if (c.includes('berawan')) return '#95a5a6'; if (c.includes('cerah berawan')) return '#f1c40f'; if (c.includes('cerah')) return '#f39c12'; if (c.includes('kabut') || c.includes('asap')) return '#bdc3c7'; return '#95a5a6'; }
    _getEmojiIcon(condition) { if (!condition) return '❓'; const c = String(condition).toLowerCase(); if (c.includes('hujan')) return '🌧️'; if (c.includes('berawan')) return '☁️'; if (c.includes('cerah')) return '☀️'; if (c.includes('kabut') || c.includes('asap') || c.includes('kabur')) return '🌫️'; if (c.includes('petir')) return '⚡'; return '🌤️'; }
}