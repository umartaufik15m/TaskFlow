# PRD — Taskflow Personal Command Center

**Versi:** 2.0  
**Status:** Personal MVP  
**Pemakai utama:** Satu orang / pemilik aplikasi

## 1. Ringkasan

Taskflow adalah personal command center untuk mencatat apa yang perlu dikerjakan, apa yang ingin dicapai, hal yang tidak boleh terlupakan, dan kondisi uang pribadi. Produk sengaja dibuat kecil. Taskflow bukan aplikasi tim, bukan SaaS, dan bukan aplikasi akuntansi.

Produk hanya memiliki lima ruang:

1. **Home** — keputusan penting hari ini.
2. **Tasks** — semua hal yang mau dikerjakan.
3. **Goals** — target jangka menengah dan target tabungan.
4. **Notes** — catatan bebas tanpa struktur wajib.
5. **Money** — rekening, transaksi, anggaran, dan hutang.

## 2. Masalah yang diselesaikan

- Tugas tersebar dan tidak jelas mana yang perlu dikerjakan sekarang.
- Target besar tercampur dengan task harian.
- Ide dan informasi bebas dipaksa menjadi task.
- Catatan uang, anggaran, dan hutang berada di tempat berbeda.
- Terlalu banyak halaman dengan fungsi serupa membuat aplikasi pribadi terasa berat.

## 3. Prinsip produk

- **Personal first:** hanya kebutuhan pemilik aplikasi yang masuk scope.
- **Satu objek, satu rumah:** task di Tasks, target di Goals, catatan di Notes, uang di Money.
- **Capture cepat:** satu tombol `+ Tambah` dapat membuat semua objek utama.
- **Home bukan gudang fitur:** Home hanya menampilkan ringkasan untuk mengambil keputusan.
- **Sedikit tetapi tuntas:** fitur kecil harus bekerja konsisten sebelum fitur baru ditambah.
- **Visual kuat, penggunaan tetap tenang:** hijau dan pink memberi karakter, tetapi teks dan aksi harus tetap jelas.

## 4. Informasi arsitektur produk

| Menu | Isi | Tidak boleh berisi |
|---|---|---|
| Home | Top 3, deadline, progres target, saldo/cashflow/hutang | Form panjang, semua task, semua transaksi |
| Tasks | Form task, List, Calendar, filter status, timer fokus | Target jangka panjang, catatan bebas |
| Goals | Target hidup, progres, target tabungan | Task harian, anggaran bulanan |
| Notes | Catatan bebas, pin, pencarian | Status pekerjaan, nominal transaksi |
| Money | Rekening, transaksi, anggaran, hutang | Target tabungan, task |

## 5. Perubahan dari versi sebelumnya

- Dashboard dan Today digabung menjadi **Home**.
- Planner dan Work Board digabung menjadi **Tasks**.
- Calendar menjadi mode tampilan di Tasks.
- Focus tidak menjadi menu; timer dibuka dari Tasks.
- Target tabungan dipindah dari Money ke Goals.
- Notes ditambahkan untuk menampung informasi yang bukan task.
- Hutang dan pembayaran hutang ditambahkan ke Money.
- Settings diakses dari profil dan tidak dihitung sebagai menu utama.
- Workspace tetap menjadi mekanisme internal untuk isolasi data, bukan fitur kolaborasi.
- Fitur tim, undangan, SaaS, analytics kompleks, integrasi bank, dan laporan enterprise dihapus dari roadmap.

## 6. Kebutuhan fungsional

### 6.1 Home

- Menampilkan maksimal tiga task aktif berdasarkan prioritas dan waktu.
- Menampilkan jumlah deadline yang perlu perhatian.
- Menampilkan maksimal tiga goal aktif beserta progres.
- Menampilkan saldo, cashflow bulan berjalan, dan total sisa hutang.
- Setiap kartu membawa pengguna ke ruang asal datanya.

### 6.2 Tasks

