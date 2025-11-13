// ===== GLOBAL VARIABLES =====
let currentUser = null;
let currentPage = 'landingPage';
let editingUserId = null;
let editingProductId = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
    }, 1000);

    // Load user data from localStorage
    loadUserData();
    
    // Initialize testimonials
    initializeTestimonials();
    
    // Initialize notifications
    initializeNotifications();
    
    // Initialize products
    initializeProducts();
    
    // Initialize membership data
    initializeMembership();
    
    // Load admin settings
    loadAdminSettings();
    
    // Set up event listeners
    setupEventListeners();
    
    // Show landing page
    showPage('landingPage');
}

// ===== PAGE MANAGEMENT =====
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageId;
        
        // Page-specific initialization
        if (pageId === 'dashboardPage') {
            updateDashboardData();
        } else if (pageId === 'membershipPage') {
            updateMembershipDisplay();
        } else if (pageId === 'adminPage') {
            updateAdminData();
        }
    }
    
    // Close side menu if open
    closeSideMenu();
}

// ===== AUTHENTICATION =====
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        tabButtons[0].classList.add('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        tabButtons[1].classList.add('active');
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user by email (password check is bypassed as per requirements)
    let user = users.find(u => u.email === email);
    
    if (!user) {
        // Create new user if not exists (auto-registration)
        user = {
            id: Date.now().toString(),
            email: email,
            phone: '08' + Math.floor(Math.random() * 1000000000).toString().padStart(8, '0'),
            username: email.split('@')[0],
            level: 'Warrior',
            clicks: 0,
            orders: 0,
            balance: 0,
            joinDate: new Date().toISOString()
        };
        
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Set current user
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI and redirect
    updateUserData();
    showPage('dashboardPage');
    
    // Show success message
    showNotification('Login berhasil! Selamat datang kembali.', 'success');
}

function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        showNotification('Password tidak cocok!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password minimal 6 karakter!', 'error');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        showNotification('Email sudah terdaftar!', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        username: username,
        email: email,
        phone: phone,
        level: 'Warrior',
        clicks: 0,
        orders: 0,
        balance: 0,
        joinDate: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set current user
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI and redirect
    updateUserData();
    showPage('dashboardPage');
    
    // Show success message
    showNotification('Pendaftaran berhasil! Selamat datang di AffiliatePro.', 'success');
}

function showForgotPassword() {
    showModal('forgotPasswordModal');
}

function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword !== confirmPassword) {
        showNotification('Password tidak cocok!', 'error');
        return;
    }
    
    // Get users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find and update user
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        showNotification('Password berhasil direset!', 'success');
        closeModal();
    } else {
        showNotification('Email tidak ditemukan!', 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showPage('landingPage');
    showNotification('Anda telah keluar dari sistem.', 'info');
}

// ===== USER DATA MANAGEMENT =====
function loadUserData() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserData();
    }
}

function updateUserData() {
    if (currentUser) {
        // Update user name displays
        const userNameElements = document.querySelectorAll('#userName, #profileName');
        userNameElements.forEach(el => {
            el.textContent = currentUser.username || currentUser.email.split('@')[0];
        });
        
        // Update profile info
        const profileEmail = document.getElementById('profileEmail');
        const profilePhone = document.getElementById('profilePhone');
        const profileLevel = document.getElementById('profileLevel');
        
        if (profileEmail) profileEmail.textContent = currentUser.email;
        if (profilePhone) profilePhone.textContent = currentUser.phone;
        if (profileLevel) profileLevel.textContent = currentUser.level;
        
        // Update dashboard data
        updateDashboardData();
    }
}

function updateDashboardData() {
    if (!currentUser) return;
    
    // Update metrics
    const clickCount = document.getElementById('clickCount');
    const orderCount = document.getElementById('orderCount');
    const balance = document.getElementById('balance');
    const userLevel = document.getElementById('userLevel');
    const activeCommission = document.getElementById('activeCommission');
    
    if (clickCount) clickCount.textContent = currentUser.clicks || 0;
    if (orderCount) orderCount.textContent = currentUser.orders || 0;
    if (balance) balance.textContent = formatCurrency(currentUser.balance || 0);
    if (userLevel) userLevel.textContent = currentUser.level;
    
    // Get commission rate based on level
    const commissionRate = getCommissionRate(currentUser.level);
    if (activeCommission) activeCommission.textContent = commissionRate + '%';
}

