// Add to main.js

// Store uploaded fonts
let customFonts = new Map();

// Create style element for custom fonts
const customFontStyles = document.createElement('style');
document.head.appendChild(customFontStyles);

function handleFontUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
        alert('Please upload a valid font file (.ttf, .otf, .woff, or .woff2)');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const fontName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        const fontUrl = e.target.result;
        
        // Create and add @font-face rule
        const fontFace = `
            @font-face {
                font-family: "${fontName}";
                src: url(${fontUrl}) format("${getFontFormat(file.name)}");
            }
        `;
        
        // Store font data
        customFonts.set(fontName, {
            url: fontUrl,
            format: getFontFormat(file.name)
        });
        
        // Add to style element
        customFontStyles.textContent += fontFace;
        
        // Add to font selector
        addFontOption(fontName);
        
        // Optional: Switch to the new font
        updateFont(fontName);
    };
    
    reader.readAsDataURL(file);
}

function getFontFormat(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
        case 'ttf': return 'truetype';
        case 'otf': return 'opentype';
        case 'woff': return 'woff';
        case 'woff2': return 'woff2';
        default: return 'truetype';
    }
}

function addFontOption(fontName) {
    const fontSelect = document.getElementById('fontFamily');
    const option = document.createElement('option');
    option.value = fontName;
    option.textContent = `${fontName} (Custom)`;
    fontSelect.appendChild(option);
    
    // Select the new font
    fontSelect.value = fontName;
}

// Update updateFont function to handle custom fonts
function updateFont(fontFamily) {
    // If it's a custom font, don't add fallback
    const isCustomFont = customFonts.has(fontFamily);
    const fontValue = isCustomFont ? `'${fontFamily}'` : `'${fontFamily}', sans-serif`;
    document.documentElement.style.setProperty('--font-family', fontValue);
}