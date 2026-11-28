# Lutfi Alhamsyah (Opik) — Portfolio v4.0

Website portofolio resmi **Lutfi Alhamsyah** (`opikpixel` / `kropik`), mahasiswa S1 Teknik Informatika UIN Sunan Gunung Djati Bandung & Co-Lead GemiDjati. Dirancang dengan sistem desain **The Tactical Catalyst — Kingfisher** yang bersih, terstruktur, dan responsif dalam mode **Dark (Deep River)** maupun **Light (Crystal Stream)**.

🌐 **Live Website:** [https://opikpixel.github.io](https://opikpixel.github.io)

---

## ✨ Fitur Utama (v4.0)

- **Clean Architectural UI/UX & Dual Theme (`Light` / `Dark`):**
  - Transisi mulus tanpa *flash* (Zero-FOUC) antara **Deep River Dark** (`#041524` / `#0A253D`) dan **Crystal Stream Light** (`#F4F8FB` / `#FFFFFF`), lengkap dengan pintasan keyboard `T`.
  - Latar atmosfer murni sesuai identitas brand **Kingfisher** (vektor aerodinamis 45°, gradasi sungai dalam, dan kristal *low-poly* tanpa elemen pengganggu), ditambah tombol **Mode Fokus Bersih** untuk menjeda partikel 3D.
- **Sinkronisasi Penuh Master CV & Portofolio:**
  - **88 Rekam Jejak CV Terverifikasi** (15 Prestasi & Juara, 14 Proyek & Karya, 11 Organisasi, 34 Kepanitiaan, 12 Sertifikasi & Tes, 2 Wirausaha) tersinkronisasi di `data/portfolio.json`.
  - **22 Sorotan Dokumentasi Visual** termasuk proyek terbaru *AI Academic Advisor Agent*, dilengkapi filter kategori dan modal cerita lengkap.
- **Widget Interaktif:**
  - **Command Palette (`⌘K` / `Ctrl+K`):** Pencarian cepat lintas 88 rekam jejak, proyek IT, navigasi halaman, dan aksi instan.
  - **Live GitHub Pulse (`@opikpixel`):** Widget telemetri langsung ke GitHub REST API dengan *fallback* lokal instan.
  - **Orix Kingfisher Studio (3 Mode):** Beralih antara *Live Vector Rig* interaktif (pelacakan kursor 3D, *Strike 45°*, *Overdrive*, *HUD Scan*), *3D Blender Cycles Render*, dan *Geometric Brand Mark*, beserta inspektor 7 token warna resmi Kingfisher.
  - **Workstation & System Setup Inspector:** Spesifikasi *daily driver* Dual-Boot Linux Mint Cinnamon + Windows 11, *stack* AI/ML, dan PKM.
  - **Quick Collaboration Brief:** Generator pesan kolaborasi siap salin dalam 1 klik.
  - **Live Edit Mode (`Ctrl+E`):** Ubah teks dan level keahlian langsung dari browser lalu unduh HTML/JSON.
- **GitHub Actions CI (`.github/workflows/ci.yml`):**
  - Pemeriksaan otomatis sintaks JavaScript, struktur SEO HTML, konsistensi token Light/Dark, sinkronisasi JSON CV, serta validasi *magic bytes* seluruh aset gambar lokal pada setiap *push* dan *Pull Request*.

---

## 🗂️ Struktur Direktori

```text
.
├── .github/workflows/ci.yml      # Pipeline GitHub Actions CI & audit kualitas otomatis
├── assets/
│   ├── css/styles.css            # Sistem Desain Murni Kingfisher (Dark & Light Tokens)
│   ├── js/portfolio-data.js      # Seed data tersinkronisasi (mendukung protokol file:// & HTTPS)
│   ├── js/app.js                 # Engine modular UI, Theme, Command Palette, GitHub API & WebGL
│   └── logo-kingfisher.png       # Logo geometris vektor Kingfisher
├── data/
│   └── portfolio.json            # Master data JSON (88 rekam jejak CV + 22 sorotan + proyek)
├── scripts/
│   └── validate-portfolio.mjs    # Skrip validator integritas UI, data, dan aset biner
├── index.html                    # Halaman utama portofolio semantik
├── favicon.svg                   # Emblem SVG Orix Kingfisher
├── FotoProfile.png               # Foto profil utama
├── Maskot_Orix.jpeg              # Render 3D Cycles Orix The Tactical Kingfisher
├── kegiatan*.jpg                 # Dokumentasi foto kegiatan asli
└── README.md
```

---

## 🚀 Menjalankan & Memvalidasi Secara Lokal

1. Jalankan validator kualitas & integritas aset:
   ```bash
   node scripts/validate-portfolio.mjs
   ```

2. Jalankan server pengembangan lokal:
   ```bash
   python3 -m http.server 8000
   ```
   Lalu buka `http://localhost:8000`.