// ===== DASHBOARD FUNCTIONS =====
function toggleMenu() {
    const sideMenu = document.getElementById('sideMenu');
    sideMenu.classList.toggle('active');
}

function closeSideMenu() {
    const sideMenu = document.getElementById('sideMenu');
    sideMenu.classList.remove('active');
}

function showDashboardSection(section) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(s => s.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(section + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    // Find and activate corresponding menu item
    const activeMenuItem = Array.from(menuItems).find(item => 
        item.getAttribute('onclick').includes(section)
    );
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }
    
    // Close side menu
    closeSideMenu();
    
    // Load section-specific data
    if (section === 'products') {
        loadProducts();
    }
}

function copyAffiliateLink() {
    const affiliateLink = `https://affiliatepro.com/ref=${currentUser.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(affiliateLink).then(() => {
        showNotification('Link affiliate berhasil disalin!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = affiliateLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Link affiliate berhasil disalin!', 'success');
    });
}

// ===== WITHDRAW FUNCTIONS =====
function showWithdrawForm() {
    showModal('withdrawModal');
}

function handleWithdraw(event) {
    event.preventDefault();
    
    const name = document.getElementById('withdrawName').value;
    const account = document.getElementById('withdrawAccount').value;
    const bank = document.getElementById('withdrawBank').value;
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    
    // Check minimum withdrawal
    const minWithdraw = parseInt(localStorage.getItem('minWithdraw') || '50000');
    if (amount < minWithdraw) {
        showNotification(`Minimal penarikan adalah ${formatCurrency(minWithdraw)}`, 'error');
        return;
    }
    
    // Check user balance
    if (amount > (currentUser.balance || 0)) {
        showNotification('Saldo tidak mencukupi!', 'error');
        return;
    }
    
    // Check if user can withdraw (based on membership level)
    const canWithdraw = ['Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic'].includes(currentUser.level);
    if (!canWithdraw) {
        showNotification('Upgrade membership untuk melakukan penarikan!', 'warning');
        closeModal();
        return;
    }
    
    // Process withdrawal (in real app, this would connect to payment system)
    showNotification('Permintaan penarikan sedang diproses!', 'success');
    closeModal();
    
    // Reset form
    event.target.reset();
}

// ===== TESTIMONIALS =====
function initializeTestimonials() {
    const testimonials = [
        { name: 'Andi Wijaya', text: 'Sudah 3 bulan bergabung, komisi selalu tepat waktu!' },
        { name: 'Siti Nurhaliza', text: 'Mudah sekali dapat uang dari HP, recommended!' },
        { name: 'Budi Santoso', text: 'Affiliate program terbaik yang pernah saya ikuti.' },
        { name: 'Maya Putri', text: 'Komisi besar, produk berkualitas, mantap!' },
        { name: 'Rudi Hermawan', text: 'Dari nol sampai bisa beli motor, thanks AffiliatePro!' },
        { name: 'Dewi Lestari', text: 'Sangat membantu finansial keluarga saya.' },
        { name: 'Ahmad Fauzi', text: 'Platform yang trustworthy dan pembayaran cepat.' },
        { name: 'Lisa Anggraini', text: 'Modal HP saja sudah bisa menghasilkan jutaan.' },
        { name: 'Joko Prasetyo', text: 'Best affiliate program di Indonesia!' },
        { name: 'Rina Susanti', text: 'Sudah withdraw 5 kali, selalu berhasil.' },
        { name: 'Eko Widodo', text: 'Customer service responsif, komisi transparent.' },
        { name: 'Fitri Handayani', text: 'Rekomended banget untuk cari tambahan.' },
        { name: 'Hadi Kurniawan', text: 'Sudah dapat 10 juta dalam 2 bulan!' },
        { name: 'Nina Permata', text: 'Mudah dipahami, cocok untuk pemula.' },
        { name: 'Dedi Setiawan', text: 'Affiliate program yang benar-benar membayar.' }
    ];
    
    const container = document.getElementById('testimonialsScroll');
    if (container) {
        container.innerHTML = '';
        
        testimonials.forEach((testimonial, index) => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            card.innerHTML = `
                <div class="testimonial-header">
                    <div class="testimonial-avatar">${testimonial.name.charAt(0)}</div>
                    <div class="testimonial-name">${testimonial.name}</div>
                </div>
                <div class="testimonial-text">"${testimonial.text}"</div>
            `;
            container.appendChild(card);
        });
        
        // Auto-scroll testimonials
        setInterval(() => {
            if (currentPage === 'landingPage') {
                container.scrollLeft += 320;
                if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
                    container.scrollLeft = 0;
                }
            }
        }, 3000);
    }
}

// ===== NOTIFICATIONS =====
function initializeNotifications() {
    updateNotifications();
    setInterval(updateNotifications, 5000);
}

function updateNotifications() {
    const container = document.getElementById('notificationsScroll');
    if (!container) return;
    
    const names = ['Budi', 'Siti', 'Andi', 'Maya', 'Rudi', 'Dewi', 'Ahmad', 'Lisa'];
    const levels = ['Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic'];
    
    container.innerHTML = '';
    
    for (let i = 0; i < 10; i++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const level = levels[Math.floor(Math.random() * levels.length)];
        const amount = Math.floor(Math.random() * 50000000) + 5000000;
        const phone = '08' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        
        const notification = document.createElement('div');
        notification.className = 'notification-item';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${name}*****${phone.slice(-2)} ${level} ${formatCurrency(amount)}</span>
        `;
        container.appendChild(notification);
    }
}

