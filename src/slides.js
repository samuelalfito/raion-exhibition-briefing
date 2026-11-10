import bannerFrontUrl from './assets/banner-front.webp';
import logoUrl from './assets/raion-exhibition-logo.png';
import bannerTopUrl from './assets/banner-top.webp';
import stickerUrl from './assets/vote-sticker.png';

// Isi slide. Sumber: Raion Exhibition Guidelines (Jamstone & Androzon 2026).

const rundown = [
  { start: '08.00', end: '09.00', agenda: 'Persiapan panitia', min: 60, who: 'Panitia' },
  { start: '09.00', end: '09.30', agenda: 'Peserta datang dan menata booth', min: 30, who: 'Peserta', you: true },
  { start: '09.30', end: '12.00', agenda: 'Showcase sesi 1, pengunjung mulai datang 10.00', min: 150, who: 'Peserta', you: true },
  { start: '12.00', end: '13.00', agenda: 'Istirahat, salat, makan', min: 60, who: 'Peserta', you: true },
  { start: '13.00', end: '15.00', agenda: 'Showcase sesi 2', min: 120, who: 'Peserta', you: true },
  { start: '15.00', end: '15.30', agenda: 'Penutupan', min: 30, who: 'Panitia' },
  { start: '15.30', end: '16.00', agenda: 'Bersih-bersih', min: 30, who: 'Panitia' },
];

const header = (n, title) => `
  <header class="head">
    <span class="eyebrow">${n}</span>
    <h2>${title}</h2>
  </header>`;

const bannerFigure = `
  <figure class="banner">
    <img src="${bannerFrontUrl}" alt="Sisi depan banner booth Raion Exhibition" />
    <figcaption>Sisi depan banner. Area abu-abu diisi poster 4:5 tiap tim.</figcaption>
  </figure>`;

