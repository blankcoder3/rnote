function saveContent() {
    // Get content based on whether we want formatted or plain text
    const textContent = editor.innerText;
    const htmlContent = editor.innerHTML;
    
    // Create modal dialog for format selection
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'var(--bg-color)';
    modalContent.style.color = 'var(--text-color)';
    modalContent.style.padding = '2rem';
    modalContent.style.borderRadius = '5px';
    modalContent.style.width = '300px';
    
    const title = document.createElement('h3');
    title.textContent = 'Choose Format';
    title.style.marginBottom = '1rem';
    
    const formats = [
        { name: 'Text File (.txt)', value: 'txt' },
        { name: 'EPUB eBook (.epub)', value: 'epub' }
    ];
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.gap = '0.5rem';
    
    formats.forEach(format => {
        const button = document.createElement('button');
        button.textContent = format.name;
        button.style.padding = '0.5rem';
        button.style.cursor = 'pointer';
        button.style.backgroundColor = 'var(--toolbar-bg)';
        button.style.border = '1px solid var(--text-color)';
        button.style.color = 'var(--text-color)';
        
        button.addEventListener('click', () => {
            modal.remove();
            downloadContent(format.value);
        });
        
        buttonContainer.appendChild(button);
    });
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '0.5rem';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.backgroundColor = 'var(--toolbar-bg)';
    cancelButton.style.border = '1px solid var(--text-color)';
    cancelButton.style.color = 'var(--text-color)';
    cancelButton.style.marginTop = '1rem';
    
    cancelButton.addEventListener('click', () => {
        modal.remove();
    });
    
    modalContent.appendChild(title);
    modalContent.appendChild(buttonContainer);
    modalContent.appendChild(cancelButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function downloadContent(format) {
    const textContent = editor.innerText;
    const htmlContent = editor.innerHTML;
    const docTitle = getDocumentTitle() || 'rnote-document';
    
    switch (format) {
        case 'txt':
            // Plain text download
            const txtBlob = new Blob([textContent], { type: 'text/plain' });
            downloadBlob(txtBlob, `${docTitle}.txt`);
            break;
            
        case 'epub':
            // For EPUB we'll use JSZip for basic structure
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', () => {
                const zip = new JSZip();
                
                // Add mimetype file
                zip.file('mimetype', 'application/epub+zip');
                
                // Add META-INF folder and container.xml
                const metaInf = zip.folder('META-INF');
                metaInf.file('container.xml', 
                    '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">' +
                    '<rootfiles><rootfile full-path="content.opf" media-type="application/oebps-package+xml"/></rootfiles>' +
                    '</container>');
                
                // Add content.opf
                const timestamp = new Date().toISOString();
                zip.file('content.opf',
                    '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">' +
                    '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">' +
                    `<dc:title>${docTitle}</dc:title>` +
                    '<dc:creator>rnote</dc:creator>' +
                    `<dc:identifier id="BookID">urn:uuid:${generateUUID()}</dc:identifier>` +
                    `<dc:date>${timestamp}</dc:date>` +
                    '<dc:language>en</dc:language>' +
                    '</metadata>' +
                    '<manifest>' +
                    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>' +
                    '<item id="content" href="content.html" media-type="application/xhtml+xml"/>' +
                    '</manifest>' +
                    '<spine toc="ncx">' +
                    '<itemref idref="content"/>' +
                    '</spine>' +
                    '</package>');
                
                // Add toc.ncx
                zip.file('toc.ncx',
                    '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">' +
                    '<head>' +
                    `<meta name="dtb:uid" content="urn:uuid:${generateUUID()}"/>` +
                    '<meta name="dtb:depth" content="1"/>' +
                    '<meta name="dtb:totalPageCount" content="0"/>' +
                    '<meta name="dtb:maxPageNumber" content="0"/>' +
                    '</head>' +
                    `<docTitle><text>${docTitle}</text></docTitle>` +
                    '<navMap>' +
                    '<navPoint id="navpoint-1" playOrder="1">' +
                    `<navLabel><text>${docTitle}</text></navLabel>` +
                    '<content src="content.html"/>' +
                    '</navPoint>' +
                    '</navMap>' +
                    '</ncx>');
                
                // Create content.html with proper EPUB structure
                const contentHead = '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<!DOCTYPE html>' +
                    '<html xmlns="http://www.w3.org/1999/xhtml">' +
                    '<head>' +
                    `<title>${docTitle}</title>` +
                    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>' +
                    `<style>
                        body { 
                            font-family: serif; 
                            font-size: 1em; 
                            line-height: 1.5;
                            margin: 0;
                            padding: 1em;
                        }
                        h1, h2, h3 { margin-top: 1em; margin-bottom: 0.5em; }
                        p { margin: 0.5em 0; }
                    </style>` +
                    '</head>' +
                    '<body>';
                
                const contentFoot = '</body></html>';
                
                // Clean up the HTML content for EPUB (remove any scripts, etc.)
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                
                // Remove any scripts
                tempDiv.querySelectorAll('script').forEach(el => el.remove());
                
                zip.file('content.html', contentHead + tempDiv.innerHTML + contentFoot);
                
                // Generate and download the EPUB
                zip.generateAsync({type: 'blob'}).then(content => {
                    downloadBlob(content, `${docTitle}.epub`);
                });
            });
            break;
    }
}

function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

function getDocumentTitle() {
    // Try to extract title from first heading
    const firstHeading = editor.querySelector('h1, h2, h3');
    if (firstHeading && firstHeading.textContent.trim()) {
        return firstHeading.textContent.trim();
    }
    
    // If no heading, use first few words of content
    const firstFewWords = editor.innerText.trim().split(/\s+/).slice(0, 4).join('-');
    if (firstFewWords) {
        return firstFewWords;
    }
    
    // Default title
    return 'rnote-document';
}

function generateUUID() {
    // Simple UUID generator for EPUB metadata
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}