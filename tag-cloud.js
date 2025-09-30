// Tag Cloud Background Effect
class TagCloudBackground {
    constructor() {
        this.tags = [
            // Tên người Việt Nam phổ biến
            'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
            'Vũ Thị Linh', 'Đặng Văn Hùng', 'Bùi Thị Mai', 'Đỗ Văn Nam', 'Ngô Thị Oanh',
            'Lý Văn Phong', 'Đinh Thị Quỳnh', 'Dương Văn Sơn', 'Phan Thị Tâm', 'Tạ Văn Tuấn',
            'Cao Thị Uyên', 'Hồ Văn Vinh', 'Lại Thị Xuân', 'Chu Văn Yên', 'Mai Thị Zung',
            'Trịnh Văn Bảo', 'Võ Thị Cẩm', 'Lưu Văn Đức', 'Ninh Thị Hà', 'Tô Văn Khánh',
            'Huỳnh Thị Lan', 'Đoàn Văn Minh', 'Trương Thị Nga', 'Lâm Văn Phú', 'Kiều Thị Quế',
            'Điều Văn Rồng', 'Hà Thị Sen', 'Thái Văn Thành', 'Ung Thị Vân', 'Xa Văn Wean',
            'Yên Thị Xuân', 'Âu Văn Ying', 'Ông Thị Zen', 'Ít Văn Alo', 'Ớt Thị Béo',
            'Cù Văn Dần', 'Ẻ Thị Giang', 'Ỉ Văn Huệ', 'Ọ Thị Kiều', 'Ủy Văn Lộc',
            'Ẵng Thị Mơ', 'Ẫm Văn Nho', 'Ơ Thị Phương', 'Ậu Văn Quang', 'Ẩy Thị Rose'
        ];
        
        this.sizes = ['size-small', 'size-medium', 'size-large', 'size-xlarge'];
        this.colors = ['color-red', 'color-yellow', 'color-blue', 'color-green', 'color-white'];
        this.animations = ['anim-1', 'anim-2', 'anim-3'];
        this.delays = ['delay-1', 'delay-2', 'delay-3', 'delay-4'];
        
        this.container = null;
        this.titleElement = null;
        this.tagElements = [];
        this.isRunning = false;
        this.popupInterval = null;
        this.activePopups = [];
        
        // Cấu hình hình cầu với kích thước vừa phải
        this.sphereRadius = Math.min(window.innerWidth, window.innerHeight) * 0.28; // Giảm từ 40% xuống 28%
        this.sphereCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.rotationSpeed = 0.008; // Giảm tốc độ xoay cho mượt hơn
        this.orbitSpeed = 0.003; // Giảm tốc độ di chuyển
        this.animationFrame = null;
        this.time = 0;
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.createTitle();
        this.createTags();
        this.start();
    }
    
    createContainer() {
        // Xóa container cũ nếu có
        const existingContainer = document.querySelector('.tag-cloud-background');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        this.container = document.createElement('div');
        this.container.className = 'tag-cloud-background';
        document.body.insertBefore(this.container, document.body.firstChild);
    }
    
    createTitle() {
        this.titleElement = document.createElement('div');
        this.titleElement.className = 'sphere-title';
        this.titleElement.innerHTML = `
            <h2>10.000 + người đã ký cam kết</h2>
            <div class="title-decoration">
                <span class="star">⭐</span>
                <span class="line"></span>
                <span class="star">⭐</span>
            </div>
        `;
        
        this.container.appendChild(this.titleElement);
    }
    
    createTags() {
        const numTags = Math.min(40, this.tags.length); // Giảm từ 60 xuống 40 tags để tạo khoảng cách
        
        for (let i = 0; i < numTags; i++) {
            const tag = this.createTag(i, numTags);
            this.container.appendChild(tag);
            this.tagElements.push(tag);
        }
    }
    
    createTag(index, totalTags) {
        const tag = document.createElement('div');
        const tagText = this.tags[index % this.tags.length];
        
        tag.className = 'floating-tag sphere-tag';
        tag.textContent = tagText;
        
        // Tính toán vị trí trên hình cầu sử dụng tọa độ cầu với phân bố đều hơn
        const phi = Math.acos(-1 + (2 * index) / totalTags); // Góc từ 0 đến π
        const theta = Math.sqrt(totalTags * Math.PI * 1.5) * phi;   // Tăng hệ số để tạo khoảng cách
        
        // Lưu tọa độ cầu ban đầu
        tag.sphereCoords = { phi, theta, index };
        
        // Random size
        const size = this.getRandomItem(this.sizes);
        tag.classList.add(size);
        
        // Áp dụng vị trí ban đầu
        this.updateTagPosition(tag);
        
        return tag;
    }
    
    // Cập nhật vị trí tiêu đề
    updateTitlePosition() {
        if (!this.titleElement) return;
        
        // Tính toán vị trí trung tâm hình cầu (di chuyển quanh màn hình)
        const orbitRadius = Math.min(window.innerWidth, window.innerHeight) * 0.1;
        const orbitX = Math.cos(this.time * this.orbitSpeed) * orbitRadius;
        const orbitY = Math.sin(this.time * this.orbitSpeed) * (orbitRadius * 0.5);
        
        // Vị trí title phía trên hình cầu
        const titleX = this.sphereCenter.x + orbitX;
        const titleY = this.sphereCenter.y + orbitY - this.sphereRadius - (window.innerHeight * 0.08); // 8% màn hình phía trên
        
        this.titleElement.style.left = titleX + 'px';
        this.titleElement.style.top = titleY + 'px';
    }
    
