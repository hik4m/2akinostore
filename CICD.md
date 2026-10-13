# Panduan Version Control: 2akinostore (GitHub CLI Edition)

Dokumen ini merinci alur kerja (*workflow*) pengontrolan versi untuk proyek **2akinostore** menggunakan **Git** dan **GitHub CLI (`gh`)** untuk meningkatkan efisiensi pengembangan langsung dari terminal.

## Model Branch: Single Branch (`main`)

Proyek ini memakai **satu branch saja: `main`**. Semua pekerjaan dilakukan
langsung di `main`, lalu di-*push* ke remote. Tidak ada branch `develop`,
`feature/*`, `hotfix/*`, atau *release branch*.

Konsekuensinya:

* `main` harus selalu dalam kondisi **hijau** (test lulus dan build sukses)
  setiap kali di-*push*. Jangan pernah push kode yang belum diuji.
* Setiap perubahan langsung terlihat oleh semua orang di branch utama.
* **Tidak ada Pull Request** sebagai gerbang review. Review dilakukan sebelum
  commit (lihat langkah 4), bukan setelah push.

> CI pada `.github/workflows/ci.yml` berjalan otomatis untuk setiap push ke
> `main`. Karena tidak ada PR, push ke `main` adalah satu-satunya pemicu CI —
> pastikan `npm test` dan `npm run build` sudah lulus secara lokal lebih dulu
> supaya CI tidak gagal.

## Alur Kerja (Workflow) Utama

```
[ Pull ] -> [ Coding ] -> [ Testing ] -> [ Commit ] -> [ Push ke main ]
```

---

### 1. Pull

Selalu tarik perubahan terbaru sebelum mulai ngoding, supaya Anda tidak
menimpa pekerjaan orang lain:

```bash
git checkout main
git pull origin main
```

Jika Anda belum punya repositori lokal:

```bash
gh repo clone rizalzaky500-star/2akinostore
```

---

### 2. Coding

Tulis kode atau implementasikan perubahan langsung di `main`.

* Tulis kode yang bersih dan ikuti standar kode proyek **2akinostore**.
* Lakukan perubahan secara bertahap pada file yang relevan.
* Catat perubahan besar sebagai **Issue** agar tetap terlacak, walau tanpa
  branch terpisah:
  ```bash
  gh issue create --title "Fix: Perbaikan tombol checkout pada halaman keranjang" --body "Deskripsi detail mengenai bug atau fitur yang akan dikerjakan."
  ```
  Tutup issue-nya setelah perubahan ter-push:
  ```bash
  gh issue close 123 --comment "Selesai di commit <hash>."
  ```

---

### 3. Testing

Sebelum menyimpan perubahan, pastikan kode yang Anda tulis telah diuji secara
lokal untuk menghindari *bug* atau error yang tidak diinginkan.

```bash
npm test
npm run build
```

Pastikan keduanya lulus. Verifikasi juga bahwa fitur atau perbaikan berjalan
baik secara lokal (`npm run dev`).

---

### 4. Commit

Simpan perubahan yang telah diuji ke dalam riwayat Git lokal Anda dengan pesan
yang deskriptif.

* Periksa status file yang berubah:
  ```bash
  git status
  ```

* Tinjau *diff* Anda sendiri — inilah pengganti review PR:
  ```bash
  git diff
  ```

* Tambahkan file ke *staging area*:
  ```bash
  git add .
  ```

* Lakukan commit menggunakan konvensi yang jelas:
  ```bash
  git commit -m "feat(cart): memperbaiki bug tombol checkout pada halaman keranjang"
  ```

---

### 5. Push ke `main`

Karena hanya ada satu branch, kirim perubahan langsung ke `main`:

```bash
git push origin main
```

Periksa hasil CI setelah push:

```bash
gh run list --limit 5
gh run watch
```

Jika CI gagal, segera perbaiki di `main` dan push lagi. Jangan biarkan `main`
merah.

---

## Meringkas Riwayat (Opsional)

Untuk menjaga riwayat `main` tetap rapi karena semua commit masuk ke sana,
biasakan:

* Satu commit untuk satu perubahan logis, bukan satu commit besar berisi
  banyak hal sekaligus.
* Hindari commit "wip" atau "fix typo" yang bertumpuk; gunakan `git commit
  --amend` selama commit tersebut belum di-push.
* Gunakan `git pull --rebase origin main` sebelum push agar riwayat tetap
  linear dan tidak penuh merge commit:
  ```bash
  git pull --rebase origin main
  git push origin main
  ```
