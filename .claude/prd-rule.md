# Standar Operasional: Penyusunan Product Requirements Document (PRD)

Dokumen ini memuat standar absolut untuk setiap pembuatan PRD di dalam ekosistem kita. Tujuannya adalah memastikan dokumen selalu rapi dan mudah dipahami oleh seluruh tim lintas fungsi. Aturan ini wajib dipatuhi tanpa pengecualian komputasi.

## Aturan Penulisan Dasar
* Setiap paragraf di dalam PRD maksimal hanya terdiri dari 3 kalimat.
* Penjelasan harus selalu dipecah menjadi poin-poin (bullet points) untuk memudahkan pemindaian visual.
* Setiap poin penjelasan wajib diletakkan pada barisnya masing-masing.
* Gunakan bahasa teknis yang lugas, tidak ambigu, dan berorientasi pada hasil (outcome-oriented).

## Struktur Wajib Dokumen

### 1. Document Status
* **Status Dokumen:** [Draft / Final]
* **Pemilik Dokumen:** [Nama PM / Product Owner]
* **Target Rilis:** [Target Kuartal / Tanggal Spesifik]

### 2. Problem Alignment
Bagian ini mendefinisikan masalah fundamental yang ingin diselesaikan. Fokus utamanya adalah pada akar masalah dan metrik keberhasilan.
* **Background:** Konteks masalah, titik masalah (pain points) pengguna, dan risiko jika tidak diselesaikan.
* **Target Market/User:** Segmentasi spesifik untuk pengguna utama maupun sekunder.
* **User Value:** Manfaat konkret yang mengurangi friksi atau menambah nilai bagi pengguna.
* **Business Value:** Dampak inisiatif terhadap sasaran perusahaan (konversi, retensi, atau efisiensi).
* **Success Metrics:** Tabel wajib yang mengukur Goal, Metric, Baseline, Target, dan Measurement.

### 3. Proposed Solution
Bagian ini menjabarkan batas ruang lingkup dan arsitektur alur solusi. Diagram visual sangat diwajibkan pada fase ini.
* **Scope & Assumptions:** Penegasan cakupan MVP (Fase 1), fitur yang ditunda (Fase 2), dan asumsi sistem.
* **User Flow:** Diagram Mermaid (flowchart TD) yang memetakan langkah pengguna secara komprehensif.
* **Sequence Diagram:** Diagram Mermaid tambahan jika inisiatif melibatkan lebih dari dua sistem.
* **Key Features List:** Daftar lengkap seluruh fitur yang akan dibangun, dinomori secara sekuensial (misal: 8.1, 8.2).

### 4. Functional Requirements
Bagian ini adalah spesifikasi teknis inti untuk tim Engineering dan QA. Pemetaan fungsional wajib sinkron 1:1 dengan Key Features List.
* **Struktur User Story:** "Sebagai [Persona], saya ingin [Aksi], agar [Manfaat/Tujuan]."
* **Acceptance Criteria (AC):** Setiap AC wajib memiliki tiga sub-heading absolut berikut:
* `# User Journey`: Rincian aksi pengguna lapis demi lapis dan pemicu (trigger) antarmuka.
* `# Design`: Spesifikasi visual, status komponen (states), batasan tata letak, dan umpan balik UI.
* `# Logic`: Aturan inti bisnis, validasi data, kasus batas (edge cases), dan penanganan galat (error handling).

### 5. Non-Functional Requirements & Design
Bagian ini memastikan standar stabilitas dan referensi visual terpenuhi.
* **NFR:** Tabel spesifikasi teknis yang mencakup Performa, Keamanan, Strategi Cache, dan Dukungan Luring.
* **Design References:** Tautan langsung menuju prototipe desain yang disetujui (misal: Figma).

## Notes
kamu boleh edit file rule ini sesuai instruksi lanjutan yang dikirim di chat