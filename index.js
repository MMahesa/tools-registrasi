let selectedPaket = '';

const paketOptions = [
    'Paket UP TO 25 Mbps',
    'Paket UP TO 50 Mbps',
    'Paket UP TO 75 Mbps',
    'Paket UP TO 100 Mbps',
    'Paket UP TO 125 Mbps'
];

const odpVlanMapping = {
    'LEWE': 10,
    'LEWE-GPON': 50,
    'LMO': 10,
    'KND': 10,
    'CRT': 10,
    'SMD01': 10,
    'SMD02': 10,
    'CKD': 10,
    'DMG': 10,
    'PGS': 50,
    'RWG': 50,
    'BLK': 50,
    'CRG': 50,
    'PML': 50,
    'BMY01': 20,
    'BMY02': 20,
    'BMY03': 20
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize paket dropdown
    const paketButton = document.getElementById('paketButton');
    const paketDropdown = document.getElementById('paketDropdown');
    const paketSearch = document.getElementById('paketSearch');
    const paketList = document.getElementById('paketList');

    // Populate paket list
    function tampilkanDaftarPaket(filter = '') {
        const filteredPaket = paketOptions.filter(paket => 
            paket.toLowerCase().includes(filter.toLowerCase())
        );
        
        paketList.innerHTML = filteredPaket.map(paket => 
            `<div class="paket-item" data-paket="${paket}">${paket}</div>`
        ).join('');

        // Add click handlers to paket items
        document.querySelectorAll('.paket-item').forEach(item => {
            item.addEventListener('click', function() {
                selectedPaket = this.getAttribute('data-paket');
                document.getElementById('selectedPaket').value = selectedPaket;
                paketDropdown.classList.add('hidden');
                paketSearch.value = '';
            });
        });
    }

    tampilkanDaftarPaket();

    // Toggle dropdown
    paketButton.addEventListener('click', function() {
        paketDropdown.classList.toggle('hidden');
        if (!paketDropdown.classList.contains('hidden')) {
            paketSearch.focus();
        }
    });

    // Search functionality
    paketSearch.addEventListener('input', function() {
        tampilkanDaftarPaket(this.value);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.form-group')) {
            paketDropdown.classList.add('hidden');
        }
    });

    // ODP change handler
    document.getElementById('odp').addEventListener('change', function() {
        const selectedODP = this.value;
        const vlanField = document.getElementById('vlan');
        
        if (selectedODP && odpVlanMapping[selectedODP]) {
            vlanField.value = odpVlanMapping[selectedODP];
        } else {
            vlanField.value = '';
        }
    });

    // Username auto-format
    document.getElementById('username').addEventListener('blur', function() {
        let value = this.value.trim();
        if (value && !value.includes('@')) {
            this.value = value + '@harmonika.id';
        }
    });

    // Redaman auto-format
    document.getElementById('redaman').addEventListener('blur', function() {
        let value = this.value.trim();
        if (value) {
            // Remove existing - if present
            value = value.replace(/^-/, '');
            // Add - at the beginning
            value = '-' + value;
            // Add dBm if not present
            if (!value.toLowerCase().includes('dbm')) {
                value = value + ' dBm';
            }
            this.value = value;
        }
    });

    // Password default
    document.getElementById('password').addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.value = '12345';
        }
    });

    // MAC address formatting
    document.getElementById('mac').addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^a-fA-F0-9]/g, '');
        
        // Add colon after every 2 characters
        if (value.length > 2) {
            value = value.match(/.{1,2}/g).join(':');
        }
        
        // Limit to MAC address length (17 characters with colons)
        if (value.length > 17) {
            value = value.substring(0, 17);
        }
        
        e.target.value = value;
    });

    // Mode selector handler
    document.getElementById('modeSelect').addEventListener('change', function() {
        const mode = this.value;
        const formTitle = document.getElementById('formTitle');
        const generateBtn = document.getElementById('generateBtn');
        const passwordGroup = document.getElementById('passwordGroup');
        const paketGroup = document.getElementById('paketGroup');
        const promoGroup = document.querySelector('label[for="promo"]').parentElement;
        
        if (mode === 'gantiModem') {
            formTitle.textContent = 'Formulir Ganti Modem';
            generateBtn.innerHTML = 'Generate Script Ganti Modem';
            passwordGroup.style.display = 'none';
            paketGroup.style.display = 'none';
            promoGroup.style.display = 'none';
            // Clear password field for ganti modem mode
            document.getElementById('password').value = '';
        } else {
            formTitle.textContent = 'Formulir Registrasi Pelanggan Baru';
            generateBtn.innerHTML = 'Generate Script Registrasi';
            passwordGroup.style.display = 'block';
            paketGroup.style.display = 'block';
            promoGroup.style.display = 'block';
        }
    });

    // Generate button handler
    document.getElementById('generateBtn').addEventListener('click', function() {
        const mode = document.getElementById('modeSelect').value;
        if (mode === 'gantiModem') {
            buatScriptGantiModem();
        } else {
            buatScriptRegistrasi();
        }
    });
});

        function buatScriptGantiModem() {
    // Validasi form untuk ganti modem
    const requiredFields = ['nama', 'sn', 'mac', 'redaman', 'vlan', 'tikor', 'odp', 'teknisi'];
    const missingFields = [];
    
    for (let field of requiredFields) {
        const value = document.getElementById(field).value.trim();
        if (!value) {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        tampilkanNotifikasi(`Harap lengkapi field: ${missingFields.join(', ')}`, 'error');
        return;
    }

    // Get values
    const nama = document.getElementById('nama').value.trim();
    const sn = document.getElementById('sn').value.trim();
    const mac = document.getElementById('mac').value.trim();
    const redaman = document.getElementById('redaman').value.trim();
    const userInput = document.getElementById('username').value.trim().replace('@harmonika.id', '');
    const username = userInput ? userInput + '@harmonika.id' : '@harmonika.id';
    const password = '12345';
    const vlan = document.getElementById('vlan').value.trim();
    const tikor = document.getElementById('tikor').value.trim();
    const odp = document.getElementById('odp').value.trim();
    const odpCode = document.getElementById('odpCode').value.trim();
    const teknisi = document.getElementById('teknisi').value;
    
    // Combine ODP and ODP code
    const odpFull = odpCode ? `${odp} ${odpCode}` : odp;
    const paket = 'Paket UP TO 50Mbps';

    // Generate script untuk Ganti Modem
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
    
    // Scroll to output
    document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
}

function buatScriptRegistrasi() {
    // Validasi form
    const requiredFields = ['nama', 'sn', 'mac', 'redaman', 'username', 'password', 'vlan', 'tikor', 'odp', 'teknisi'];
    const missingFields = [];
    
    for (let field of requiredFields) {
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

    // Get values
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

    // Combine ODP and ODP code
    const odpFull = odpCode ? `${odp} ${odpCode}` : odp;

    // Generate script untuk Telegram
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
    
    // Scroll to output
    document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
}

function bersihkanForm() {
    if (!confirm('Yakin ingin menghapus semua data form?')) {
        return;
    }

    // Clear all inputs
    document.querySelectorAll('input').forEach(input => {
        input.value = '';
    });
    
    // Reset default values
    document.getElementById('promo').value = 'FREE PEMASANGAN';
    document.getElementById('teknisi').value = '';
    document.getElementById('output').textContent = '';
    
    // Clear selected package
    selectedPaket = '';
    
    // Reset mode selector to registrasi
    document.getElementById('modeSelect').value = 'registrasi';
    
    // Trigger mode change to reset form visibility
    document.getElementById('modeSelect').dispatchEvent(new Event('change'));
    
    tampilkanNotifikasi('Form berhasil dibersihkan!');
}

function salinOutput() {
    const output = document.getElementById('output').textContent;
    
    if (!output.trim()) {
        tampilkanNotifikasi('Tidak ada output untuk disalin!', 'error');
        return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(output).then(() => {
        tampilkanNotifikasi('Output berhasil disalin ke clipboard!');
    }).catch(() => {
        // Fallback for older browsers
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

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            const mode = document.getElementById('modeSelect').value;
            if (mode === 'gantiModem') {
                buatScriptGantiModem();
            } else {
                buatScriptRegistrasi();
            }
        } else if (e.ctrlKey && e.key === 'c' && e.shiftKey) {
            salinOutput();
        } else if (e.ctrlKey && e.key === 'g') {
            const mode = document.getElementById('modeSelect').value;
            if (mode === 'gantiModem') {
                buatScriptGantiModem();
            } else {
                buatScriptRegistrasi();
            }
        } else if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            bersihkanForm();
        }
    });