- Pengguna dapat membuat, mengubah, menyelesaikan, membuka kembali, dan menghapus task.
- Task memiliki judul, deskripsi, konteks kerja/pribadi, kategori, prioritas, jadwal, deadline opsional, dan status.
- Semua task tersedia dalam mode List dan Calendar.
- List dapat difilter menjadi Aktif, Semua, dan Selesai.
- Timer fokus dapat dibuka dari halaman Tasks dan dikaitkan dengan task aktif.
- Tidak ada Planner, Today, atau Work Board terpisah.

### 6.3 Goals

- Pengguna dapat membuat goal berisi judul, alasan/deskripsi, area, dan target tanggal.
- Area goal: pribadi, kerja, kesehatan, dan belajar.
- Progres dapat diperbarui dari 0–100%.
- Progres 100% menandai goal selesai.
- Target tabungan ditampilkan bersama life goals tetapi tetap memakai perhitungan nominal.
- Goal bukan daftar checklist harian; tindakan harian tetap dibuat sebagai task.

### 6.4 Notes

- Pengguna dapat membuat catatan berisi judul dan isi bebas.
- Catatan dapat dipin dan dihapus.
- Pengguna dapat mencari judul maupun isi.
- Catatan tidak mewajibkan tanggal, kategori, prioritas, atau status.

### 6.5 Money

- Pengguna dapat membuat rekening kas, bank, e-wallet, atau investasi.
- Pengguna dapat mencatat pemasukan dan pengeluaran.
- Sistem menghitung saldo total, saldo per rekening, pemasukan, pengeluaran, dan cashflow.
- Pengguna dapat membuat anggaran bulanan per kategori pengeluaran.
- Sistem menampilkan terpakai, sisa, dan kondisi anggaran terlampaui.
- Pengguna dapat mencatat total hutang, pihak pemberi hutang, catatan, dan jatuh tempo.
- Pembayaran hutang wajib memilih rekening sumber.
- Satu aksi pembayaran secara atomik membuat transaksi pengeluaran, mengurangi saldo rekening, dan mengurangi sisa hutang.
- Pembayaran tidak boleh lebih besar daripada sisa hutang.
- Hutang otomatis berstatus lunas ketika sisa mencapai nol.

### 6.6 Quick Add

- Tombol `+ Tambah` selalu tersedia pada header.
- Pilihan yang tersedia: Task, Goal, Note, Transaction, dan Debt.
- Setiap pilihan membuka form yang benar pada menu tujuan.
- Shortcut keyboard `Ctrl/⌘ + K` membuka pemilih Quick Add.

## 7. Aturan antitumpang-tindih

- Sesuatu yang punya aksi dan bisa selesai adalah **Task**.
- Sesuatu yang dicapai secara bertahap adalah **Goal**.
- Informasi tanpa status penyelesaian adalah **Note**.
- Pergerakan uang adalah **Transaction**.
- Batas pengeluaran periodik adalah **Budget**.
- Kewajiban mengembalikan uang adalah **Debt**.
- Target tabungan adalah **Goal**, bukan Budget.
- Timer adalah alat untuk mengerjakan Task, bukan ruang produk tersendiri.

## 8. Desain UI

### Arah visual

Identitas mengikuti estetika booklet dan cover *Paradoks Diametral*: tipografi serif klasik, komposisi editorial, bidang warna datar, dan bentuk geometris lingkaran dengan segitiga terbalik. Tidak menggunakan gaya dashboard generik atau glassmorphism.

### Token utama

- Electric Green: `#00FF12`
- Hot Pink: `#FF28E4`
- Royal Blue: `#1826C8`
- Paper White: `#F8F6F2`

### Aturan penggunaan warna

- Royal blue menjadi warna seluruh teks, garis, ikon, dan struktur informasi.
- Electric green menjadi latar utama tema Green Poster.
- Hot pink menjadi bidang aksen, tombol utama, dan bentuk lingkaran.
- Tema Pink Cover membalik pink sebagai latar dan hijau sebagai aksen.
- Seluruh warna ditampilkan datar tanpa gradient, blur, atau bayangan lembut.
- Status tetap menggunakan label teks agar tidak dibedakan hanya melalui warna.

