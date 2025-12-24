// Load data from JSON files
let data = {};
let notifications = [];
let projects = [];
let homeData = {};
let saleScripts = [];
let donateData = {};
let discordConfig = {};
let discordData = null;

// Load all JSON data
async function loadData() {
    try {
        const [dataRes, notifyRes, projectRes, homeRes, saleRes, donateRes, discordRes] = await Promise.all([
            fetch('data/data.json'),
            fetch('data/notify.json'),
            fetch('data/project.json'),
            fetch('data/home.json'),
            fetch('data/sale.json'),
            fetch('data/donate.json'),
            fetch('data/discord.json')
        ]);

        data = await dataRes.json();
        notifications = await notifyRes.json();
        projects = await projectRes.json();
        homeData = await homeRes.json();
        saleScripts = await saleRes.json();
        donateData = await donateRes.json();
        discordConfig = await discordRes.json();

        initializeApp();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        // Sử dụng dữ liệu mặc định nếu file không tồn tại
        useDefaultData();
        initializeApp();
    }
}

// Default data if JSON files don't exist
function useDefaultData() {
    data = {
        name: "CODEPULSE",
        description: "Chuyên code FiveM chất lượng cao",
        status: "ONLINE"
    };

    notifications = [
        {
            id: 1,
            title: "Chào mừng đến với CODEPULSE",
            message: "Chào mừng bạn đến với CODEPULSE - Studio Phát triển FiveM",
            date: new Date().toLocaleDateString('vi-VN')
        }
    ];

    projects = [
        {
            id: 1,
            title: "Dự án mẫu",
            description: "Đây là một dự án mẫu của CODEPULSE",
            tags: ["FiveM", "Lua", "JavaScript"]
        }
    ];

    donateData = {
        donate: "off",
        link: ""
    };
}

// Initialize the application
function initializeApp() {
    setupNavigation();
    setupNotificationBell();
    setupDonateButton();
    updateStatusDisplay(); // Cập nhật trạng thái ngay lập tức
    renderHome();
    renderProjects();
    renderSaleScripts();
    renderNotifications();
    renderDiscord(); // Render Discord UI từ config
    loadDiscordData(); // Load Discord stats từ API
    renderAbout();
    updateNotificationBadge();
    
    // Cập nhật trạng thái mỗi phút để phản ánh thời gian hiện tại
    setInterval(updateStatusDisplay, 60000);
}

// Setup Donate Button
function setupDonateButton() {
    const donateBtn = document.getElementById('donateBtn');
    const donateModal = document.getElementById('donateModal');
    const donateModalClose = document.getElementById('donateModalClose');
    const donateModalOverlay = document.querySelector('.donate-modal-overlay');
    
    if (!donateBtn || !donateModal) return;

    if (donateData && donateData.donate === 'on') {
        donateBtn.style.display = 'flex';
        
        // Open modal on click
        donateBtn.addEventListener('click', () => {
            openDonateModal();
        });
        
        // Close modal
        if (donateModalClose) {
            donateModalClose.addEventListener('click', () => {
                closeDonateModal();
            });
        }
        
        if (donateModalOverlay) {
            donateModalOverlay.addEventListener('click', () => {
                closeDonateModal();
            });
        }
    } else {
        donateBtn.style.display = 'none';
    }
}

