# Taskflow

Taskflow adalah personal command center berbasis Next.js dan Supabase untuk mengelola task, target, catatan, serta uang pribadi.

## Fitur utama

- Home ringkas dengan Top 3, deadline, progres target, dan kondisi uang.
- Tasks dalam tampilan list atau kalender dengan timer fokus kontekstual.
- Goals untuk target hidup dan target tabungan.
- Notes untuk ide dan informasi bebas.
- Pengaturan profil, perusahaan, kategori, dan tema.
- Money untuk rekening, transaksi, anggaran bulanan, kategori, dan hutang.
- Pembayaran hutang otomatis mencatat pengeluaran dan mengurangi sisa hutang.
- Row Level Security agar data pribadi hanya dapat diakses pemiliknya.
- Identitas visual editorial: serif klasik, electric green, hot pink, royal blue, dan motif lingkaran-segitiga.

## Menjalankan secara lokal

Persyaratan: Node.js 20.9 atau lebih baru dan sebuah proyek Supabase.

1. Salin `.env.example` menjadi `.env.local`.
2. Isi URL dan anon key Supabase.
3. Jalankan migration SQL di `supabase/migrations` sesuai urutan nama file.
4. Pasang dependency dengan `npm install`.
5. Jalankan aplikasi dengan `npm run dev`.

Aplikasi tersedia di `http://localhost:3000`.

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Anon key memang boleh dipakai browser. Keamanan data tetap harus ditegakkan oleh RLS pada database. Jangan pernah memasukkan service-role key ke variabel `NEXT_PUBLIC_*`.

## Database dan keamanan

Migration `20260813_finance_workspace_security.sql` membuat fondasi keuangan. Migration `20260814_personal_command_center.sql` menambahkan goals, notes, hutang, pembayaran hutang atomik, indeks, dan RLS.

Nominal IDR disimpan sebagai integer rupiah di kolom `*_minor`, bukan floating point. Aplikasi tidak menyimpan PIN, password bank, nomor kartu, atau kredensial perbankan.

## Pemeriksaan kualitas

```bash
npm run lint
npm run test
npm run build
```

Atau jalankan semuanya dengan `npm run check`.

## Deployment

Pastikan seluruh migration sudah diterapkan dan environment Supabase sudah tersedia di platform deployment sebelum menjalankan build produksi.