export const slides = [
  // 1. Cover
  `<section class="slide cover">
    <div class="cover-inner">
      <span class="eyebrow">Briefing peserta</span>
      <h1><img class="logo" src="${logoUrl}" alt="Raion Exhibition" /></h1>
      <p class="sub">Jamstone &amp; Androzon 2026</p>
      <div class="meta">
        <div><b>Rabu, 11 November 2026</b><span>Tanggal</span></div>
        <div><b>GKM FILKOM UB, lantai 1</b><span>Lokasi</span></div>
        <div><b>09.00 sampai 15.00 WIB</b><span>Waktu peserta</span></div>
      </div>
    </div>
  </section>`,

  // 2. Empat jam
  `<section class="slide">
    ${header('01', 'Empat jam yang harus diingat')}
    <div class="clocks">
      <article>
        <strong>09.00</strong>
        <h3>Tiba di booth</h3>
        <p>Setengah jam untuk menata meja, memasang perangkat, dan mencoba demo.</p>
      </article>
      <article>
        <strong>09.30</strong>
        <h3>Showcase dimulai</h3>
        <p>Peserta sudah di booth masing-masing dan mulai memamerkan proyeknya.</p>
      </article>
      <article class="hot">
        <strong>10.00</strong>
        <h3>Pengunjung datang</h3>
        <p>Pengunjung mulai berkeliling dan mencoba proyek. Paling lambat jam ini booth sudah siap sepenuhnya.</p>
      </article>
      <article>
        <strong>15.00</strong>
        <h3>Baru boleh pergi</h3>
        <p>Booth dijaga sampai jam ini. Peserta tidak boleh pergi lebih awal.</p>
      </article>
    </div>
  </section>`,

  // 3. Rundown
  `<section class="slide">
    ${header('02', 'Rundown')}
    <div class="strip" aria-hidden="true">
      ${rundown.map((r) => `<i class="${r.you ? 'you' : ''}" style="flex:${r.min}"></i>`).join('')}
    </div>
    <div class="strip-ticks" aria-hidden="true"><span>08.00</span><span>12.00</span><span>16.00</span></div>
    <table class="rundown">
      <tbody>
        ${rundown
          .map(
            (r) => `<tr class="${r.you ? 'you' : ''}">
              <td class="time">${r.start} – ${r.end}</td>
              <td>${r.agenda}</td>
              <td class="dur">${r.min} menit</td>
              <td class="who">${r.who}</td>
            </tr>`,
          )
          .join('')}
      </tbody>
    </table>
  </section>`,

  // 4. Isi booth
  `<section class="slide split">
    <div>
      ${header('03', 'Isi booth')}
      <div class="two">
        <div class="card">
          <h3>Dari panitia</h3>
          <ul>
            <li>1 meja dan 2 kursi</li>
            <li>Banner booth, dicetak dari poster tim</li>
          </ul>
        </div>
        <div class="card">
          <h3>Dibawa sendiri</h3>
          <ul>
            <li>Laptop atau perangkat lain untuk demo</li>
            <li>Kabel roll kalau butuh colokan lebih</li>
            <li>Dekorasi seperlunya</li>
          </ul>
        </div>
      </div>
      <p class="callout">Setiap tim wajib mengirim desain poster proyek dengan rasio <b>4:5</b>. Panitia yang mencetaknya jadi banner.</p>
    </div>
    <div class="figure">${bannerFigure}</div>
  </section>`,

  // 5. Penjaga booth
  `<section class="slide">
    ${header('04', 'Yang menjaga booth')}
    <div class="grid2">
      <article class="stat">
        <strong>1–3</strong>
        <p>orang di setiap booth. Minimal satu, paling banyak tiga.</p>
      </article>
      <div class="rules">
        <div class="rule"><span>1</span><p>Booth tetap dijaga sampai 15.00. Kalau tim tidak bisa menjaga di jam tertentu, kabari panitia lebih dulu.</p></div>
        <div class="rule"><span>2</span><p>Yang sudah menerima jaket Raion wajib memakainya sepanjang acara.</p></div>
        <div class="rule"><span>3</span><p>Berpakaian rapi dan pantas dari awal sampai acara selesai.</p></div>
      </div>
    </div>
  </section>`,

  // 6. Larangan
  `<section class="slide">
    ${header('05', 'Yang tidak boleh')}
    <div class="bans">
      <article>
        <span class="x" aria-hidden="true"></span>
        <h3>Barang terlarang</h3>
        <p>Senjata tajam, rokok, dan barang sejenisnya tidak boleh dibawa ke area acara.</p>
      </article>
      <article>
        <span class="x" aria-hidden="true"></span>
        <h3>Dekorasi bermasalah</h3>
        <p>Dekorasi bebas sesuai kebutuhan, asal tidak memuat unsur SARA, pornografi, atau konten lain yang tidak pantas.</p>
      </article>
      <article>
        <span class="x" aria-hidden="true"></span>
        <h3>Mengganggu booth lain</h3>
        <p>Merendahkan, meremehkan, atau mengganggu tim lain dilarang keras.</p>
      </article>
      <article>
        <span class="x" aria-hidden="true"></span>
        <h3>Berjualan</h3>
        <p>Booth hanya untuk memamerkan proyek. Peserta tidak boleh menjual apa pun di area acara.</p>
      </article>
    </div>
  </section>`,

  // 7. Voting
  `<section class="slide">
    ${header('06', 'Voting booth favorit')}
    <div class="vote">
      <div class="card how">
        <h3>Cara pengunjung memberi suara</h3>
        <div class="flap">
          <img src="${bannerTopUrl}" alt="Bagian atas banner di meja booth, dengan stiker voting menempel di area putih" />
          <img class="dot" src="${stickerUrl}" alt="" style="left:9%;top:13%" /><img class="dot" src="${stickerUrl}" alt="" style="left:22%;top:41%" /><img class="dot" src="${stickerUrl}" alt="" style="left:37%;top:17%" /><img class="dot" src="${stickerUrl}" alt="" style="left:11%;top:62%" /><img class="dot" src="${stickerUrl}" alt="" style="left:31%;top:58%" />
        </div>
        <div class="how-text">
          <img src="${stickerUrl}" alt="Stiker voting Raion Exhibition" />
          <p>Pengunjung menempel stiker voting di area putih banner, di atas meja booth yang dipilih.</p>
        </div>
      </div>
      <div class="card ok">
        <h3>Boleh</h3>
        <ul>
          <li>Mengajak pengunjung memilih proyek tim sendiri</li>
          <li>Mengarahkan mereka ke meja registrasi untuk memberikan suara</li>
        </ul>
      </div>
      <div class="card no">
        <h3>Dilarang keras</h3>
        <ul>
          <li>Menawarkan hadiah atau imbalan dalam bentuk apa pun</li>
          <li>Memaksa, mengintimidasi, atau menekan pengunjung</li>
        </ul>
      </div>
    </div>
    <p class="callout tight">Suara diberikan sukarela. Pilihan pengunjung dan hasil akhir voting dihormati semua tim.</p>
  </section>`,

  // 8. Denah 3D
  `<section class="slide venue-slide" data-venue>
    <div id="venue"></div>
  </section>`,

  // 9. Setelah acara
  `<section class="slide">
    ${header('08', 'Sebelum pulang')}
    <div class="rules wide">
      <div class="rule"><span>1</span><p>Kembalikan area booth ke kondisi semula.</p></div>
      <div class="rule"><span>2</span><p>Buang semua sampah pada tempatnya dan pastikan area booth bersih.</p></div>
      <div class="rule"><span>3</span><p>Jangan sampai ada fasilitas GKM yang rusak.</p></div>
    </div>
  </section>`,

  // 10. Checklist
  `<section class="slide">
    ${header('09', 'Cek sebelum berangkat')}
    <ul class="check">
      <li>Poster 4:5 sudah dikirim lewat form</li>
      <li>Laptop atau perangkat demo, lengkap dengan charger</li>
      <li>Kabel roll</li>
      <li>Jaket Raion, bagi yang sudah menerima</li>
      <li>Jadwal jaga tim, 1 sampai 3 orang sampai 15.00</li>
    </ul>
  </section>`,

  // 11. Form dan kontak
  `<section class="slide split contact">
    <div>
      ${header('10', 'Form dan kontak')}
      <div class="card">
        <h3>Form pengumpulan proyek</h3>
        <p class="link">raion.clips.id/ProjectSubmissionExibhition</p>
      </div>
      <p class="callout">Ada yang belum jelas? Tanyakan sekarang.</p>
    </div>
    <div class="figure qr">
      <img id="qr-form" alt="Kode QR menuju form pengumpulan proyek" />
      <span>Form pengumpulan proyek</span>
    </div>
  </section>`,
];

export const FORM_URL = 'https://raion.clips.id/ProjectSubmissionExibhition';