// Open Donate Modal
function openDonateModal() {
    const modal = document.getElementById('donateModal');
    if (!modal || !donateData) return;
    
    // Update modal content
    const accountName = document.getElementById('donateAccountName');
    const accountNumber = document.getElementById('donateAccountNumber');
    const bank = document.getElementById('donateBank');
    const content = document.getElementById('donateContent');
    const qrCode = document.getElementById('donateQRCode');
    
    if (accountName) accountName.textContent = donateData.accountName || '-';
    if (accountNumber) accountNumber.textContent = donateData.accountNumber || '-';
    if (bank) bank.textContent = donateData.bank || '-';
    if (content) content.textContent = donateData.content || '-';
    
    // Generate VietQR
    if (qrCode) {
        generateVietQR();
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Donate Modal
function closeDonateModal() {
    const modal = document.getElementById('donateModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Generate VietQR Code
function generateVietQR() {
    const qrCode = document.getElementById('donateQRCode');
    if (!qrCode || !donateData) return;
    
    const accountName = donateData.accountName || '';
    const accountNumber = donateData.accountNumber || '';
    const bank = donateData.bank || '';
    const amount = donateData.amount || '';
    const content = donateData.content || 'ỦNG HỘ CODEPULSE';
    
    // Build VietQR URL
    // Format: https://img.vietqr.io/image/{bank}-{accountNumber}-compact2.jpg?amount={amount}&addInfo={content}&accountName={accountName}
    const bankCode = getBankCode(bank);
    let qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg`;
    
    const params = [];
    if (amount) params.push(`amount=${encodeURIComponent(amount)}`);
    if (content) params.push(`addInfo=${encodeURIComponent(content)}`);
    if (accountName) params.push(`accountName=${encodeURIComponent(accountName)}`);
    
    if (params.length > 0) {
        qrUrl += '?' + params.join('&');
    }
    
    qrCode.innerHTML = `<img src="${qrUrl}" alt="VietQR Code" class="donate-qr-image">`;
    
    // Setup copy button
    setupDonateCopyButton();
}

// Get Bank Code for VietQR
function getBankCode(bankName) {
    const bankCodes = {
        'Vietcombank': 'VCB',
        'Vietinbank': 'CTG',
        'BIDV': 'BID',
        'Agribank': 'VBA',
        'Techcombank': 'TCB',
        'MBBank': 'MBB',
        'ACB': 'ACB',
        'VPBank': 'VPB',
        'TPBank': 'TPB',
        'Sacombank': 'STB',
        'HDBank': 'HDB',
        'SHB': 'SHB',
        'Eximbank': 'EIB',
        'MSB': 'MSB',
        'VIB': 'VIB',
        'SeABank': 'SSB',
        'PGBank': 'PGB',
        'NamABank': 'NAB',
        'OCB': 'OCB',
        'PVcomBank': 'PVC',
        'VietABank': 'VAB',
        'ABBank': 'ABB',
        'BacABank': 'BAB',
        'SCB': 'SCB',
        'VCCB': 'VCCB',
        'VietBank': 'VTB',
        'BAOVIETBank': 'BVB',
        'PublicBank': 'PBV',
        'GPBank': 'GPB',
        'KienLongBank': 'KLB',
        'DongABank': 'DAB',
        'NCB': 'NCB',
        'OCEANBANK': 'OCEAN',
        'PvcomBank': 'PVC',
        'VietCapitalBank': 'VCB',
        'VietnamBank': 'VNB'
    };
    
    return bankCodes[bankName] || 'VCB';
}

// Setup Copy Button
function setupDonateCopyButton() {
    const copyBtn = document.getElementById('donateCopyBtn');
    if (!copyBtn || !donateData) return;
    
    copyBtn.addEventListener('click', () => {
        const text = `Chủ tài khoản: ${donateData.accountName || ''}\nSố tài khoản: ${donateData.accountNumber || ''}\nNgân hàng: ${donateData.bank || ''}\nNội dung: ${donateData.content || ''}`;
        
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Đã sao chép!';
            copyBtn.style.background = 'var(--online-color)';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Không thể sao chép:', err);
        });
    });
}

// Navigation functionality
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');

            // Remove active class from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            // Add active class to clicked button and corresponding section
            button.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

// Check if current time is within working hours
function checkWorkingHours() {
    if (!data.workingHours) {
        return true; // Default to online if no working hours configured
    }

    const now = new Date();
    const currentHour = now.getHours();
    const startHour = data.workingHours.start || 7;
    const endHour = data.workingHours.end || 21;

    // Check if current hour is between start and end
    return currentHour >= startHour && currentHour < endHour;
}

// Get current status based on working hours
function getCurrentStatus() {
    return checkWorkingHours() ? 'ONLINE' : 'OFFLINE';
}

// Update status display
function updateStatusDisplay() {
    const activeStatus = document.getElementById('active-status');
    const statusDot = document.getElementById('status-dot');
    
    if (activeStatus) {
        const status = getCurrentStatus();
        activeStatus.textContent = status;
        
        // Update class based on status
        activeStatus.className = 'stat-number';
        if (status === 'ONLINE') {
            activeStatus.classList.add('status-online');
        } else {
            activeStatus.classList.add('status-offline');
        }
    }
    
    // Update status dot
    if (statusDot) {
        const status = getCurrentStatus();
        statusDot.className = 'status-dot';
        if (status === 'ONLINE') {
            statusDot.classList.add('status-online');
        } else {
            statusDot.classList.add('status-offline');
        }
    }
}

// Render Home Section
function renderHome() {
    if (!homeData || Object.keys(homeData).length === 0) {
        // Fallback if home.json not loaded
        renderHomeFallback();
        return;
    }

    renderHero();
    renderStats();
    renderServices();
    renderProcess();
    renderTechStack();
    renderFeatures();
    renderFeaturedProjects();
    
    updateNotificationBadge();
    updateStatusDisplay();
}

// Render Hero Section
function renderHero() {
    if (!homeData.hero) return;
    
    const hero = homeData.hero;
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    const badge = heroContent.querySelector('.hero-badge');
    const title = heroContent.querySelector('.hero-title');
    const description = heroContent.querySelector('.hero-description');
    const features = heroContent.querySelector('.hero-features');

    if (badge) badge.textContent = hero.badge || '';
    if (title) {
        title.innerHTML = `${hero.title || ''} <span class="hero-highlight">${hero.highlight || ''}</span>`;
    }
    if (description) description.textContent = hero.description || '';
    if (features && hero.tags) {
        features.innerHTML = hero.tags.map(tag => `<span class="hero-tag">${tag}</span>`).join('');
    }
}

// Render Stats
function renderStats() {
    if (!homeData.stats) return;
    
    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;

    statsGrid.innerHTML = homeData.stats.map(stat => {
        const isStatus = stat.id === 'active-status';
        return `
            <div class="stat-card">
                <div class="stat-icon">${stat.icon || ''}</div>
                <div class="stat-content">
                    <div class="stat-number" id="${stat.id}">0</div>
                    <div class="stat-label">${stat.label || ''}</div>
                </div>
                ${isStatus ? '<span class="status-dot" id="status-dot"></span>' : ''}
            </div>
        `;
    }).join('');

    // Update stat values
    const totalProjects = document.getElementById('total-projects');
    const totalNotifications = document.getElementById('total-notifications');
    const totalSale = document.getElementById('total-sale');
    
    if (totalProjects) {
        totalProjects.textContent = projects.length || 0;
        animateNumber(totalProjects, 0, projects.length || 0);
    }
    if (totalNotifications) {
        totalNotifications.textContent = notifications.length || 0;
        animateNumber(totalNotifications, 0, notifications.length || 0);
    }
    if (totalSale) {
        totalSale.textContent = saleScripts.length || 0;
        animateNumber(totalSale, 0, saleScripts.length || 0);
    }
}

// Render Services
function renderServices() {
    if (!homeData.services) return;
    
    const homeSection = document.getElementById('home');
    if (!homeSection) return;
    
    let servicesSection = homeSection.querySelector('.home-section');
    if (!servicesSection || !servicesSection.querySelector('.services-grid')) {
        // Create services section if not exists
        const hero = homeSection.querySelector('.hero');
        if (hero) {
            servicesSection = document.createElement('div');
            servicesSection.className = 'home-section';
            servicesSection.innerHTML = `
                <h2 class="home-section-title">Dịch vụ của chúng tôi</h2>
                <div class="services-grid"></div>
            `;
            hero.after(servicesSection);
        } else return;
    }
    
    const servicesGrid = servicesSection.querySelector('.services-grid');
    if (!servicesGrid) return;

    servicesGrid.innerHTML = homeData.services.map(service => `
        <div class="service-card">
            <div class="service-icon">${service.icon || ''}</div>
            <h3 class="service-title">${service.title || ''}</h3>
            <p class="service-description">${service.description || ''}</p>
        </div>
    `).join('');
}

// Render Process
function renderProcess() {
    if (!homeData.process) return;
    
    const homeSection = document.getElementById('home');
    if (!homeSection) return;
    
    const sections = homeSection.querySelectorAll('.home-section');
    let processSection = Array.from(sections).find(s => s.querySelector('.process-list'));
    
    if (!processSection) {
        // Create process section if not exists
        const lastSection = sections[sections.length - 1];
        if (lastSection) {
            processSection = document.createElement('div');
            processSection.className = 'home-section';
            processSection.innerHTML = `
                <h2 class="home-section-title">Quy trình làm việc</h2>
                <div class="process-list"></div>
            `;
            lastSection.after(processSection);
        } else return;
    }
    
    const processList = processSection.querySelector('.process-list');
    if (!processList) return;

    processList.innerHTML = homeData.process.map(process => `
        <div class="process-item">
            <div class="process-number">${process.number || ''}</div>
            <div class="process-content">
                <h3 class="process-title">${process.title || ''}</h3>
                <p class="process-description">${process.description || ''}</p>
            </div>
        </div>
    `).join('');
}

// Render Tech Stack
function renderTechStack() {
    if (!homeData.techStack) return;
    
    const homeSection = document.getElementById('home');
    if (!homeSection) return;
    
    const sections = homeSection.querySelectorAll('.home-section');
    let techSection = Array.from(sections).find(s => s.querySelector('.tech-stack'));
    
    if (!techSection) {
        // Create tech section if not exists
        const lastSection = sections[sections.length - 1];
        if (lastSection) {
            techSection = document.createElement('div');
            techSection.className = 'home-section';
            techSection.innerHTML = `
                <h2 class="home-section-title">Công nghệ chúng tôi sử dụng</h2>
                <div class="tech-stack"></div>
            `;
            lastSection.after(techSection);
        } else return;
    }
    
    const techStack = techSection.querySelector('.tech-stack');
    if (!techStack) return;

    techStack.innerHTML = homeData.techStack.map(category => `
        <div class="tech-category">
            <div class="tech-category-header">
                <div class="tech-category-icon">${category.icon || ''}</div>
                <h3 class="tech-category-title">${category.title || ''}</h3>
            </div>
            <div class="tech-tags">
                ${category.tags.map(tag => `<span class="tech-tag" data-tech="${tag.tech || ''}">${tag.name || ''}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// Render Features
function renderFeatures() {
    if (!homeData.features) return;
    
    const homeSection = document.getElementById('home');
    if (!homeSection) return;
    
    const sections = homeSection.querySelectorAll('.home-section');
    let featuresSection = Array.from(sections).find(s => s.querySelector('.features-grid'));
    
    if (!featuresSection) {
        // Create features section if not exists
        const lastSection = sections[sections.length - 1];
        if (lastSection) {
            featuresSection = document.createElement('div');
            featuresSection.className = 'home-section';
            featuresSection.innerHTML = `
                <h2 class="home-section-title">Tại sao chọn CODEPULSE?</h2>
                <div class="features-grid"></div>
            `;
            lastSection.after(featuresSection);
        } else return;
    }
    
    const featuresGrid = featuresSection.querySelector('.features-grid');
    if (!featuresGrid) return;

    featuresGrid.innerHTML = homeData.features.map(feature => `
        <div class="feature-item">
            <div class="feature-icon">✓</div>
            <div class="feature-content">
                <h3 class="feature-title">${feature.title || ''}</h3>
                <p class="feature-description">${feature.description || ''}</p>
            </div>
        </div>
    `).join('');
}

// Fallback if home.json not loaded
function renderHomeFallback() {
    const totalProjects = document.getElementById('total-projects');
    const totalNotifications = document.getElementById('total-notifications');

    if (totalProjects) {
        totalProjects.textContent = projects.length || 0;
        animateNumber(totalProjects, 0, projects.length || 0);
    }

    if (totalNotifications) {
        totalNotifications.textContent = notifications.length || 0;
        animateNumber(totalNotifications, 0, notifications.length || 0);
    }
    
    updateNotificationBadge();
    updateStatusDisplay();
    renderFeaturedProjects();
}

// Render Sale Scripts
function renderSaleScripts() {
    const container = document.getElementById('sale-container');
    if (!container) return;

    if (saleScripts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); font-size: 1.2rem;">Chưa có script nào đang bán</p>';
        return;
    }

    container.innerHTML = saleScripts.map(script => {
        let previewHTML = '';
        
        if (script.preview) {
            if (script.preview.type === 'youtube') {
                // Extract video ID from any YouTube URL format or use directly if it's just ID
                let videoId = script.preview.url.trim();
                let videoTitle = script.title || 'YouTube video player';
                
                // Extract video ID from different URL formats
                if (videoId.includes('youtube.com/watch?v=')) {
                    videoId = videoId.split('v=')[1]?.split('&')[0];
                } else if (videoId.includes('youtu.be/')) {
                    videoId = videoId.split('youtu.be/')[1]?.split('?')[0];
                } else if (videoId.includes('youtube.com/embed/')) {
                    videoId = videoId.split('embed/')[1]?.split('?')[0];
                }
                
                // Clean video ID (remove any remaining query params or fragments)
                videoId = videoId.split('?')[0].split('&')[0].split('#')[0].trim();
                
                // Get current origin for YouTube embed
                const origin = window.location.origin;
                
                // Build embed URL with necessary parameters
                const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(origin)}&rel=0&modestbranding=1`;
                
                previewHTML = `
                    <div class="sale-preview sale-preview-youtube">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src="${embedUrl}" 
                            title="${videoTitle}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    </div>
                `;
            } else if (script.preview.type === 'images' && script.preview.urls) {
                previewHTML = `
                    <div class="sale-preview sale-preview-images">
                        <div class="sale-image-gallery">
                            ${script.preview.urls.map((url, index) => `
                                <img src="${url}" alt="${script.title} - Image ${index + 1}" class="sale-gallery-image ${index === 0 ? 'active' : ''}">
                            `).join('')}
                        </div>
                        ${script.preview.urls.length > 1 ? `
                            <div class="sale-gallery-nav">
                                ${script.preview.urls.map((_, index) => `
                                    <button class="sale-gallery-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        }

        return `
            <div class="sale-card">
                ${previewHTML}
                <div class="sale-content">
                    <h3 class="sale-title">${script.title || 'Script chưa có tiêu đề'}</h3>
                    <p class="sale-description">${script.description || 'Không có mô tả'}</p>
                    <div class="sale-tags">
                        ${script.tags && script.tags.length > 0 ? script.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                    <div class="sale-footer">
                        <div class="sale-price">${script.price || 'Liên hệ'}</div>
                        <a href="https://discord.gg/cJQDVJ4fpa" target="_blank" class="sale-btn">Mua ngay</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Setup gallery navigation
    setupSaleGallery();
}

// Setup gallery navigation for image previews
function setupSaleGallery() {
    const galleries = document.querySelectorAll('.sale-preview-images');
    
    galleries.forEach(gallery => {
        const images = gallery.querySelectorAll('.sale-gallery-image');
        const dots = gallery.querySelectorAll('.sale-gallery-dot');
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                // Remove active class from all
                images.forEach(img => img.classList.remove('active'));
                dots.forEach(d => d.classList.remove('active'));
                
                // Add active class to selected
                images[index].classList.add('active');
                dot.classList.add('active');
            });
        });

        // Auto slide if multiple images
        if (images.length > 1) {
            let currentIndex = 0;
            setInterval(() => {
                currentIndex = (currentIndex + 1) % images.length;
                images.forEach(img => img.classList.remove('active'));
                dots.forEach(d => d.classList.remove('active'));
                images[currentIndex].classList.add('active');
                dots[currentIndex].classList.add('active');
            }, 5000);
        }
    });
}

// Render Featured Projects
function renderFeaturedProjects() {
    const container = document.getElementById('featured-projects-container');
    if (!container) return;

    // Show first 3 projects as featured
    const featuredProjects = projects.slice(0, 3);

    if (featuredProjects.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Chưa có dự án nào</p>';
        return;
    }

    container.innerHTML = featuredProjects.map(project => `
        <div class="featured-project-card">
            <h3 class="featured-project-title">${project.title || 'Dự án chưa có tiêu đề'}</h3>
            <p class="featured-project-description">${project.description || 'Không có mô tả'}</p>
            ${project.tags && project.tags.length > 0 ? `
                <div class="featured-project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Animate number counting
function animateNumber(element, start, end, duration = 1000) {
    let startTime = null;
    const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        element.textContent = current;
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}

// Render Projects Section
function renderProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-gray); font-size: 1.2rem;">Chưa có dự án nào</p>';
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="project-card">
            <h3 class="project-title">${project.title || 'Dự án chưa có tiêu đề'}</h3>
            <p class="project-description">${project.description || 'Không có mô tả'}</p>
            ${project.tags && project.tags.length > 0 ? `
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Setup Notification Bell
function setupNotificationBell() {
    const bell = document.getElementById('notificationBell');
    const dropdown = document.getElementById('notificationDropdown');
    const closeBtn = document.getElementById('closeNotifications');
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    document.body.appendChild(overlay);

    if (!bell || !dropdown) return;

    bell.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNotificationDropdown();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeNotificationDropdown();
        });
    }

    overlay.addEventListener('click', () => {
        closeNotificationDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !bell.contains(e.target)) {
            closeNotificationDropdown();
        }
    });
}

function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    const overlay = document.querySelector('.notification-overlay');
    
    if (dropdown && overlay) {
        const isActive = dropdown.classList.contains('active');
        if (isActive) {
            closeNotificationDropdown();
        } else {
            dropdown.classList.add('active');
            overlay.classList.add('active');
            renderNotificationDropdown();
        }
    }
}

function closeNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    const overlay = document.querySelector('.notification-overlay');
    
    if (dropdown && overlay) {
        dropdown.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// Render Notifications in Dropdown
function renderNotifications() {
    renderNotificationDropdown();
}

function renderNotificationDropdown() {
    const container = document.getElementById('notificationDropdownContent');
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = '<div class="notification-dropdown-empty">Chưa có thông báo nào</div>';
        return;
    }

    // Sắp xếp thông báo theo thời gian: mới nhất ở trên, cũ nhất ở dưới
    const sortedNotifications = [...notifications].sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        // Sắp xếp giảm dần: date lớn hơn (mới hơn) sẽ ở trước
        return dateB - dateA;
    });

    container.innerHTML = sortedNotifications.map(notification => `
        <div class="notification-dropdown-item">
            <div class="notification-dropdown-item-title">${notification.title || 'Thông báo'}</div>
            <div class="notification-dropdown-item-message">${notification.message || 'Không có tin nhắn'}</div>
            ${notification.date ? `<div class="notification-dropdown-item-date">${notification.date}</div>` : ''}
        </div>
    `).join('');
}

// Update Notification Badge
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    const count = notifications.length || 0;
    badge.textContent = count > 99 ? '99+' : count.toString();
    
    if (count === 0) {
        badge.classList.add('hidden');
    } else {
        badge.classList.remove('hidden');
    }
}

// Load Discord Data
async function loadDiscordData() {
    if (!discordConfig || !discordConfig.guildId) {
        console.error('Discord config không tồn tại');
        return;
    }

    try {
        const response = await fetch(`https://discord.com/api/guilds/${discordConfig.guildId}/widget.json`);
        discordData = await response.json();
        renderDiscord();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu Discord:', error);
        // Sử dụng dữ liệu mặc định
        discordData = {
            presence_count: 0,
            members: []
        };
        renderDiscord();
    }
}

// Render Discord Section
function renderDiscord() {
    // Render description
    const descriptionEl = document.querySelector('.discord-description');
    if (descriptionEl && discordConfig.description) {
        descriptionEl.textContent = discordConfig.description;
    }

    // Render features
    const featuresList = document.querySelector('.discord-features-list');
    if (featuresList && discordConfig.features) {
        featuresList.innerHTML = discordConfig.features.map(feature => `
            <li>
                <span class="discord-feature-icon">${feature.icon || '✨'}</span>
                <span>${feature.text || ''}</span>
            </li>
        `).join('');
    }

    // Render widget title
    const widgetTitle = document.querySelector('.discord-widget-title span');
    if (widgetTitle && discordConfig.widgetTitle) {
        widgetTitle.textContent = discordConfig.widgetTitle;
    }

    // Update widget iframe
    const widgetIframe = document.querySelector('.discord-widget');
    if (widgetIframe && discordConfig.guildId) {
        widgetIframe.src = `https://discord.com/widget?id=${discordConfig.guildId}&theme=dark`;
    }

    // Update join button
    const joinBtn = document.querySelector('.discord-join-btn');
    if (joinBtn && discordConfig.inviteLink) {
        joinBtn.href = discordConfig.inviteLink;
    }

    // Render stats
    const onlineElement = document.getElementById('discord-online');
    const totalElement = document.getElementById('discord-total');

    if (discordData) {
        const onlineCount = discordData.presence_count || 0;
        const totalCount = discordData.members ? discordData.members.length : 0;

        if (onlineElement) {
            animateNumber(onlineElement, 0, onlineCount);
        }

        if (totalElement) {
            animateNumber(totalElement, 0, totalCount);
        }
    } else {
        if (onlineElement) onlineElement.textContent = '0';
        if (totalElement) totalElement.textContent = '0';
    }
}

// Render About Section
function renderAbout() {
    const container = document.getElementById('about-container');
    if (!container) return;

    container.innerHTML = `
        <h3>Giới thiệu</h3>
        <p>${data.description || 'CODEPULSE là một studio chuyên phát triển các script và resource cho FiveM với chất lượng cao và hiệu năng tốt.'}</p>
        
        <h3>Dịch vụ</h3>
        <p>Chúng tôi chuyên cung cấp các dịch vụ:</p>
        <ul style="list-style: none; padding-left: 0;">
            <li style="margin: 10px 0; padding-left: 20px; position: relative;">
                <span style="position: absolute; left: 0; color: var(--primary-color);">▸</span>
                Code script FiveM custom
            </li>
            <li style="margin: 10px 0; padding-left: 20px; position: relative;">
                <span style="position: absolute; left: 0; color: var(--primary-color);">▸</span>
                Tối ưu hóa hiệu năng
            </li>
            <li style="margin: 10px 0; padding-left: 20px; position: relative;">
                <span style="position: absolute; left: 0; color: var(--primary-color);">▸</span>
                Fix bug và bảo trì
            </li>
            <li style="margin: 10px 0; padding-left: 20px; position: relative;">
                <span style="position: absolute; left: 0; color: var(--primary-color);">▸</span>
                Tư vấn và hỗ trợ kỹ thuật
            </li>
        </ul>

        <h3>Liên hệ</h3>
        <p>Để biết thêm thông tin, vui lòng liên hệ với chúng tôi qua các kênh chính thức của CODEPULSE.</p>
    `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

