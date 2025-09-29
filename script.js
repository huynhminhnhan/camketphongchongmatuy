// Biến toàn cục
let signaturePad;
let commitments = JSON.parse(localStorage.getItem('commitments')) || [];
let isFormVisible = true;

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    initializeSignaturePad();
    setupEventListeners();
    updateNameDisplay();
    setupFormToggle();
});

// Khởi tạo signature pad
function initializeSignaturePad() {
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Thiết lập canvas
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Sự kiện chuột
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Sự kiện touch cho mobile
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getMousePos(e);
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const [currentX, currentY] = getMousePos(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        [lastX, lastY] = [currentX, currentY];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return [
            e.clientX - rect.left,
            e.clientY - rect.top
        ];
    }

    function handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                        e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }

    // Nút xóa chữ ký
    document.getElementById('clearSignature').addEventListener('click', function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

// Thiết lập các event listeners
function setupEventListeners() {
    // Cập nhật tên trong cam kết khi người dùng nhập
    document.getElementById('fullName').addEventListener('input', updateNameDisplay);
    
    // Xử lý upload hình ảnh
    document.getElementById('proofImage').addEventListener('change', handleImageUpload);
    
    // Xử lý submit form
    document.getElementById('commitmentForm').addEventListener('submit', handleFormSubmit);
}

// Cập nhật tên hiển thị trong nội dung cam kết
function updateNameDisplay() {
    const nameInput = document.getElementById('fullName');
    const nameDisplay = document.getElementById('nameDisplay');
    nameDisplay.textContent = nameInput.value || '[Họ và tên]';
}

// Xử lý upload hình ảnh
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh!');
        e.target.value = '';
        return;
    }

    // Kiểm tra kích thước file (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB!');
        e.target.value = '';
        return;
    }

    // Hiển thị preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewContainer = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        previewImg.src = e.target.result;
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Xử lý submit form
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }

    // Thu thập dữ liệu
    const formData = collectFormData();
    
    // Lưu vào localStorage
    saveCommitment(formData);
    
    // Hiển thị thông báo thành công
    showSuccessMessage();
}

// Validate form
function validateForm() {
    // Kiểm tra các trường bắt buộc
    const requiredFields = ['fullName', 'idNumber', 'phone', 'address'];
    for (let field of requiredFields) {
        const element = document.getElementById(field);
        if (!element.value.trim()) {
            alert(`Vui lòng điền ${element.previousElementSibling.textContent.replace(' *', '')}`);
            element.focus();
            return false;
        }
    }

    // Kiểm tra file hình ảnh
    const imageFile = document.getElementById('proofImage').files[0];
    if (!imageFile) {
        alert('Vui lòng upload hình ảnh thể hiện cam kết!');
        return false;
    }

    // Kiểm tra checkbox đồng ý
    if (!document.getElementById('agreeTerms').checked) {
        alert('Vui lòng đồng ý với nội dung cam kết!');
        return false;
    }

    // Kiểm tra chữ ký
    if (!hasSignature()) {
        alert('Vui lòng ký tên trong khung chữ ký!');
        return false;
    }

    return true;
}

// Kiểm tra có chữ ký hay không
function hasSignature() {
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Kiểm tra xem có pixel nào khác màu trắng không
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] !== 0) { // Alpha channel
            return true;
        }
    }
    return false;
}

// Thu thập dữ liệu form
function collectFormData() {
    const canvas = document.getElementById('signatureCanvas');
    const imageFile = document.getElementById('proofImage').files[0];
    
    return {
        id: Date.now(), // ID duy nhất
        fullName: document.getElementById('fullName').value.trim(),
        idNumber: document.getElementById('idNumber').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        signature: canvas.toDataURL(), // Chữ ký dạng base64
        imageName: imageFile.name,
        imageSize: imageFile.size,
        timestamp: new Date().toISOString(),
        dateSubmitted: new Date().toLocaleDateString('vi-VN')
    };
}

