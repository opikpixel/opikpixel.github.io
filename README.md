# Lutfi Alhamsyah (Opikz) — Portfolio

Website portofolio pribadi Lutfi Alhamsyah, mahasiswa Informatika UIN Sunan Gunung Djati Bandung. Situs ini menampilkan profil, minat di bidang project management, dokumentasi kegiatan, keterampilan, serta tautan CV dan media sosial.

🌐 **Website:** https://opikpixel.github.io

## Fitur

- Desain responsif dengan tema gelap bernuansa *moonlit owl forest* dan efek glassmorphism.
- Navigasi ke bagian Home, Identitas, Arsip, dan Skills.
- Hero section berisi profil, deskripsi, motto, CV, dan tautan media sosial.
- Carousel sorotan kegiatan yang dapat dijeda.
- Animasi dan efek interaktif, termasuk parallax, indikator progres scroll, dan latar partikel WebGL.
- Penghormatan terhadap preferensi `prefers-reduced-motion` pada sejumlah animasi.

## Teknologi

- HTML, CSS, dan JavaScript dalam satu halaman (`index.html`).
- [Tailwind CSS](https://tailwindcss.com/) melalui CDN.
- [Phosphor Icons](https://phosphoricons.com/), GSAP/ScrollTrigger, dan Three.js melalui CDN.
- Google Fonts: Space Grotesk, Plus Jakarta Sans, dan JetBrains Mono.

Tidak diperlukan proses build atau instalasi package untuk menjalankan situs ini. Koneksi internet diperlukan untuk memuat library, ikon, dan font dari CDN.

## Menjalankan secara lokal

1. Clone repository:

   ```bash
   git clone https://github.com/opikpixel/opikpixel.github.io.git
   cd opikpixel.github.io
   ```

2. Buka `index.html` di browser. Untuk pengalaman yang lebih konsisten, jalankan server lokal sederhana, misalnya:

   ```bash
   python -m http.server 8000
   ```

3. Buka http://localhost:8000.

## Struktur repository

```text
.
├── index.html       # Halaman portofolio, termasuk CSS dan JavaScript
├── FotoProfile.png  # Foto profil
├── kegiatan*.jpg    # Foto dokumentasi kegiatan
└── README.md
```

## Kustomisasi

Konten utama dan gaya situs berada di `index.html`:

- Ubah nama, bio, motto, CV, dan tautan media sosial pada bagian hero.
- Ganti `FotoProfile.png` untuk memperbarui foto profil.
- Perbarui judul, deskripsi, dan sumber gambar pada kartu kegiatan/carousel. Pastikan nama file gambar yang dirujuk tersedia di root repository; kode carousel saat ini juga merujuk `kegiatan19.jpg`.
- Sesuaikan daftar keterampilan dan bagian lain langsung pada markup HTML.

## Deployment

Repository ini menggunakan nama `opikpixel.github.io`, sehingga dapat dipublikasikan melalui GitHub Pages sebagai situs pengguna. Pastikan GitHub Pages diaktifkan pada repository dan sumber deployment menunjuk ke branch serta direktori yang berisi `index.html` (umumnya root branch `main`). Setelah perubahan dipush, tunggu proses deployment selesai lalu kunjungi https://opikpixel.github.io.

## Lisensi

Belum ada file lisensi di repository ini. Hubungi pemilik repository sebelum menggunakan kembali konten, foto, atau asetnya.