### Gaya komponen

- Seluruh aplikasi menggunakan `Times New Roman`, `Times`, atau serif kompatibel.
- Home menggunakan grid editorial dengan motif cover lingkaran pink dan segitiga biru.
- Kartu menggunakan garis biru tipis, sudut tegas, dan hampir tanpa bayangan.
- Notes boleh menggunakan offset shadow berwarna sebagai pengecualian bergaya cetak.
- Form tetap sederhana, satu kolom pada mobile.
- Mobile navigation tetap dapat digeser dan tombol Tambah mudah dijangkau.

## 9. Keamanan dan data

- Semua data hanya dapat diakses oleh pengguna terautentikasi.
- Tasks, goals, dan notes dibatasi langsung berdasarkan `user_id` melalui RLS.
- Data Money dibatasi melalui workspace personal internal dan `created_by`.
- Aplikasi tidak menyimpan PIN, password bank, nomor kartu, atau kredensial pembayaran.
- Nominal IDR disimpan sebagai integer.
- Pembayaran hutang diproses dalam satu fungsi database atomik.

## 10. Bukan scope

- Tim, anggota workspace, dan undangan.
- Paket SaaS atau subscription.
- Integrasi bank dan transfer uang.
- Akuntansi, invoice, pajak, dan payroll.
- Analytics produk yang kompleks.
- Ekspor laporan formal dan dashboard BI.
- Habit tracker, journal khusus, project management kompleks, atau chat.
- Sinkronisasi kalender eksternal pada MVP personal.

## 11. Kriteria penerimaan Personal MVP

- Header hanya menampilkan lima menu utama.
- URL lama mengarahkan ke menu baru yang relevan.
- Pengguna dapat mencatat task, goal, note, transaksi, anggaran, dan hutang.
- Home tidak menampilkan lebih dari tiga prioritas dan tiga goal.
- Calendar hanya tersedia sebagai tampilan Tasks.
- Timer tersedia dari Tasks dan tidak muncul sebagai menu.
- Target tabungan hanya dikelola melalui Goals.
- Pembayaran hutang membuat transaksi pengeluaran dan memperbarui sisa hutang dalam satu aksi.
- Seluruh data lolos uji isolasi dua akun.
- UI dapat digunakan pada lebar 360 px tanpa scroll horizontal tidak disengaja.
- Kontras teks penting memenuhi WCAG AA.
- Lint, automated test, dan production build berhasil.

## 12. Roadmap kecil

### Fase 1 — Personal MVP

- Lima menu final.
- CRUD inti untuk Task, Goal, Note, Money, dan Debt.
- Quick Add.
- Tema acid green/hot pink.
- Migrasi dan RLS tervalidasi.

### Fase 2 — Polishing pribadi

- Edit goal dan note.
- Edit/hapus rekening, kategori, anggaran, dan hutang dengan aman.
- Konfirmasi penghapusan.
- Riwayat sesi fokus sederhana.
- Empty/loading/error state yang lebih halus.

### Fase 3 — Hanya jika benar-benar dibutuhkan

- Pengingat lokal untuk deadline dan hutang.
- Transaksi berulang dengan konfirmasi.
- Impor/ekspor CSV sebagai backup pribadi.
- PWA dan dukungan offline terbatas.

Tidak ada fase tim atau enterprise. Fitur baru hanya masuk bila menyelesaikan masalah pribadi yang berulang.

## 13. Definition of Done

Sebuah fitur selesai ketika:

- Tidak menduplikasi fungsi menu lain.
- Alur utamanya dapat selesai tanpa petunjuk teknis.
- Validasi server dan RLS tersedia.
- Loading, success, error, dan empty state ditangani.
- Tampilan mobile dan desktop telah diperiksa.
- Automated test yang relevan lulus.
- Tidak menambah menu utama keenam.
