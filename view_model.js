class WeatherViewModel {
    constructor() {
        this.viewMode = 'CARD';
        this.chartInstance = null; // Menyimpan instance chart aktif
    }

    setViewMode(mode) {
        this.viewMode = mode;
    }

    // UPDATE: Menerima parameter chartId
    render(containerId, chartId, data) {
        const mainContainer = document.getElementById(containerId);
        mainContainer.innerHTML = ''; 
        mainContainer.className = ''; 

        // 1. Render Grafik
        this.renderChart(chartId, data);

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

    // --- CHART LOGIC (BARU) ---
    renderChart(chartId, data) {
        const ctx = document.getElementById(chartId).getContext('2d');

        // Hancurkan chart lama jika ada agar tidak memory leak/glitch
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        // Siapkan Label (Tanggal + Jam) dan Data (Suhu)
        // Kita persingkat label agar grafik tidak penuh sesak
        const labels = data.map(d => {
            // Contoh format label: "05 Des 12:00"
            const shortDate = d.dateStr.split(',')[1].trim().split(' ').slice(0, 2).join(' ');
            return `${shortDate} ${d.timeStr}`;
        });
        
        const temps = data.map(d => d.temp);

        // Buat Chart Baru
        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Suhu (°C)',
                    data: temps,
                    borderColor: '#e67e22', // Warna Oranye
                    backgroundColor: 'rgba(230, 126, 34, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#e67e22',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.4, // Membuat garis melengkung halus (spline)
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { font: { family: "'Segoe UI', sans-serif" } }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { maxRotation: 45, minRotation: 45 }
                    },
                    y: {
                        beginAtZero: false, // Agar grafik lebih dinamis (fokus di range suhu)
                        grid: { borderDash: [2, 4] },
                        title: { display: true, text: 'Celcius' }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
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
            <div class="card-header">
                <span class="card-time">🕒 ${fc.timeStr} WIB</span>
            </div>
            <div class="main-weather">
                ${iconHtml}
                <div class="temp-display">${fc.temp}°C</div>
            </div>
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
            <div class="list-center">
                ${iconHtml}
                <div class="list-temp-group"><span class="list-temp">${fc.temp}°C</span><span class="list-condition">${fc.condition}</span></div>
            </div>
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