// ===== PRODUCTS =====
function initializeProducts() {
    const defaultProducts = [
        { id: 1, name: 'Smartphone Samsung Galaxy A54', price: 5000000, commission: 5, image: '', url: 'https://example.com/samsung-a54' },
        { id: 2, name: 'Laptop ASUS ROG Gaming', price: 15000000, commission: 8, image: '', url: 'https://example.com/asus-rog' },
        { id: 3, name: 'Sony WH-1000XM5 Headphone', price: 3500000, commission: 6, image: '', url: 'https://example.com/sony-headphone' },
        { id: 4, name: 'iPad Air Gen 5', price: 8000000, commission: 7, image: '', url: 'https://example.com/ipad-air' },
        { id: 5, name: 'Smartwatch Apple Watch Series 9', price: 6000000, commission: 6, image: '', url: 'https://example.com/apple-watch' },
        { id: 6, name: 'Camera Canon EOS R50', price: 12000000, commission: 8, image: '', url: 'https://example.com/canon-r50' },
        { id: 7, name: 'PlayStation 5 Console', price: 7500000, commission: 5, image: '', url: 'https://example.com/ps5' },
        { id: 8, name: 'Nintendo Switch OLED', price: 4500000, commission: 6, image: '', url: 'https://example.com/switch-oled' },
        { id: 9, name: 'Samsung 55" 4K Smart TV', price: 9000000, commission: 7, image: '', url: 'https://example.com/samsung-tv' },
        { id: 10, name: 'Dyson V15 Vacuum Cleaner', price: 11000000, commission: 8, image: '', url: 'https://example.com/dyson-v15' },
        { id: 11, name: 'Xiaomi Robot Vacuum', price: 3500000, commission: 6, image: '', url: 'https://example.com/xiaomi-vacuum' },
        { id: 12, name: 'GoPro Hero 12 Black', price: 5500000, commission: 7, image: '', url: 'https://example.com/gopro-hero12' },
        { id: 13, name: 'DJI Mini 3 Pro Drone', price: 10000000, commission: 8, image: '', url: 'https://example.com/dji-mini3' },
        { id: 14, name: 'iPad Pro 12.9" M2', price: 15000000, commission: 8, image: '', url: 'https://example.com/ipad-pro' },
        { id: 15, name: 'MacBook Air M2', price: 18000000, commission: 10, image: '', url: 'https://example.com/macbook-air' },
        { id: 16, name: 'iPhone 15 Pro Max', price: 20000000, commission: 10, image: '', url: 'https://example.com/iphone15' },
        { id: 17, name: 'Samsung Galaxy S24 Ultra', price: 19000000, commission: 10, image: '', url: 'https://example.com/s24-ultra' },
        { id: 18, name: 'AirPods Pro 2nd Gen', price: 2500000, commission: 5, image: '', url: 'https://example.com/airpods-pro' },
        { id: 19, name: 'Sony PlayStation VR2', price: 8500000, commission: 7, image: '', url: 'https://example.com/psvr2' },
        { id: 20, name: 'Microsoft Surface Pro 9', price: 13000000, commission: 8, image: '', url: 'https://example.com/surface-pro9' }
    ];
    
    // Save to localStorage if not exists
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
}