// Lưu cam kết vào localStorage
function saveCommitment(data) {
    commitments.push(data);
    localStorage.setItem('commitments', JSON.stringify(commitments));
    
    console.log('Cam kết đã được lưu:', data);
}

// Hiển thị thông báo thành công
function showSuccessMessage() {
    const formContainer = document.querySelector('.form-container');
    const successMessage = document.getElementById('successMessage');
    
    formContainer.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Utility functions

// Validate số điện thoại Việt Nam
function validatePhoneNumber(phone) {
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return phoneRegex.test(phone);
}

// Validate số CCCD/CMND
function validateIdNumber(idNumber) {
    const cccdRegex = /^[0-9]{12}$/; // CCCD 12 số
    const cmndRegex = /^[0-9]{9}$/;  // CMND 9 số
    return cccdRegex.test(idNumber) || cmndRegex.test(idNumber);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Xuất dữ liệu cam kết (để admin xem)
function exportCommitments() {
    const data = localStorage.getItem('commitments');
    if (!data) {
        alert('Không có dữ liệu cam kết nào!');
        return;
    }
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cam-ket-chong-ma-tuy-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Xóa tất cả dữ liệu (để test)
function clearAllData() {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu cam kết?')) {
        localStorage.removeItem('commitments');
        commitments = [];
        alert('Đã xóa tất cả dữ liệu!');
    }
}

// Console commands for admin
console.log('=== PHẦN MỀM KÝ CAM KẾT CHỐNG MA TÚY ===');
console.log('Các lệnh admin:');
console.log('- exportCommitments(): Xuất dữ liệu cam kết');
console.log('- clearAllData(): Xóa tất cả dữ liệu');
console.log('- commitments: Xem danh sách cam kết');

// Setup form toggle functionality
function setupFormToggle() {
    const toggleBtn = document.getElementById('toggleFormBtn');
    const mainContainer = document.getElementById('mainContainer');
    
    if (!toggleBtn || !mainContainer) {
        console.log('Toggle elements not found, skipping setup');
        return;
    }
    
    // Toggle button click
    toggleBtn.addEventListener('click', function() {
        toggleFormVisibility();
    });
    
    // Click outside form to hide
    document.addEventListener('click', function(e) {
        // Check if click is outside the main container and not on toggle button
        if (isFormVisible && 
            !mainContainer.contains(e.target) && 
            !toggleBtn.contains(e.target)) {
            hideForm();
        }
    });
    
    // ESC key to hide form
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isFormVisible) {
            hideForm();
        }
    });
    
    // Prevent form clicks from bubbling
    mainContainer.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

function toggleFormVisibility() {
    if (isFormVisible) {
        hideForm();
    } else {
        showForm();
    }
}

function hideForm() {
    const mainContainer = document.getElementById('mainContainer');
    const toggleBtn = document.getElementById('toggleFormBtn');
    
    if (mainContainer) {
        mainContainer.classList.add('hidden');
    }
    if (toggleBtn) {
        toggleBtn.textContent = 'Hiện Form';
        toggleBtn.classList.add('form-hidden');
    }
    isFormVisible = false;
    
    // Change spherical background theme to indicate focus mode
    if (window.sphericalBackground && window.sphericalBackground.instance()) {
        window.sphericalBackground.changeTheme('blue');
    }
}

function showForm() {
    const mainContainer = document.getElementById('mainContainer');
    const toggleBtn = document.getElementById('toggleFormBtn');
    
    if (mainContainer) {
        mainContainer.classList.remove('hidden');
    }
    if (toggleBtn) {
        toggleBtn.textContent = 'Ẩn Form';
        toggleBtn.classList.remove('form-hidden');
    }
    isFormVisible = true;
    
    // Restore default theme
    if (window.sphericalBackground && window.sphericalBackground.instance()) {
        window.sphericalBackground.changeTheme('purple');
    }
}
