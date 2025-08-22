
const notepad = document.getElementById('notepad');
const wordCount = document.getElementById('word-count');
const charCount = document.getElementById('char-count');
const lineCount = document.getElementById('line-count');


function updateCounters() {
    const text = notepad.value;
    
    // Character count
    charCount.textContent = text.length;
    
    // Word count
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    wordCount.textContent = words.length === 0 ? 0 : words.length;
    
    // Line count
    const lines = text.split('\n');
    lineCount.textContent = lines.length || 1;
}


function clearText() {
    if (notepad.value && confirm('Are you sure you want to clear all text? 🙀')) {
        notepad.value = '';
        updateCounters();
        showNotification('Text cleared! 🧹');
    }
}


function downloadTxt() {
    const text = notepad.value;
    if (!text) {
        showNotification('Nothing to save! Write something first 😸');
        return;
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kitty-notes-${getTimestamp()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('TXT file saved! 📄✨');
}


function downloadPDF() {
    const text = notepad.value;
    if (!text) {
        showNotification('Nothing to save! Write something first 😸');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Colors
    const kittyTitleColor = [72, 61, 139];  // DarkSlateBlue for title
    const bodyText = [40, 40, 40];          // Dark gray body text
    const lightGray = [130, 130, 130];      // Subtle gray for date

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...kittyTitleColor);
    doc.text("Kitty Notepad", 105, 18, { align: "center" });

    // Date
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...lightGray);
    doc.text(`Created: ${new Date().toLocaleDateString()}`, 105, 26, { align: "center" });

    // Stats (Words, Characters, Lines) - in header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0); // pure black
    const stats = `Words: ${wordCount.textContent} | Characters: ${charCount.textContent} | Lines: ${lineCount.textContent}`;
    doc.text(stats, 105, 34, { align: "center" });

    // Separator line under header
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, 38, 190, 38);

    // Main Text
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...bodyText);

    const marginX = 20;
    let y = 50;
    const pageHeight = doc.internal.pageSize.height;

    const lines = doc.splitTextToSize(text, 170);
    lines.forEach(line => {
        if (y > pageHeight - 20) {
            doc.addPage();

            // repeat header on new page
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(...kittyTitleColor);
            doc.text("Kitty Notepad", 105, 18, { align: "center" });

            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            doc.setTextColor(...lightGray);
            doc.text(`Created: ${new Date().toLocaleDateString()}`, 105, 26, { align: "center" });

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(stats, 105, 34, { align: "center" });

            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(20, 38, 190, 38);

            y = 50;
        }
        doc.text(line, marginX, y);
        y += 7;
    });


    doc.save(`kitty-notes-${getTimestamp()}.pdf`);
    showNotification('PDF saved successfully! 📑');
}



function getTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span class="notification-icon">🐾</span>
        <span>${message}</span>
    `;
    

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        box-shadow: 0 4px 20px rgba(255, 182, 193, 0.4);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}


function autoSave() {
    localStorage.setItem('kittyNotepadContent', notepad.value);
}


function loadSavedContent() {
    const savedContent = localStorage.getItem('kittyNotepadContent');
    if (savedContent) {
        notepad.value = savedContent;
        updateCounters();
    }
}


notepad.addEventListener('input', () => {
    updateCounters();
    autoSave();
});


document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save as TXT
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        downloadTxt();
    }
    
    // Ctrl/Cmd + P to save as PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        downloadPDF();
    }
    
    // Ctrl/Cmd + L to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        clearText();
    }
});


let catMoodIndex = 0;
const catMoods = ['😺', '😸', '😻', '😽', '😹', '🙀', '😿', '😾'];

document.querySelector('.floating-cat').addEventListener('click', function() {
    catMoodIndex = (catMoodIndex + 1) % catMoods.length;
    this.querySelector('.cat-emoji').textContent = catMoods[catMoodIndex];
    
    // Add a little bounce animation
    this.style.animation = 'none';
    setTimeout(() => {
        this.style.animation = 'float 3s ease-in-out infinite, bounce 0.5s ease-out';
    }, 10);
});


const bounceStyle = document.createElement('style');
bounceStyle.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-20px) scale(1.2); }
    }
`;
document.head.appendChild(bounceStyle);


document.addEventListener('DOMContentLoaded', () => {
    loadSavedContent();
    updateCounters();
    
    // Welcome message
    if (!localStorage.getItem('kittyNotepadWelcomed')) {
        showNotification('Welcome to Kitty Notepad! 🐱💕');
        localStorage.setItem('kittyNotepadWelcomed', 'true');
    }
});

notepad.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        
        const start = this.selectionStart;
        const end = this.selectionEnd;
        
        // Insert tab at cursor position
        this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);
        
        // Move cursor after tab
        this.selectionStart = this.selectionEnd = start + 1;
        
        updateCounters();
        autoSave();
    }
});


let mouseX = 0, mouseY = 0;
let pawPrints = [];

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function createPawPrint() {
    const paw = document.createElement('div');
    paw.innerHTML = '🐾';
    paw.style.cssText = `
        position: fixed;
        left: ${mouseX}px;
        top: ${mouseY}px;
        pointer-events: none;
        font-size: 12px;
        opacity: 0.3;
        transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
        transition: opacity 2s ease-out;
        z-index: 999;
    `;
    
    document.body.appendChild(paw);
    pawPrints.push(paw);
    

    setTimeout(() => {
        paw.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(paw);
            pawPrints = pawPrints.filter(p => p !== paw);
        }, 2000);
    }, 100);
    

    if (pawPrints.length > 10) {
        const oldPaw = pawPrints.shift();
        if (oldPaw.parentNode) {
            oldPaw.parentNode.removeChild(oldPaw);
        }
    }
}

let lastPawTime = 0;
document.addEventListener('mousemove', () => {
    const now = Date.now();
    if (now - lastPawTime > 500) { // Every 500ms
        createPawPrint();
        lastPawTime = now;
    }
});