function loadProducts() {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const userLevel = currentUser ? currentUser.level : 'Warrior';
    const userCommissionRate = getCommissionRate(userLevel);
    
    container.innerHTML = '';
    
    products.forEach((product, index) => {
        const isLocked = product.commission > userCommissionRate;
        const card = document.createElement('div');
        card.className = `product-card ${isLocked ? 'locked' : ''}`;
        
        card.innerHTML = `
            ${isLocked ? '<div class="lock-overlay"><i class="fas fa-lock"></i> Locked</div>' : ''}
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<i class="fas fa-box"></i>'}
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${formatCurrency(product.price)}</div>
                <div class="product-commission">Komisi: ${product.commission}%</div>
                <div class="product-actions">
                    <button class="btn-primary" onclick="copyProductLink('${product.url}')" ${isLocked ? 'disabled' : ''}>
                        <i class="fas fa-copy"></i> Salin Link
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
        
        // Show upgrade modal on scroll to bottom for non-premium users
        if (index === 19 && !['Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic'].includes(userLevel)) {
            container.addEventListener('scroll', function() {
                if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
                    showUpgradeModal();
                }
            });
        }
    });
}

function copyProductLink(productUrl) {
    const affiliateLink = `${productUrl}?ref=${currentUser.id}`;
    
    navigator.clipboard.writeText(affiliateLink).then(() => {
        showNotification('Link produk berhasil disalin!', 'success');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = affiliateLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Link produk berhasil disalin!', 'success');
    });
}

// ===== MEMBERSHIP =====
function initializeMembership() {
    const defaultMembership = {
        Warrior: { price: 0, commission: 5 },
        Master: { price: 100000, commission: 8 },
        Grandmaster: { price: 250000, commission: 12 },
        Epic: { price: 500000, commission: 15 },
        Legend: { price: 1000000, commission: 20 },
        Mythic: { price: 2500000, commission: 25 }
    };
    
    if (!localStorage.getItem('membershipSettings')) {
        localStorage.setItem('membershipSettings', JSON.stringify(defaultMembership));
    }
}

function updateMembershipDisplay() {
    const container = document.getElementById('membershipGrid');
    if (!container) return;
    
    const membershipSettings = JSON.parse(localStorage.getItem('membershipSettings') || '{}');
    const currentLevel = currentUser ? currentUser.level : 'Warrior';
    
    container.innerHTML = '';
    
    Object.entries(membershipSettings).forEach(([level, settings]) => {
        const isCurrent = level === currentLevel;
        const canUpgrade = getLevelIndex(level) > getLevelIndex(currentLevel);
        
        const card = document.createElement('div');
        card.className = `membership-card ${isCurrent ? 'current' : ''}`;
        
        card.innerHTML = `
            <div class="membership-level">${level}</div>
            <div class="membership-commission">${settings.commission}%</div>
            <div class="membership-price">${formatCurrency(settings.price)}</div>
            <div class="membership-features">
                <div class="feature-row">
                    <i class="fas fa-check"></i>
                    <span>Komisi ${settings.commission}%</span>
                </div>
                <div class="feature-row">
                    <i class="fas fa-check"></i>
                    <span>Akses ${getProductAccess(level)} produk</span>
                </div>
                <div class="feature-row">
                    <i class="fas fa-check"></i>
                    <span>${canWithdraw(level) ? 'Bisa Withdraw' : 'Tidak Bisa Withdraw'}</span>
                </div>
                <div class="feature-row">
                    <i class="fas fa-check"></i>
                    <span>Support 24/7</span>
                </div>
            </div>
            <button class="btn-upgrade" ${isCurrent ? 'disabled' : ''} onclick="upgradeMembership('${level}')">
                ${isCurrent ? 'Level Saat Ini' : 'Upgrade Sekarang'}
            </button>
        `;
        
        container.appendChild(card);
    });
}

function upgradeMembership(level) {
    if (!currentUser) {
        showPage('loginPage');
        return;
    }
    
    const membershipSettings = JSON.parse(localStorage.getItem('membershipSettings') || '{}');
    const currentLevelIndex = getLevelIndex(currentUser.level);
    const targetLevelIndex = getLevelIndex(level);
    
    if (targetLevelIndex <= currentLevelIndex) {
        showNotification('Anda sudah berada di level ini atau lebih tinggi!', 'info');
        return;
    }
    
    const price = membershipSettings[level].price;
    
    // Store upgrade data globally
    window.pendingUpgrade = {
        level: level,
        price: price,
        currentLevel: currentUser.level
    };
    
    // Populate modal with upgrade info
    document.getElementById('currentLevelDisplay').textContent = currentUser.level;
    document.getElementById('targetLevelDisplay').textContent = level;
    document.getElementById('upgradePriceDisplay').textContent = formatCurrency(price);
    
    // Get bank info from settings
    const bankName = localStorage.getItem('bankName') || 'BCA';
    const bankAccount = localStorage.getItem('bankAccount') || '1234567890';
    const adminName = localStorage.getItem('adminName') || 'Admin AffiliatePro';
    
    document.getElementById('paymentBank').textContent = bankName;
    document.getElementById('paymentAccount').textContent = bankAccount;
    document.getElementById('paymentName').textContent = adminName;
    
    // Show confirmation modal instead of simple confirm
    showModal('upgradeConfirmModal');
}

// ===== ADMIN FUNCTIONS =====
function showAdminAccess() {
    showModal('adminAccessModal');
}

function handleAdminAccess(event) {
    event.preventDefault();
    
    const code = document.getElementById('adminCode').value;
    
    if (code === '521389') {
        showPage('adminPage');
        closeModal();
        showNotification('Selamat datang di Admin Dashboard', 'success');
    } else {
        showNotification('Kode akses salah!', 'error');
    }
}

function confirmUpgradePayment() {
    if (!window.pendingUpgrade) {
        showNotification('Tidak ada upgrade yang pending!', 'error');
        return;
    }
    
    const { level, price, currentLevel } = window.pendingUpgrade;
    
    // Get admin WhatsApp from settings
    const contactUrl = localStorage.getItem('contactUrl') || 'https://wa.me/628123456789';
    
    // Create upgrade message
    const message = encodeURIComponent(
        `Halo Admin, saya mau upgrade membership:\n\n` +
        `• Level Saat Ini: ${currentLevel}\n` +
        `• Upgrade Ke: ${level}\n` +
        `• Total Pembayaran: Rp ${price.toLocaleString('id-ID')}\n\n` +
        `Sudah transfer, mohon segera diproses. Terima kasih!`
    );
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `${contactUrl}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Show notification
    showNotification('Membuka WhatsApp untuk konfirmasi pembayaran...', 'success');
    
    // Clear pending upgrade
    window.pendingUpgrade = null;
    
    // Close modal
    closeModal();
}

function showAdminTab(tab) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    // Remove active from buttons
    const buttons = document.querySelectorAll('.admin-tab-btn');
    buttons.forEach(b => b.classList.remove('active'));
    
    // Show selected tab
    const targetTab = document.getElementById(tab + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Activate button
    const activeButton = Array.from(buttons).find(btn => 
        btn.getAttribute('onclick').includes(tab)
    );
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Load tab-specific data
    if (tab === 'users') {
        loadUsersTable();
    } else if (tab === 'products') {
        loadProductsTable();
    } else if (tab === 'settings') {
        loadSettingsForms();
    }
}

function updateAdminData() {
    loadUsersTable();
    loadProductsTable();
    loadSettingsForms();
}

function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.level}</td>
            <td>${user.clicks || 0}</td>
            <td>${user.orders || 0}</td>
            <td>${formatCurrency(user.balance || 0)}</td>
            <td class="table-actions">
                <button class="btn-edit" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (user) {
        editingUserId = userId;
        
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserPhone').value = user.phone;
        document.getElementById('editUserLevel').value = user.level;
        document.getElementById('editUserClicks').value = user.clicks || 0;
        document.getElementById('editUserOrders').value = user.orders || 0;
        document.getElementById('editUserBalance').value = user.balance || 0;
        
        showModal('editUserModal');
    }
}

