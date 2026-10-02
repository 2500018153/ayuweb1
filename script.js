document.addEventListener('DOMContentLoaded', function () {

    /* ========== DATA MUSISI ========== */
    var musisiList = [
        { id: 'hindia', nama: 'Hindia', genre: 'Indie Pop / Alternative', kota: 'Jakarta', lagu: 'Rumah Ke Rumah', foto: 'hindia.jpg' },
        { id: 'fourtwnty', nama: 'Fourtwnty', genre: 'Folk / Indie', kota: 'Jakarta', lagu: 'Fana Merah Jambu', foto: 'fourtwnty.jpg' },
        { id: 'reality-club', nama: 'Reality Club', genre: 'Indie Rock', kota: 'Jakarta', lagu: 'Anything You Want', foto: 'realityclub.jpg' }
    ];

    var KEY_COUNTER = 'indiesound_counter';
    var KEY_VOTES = 'indiesound_votes';

    /* ========== HELPER STORAGE (pengganti file .txt) ========== */
    function bacaVotes() {
        try {
            return JSON.parse(localStorage.getItem(KEY_VOTES)) || [];
        } catch (e) {
            return [];
        }
    }

    function simpanVotes(votes) {
        try {
            localStorage.setItem(KEY_VOTES, JSON.stringify(votes));
            return true;
        } catch (e) {
            return false;
        }
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /* ========== HIT COUNTER ========== */
    function updateCounter() {
        var n = 0;
        try {
            n = parseInt(localStorage.getItem(KEY_COUNTER), 10) || 0;
            n++;
            localStorage.setItem(KEY_COUNTER, n);
        } catch (e) { n = 1; }
        document.getElementById('counter').textContent = n;
    }

    /* ========== RENDER ========== */
    function hitungVote() {
        var counts = {};
        musisiList.forEach(function (m) { counts[m.nama] = 0; });
        bacaVotes().forEach(function (v) {
            if (counts.hasOwnProperty(v.musisi)) counts[v.musisi]++;
        });
        return counts;
    }

    function render() {
        var counts = hitungVote();

        document.getElementById('grid-musisi').innerHTML = musisiList.map(function (m) {
            return '<article class="kartu-musisi">' +
                '<img src="' + escapeHtml(m.foto) + '" alt="Foto ' + escapeHtml(m.nama) + '" class="foto-musisi">' +
                '<div class="info-musisi">' +
                '<h3>' + escapeHtml(m.nama) + '</h3>' +
                '<p><strong>Genre:</strong> ' + escapeHtml(m.genre) + '</p>' +
                '<p><strong>Asal Kota:</strong> ' + escapeHtml(m.kota) + '</p>' +
                '<p><strong>Lagu Andalan:</strong> ' + escapeHtml(m.lagu) + '</p>' +
                '<p class="jumlah-vote">Vote: ' + counts[m.nama] + '</p>' +
                '</div></article>';
        }).join('');

        document.getElementById('list-hasil').innerHTML = musisiList.map(function (m) {
            return '<li>' + escapeHtml(m.nama) + ' : <strong>' + counts[m.nama] + ' vote</strong></li>';
        }).join('');
    }

    function isiDropdown() {
        var select = document.getElementById('musisi');
        musisiList.forEach(function (m) {
            var opt = document.createElement('option');
            opt.value = m.nama;
            opt.textContent = m.nama;
            select.appendChild(opt);
        });
    }

    function tampilkanStatus(sukses) {
        var el = document.getElementById('status-pesan');
        el.innerHTML = sukses
            ? '<div class="pesan pesan-sukses">✅ Terima kasih! Vote kamu berhasil disimpan.</div>'
            : '<div class="pesan pesan-gagal">⚠️ Maaf, data tidak valid / gagal disimpan. Silakan coba lagi.</div>';
    }

    document.getElementById('tahun').textContent = new Date().getFullYear();
    isiDropdown();
    render();
    updateCounter();

    /* ========== VALIDASI FORM ========== */
    var form = document.getElementById('form-voting');
    var inputNama = document.getElementById('nama');
    var inputEmail = document.getElementById('email');
    var selectMusisi = document.getElementById('musisi');
    var textareaAlasan = document.getElementById('alasan');

    var errorNama = document.getElementById('error-nama');
    var errorEmail = document.getElementById('error-email');
    var errorMusisi = document.getElementById('error-musisi');
    var errorAlasan = document.getElementById('error-alasan');

    function tampilkanError(inputElement, errorElement, pesan) {
        errorElement.textContent = pesan;
        inputElement.classList.add('invalid');
    }

    function hapusError(inputElement, errorElement) {
        errorElement.textContent = '';
        inputElement.classList.remove('invalid');
    }

    function isEmailValid(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // tidak ada server, jadi selalu ditangani di JS

        var nilaiNama = inputNama.value.trim();
        var nilaiEmail = inputEmail.value.trim();
        var nilaiMusisi = selectMusisi.value;
        var nilaiAlasan = textareaAlasan.value.trim();

        hapusError(inputNama, errorNama);
        hapusError(inputEmail, errorEmail);
        hapusError(selectMusisi, errorMusisi);
        hapusError(textareaAlasan, errorAlasan);

        var formValid = true;

        if (nilaiNama === '') {
            tampilkanError(inputNama, errorNama, 'Nama tidak boleh kosong.');
            formValid = false;
        }

        if (nilaiEmail === '') {
            tampilkanError(inputEmail, errorEmail, 'Email tidak boleh kosong.');
            formValid = false;
        } else if (!isEmailValid(nilaiEmail)) {
            tampilkanError(inputEmail, errorEmail, 'Format email tidak valid.');
            formValid = false;
        }

        if (nilaiMusisi === '') {
            tampilkanError(selectMusisi, errorMusisi, 'Silakan pilih salah satu musisi.');
            formValid = false;
        }

        if (nilaiAlasan === '') {
            tampilkanError(textareaAlasan, errorAlasan, 'Alasan tidak boleh kosong.');
            formValid = false;
        } else if (nilaiAlasan.length < 15) {
            tampilkanError(textareaAlasan, errorAlasan,
                'Alasan minimal 15 karakter (saat ini ' + nilaiAlasan.length + ' karakter).');
            formValid = false;
        }

        if (!formValid) return;

        /* ========== SIMPAN VOTE (pengganti proses_vote.php) ========== */
        var votes = bacaVotes();
        votes.push({
            nama: nilaiNama,
            email: nilaiEmail,
            musisi: nilaiMusisi,
            alasan: nilaiAlasan,
            tanggal: new Date().toLocaleString('id-ID')
        });

        var berhasil = simpanVotes(votes);
        tampilkanStatus(berhasil);
        if (berhasil) {
            form.reset();
            render();
        }
    });

    inputNama.addEventListener('input', function () { hapusError(inputNama, errorNama); });
    inputEmail.addEventListener('input', function () { hapusError(inputEmail, errorEmail); });
    selectMusisi.addEventListener('change', function () { hapusError(selectMusisi, errorMusisi); });
    textareaAlasan.addEventListener('input', function () { hapusError(textareaAlasan, errorAlasan); });

});