    // Cập nhật vị trí tag dựa trên tọa độ cầu
    updateTagPosition(tag) {
        const coords = tag.sphereCoords;
        
        // Chuyển đổi tọa độ cầu sang Cartesian
        const x = this.sphereRadius * Math.sin(coords.phi) * Math.cos(coords.theta + this.time * this.rotationSpeed);
        const y = this.sphereRadius * Math.cos(coords.phi);
        const z = this.sphereRadius * Math.sin(coords.phi) * Math.sin(coords.theta + this.time * this.rotationSpeed);
        
        // Tính toán vị trí trung tâm hình cầu (di chuyển quanh màn hình)
        const orbitRadius = Math.min(window.innerWidth, window.innerHeight) * 0.1; // 10% màn hình
        const orbitX = Math.cos(this.time * this.orbitSpeed) * orbitRadius;
        const orbitY = Math.sin(this.time * this.orbitSpeed) * (orbitRadius * 0.5);
        
        // Vị trí cuối cùng
        const finalX = this.sphereCenter.x + x + orbitX;
        const finalY = this.sphereCenter.y + y + orbitY;
        
        // Hiệu ứng perspective (tag ở phía sau nhỏ hơn và mờ hơn)
        const scale = (z + this.sphereRadius) / (2 * this.sphereRadius); // 0.5 - 1
        const opacity = 0.3 + scale * 0.7; // 0.3 - 1
        
        tag.style.left = finalX + 'px';
        tag.style.top = finalY + 'px';
        tag.style.transform = `scale(${scale})`;
        tag.style.opacity = opacity;
        tag.style.zIndex = Math.floor(z + this.sphereRadius);
    }
    
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        // Animation loop cho hình cầu
        const animate = () => {
            if (!this.isRunning) return;
            
            this.time += 1;
            
            // Cập nhật vị trí title
            this.updateTitlePosition();
            
            // Cập nhật vị trí tất cả tags
            this.tagElements.forEach(tag => {
                this.updateTagPosition(tag);
            });
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
        
        // Show popup every 5 seconds
        this.popupInterval = setInterval(() => {
            this.showRandomPopup();
        }, 5000);
    }
    
    showRandomPopup() {
        if (this.tags.length === 0) return;
        
        // Chọn tên ngẫu nhiên
        const randomName = this.getRandomItem(this.tags);
        
        // Tạo popup
        const popup = document.createElement('div');
        popup.className = 'commitment-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <span class="popup-icon">✅</span>
                <span class="popup-text">'<strong>${randomName}</strong>' đã ký cam kết phòng chống ma túy</span>
            </div>
        `;
        
        // Vị trí responsive
        if (window.innerWidth <= 768) {
            // Mobile: hiển thị ở bottom, full width
            popup.style.left = '10px';
            popup.style.right = '10px';
            popup.style.bottom = '20px';
        } else {
            // Desktop: vị trí ngẫu nhiên ở bottom
            const x = Math.random() * (window.innerWidth - 400);
            popup.style.left = x + 'px';
            popup.style.bottom = '20px';
        }
        
        document.body.appendChild(popup);
        this.activePopups.push(popup);
        
        // Animation vào
        setTimeout(() => {
            popup.classList.add('show');
        }, 100);
        
        // Tự động ẩn sau 4 seconds
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
                // Remove from active popups array
                const index = this.activePopups.indexOf(popup);
                if (index > -1) {
                    this.activePopups.splice(index, 1);
                }
            }, 500);
        }, 4000);
    }
    
    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        if (this.popupInterval) {
            clearInterval(this.popupInterval);
        }
    }
    
    destroy() {
        this.stop();
        
        // Remove all active popups
        this.activePopups.forEach(popup => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        });
        this.activePopups = [];
        
        if (this.container) {
            this.container.remove();
        }
        this.tagElements = [];
    }
    
    // Responsive handling
    handleResize() {
        // Cập nhật center của sphere khi resize
        this.sphereCenter = { 
            x: window.innerWidth / 2, 
            y: window.innerHeight / 2 
        };
        
        // Điều chỉnh radius cho responsive
        if (window.innerWidth <= 768) {
            // Mobile: 25% của màn hình
            this.sphereRadius = Math.min(window.innerWidth, window.innerHeight) * 0.25;
        } else if (window.innerWidth <= 1024) {
            // Tablet: 26% của màn hình
            this.sphereRadius = Math.min(window.innerWidth, window.innerHeight) * 0.26;
        } else {
            // Desktop: 28% của màn hình
            this.sphereRadius = Math.min(window.innerWidth, window.innerHeight) * 0.28;
        }
        
        // Cập nhật vị trí title ngay lập tức
        this.updateTitlePosition();
    }
}

// Initialize tag cloud when DOM is loaded
let tagCloud = null;

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure other scripts are loaded
    setTimeout(() => {
        tagCloud = new TagCloudBackground();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (tagCloud) {
                tagCloud.handleResize();
            }
        });
    }, 1000);
});

// Export for potential external use
window.TagCloudBackground = TagCloudBackground;
