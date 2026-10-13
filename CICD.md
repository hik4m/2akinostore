# Panduan Version Control: 2akinostore (GitHub CLI Edition)

Dokumen ini merinci alur kerja (*workflow*) pengontrolan versi untuk proyek **2akinostore** menggunakan **Git** dan **GitHub CLI (`gh`)** untuk meningkatkan efisiensi pengembangan langsung dari terminal.

## Alur Kerja (Workflow) Utama

```
[ Pull / Clone ] -> [ Buka Issues ] -> [ Coding ] -> [ Testing ] -> [ Commit ] -> [ Push ]
```

---

### 1. Pull / Clone

Pastikan repositori lokal Anda sinkron dengan versi terbaru di server *remote*. Anda dapat memanfaatkan GitHub CLI untuk proses *clone*.

* **Clone Repositori menggunakan GitHub CLI:**
  ```bash
  gh repo clone rizalzaky500-star/2akinostore
  ```

* **Pull Pembaruan Terbaru:**
  Sebelum mulai menulis kode, pastikan branch utama Anda sudah yang paling baru:
  ```bash
  git checkout main
  git pull origin main
  ```

---

### 2. Buka Issues

Sebelum mulai ngoding, buat atau tetapkan diri Anda pada sebuah **Issue** langsung dari terminal menggunakan GitHub CLI.

* **Membuat Issue Baru via CLI:**
  ```bash
  gh issue create --title "Fix: Perbaikan tombol checkout pada halaman keranjang" --body "Deskripsi detail mengenai bug atau fitur yang akan dikerjakan."
  ```

* **Membuat Branch Kerja Baru Berdasarkan Issue:**
  Hubungkan branch kerja Anda dengan nomor issue yang relevan:
  ```bash
  git checkout -b feature/issue-123-checkout-fix
  ```

---

### 3. Coding

Tulis kode atau implementasikan fitur sesuai dengan spesifikasi dari Issue yang telah dibuka.

* Tulis kode yang bersih dan ikuti standar kode proyek **2akinostore**.
* Lakukan perubahan secara bertahap pada file yang relevan.

---

### 4. Testing

Sebelum menyimpan perubahan, pastikan kode yang Anda tulis telah diuji secara lokal untuk menghindari *bug* atau error yang tidak diinginkan.

* Jalankan pengujian (*unit/integration test*) yang tersedia pada proyek.
* Verifikasi bahwa fitur atau perbaikan berjalan dengan baik secara lokal.

---

### 5. Commit

Simpan perubahan yang telah diuji ke dalam riwayat Git lokal Anda dengan pesan yang deskriptif.

* Periksa status file yang berubah:
  ```bash
  git status
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

### 6. Push

Unggah riwayat commit dari lokal ke repositori *remote* dan buat *Pull Request* menggunakan GitHub CLI.

* Kirim branch kerja Anda ke server:
  ```bash
  git push origin feature/issue-123-checkout-fix
  ```

* **Membuat Pull Request (PR) via GitHub CLI:**
  Setelah ter-push, buat PR secara cepat langsung dari terminal:
  ```bash
  gh pr create --title "feat(cart): memperbaiki bug tombol checkout" --body "Menyelesaikan issue #123 terkait error tombol checkout."