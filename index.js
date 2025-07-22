let selectedPaket = '';

        // Initialize event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Add click handlers for package selection
            document.querySelectorAll('.paket-option').forEach(option => {
                option.addEventListener('click', function() {
                    // Remove selected class from all options
                    document.querySelectorAll('.paket-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked option
                    this.classList.add('selected');
                    selectedPaket = this.getAttribute('data-paket');
                });
            });

            // Add input validation and formatting
            document.getElementById('mac').addEventListener('input', function(e) {
                let value = e.target.value.replace(/[^a-fA-F0-9]/g, '');
                let formattedValue = value.match(/.{1,2}/g)?.join(':').substr(0, 17) || value;
                if (formattedValue !== e.target.value) {
                    e.target.value = formattedValue;
                }
            });

            document.getElementById('vlan').addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        });

        function generateScript() {
            // Validation
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
                showNotification(`Mohon lengkapi field: ${missingFields.join(', ')}`, 'error');
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
            const teknisi = document.getElementById('teknisi').value;

            // Generate simplified script for Telegram
            const script = `**Registrasi Pelanggan Baru**
Nama: ${nama}
SN: ${sn}
MAC Address: ${mac}
Redaman: ${redaman}
Username: ${username}
Password: ${password}
Vlan: ${vlan}
Tikor: ${tikor}
ODP: ${odp}
Paket: ${selectedPaket}
Promo: FREE PEMASANGAN
Teknisi: ${teknisi}`;

            document.getElementById('output').textContent = script;
            showNotification('Script berhasil dibuat!');
            
            // Scroll to output
            document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
        }

        function clearForm() {
            if (!confirm('Yakin ingin menghapus semua data?')) {
                return;
            }

            // Clear all inputs
            document.querySelectorAll('input').forEach(input => {
                input.value = '';
            });
            
            document.getElementById('teknisi').value = '';
            document.getElementById('output').textContent = '';
            
            // Clear selected package
            document.querySelectorAll('.paket-option').forEach(option => {
                option.classList.remove('selected');
            });
            selectedPaket = '';
            
            showNotification('Form berhasil dibersihkan!');
        }

        function copyOutput() {
            const output = document.getElementById('output').textContent;
            
            if (!output.trim()) {
                showNotification('Tidak ada output untuk disalin!', 'error');
                return;
            }

            // Copy to clipboard
            navigator.clipboard.writeText(output).then(() => {
                showNotification('Output berhasil disalin ke clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = output;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Output berhasil disalin!');
            });
        }

        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                generateScript();
            } else if (e.ctrlKey && e.key === 'c' && e.shiftKey) {
                copyOutput();
            } else if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                clearForm();
            }
        });