function handleEditUser(event) {
    event.preventDefault();
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === editingUserId);
    
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            email: document.getElementById('editUserEmail').value,
            phone: document.getElementById('editUserPhone').value,
            level: document.getElementById('editUserLevel').value,
            clicks: parseInt(document.getElementById('editUserClicks').value),
            orders: parseInt(document.getElementById('editUserOrders').value),
            balance: parseInt(document.getElementById('editUserBalance').value)
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user if editing self
        if (currentUser && currentUser.id === editingUserId) {
            currentUser = users[userIndex];
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserData();
        }
        
        loadUsersTable();
        closeModal();
        showNotification('User berhasil diperbarui!', 'success');
    }
}

function deleteUser(userId) {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        
        loadUsersTable();
        showNotification('User berhasil dihapus!', 'success');
    }
}

function loadProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.commission}%</td>
            <td>${product.image ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>'}</td>
            <td><a href="${product.url}" target="_blank">Lihat</a></td>
            <td class="table-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddProductForm() {
    editingProductId = null;
    document.getElementById('productModalTitle').textContent = 'Tambah Produk Baru';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCommission').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productUrl').value = '';
    showModal('productModal');
}

function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (product) {
        editingProductId = productId;
        document.getElementById('productModalTitle').textContent = 'Edit Produk';
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCommission').value = product.commission;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productUrl').value = product.url;
        showModal('productModal');
    }
}

