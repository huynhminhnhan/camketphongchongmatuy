// Spherical Image Background System
class SphericalImageBackground {
    constructor(options = {}) {
        this.radius = options.radius || 400;
        this.rows = options.rows || 12;
        this.cols = options.cols || 16;
        this.imageSize = options.imageSize || 60;
        this.container = null;
        this.sphereContainer = null;
        this.imagePlanes = [];
        this.particles = [];
        this.isInitialized = false;
        this.currentTheme = 'blue';
        this.imageList = []; // Sẽ chứa danh sách hình ảnh từ folder
        
        this.loadImagesFromFolder();
    }

    // Load tất cả hình ảnh từ folder images
    async loadImagesFromFolder() {
        try {
            // Danh sách các file ảnh có sẵn (từ ls command)
            const imageFiles = [
                'HY202868.JPG', 'HY202869.JPG', 'HY202870.JPG', 'HY202871.JPG', 'HY202872.JPG',
                'HY202873.JPG', 'HY202874.JPG', 'HY202875.JPG', 'HY202876.JPG', 'HY202877.JPG',
                'HY202878.JPG', 'HY202879.JPG', 'HY202880.JPG', 'HY202881.JPG', 'HY202882.JPG',
                'HY202883.JPG', 'HY202884.JPG', 'HY202885.JPG', 'HY202886.JPG', 'HY202887.JPG',
                'HY202888.JPG', 'HY202889.JPG', 'HY202890.JPG', 'HY202891.JPG', 'HY202892.JPG',
                'HY202893.JPG', 'HY202894.JPG', 'HY202895.JPG', 'HY202896.JPG', 'HY202897.JPG',
                'HY202898.JPG', 'HY202899.JPG', 'HY202900.JPG', 'HY202901.JPG', 'HY202902.JPG',
                'HY202903.JPG', 'HY202904.JPG', 'HY202905.JPG', 'HY202906.JPG', 'HY202907.JPG',
                'HY202908.JPG', 'HY202909.JPG', 'HY202910.JPG', 'HY202911.JPG', 'HY202912.JPG'
            ];
            
            // Tạo đường dẫn đầy đủ cho mỗi hình ảnh
            this.imageList = imageFiles.map(filename => `images/${filename}`);
            
            console.log(`📸 Loaded ${this.imageList.length} images from folder`);
            
            // Khởi tạo sau khi load xong ảnh
            this.init();
            
        } catch (error) {
            console.error('❌ Error loading images:', error);
            // Fallback to demo images if loading fails
            this.imageList = this.createFallbackImages();
            this.init();
        }
    }
    
    // Fallback images nếu không load được từ folder
    createFallbackImages() {
        return [
            'data:image/svg+xml,' + encodeURIComponent(`
                <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="#667eea"/>
                    <circle cx="50" cy="50" r="30" fill="#ffffff" opacity="0.8"/>
                    <text x="50" y="55" text-anchor="middle" fill="#333" font-size="16" font-weight="bold">📷</text>
                </svg>
            `),
            'data:image/svg+xml,' + encodeURIComponent(`
                <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="#764ba2"/>
                    <polygon points="50,20 80,70 20,70" fill="#ffffff" opacity="0.8"/>
                    <text x="50" y="60" text-anchor="middle" fill="#333" font-size="12" font-weight="bold">🖼️</text>
                </svg>
            `)
        ];
    }

    init() {
        this.createContainer();
        this.createSphereStructure();
        this.createImagePlanes();
        this.createFloatingParticles();
        this.addEventListeners();
        this.isInitialized = true;
        
        console.log('🌐 Spherical Image Background initialized');
    }

    createContainer() {
        // Tạo container chính
        this.container = document.createElement('div');
        this.container.className = 'spherical-background';
        
        // Tạo sphere container
        this.sphereContainer = document.createElement('div');
        this.sphereContainer.className = 'sphere-container';
        
        this.container.appendChild(this.sphereContainer);
        document.body.insertBefore(this.container, document.body.firstChild);
    }

