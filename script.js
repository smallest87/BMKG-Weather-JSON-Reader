// Variabel global untuk menyimpan data cuaca
let weatherData = [];

// Event Listener saat file dipilih
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            weatherData = JSON.parse(e.target.result);
            initDashboard();
        } catch (error) {
            alert("Error: File JSON tidak valid atau format salah.");
            console.error(error);
        }
    };
    reader.readAsText(file);
});

// Fungsi inisialisasi dashboard setelah data dimuat
function initDashboard() {
    // Sembunyikan upload, tampilkan dashboard
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    // Populasi Dropdown
    const select = document.getElementById('regionSelect');
    select.innerHTML = '<option value="">-- Pilih Kecamatan/Wilayah --</option>';
    
    // Urutkan wilayah secara alfabetis (A-Z)
    weatherData.sort((a, b) => a.wilayah.localeCompare(b.wilayah));

    // Masukkan opsi ke dropdown
    weatherData.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = item.wilayah;
        select.appendChild(option);
    });

    // Event saat dropdown berubah
    select.addEventListener('change', (e) => {
        const titleElement = document.getElementById('mainTitle');
        
        if(e.target.value !== "") {
            // Render data jika wilayah dipilih
            renderRegion(weatherData[e.target.value]);
        } else {
            // Reset tampilan jika memilih default
            titleElement.innerText = '🌤️ Prakiraan Cuaca Kab. Malang';
            document.getElementById('regionInfo').style.display = 'none';
            document.getElementById('forecastGrid').innerHTML = '';
        }
    });

    // Otomatis pilih wilayah pertama saat load
    if(weatherData.length > 0) {
        select.value = 0;
        renderRegion(weatherData[0]);
    }
}

// Fungsi untuk merender detail wilayah dan kartu cuaca
function renderRegion(data) {
    const regionInfo = document.getElementById('regionInfo');
    const forecastGrid = document.getElementById('forecastGrid');
    const titleElement = document.getElementById('mainTitle');
    
    // Update Judul Utama sesuai wilayah
    titleElement.innerText = `🌤️ Prakiraan Cuaca ${data.wilayah}`;

    // Tampilkan Info Wilayah (Header Biru)
    regionInfo.style.display = 'block';
    regionInfo.innerHTML = `
        <h2>📍 ${data.wilayah}</h2>
        <div class="region-meta">
            <div>Kecamatan: ${data.administrasi.kecamatan}</div>
            <div>Koordinat: ${data.administrasi.lat}, ${data.administrasi.lon}</div>
            <div>Zona Waktu: ${data.administrasi.timezone}</div>
        </div>
    `;

    // Kosongkan Grid sebelum mengisi baru
    forecastGrid.innerHTML = '';
    
    // Loop setiap data prakiraan
    data.prakiraan.forEach(forecast => {
        const card = document.createElement('div');
        // Tambahkan class CSS dinamis berdasarkan kondisi
        card.className = `weather-card ${getWeatherClass(forecast.kondisi)}`;
        
        // Format Tanggal dan Waktu
        const dateObj = new Date(forecast.waktu_lokal);
        const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
        const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        // Pilih Ikon
        const icon = getWeatherIcon(forecast.kondisi);

        // Isi HTML Kartu
        card.innerHTML = `
            <div class="card-header">
                <span class="card-date">${dateStr}</span>
                <span class="card-time">🕒 ${timeStr} WIB</span>
            </div>
            
            <div class="main-weather">
                <div class="weather-icon">${icon}</div>
                <div class="temp-display">${forecast.suhu_max}°C</div>
            </div>
            
            <div class="condition-text">${forecast.kondisi}</div>
            
            <div class="details-grid">
                <div class="detail-item">
                    <span>Suhu Min</span>
                    ${forecast.suhu_min}°C
                </div>
                <div class="detail-item">
                    <span>Kelembapan</span>
                    ${forecast.kelembapan_min}% - ${forecast.kelembapan_max}%
                </div>
                <div class="detail-item">
                    <span>Angin</span>
                    ${forecast.arah_angin} (${forecast.kecepatan_angin} km/j)
                </div>
                <div class="detail-item">
                    <span>Visibilitas</span>
                    ${(forecast.vs / 1000).toFixed(1)} km
                </div>
            </div>
        `;
        forecastGrid.appendChild(card);
    });
}

// Helper: Mendapatkan Ikon Emoji berdasarkan teks kondisi
function getWeatherIcon(condition) {
    const c = condition.toLowerCase();
    if (c.includes('hujan')) return '🌧️';
    if (c.includes('berawan')) return '☁️';
    if (c.includes('cerah')) return '☀️';
    if (c.includes('kabut') || c.includes('asap') || c.includes('kabur')) return '🌫️';
    if (c.includes('petir')) return '⚡';
    return '🌤️';
}

// Helper: Mendapatkan Class CSS untuk warna border kiri kartu
function getWeatherClass(condition) {
    const c = condition.toLowerCase();
    if (c.includes('hujan')) return 'rain';
    if (c.includes('berawan')) return 'cloudy';
    if (c.includes('kabut')) return 'cloudy';
    return 'clear';
}