function handleProductSubmit(event) {
    event.preventDefault();
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    const productData = {
        name: document.getElementById('productName').value,
        price: parseInt(document.getElementById('productPrice').value),
        commission: parseInt(document.getElementById('productCommission').value),
        image: document.getElementById('productImage').value,
        url: document.getElementById('productUrl').value
    };
    
    if (editingProductId) {
        // Edit existing product
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
    } else {
        // Add new product
        productData.id = Date.now();
        products.push(productData);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    loadProductsTable();
    closeModal();
    showNotification(`Produk berhasil ${editingProductId ? 'diperbarui' : 'ditambahkan'}!`, 'success');
}

function deleteProduct(productId) {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const filteredProducts = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(filteredProducts));
        
        loadProductsTable();
        showNotification('Produk berhasil dihapus!', 'success');
    }
}

function loadSettingsForms() {
    // Load bank settings
    const bankName = localStorage.getItem('bankName') || '';
    const bankAccount = localStorage.getItem('bankAccount') || '';
    const adminName = localStorage.getItem('adminName') || '';
    
    document.getElementById('bankName').value = bankName;
    document.getElementById('bankAccount').value = bankAccount;
    document.getElementById('adminName').value = adminName;
    
    // Load membership settings
    loadMembershipSettings();
    
    // Load contact settings
    const contactUrl = localStorage.getItem('contactUrl') || '';
    document.getElementById('contactUrl').value = contactUrl;
    
    // Load withdrawal settings
    const withdrawEnabled = localStorage.getItem('withdrawEnabled') !== 'false';
    const minWithdraw = localStorage.getItem('minWithdraw') || '50000';
    
    document.getElementById('withdrawEnabled').checked = withdrawEnabled;
    document.getElementById('minWithdraw').value = minWithdraw;
}

