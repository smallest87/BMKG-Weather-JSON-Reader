let weatherData = [];

// Listener Upload File
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            weatherData = JSON.parse(e.target.result);
            initDashboard();
        } catch (error) {
            alert("Gagal membaca file JSON. Pastikan format file benar.");
            console.error(error);
        }
    };
    reader.readAsText(file);
});

// Inisialisasi Dashboard
function initDashboard() {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    const select = document.getElementById('regionSelect');
    select.innerHTML = '<option value="">-- Pilih Desa --</option>';

    // Urutkan berdasarkan nama desa
    weatherData.sort((a, b) => a.wilayah.localeCompare(b.wilayah));

    weatherData.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = item.wilayah; // Nama Desa
        select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
        const titleElement = document.getElementById('mainTitle');
        if(e.target.value !== "") {
            renderRegion(weatherData[e.target.value]);
        } else {
            titleElement.innerText = '🌤️ Cuaca Desa';
            document.getElementById('regionInfo').style.display = 'none';
            document.getElementById('forecastGrid').innerHTML = '';
        }
    });

    // Otomatis pilih data pertama
    if(weatherData.length > 0) {
        select.value = 0;
        renderRegion(weatherData[0]);
    }
}

// Fungsi Render Utama
function renderRegion(data) {
    const regionInfo = document.getElementById('regionInfo');
    const forecastGrid = document.getElementById('forecastGrid');
    const titleElement = document.getElementById('mainTitle');

    // 1. Update Judul & Info Wilayah
    titleElement.innerText = `🌤️ Cuaca Desa ${data.administrasi.desa}`;
    
    regionInfo.style.display = 'block';
    regionInfo.innerHTML = `
        <h2>📍 ${data.administrasi.desa}</h2>
        <div class="region-breadcrumbs">
            Kec. ${data.administrasi.kecamatan} &bull; ${data.administrasi.kotkab} &bull; ${data.administrasi.provinsi}
        </div>
        <div class="region-meta">
            <div><strong>Lat/Lon:</strong> ${data.administrasi.lat}, ${data.administrasi.lon}</div>
            <div><strong>Zona:</strong> ${data.administrasi.timezone}</div>
        </div>
    `;

    // 2. Flatten Data Prakiraan
    let flatForecasts = [];
    
    if (Array.isArray(data.prakiraan)) {
        data.prakiraan.forEach(chunk => {
            Object.values(chunk).forEach(forecast => {
                flatForecasts.push(forecast);
            });
        });
    }

    // Urutkan berdasarkan waktu lokal
    flatForecasts.sort((a, b) => new Date(a.local_datetime) - new Date(b.local_datetime));

    // 3. Render Kartu
    forecastGrid.innerHTML = '';

    flatForecasts.forEach(forecast => {
        const card = document.createElement('div');
        
        // --- UPDATE: Menambahkan class dinamis berdasarkan cuaca ---
        const weatherClass = getWeatherClass(forecast.weather_desc);
        card.className = `weather-card ${weatherClass}`;

        // Format Waktu
        const dateObj = new Date(forecast.local_datetime);
        const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
        const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        // URL Icon dari JSON
        const iconUrl = forecast.image; 

        card.innerHTML = `
            <div class="card-header">
                <span class="card-date">${dateStr}</span>
                <span class="card-time">🕒 ${timeStr} WIB</span>
            </div>
            
            <div class="main-weather">
                <img src="${iconUrl}" alt="${forecast.weather_desc}" class="weather-icon-img" onerror="this.style.display='none'">
                <div class="temp-display">${forecast.t}°C</div>
            </div>
            
            <div class="condition-text">${forecast.weather_desc}</div>
            
            <div class="details-grid">
                <div class="detail-item">
                    <span>Kelembapan</span>
                    💧 ${forecast.hu}%
                </div>
                <div class="detail-item">
                    <span>Angin</span>
                    💨 ${forecast.ws} m/s (${forecast.wd})
                </div>
                <div class="detail-item">
                    <span>Tutupan Awan</span>
                    ☁️ ${forecast.tcc}%
                </div>
                <div class="detail-item">
                    <span>Jarak Pandang</span>
                    👁️ ${forecast.vs_text}
                </div>
            </div>
        `;
        forecastGrid.appendChild(card);
    });
}

// Helper: Menentukan Class CSS untuk Warna Border
function getWeatherClass(condition) {
    if (!condition) return 'cloudy'; // fallback
    const c = condition.toLowerCase();

    if (c.includes('hujan')) return 'rain';
    if (c.includes('petir')) return 'thunder';
    if (c.includes('berawan')) return 'cloudy';
    if (c.includes('cerah berawan')) return 'sunny'; // Cerah berawan bisa pakai kuning/oranye
    if (c.includes('cerah')) return 'clear';
    if (c.includes('kabut') || c.includes('asap')) return 'fog';
    
    return 'cloudy'; // default
}