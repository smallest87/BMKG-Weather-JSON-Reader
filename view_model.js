class WeatherViewModel {
    constructor() {
        this.viewMode = 'CARD'; // Default: 'CARD' atau 'LIST'
    }

    // Mengubah mode tampilan
    setViewMode(mode) {
        this.viewMode = mode;
    }

    // Fungsi utama untuk merender data
    render(containerId, data) {
        const mainContainer = document.getElementById(containerId);
        mainContainer.innerHTML = ''; // Bersihkan container utama
        mainContainer.className = ''; // Reset class container utama

        // 1. Kelompokkan Data Berdasarkan Tanggal
        const groupedData = this._groupByDate(data);

        // 2. Loop setiap tanggal (Group)
        Object.keys(groupedData).forEach(dateKey => {
            const forecasts = groupedData[dateKey];

            // A. Buat Wrapper per Tanggal
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';

            // B. Buat Header Tanggal
            const dateHeader = document.createElement('h3');
            dateHeader.className = 'date-header';
            dateHeader.innerText = dateKey; // Contoh: "Jumat, 05 Desember 2025"
            dateGroup.appendChild(dateHeader);

            // C. Buat Container Item (Grid atau List)
            const itemContainer = document.createElement('div');
            itemContainer.className = this.viewMode === 'CARD' ? 'forecast-grid' : 'forecast-list-container';

            // D. Isi Item ke dalam Container
            forecasts.forEach(item => {
                const htmlString = this.viewMode === 'CARD' 
                    ? this._getCardTemplate(item) 
                    : this._getListTemplate(item);
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlString.trim();
                itemContainer.appendChild(tempDiv.firstChild);
            });

            // E. Gabungkan
            dateGroup.appendChild(itemContainer);
            mainContainer.appendChild(dateGroup);
        });
    }

    // --- Helper: Grouping Logic ---
    _groupByDate(data) {
        return data.reduce((groups, item) => {
            const date = item.dateStr; // Menggunakan string tanggal yang sudah diformat
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(item);
            return groups;
        }, {});
    }

    // --- TEMPLATE 1: Tampilan KARTU (Card) ---
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

    // --- TEMPLATE 2: Tampilan DAFTAR (List) ---
    _getListTemplate(fc) {
        const weatherClass = this._getWeatherClass(fc.condition);
        const iconHtml = this._getIconHtml(fc);

        return `
        <div class="weather-list-item ${weatherClass}">
            <div class="list-left">
                <span class="list-time">${fc.timeStr}</span>
            </div>
            
            <div class="list-center">
                ${iconHtml}
                <div class="list-temp-group">
                    <span class="list-temp">${fc.temp}°C</span>
                    <span class="list-condition">${fc.condition}</span>
                </div>
            </div>
            
            <div class="list-right">
                <div class="list-stat">💧 ${fc.humidity}</div>
                <div class="list-stat">💨 ${fc.wind}</div>
                <div class="list-stat">👁️ ${fc.visibility}</div>
            </div>
        </div>`;
    }

    // --- Helpers (Private) ---
    _getIconHtml(fc) {
        if (fc.iconUrl) {
            return `<img src="${fc.iconUrl}" alt="${fc.condition}" class="weather-icon-img" onerror="this.style.display='none'">`;
        } else {
            return `<div class="weather-icon-display">${this._getEmojiIcon(fc.condition)}</div>`;
        }
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