    createSphereStructure() {
        // Tính toán vị trí các điểm trên quả cầu sử dụng tọa độ cầu
        this.spherePoints = [];
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                // Tọa độ cầu (r, θ, φ)
                const theta = (i / (this.rows - 1)) * Math.PI; // 0 to π (latitude)
                const phi = (j / this.cols) * 2 * Math.PI;      // 0 to 2π (longitude)
                
                // Chuyển đổi sang tọa độ Cartesian
                const x = this.radius * Math.sin(theta) * Math.cos(phi);
                const y = this.radius * Math.cos(theta);
                const z = this.radius * Math.sin(theta) * Math.sin(phi);
                
                this.spherePoints.push({
                    x, y, z, theta, phi,
                    row: i, col: j
                });
            }
        }
    }

    createImagePlanes() {
        this.spherePoints.forEach((point, index) => {
            const plane = this.createImagePlane(point, index);
            this.sphereContainer.appendChild(plane);
            this.imagePlanes.push(plane);
        });
    }

    createImagePlane(point, index) {
        const plane = document.createElement('div');
        plane.className = 'image-plane';
        
        // Random rotation cho mỗi plane
        const randomRotationX = Math.random() * 60 - 30; // -30 to 30 degrees
        const randomRotationY = Math.random() * 60 - 30;
        
        // Chọn image từ danh sách load được
        const imageUrl = this.imageList[index % this.imageList.length];
        
        // Tạo img element
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        
        // Xử lý lỗi loading
        img.onerror = () => {
            console.warn('Failed to load image:', imageUrl);
            // Fallback to demo image
            img.src = this.createFallbackImages()[0];
        };
        
        plane.appendChild(img);
        
        // Styling cho plane với vị trí từ point
        Object.assign(plane.style, {
            position: 'absolute',
            width: this.imageSize + 'px',
            height: this.imageSize + 'px',
            transform: `translate3d(${point.x}px, ${point.y}px, ${point.z}px) rotateX(${randomRotationX}deg) rotateY(${randomRotationY}deg)`,
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255,255,255,0.2)',
            overflow: 'hidden'
        });
        
        // Hiệu ứng hover
        plane.addEventListener('mouseenter', () => {
            plane.style.transform = `translate3d(${point.x}px, ${point.y}px, ${point.z}px) rotateX(${randomRotationX}deg) rotateY(${randomRotationY}deg) scale(1.1)`;
            plane.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)';
        });
        
        plane.addEventListener('mouseleave', () => {
            plane.style.transform = `translate3d(${point.x}px, ${point.y}px, ${point.z}px) rotateX(${randomRotationX}deg) rotateY(${randomRotationY}deg) scale(1)`;
            plane.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        });
        
        return plane;
    }

    positionPlane(plane, point) {
        // Vị trí plane tại điểm trên quả cầu
        plane.style.transform = `
            translate3d(${point.x}px, ${point.y}px, ${point.z}px)
            rotateY(${(point.phi * 180 / Math.PI)}deg)
            rotateX(${(point.theta * 180 / Math.PI - 90)}deg)
        `;
        
        // Đảm bảo plane luôn "nhìn ra ngoài" từ tâm quả cầu
        plane.style.transformOrigin = 'center center';
        plane.style.position = 'absolute';
        plane.style.left = '50%';
        plane.style.top = '50%';
    }

    addPlaneInteraction(plane, point, index) {
        let hoverTimeout;
        
        plane.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            plane.style.zIndex = '100';
            plane.style.transform += ' scale(1.3)';
            
            // Tạo ripple effect cho các plane xung quanh
            this.createRippleEffect(point, index);
        });
        
        plane.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                plane.style.zIndex = '';
                this.positionPlane(plane, point);
            }, 300);
        });
        
        // Click effect
        plane.addEventListener('click', () => {
            this.triggerWaveEffect(point, index);
        });
    }

    createRippleEffect(centerPoint, centerIndex) {
        this.imagePlanes.forEach((plane, index) => {
            if (index === centerIndex) return;
            
            const point = this.spherePoints[index];
            const distance = this.calculateSphericalDistance(centerPoint, point);
            
            if (distance < 100) { // Only affect nearby planes
                const delay = (distance / 100) * 200; // Delay based on distance
                
                setTimeout(() => {
                    plane.style.transform += ' scale(1.1)';
                    plane.style.filter = 'brightness(1.2)';
                    
                    setTimeout(() => {
                        this.positionPlane(plane, point);
                        plane.style.filter = '';
                    }, 300);
                }, delay);
            }
        });
    }

    triggerWaveEffect(centerPoint, centerIndex) {
        this.imagePlanes.forEach((plane, index) => {
            const point = this.spherePoints[index];
            const distance = this.calculateSphericalDistance(centerPoint, point);
            const delay = (distance / this.radius) * 1000;
            
            setTimeout(() => {
                plane.classList.add('pulse');
                
                setTimeout(() => {
                    plane.classList.remove('pulse');
                }, 2000);
            }, delay);
        });
    }

    calculateSphericalDistance(point1, point2) {
        // Calculate distance between two points on sphere surface
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = point1.z - point2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    createFloatingParticles() {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'sphere-particle';
            
            // Random size
            const sizes = ['small', '', 'large'];
            const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
            if (randomSize) particle.classList.add(randomSize);
            
            // Random position in 3D space
            const radius = 200 + Math.random() * 600;
            const theta = Math.random() * Math.PI;
            const phi = Math.random() * 2 * Math.PI;
            
            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.cos(theta);
            const z = radius * Math.sin(theta) * Math.sin(phi);
            
            particle.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            
            this.sphereContainer.appendChild(particle);
            this.particles.push(particle);
        }
    }

    changeTheme(theme) {
        this.currentTheme = theme;
        
        this.imagePlanes.forEach(plane => {
            // Remove old theme classes
            plane.classList.remove('theme-blue', 'theme-purple', 'theme-green');
            // Add new theme class
            plane.classList.add(`theme-${theme}`);
        });
        
        console.log(`🎨 Theme changed to: ${theme}`);
    }

    addEventListeners() {
        // Pause animation on tab visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.sphereContainer.style.animationPlayState = 'paused';
            } else {
                this.sphereContainer.style.animationPlayState = 'running';
            }
        });
        
        // Handle resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    handleResize() {
        // Adjust sphere size based on viewport
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const newRadius = Math.min(vw, vh) * 0.4;
        
        if (Math.abs(newRadius - this.radius) > 50) {
            this.radius = newRadius;
            this.updatePositions();
        }
    }

    updatePositions() {
        this.createSphereStructure();
        
        this.imagePlanes.forEach((plane, index) => {
            const point = this.spherePoints[index];
            this.positionPlane(plane, point);
        });
    }

    // Utility function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    destroy() {
        if (this.container) {
            this.container.remove();
        }
        this.imagePlanes = [];
        this.particles = [];
        this.isInitialized = false;
        console.log('🗑️ Spherical Image Background destroyed');
    }
}

// Initialize when DOM is ready
let sphericalBg;

document.addEventListener('DOMContentLoaded', function() {
    sphericalBg = new SphericalImageBackground({
        radius: Math.min(window.innerWidth, window.innerHeight) * 0.4,
        rows: 10,
        cols: 14,
        imageSize: 60
    });
    
    console.log('🚀 Spherical Image Background System loaded');
});

// Global functions for console interaction
window.sphericalBackground = {
    instance: () => sphericalBg,
    changeTheme: (theme) => sphericalBg && sphericalBg.changeTheme(theme),
    destroy: () => sphericalBg && sphericalBg.destroy(),
    recreate: (options) => {
        if (sphericalBg) sphericalBg.destroy();
        sphericalBg = new SphericalImageBackground(options);
    }
};

// Console commands
console.log('🌐 Spherical Image Background Commands:');
console.log('- sphericalBackground.changeTheme("blue|purple|green")');
console.log('- sphericalBackground.destroy()');
console.log('- sphericalBackground.recreate(options)');
