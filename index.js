let selectedPaket = '';
const storageKey = 'tools-registrasi-preferences';
const { paketOptions = [], odpOptions = [], quickOdp = [] } = window.APP_CONFIG || {};
const odpVlanMapping = Object.fromEntries(odpOptions.map((odp) => [odp.value, odp.vlan]));

function renderOdpOptions(filter = '') {
    const odpSelect = document.getElementById('odp');
    const normalizedFilter = filter.trim().toLowerCase();
    const filteredOptions = odpOptions.filter((odp) => {
        const label = `${odp.value} ${odp.label}`.toLowerCase();
        return label.includes(normalizedFilter);
    });

    odpSelect.innerHTML = [
        '<option value="">Pilih ODP</option>',
        ...filteredOptions.map((odp) => `<option value="${odp.value}">${odp.label}</option>`)
    ].join('');
}

function renderQuickOdpChips() {
    const container = document.getElementById('quickOdpChips');
    const chips = quickOdp.filter((code) => odpOptions.some((odp) => odp.value === code));

    container.innerHTML = chips.map((code) => (
        `<button type="button" class="quick-chip" data-odp="${code}">${code}</button>`
    )).join('');

    container.querySelectorAll('.quick-chip').forEach((chip) => {
        chip.addEventListener('click', function() {
            const odpValue = this.getAttribute('data-odp');
            document.getElementById('odpSearch').value = '';
            renderOdpOptions();
            document.getElementById('odp').value = odpValue;
            sinkronkanVlanDariOdp(odpValue);
            fokuskanFieldBerikutnya();
        });
    });
}

function sinkronkanVlanDariOdp(selectedODP) {
    const vlanField = document.getElementById('vlan');
    vlanField.value = selectedODP && odpVlanMapping[selectedODP] ? odpVlanMapping[selectedODP] : '';
}

function fokuskanFieldBerikutnya() {
    document.getElementById('odpCode').focus();
}

function simpanPreferensi() {
    const preferences = {
        mode: document.getElementById('modeSelect').value,
        teknisi: document.getElementById('teknisi').value,
        promo: document.getElementById('promo').value.trim(),
        odp: document.getElementById('odp').value,
        paket: selectedPaket
    };

    localStorage.setItem(storageKey, JSON.stringify(preferences));
}

function muatPreferensi() {
    const savedPreferences = localStorage.getItem(storageKey);
    if (!savedPreferences) {
        return;
    }

    try {
        const preferences = JSON.parse(savedPreferences);

        if (preferences.mode) {
            document.getElementById('modeSelect').value = preferences.mode;
        }

        if (preferences.teknisi) {
            document.getElementById('teknisi').value = preferences.teknisi;
        }

        if (preferences.promo) {
            document.getElementById('promo').value = preferences.promo;
        }

        if (preferences.odp) {
            renderOdpOptions();
            document.getElementById('odp').value = preferences.odp;
            sinkronkanVlanDariOdp(preferences.odp);
        }

        if (preferences.paket) {
            selectedPaket = preferences.paket;
            document.getElementById('selectedPaket').value = preferences.paket;
        }
    } catch (error) {
        localStorage.removeItem(storageKey);
    }
}

function tampilkanDaftarPaket(filter = '') {
    const paketList = document.getElementById('paketList');
    const filteredPaket = paketOptions.filter((paket) =>
        paket.toLowerCase().includes(filter.toLowerCase())
    );

    paketList.innerHTML = filteredPaket.map((paket) =>
        `<div class="paket-item" data-paket="${paket}">${paket}</div>`
    ).join('');

    document.querySelectorAll('.paket-item').forEach((item) => {
        item.addEventListener('click', function() {
            selectedPaket = this.getAttribute('data-paket');
            document.getElementById('selectedPaket').value = selectedPaket;
            document.getElementById('paketDropdown').classList.add('hidden');
            document.getElementById('paketSearch').value = '';
            simpanPreferensi();
        });
    });
}

