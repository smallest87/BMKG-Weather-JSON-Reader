class WeatherViewModel {
    constructor() {
        this.viewMode = 'CARD'; // Default: 'CARD' atau 'LIST'
    }

    // Mengubah mode tampilan
    setViewMode(mode) {
        this.viewMode = mode;
    }

    // Fungsi utama untuk merender data ke container
    render(containerId, data) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Bersihkan container

        // Ubah class container agar CSS Grid/Flex menyesuaikan
        container.className = this.viewMode === 'CARD' ? 'forecast-grid' : 'forecast-list-container';

        data.forEach(item => {
            const htmlString = this.viewMode === 'CARD' 
                ? this._getCardTemplate(item) 
                : this._getListTemplate(item);
            
            // Konversi string HTML menjadi elemen DOM
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString.trim();
            container.appendChild(tempDiv.firstChild);
        });
    }

    // --- TEMPLATE 1: Tampilan KARTU (Card) ---
    _getCardTemplate(fc) {
        const weatherClass = this._getWeatherClass(fc.condition);
        const iconHtml = this._getIconHtml(fc);

        return `
        <div class="weather-card ${weatherClass}">
            <div class="card-header">
                <span class="card-date">${fc.dateStr}</span>
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
                <span class="list-date">${fc.dateStr}</span>
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