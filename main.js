const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.querySelector('.sidebar-toggle');
const editor = document.querySelector('.editor');
const headingsList = document.querySelector('.headings-list');
const headingSelect = document.getElementById('headingSelect');
const lineHeightSelect = document.getElementById('lineHeight');
const customLineHeightInput = document.getElementById('customLineHeight');


// Toggle sidebar
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

// Text formatting functions
function formatText(command) {
    document.execCommand(command, false, null);
    updateHeadingsList();
}

function formatHeading(tag) {
    if (tag === 'p') {
        document.execCommand('formatBlock', false, '<p>');
    } else {
        document.execCommand('formatBlock', false, `<${tag}>`);
    }
    
    // If converting the only paragraph to a heading, create a new paragraph
    const headings = editor.querySelectorAll('h1, h2, h3');
    const paragraphs = editor.querySelectorAll('p');
    
    if (headings.length > 0 && paragraphs.length === 0) {
        const newParagraph = document.createElement('p');
        newParagraph.innerHTML = '<br>';
        editor.appendChild(newParagraph);
    }
    
    updateHeadingsList();
}

// Font controls
function updateFont(fontFamily) {
    document.documentElement.style.setProperty('--font-family', `'${fontFamily}', sans-serif`);
}

function handleFontSizeChange(value) {
    const customInput = document.getElementById('customFontSize');
    if (value === 'custom') {
        customInput.style.display = 'inline';
    } else {
        customInput.style.display = 'none';
        document.documentElement.style.setProperty('--font-size', `${value}px`);
    }
}

// Handle custom font size input
const customFontSize = document.getElementById('customFontSize');
customFontSize.addEventListener('input', function() {
    document.documentElement.style.setProperty('--font-size', `${this.value}px`);
});

function updateLineHeight(value) {
    if (value === 'custom') {
        customLineHeightInput.style.display = 'inline';
        value = customLineHeightInput.value;
    } else {
        customLineHeightInput.style.display = 'none';
    }
    document.documentElement.style.setProperty('--line-height', value);
}

function updateCustomLineHeight(value) {
    document.documentElement.style.setProperty('--line-height', value);
}

// Statistics update
function updateStatistics() {
    const text = editor.innerText;
    
    // Count lines correctly (ignoring trailing empty lines)
    const lines = text.trim().split(/\n+/).length;

    // Count words correctly (already fine)
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    // Count characters correctly (including spaces but ignoring newlines)
    const chars = text.replace(/\n/g, '').length;

    document.getElementById('lineCount').textContent = lines;
    document.getElementById('wordCount').textContent = words;
    document.getElementById('charCount').textContent = chars;
}


// Update heading select based on current cursor position
function updateHeadingSelect() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        let node = selection.getRangeAt(0).commonAncestorContainer;
        
        if (node.nodeType === 3) {
            node = node.parentNode;
        }

        while (node !== editor && node.parentNode !== editor) {
            node = node.parentNode;
        }

        const tagName = node.tagName ? node.tagName.toLowerCase() : 'p';
        headingSelect.value = ['h1', 'h2', 'h3'].includes(tagName) ? tagName : 'p';
    }
}

// Theme toggle
function toggleTheme() {
    document.documentElement.setAttribute('data-theme',
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    );
}

// Custom colors
function updateColors(type, color) {
    if (type === 'bg') {
        document.documentElement.style.setProperty('--bg-color', color);
    } else {
        document.documentElement.style.setProperty('--text-color', color);
    }
}

// Update headings list
function updateHeadingsList() {
    const headings = editor.querySelectorAll('h1, h2, h3');
    headingsList.innerHTML = '';
    
    headings.forEach((heading, index) => {
        const headingItem = document.createElement('div');
        headingItem.className = 'heading-item';
        headingItem.textContent = heading.textContent || `Heading ${index + 1}`;
        headingItem.style.paddingLeft = `${(parseInt(heading.tagName[1]) - 1) * 1}rem`;
        
        headingItem.onclick = () => heading.scrollIntoView({ behavior: 'smooth' });
        headingsList.appendChild(headingItem);
    });
}

// Make first letter of first para larger 

function handleNewParagraph(e) {
    if (e.key === 'Enter') {
        // Get the current selection
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const startNode = range.startContainer;
        
        // Find if we're in a heading - check both the startNode and its parent
        let heading = null;
        if (startNode.nodeType === 3) { // Text node
            if (startNode.parentElement.tagName?.match(/^H[1-3]$/i)) {
                heading = startNode.parentElement;
            }
        } else if (startNode.tagName?.match(/^H[1-3]$/i)) {
            heading = startNode;
        }
        
        if (heading) {
            // Prevent default to handle paragraph creation manually
            e.preventDefault();
            
            // Create and insert new paragraph
            const newParagraph = document.createElement('p');
            newParagraph.innerHTML = '<br>';
            
            // Insert after the heading
            if (heading.nextSibling) {
                editor.insertBefore(newParagraph, heading.nextSibling);
            } else {
                editor.appendChild(newParagraph);
            }
            
            // Move cursor to new paragraph immediately
            const newRange = document.createRange();
            newRange.setStart(newParagraph, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Update headings list and statistics immediately
            updateHeadingsList();
            updateStatistics();
        }
    }
}

// Initialize placeholder state
if (editor.textContent.trim() === '') {
    editor.textContent = 'Start typing from here...';
    editor.classList.add('empty');
}

editor.addEventListener('focus', function() {
    if (editor.textContent === 'Start typing from here...') {
        editor.textContent = '';
        editor.classList.remove('empty');
        // Ensure content is wrapped in a paragraph
        document.execCommand('formatBlock', false, '<p>');
    }
});

editor.addEventListener('blur', function() {
    if (editor.textContent.trim() === '') {
        editor.textContent = 'Start typing from here...';
        editor.classList.add('empty');
    }
});

// Add the event listener
editor.addEventListener('keydown', handleNewParagraph);

// Event listeners
editor.addEventListener('input', () => {
    if (editor.textContent.trim() !== '') {
        // Ensure content is in a paragraph if it isn't already
        if (!editor.querySelector('p') && !editor.querySelector('h1,h2,h3')) {
            document.execCommand('formatBlock', false, '<p>');
        }
    }
    updateHeadingsList();
    updateHeadingSelect();
    updateStatistics();
});

editor.addEventListener('keyup', updateHeadingSelect);
editor.addEventListener('click', updateHeadingSelect);
editor.addEventListener('mouseup', updateHeadingSelect);

// Initialize statistics
updateStatistics();