function aturModeForm(mode) {
    const formTitle = document.getElementById('formTitle');
    const generateBtn = document.getElementById('generateBtn');
    const passwordGroup = document.getElementById('passwordGroup');
    const paketGroup = document.getElementById('paketGroup');
    const promoGroup = document.querySelector('label[for="promo"]').parentElement;

    if (mode === 'gantiModem') {
        formTitle.textContent = 'Formulir Ganti Modem';
        generateBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Generate Script Ganti Modem';
        passwordGroup.style.display = 'none';
        paketGroup.style.display = 'none';
        promoGroup.style.display = 'none';
        document.getElementById('password').value = '';
    } else {
        formTitle.textContent = 'Formulir Registrasi Pelanggan Baru';
        generateBtn.innerHTML = '<i class="bi bi-play-circle"></i> Generate Script Registrasi';
        passwordGroup.style.display = 'block';
        paketGroup.style.display = 'block';
        promoGroup.style.display = 'block';
    }
}

function buatScriptGantiModem() {
    const requiredFields = ['nama', 'sn', 'mac', 'redaman', 'vlan', 'tikor', 'odp', 'teknisi'];
    const missingFields = [];

    for (const field of requiredFields) {
        const value = document.getElementById(field).value.trim();
        if (!value) {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        tampilkanNotifikasi(`Harap lengkapi field: ${missingFields.join(', ')}`, 'error');
        return;
    }

    const nama = document.getElementById('nama').value.trim();
    const sn = document.getElementById('sn').value.trim();
    const mac = document.getElementById('mac').value.trim();
    const redaman = document.getElementById('redaman').value.trim();
    const userInput = document.getElementById('username').value.trim().replace('@harmonika.id', '');
    const username = userInput ? `${userInput}@harmonika.id` : '@harmonika.id';
    const password = '12345';
    const vlan = document.getElementById('vlan').value.trim();
    const tikor = document.getElementById('tikor').value.trim();
    const odp = document.getElementById('odp').value.trim();
    const odpCode = document.getElementById('odpCode').value.trim();
    const teknisi = document.getElementById('teknisi').value;
    const odpFull = odpCode ? `${odp} ${odpCode}` : odp;
    const paket = 'Paket UP TO 50Mbps';

    const script = `**Ganti Modem**
Nama: ${nama}
SN: ${sn}
MAC Address: ${mac}
Redaman: ${redaman}
Username: ${username}
Password: ${password}
Vlan: ${vlan}
Tikor: ${tikor}
ODP: ${odpFull}
Paket: ${paket}
Teknisi: ${teknisi}`;

    document.getElementById('output').textContent = script;
    tampilkanNotifikasi('Script ganti modem berhasil dibuat!');
    document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
}

function buatScriptRegistrasi() {
    const requiredFields = ['nama', 'sn', 'mac', 'redaman', 'username', 'password', 'vlan', 'tikor', 'odp', 'teknisi'];
    const missingFields = [];

    for (const field of requiredFields) {
        const value = document.getElementById(field).value.trim();
        if (!value) {
            missingFields.push(field);
        }
    }

    if (!selectedPaket) {
        missingFields.push('paket');
    }

    if (missingFields.length > 0) {
        tampilkanNotifikasi(`Harap lengkapi field: ${missingFields.join(', ')}`, 'error');
        return;
    }

    const nama = document.getElementById('nama').value.trim();
    const sn = document.getElementById('sn').value.trim();
    const mac = document.getElementById('mac').value.trim();
    const redaman = document.getElementById('redaman').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const vlan = document.getElementById('vlan').value.trim();
    const tikor = document.getElementById('tikor').value.trim();
    const odp = document.getElementById('odp').value.trim();
    const odpCode = document.getElementById('odpCode').value.trim();
    const teknisi = document.getElementById('teknisi').value;
    const promo = document.getElementById('promo').value.trim() || 'FREE PEMASANGAN';
    const odpFull = odpCode ? `${odp} ${odpCode}` : odp;

    const script = `**Registrasi Pelanggan Baru**
Nama: ${nama}
SN: ${sn}
MAC Address: ${mac}
Redaman: ${redaman}
Username: ${username}
Password: ${password}
Vlan: ${vlan}
Tikor: ${tikor}
ODP: ${odpFull}
Paket: ${selectedPaket}
Promo: ${promo}
Teknisi: ${teknisi}`;

    document.getElementById('output').textContent = script;
    tampilkanNotifikasi('Script registrasi berhasil dibuat!');
    document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
}

function bersihkanForm() {
    if (!confirm('Yakin ingin menghapus semua data form?')) {
        return;
    }

    document.querySelectorAll('input').forEach((input) => {
        input.value = '';
    });

    document.getElementById('promo').value = 'FREE PEMASANGAN';
    document.getElementById('teknisi').value = '';
    document.getElementById('odpSearch').value = '';
    document.getElementById('output').textContent = '';
    document.getElementById('selectedPaket').value = '';
    selectedPaket = '';

    renderOdpOptions();
    document.getElementById('modeSelect').value = 'registrasi';
    aturModeForm('registrasi');
    simpanPreferensi();
    tampilkanNotifikasi('Form berhasil dibersihkan!');
}

function salinOutput() {
    const output = document.getElementById('output').textContent;

    if (!output.trim()) {
        tampilkanNotifikasi('Tidak ada output untuk disalin!', 'error');
        return;
    }

    navigator.clipboard.writeText(output).then(() => {
        tampilkanNotifikasi('Output berhasil disalin ke clipboard!');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = output;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        tampilkanNotifikasi('Output berhasil disalin!');
    });
}

function cetakHasil() {
    const output = document.getElementById('output').textContent;

    if (!output.trim()) {
        tampilkanNotifikasi('Tidak ada output untuk dicetak!', 'error');
        return;
    }

    window.print();
}

function tampilkanNotifikasi(pesan, tipe = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = pesan;
    notification.className = `notification ${tipe}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    const paketButton = document.getElementById('paketButton');
    const paketDropdown = document.getElementById('paketDropdown');
    const paketSearch = document.getElementById('paketSearch');
    const odpSearch = document.getElementById('odpSearch');
    const odpSelect = document.getElementById('odp');
    const modeSelect = document.getElementById('modeSelect');

    renderOdpOptions();
    renderQuickOdpChips();
    muatPreferensi();
    tampilkanDaftarPaket();

    paketButton.addEventListener('click', function() {
        paketDropdown.classList.toggle('hidden');
        if (!paketDropdown.classList.contains('hidden')) {
            paketSearch.focus();
        }
    });

    paketSearch.addEventListener('input', function() {
        tampilkanDaftarPaket(this.value);
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.form-group')) {
            paketDropdown.classList.add('hidden');
        }
    });

    odpSearch.addEventListener('input', function() {
        const currentValue = odpSelect.value;
        renderOdpOptions(this.value);
        if (Array.from(odpSelect.options).some((option) => option.value === currentValue)) {
            odpSelect.value = currentValue;
        }
    });

    odpSearch.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (odpSelect.options.length > 1) {
                odpSelect.selectedIndex = 1;
                sinkronkanVlanDariOdp(odpSelect.value);
                simpanPreferensi();
                fokuskanFieldBerikutnya();
            }
        }
    });

    odpSelect.addEventListener('change', function() {
        sinkronkanVlanDariOdp(this.value);
        simpanPreferensi();
    });

    document.getElementById('username').addEventListener('blur', function() {
        const value = this.value.trim();
        if (value && !value.includes('@')) {
            this.value = `${value}@harmonika.id`;
        }
    });

    document.getElementById('redaman').addEventListener('blur', function() {
        let value = this.value.trim();
        if (value) {
            value = value.replace(/^-/, '');
            value = `-${value}`;
            if (!value.toLowerCase().includes('dbm')) {
                value = `${value} dBm`;
            }
            this.value = value;
        }
    });

    document.getElementById('password').addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.value = '12345';
        }
    });

    document.getElementById('mac').addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^a-fA-F0-9]/g, '');
        if (value.length > 2) {
            value = value.match(/.{1,2}/g).join(':');
        }
        if (value.length > 17) {
            value = value.substring(0, 17);
        }
        e.target.value = value;
    });

    modeSelect.addEventListener('change', function() {
        aturModeForm(this.value);
        simpanPreferensi();
    });

    document.getElementById('teknisi').addEventListener('change', simpanPreferensi);
    document.getElementById('promo').addEventListener('blur', simpanPreferensi);

    document.getElementById('generateBtn').addEventListener('click', function() {
        if (modeSelect.value === 'gantiModem') {
            buatScriptGantiModem();
        } else {
            buatScriptRegistrasi();
        }
    });

    aturModeForm(modeSelect.value);
});

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        if (document.getElementById('modeSelect').value === 'gantiModem') {
            buatScriptGantiModem();
        } else {
            buatScriptRegistrasi();
        }
    } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        salinOutput();
    } else if (e.ctrlKey && e.key === 'g') {
        if (document.getElementById('modeSelect').value === 'gantiModem') {
            buatScriptGantiModem();
        } else {
            buatScriptRegistrasi();
        }
    } else if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        bersihkanForm();
    }
});