function loadMembershipSettings() {
    const container = document.getElementById('membershipSettingsGrid');
    if (!container) return;
    
    const membershipSettings = JSON.parse(localStorage.getItem('membershipSettings') || '{}');
    
    container.innerHTML = '';
    
    Object.entries(membershipSettings).forEach(([level, settings]) => {
        const item = document.createElement('div');
        item.className = 'membership-setting-item';
        item.innerHTML = `
            <h4>${level}</h4>
            <div class="form-group">
                <label>Harga</label>
                <input type="number" id="price_${level}" value="${settings.price}" onchange="saveMembershipSetting('${level}', 'price', this.value)">
            </div>
            <div class="form-group">
                <label>Komisi (%)</label>
                <input type="number" id="commission_${level}" value="${settings.commission}" min="0" max="100" onchange="saveMembershipSetting('${level}', 'commission', this.value)">
            </div>
        `;
        container.appendChild(item);
    });
}

function saveMembershipSetting(level, field, value) {
    const membershipSettings = JSON.parse(localStorage.getItem('membershipSettings') || '{}');
    membershipSettings[level][field] = parseInt(value);
    localStorage.setItem('membershipSettings', JSON.stringify(membershipSettings));
    showNotification(`Setting ${level} berhasil diperbarui!`, 'success');
}

function saveBankSettings(event) {
    event.preventDefault();
    
    localStorage.setItem('bankName', document.getElementById('bankName').value);
    localStorage.setItem('bankAccount', document.getElementById('bankAccount').value);
    localStorage.setItem('adminName', document.getElementById('adminName').value);
    
    showNotification('Info rekening berhasil disimpan!', 'success');
}

function saveContactSettings(event) {
    event.preventDefault();
    
    const contactUrl = document.getElementById('contactUrl').value;
    localStorage.setItem('contactUrl', contactUrl);
    
    // Update contact button
    const contactBtn = document.getElementById('contactAdminBtn');
    if (contactBtn) {
        contactBtn.href = contactUrl;
    }
    
    showNotification('URL kontak berhasil disimpan!', 'success');
}

function loadAdminSettings() {
    // Load contact URL
    const contactUrl = localStorage.getItem('contactUrl') || 'https://wa.me/628123456789';
    const contactBtn = document.getElementById('contactAdminBtn');
    if (contactBtn) {
        contactBtn.href = contactUrl;
    }
}

function exportUserData() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const csv = convertToCSV(users);
    downloadCSV(csv, 'users_data.csv');
    showNotification('Data user berhasil diexport!', 'success');
}

// ===== UTILITY FUNCTIONS =====
function getCommissionRate(level) {
    const membershipSettings = JSON.parse(localStorage.getItem('membershipSettings') || '{}');
    return membershipSettings[level]?.commission || 5;
}

function getLevelIndex(level) {
    const levels = ['Warrior', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic'];
    return levels.indexOf(level);
}

function getProductAccess(level) {
    const commissionRate = getCommissionRate(level);
    if (commissionRate <= 5) return '10';
    if (commissionRate <= 8) return '15';
    if (commissionRate <= 12) return '20';
    return 'Semua';
}

function canWithdraw(level) {
    return ['Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic'].includes(level);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 3000;
        animation: slideInFromRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutToRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modalOverlay');
    
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    const overlay = document.getElementById('modalOverlay');
    
    modals.forEach(modal => modal.classList.remove('active'));
    if (overlay) overlay.classList.remove('active');
}

function showUpgradeModal() {
    showModal('upgradeModal');
}

function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function setupEventListeners() {
    // Close modals on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    // Prevent form submission on enter in modals
    document.querySelectorAll('.modal form').forEach(form => {
        form.addEventListener('submit', function(e) {
            // Let the form handler deal with submission
        });
    });
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutToRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        box-shadow: var(--shadow);
    }
    
    .notification i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);