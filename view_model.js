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

        // 1. Render Grafik
        this.renderChart(chartId, data, metric);

        // 2. Render List/Grid (Grouping Tanggal)
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
                const htmlString = this.viewMode === 'CARD' 
                    ? this._getCardTemplate(item) 
                    : this._getListTemplate(item);
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlString.trim();
                itemContainer.appendChild(tempDiv.firstChild);
            });

            dateGroup.appendChild(itemContainer);
            mainContainer.appendChild(dateGroup);
        });
    }

    // --- CHART LOGIC UPDATED ---
    renderChart(chartId, data, metric) {
        const ctx = document.getElementById(chartId).getContext('2d');

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const labels = data.map(d => {
            const shortDate = d.dateStr.split(',')[1].trim().split(' ').slice(0, 2).join(' ');
            return `${shortDate} ${d.timeStr}`;
        });

        // Cek apakah data ini punya Min & Max (biasanya data Kecamatan)
        // Data Desa biasanya hanya per jam (satu suhu), jadi temp_min undefined atau sama dengan temp_max
        const hasMinMax = data.length > 0 && 
                          data[0].raw.temp_min !== undefined && 
                          data[0].raw.temp_max !== undefined &&
                          data[0].raw.temp_min !== data[0].raw.temp_max; // Pastikan beda

        let datasets = [];

        // Logika Khusus untuk SUHU dengan Min/Max
        if (metric === 'temp' && hasMinMax) {
            const maxTemps = data.map(d => d.raw.temp_max);
            const minTemps = data.map(d => d.raw.temp_min);

            datasets = [
                {
                    label: 'Suhu Max (°C)',
                    data: maxTemps,
                    borderColor: '#e74c3c', // Merah
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#e74c3c',
                    pointRadius: 4,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Suhu Min (°C)',
                    data: minTemps,
                    borderColor: '#3498db', // Biru
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#3498db',
                    pointRadius: 4,
                    tension: 0.4,
                    fill: false
                }
            ];
        } else {
            // Logika Standard (Satu Garis)
            const metricsConfig = {
                'temp': { label: 'Suhu (°C)', color: '#e67e22', bg: 'rgba(230, 126, 34, 0.1)', key: 'temp' },
                'humidity': { label: 'Kelembapan (%)', color: '#3498db', bg: 'rgba(52, 152, 219, 0.1)', key: 'humidity' },
                'wind': { label: 'Kecepatan Angin (m/s)', color: '#27ae60', bg: 'rgba(39, 174, 96, 0.1)', key: 'wind' },
                'clouds': { label: 'Tutupan Awan (%)', color: '#95a5a6', bg: 'rgba(149, 165, 166, 0.1)', key: 'clouds' },
                'visibility': { label: 'Visibilitas (km)', color: '#9b59b6', bg: 'rgba(155, 89, 182, 0.1)', key: 'visibility' }
            };

            const config = metricsConfig[metric] || metricsConfig['temp'];
            
            const datasetData = data.map(d => {
                let val = d.raw[config.key];
                if (metric === 'visibility' && val > 100) val = val / 1000; 
                return val;
            });

            datasets = [{
                label: config.label,
                data: datasetData,
                borderColor: config.color,
                backgroundColor: config.bg,
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: config.color,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.4,
                fill: true
            }];
        }

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { family: "'Segoe UI', sans-serif" } } },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45 } },
                    y: { beginAtZero: false, grid: { borderDash: [2, 4] } }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });
    }

    _groupByDate(data) {
        return data.reduce((groups, item) => {
            const date = item.dateStr;
            if (!groups[date]) groups[date] = [];
            groups[date].push(item);
            return groups;
        }, {});
    }

    _getCardTemplate(fc) {
        const weatherClass = this._getWeatherClass(fc.condition);
        const iconHtml = this._getIconHtml(fc);
        return `
        <div class="weather-card ${weatherClass}">
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

    _getListTemplate(fc) {
        const weatherClass = this._getWeatherClass(fc.condition);
        const iconHtml = this._getIconHtml(fc);
        return `
        <div class="weather-list-item ${weatherClass}">
            <div class="list-left"><span class="list-time">${fc.timeStr}</span></div>
            <div class="list-center">${iconHtml}<div class="list-temp-group"><span class="list-temp">${fc.temp}°C</span><span class="list-condition">${fc.condition}</span></div></div>
            <div class="list-right">
                <div class="list-stat">💧 ${fc.humidity}</div>
                <div class="list-stat">💨 ${fc.wind}</div>
                <div class="list-stat">👁️ ${fc.visibility}</div>
            </div>
        </div>`;
    }

    _getIconHtml(fc) {
        if (fc.iconUrl) return `<img src="${fc.iconUrl}" alt="${fc.condition}" class="weather-icon-img" onerror="this.style.display='none'">`;
        else return `<div class="weather-icon-display">${this._getEmojiIcon(fc.condition)}</div>`;
    }

    _getWeatherClass(condition) {
        if (!condition) return 'cloudy';
        const c = String(condition).toLowerCase();
        if (c.includes('hujan')) return 'rain';
        if (c.includes('petir')) return 'thunder';
        if (c.includes('berawan')) return 'cloudy';
        if (c.includes('cerah berawan')) return 'sunny'; 
        if (c.includes('cerah')) return 'clear';
        if (c.includes('kabut') || c.includes('asap')) return 'fog';
        return 'cloudy';
    }

    _getEmojiIcon(condition) {
        if (!condition) return '❓';
        const c = String(condition).toLowerCase();
        if (c.includes('hujan')) return '🌧️';
        if (c.includes('berawan')) return '☁️';
        if (c.includes('cerah')) return '☀️';
        if (c.includes('kabut') || c.includes('asap') || c.includes('kabur')) return '🌫️';
        if (c.includes('petir')) return '⚡';
        return '🌤️';
    }
}