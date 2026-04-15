// AAROHANA LOCAL NATIVE CMS LOGIC

// UI Elements
const loginView = document.getElementById('login-view');
const dashView = document.getElementById('dashboard-view');
const loginBtn = document.getElementById('login-btn');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logout-btn');

// --- Mock Login ---
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    if(email === 'admin@kssem.edu.in' && pass === 'admin') {
        loginView.style.display = 'none';
        dashView.style.display = 'flex';
        loadExistingEvents();
    } else {
        authError.style.display = 'block';
        authError.innerText = "Local Login: Use admin@kssem.edu.in / admin";
    }
});

logoutBtn.addEventListener('click', () => {
    loginView.style.display = 'flex';
    dashView.style.display = 'none';
});

// --- Fetch Pre-existing events.html exactly as it is locally ---
async function loadExistingEvents() {
    const listDiv = document.getElementById('existing-events-list');
    if(!listDiv) return;
    
    try {
        const response = await fetch('events.html');
        if(!response.ok) throw new Error("Could not fetch events.html");
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        const cards = doc.querySelectorAll('.event-card');
        
        if(cards.length === 0) {
            listDiv.innerHTML = '<div style="color: #bbb;">No events found in events.html.</div>';
            return;
        }

        let outHTML = '';
        cards.forEach((card) => {
            const title = card.dataset.title || 'Untitled Event';
            const date = card.dataset.date || 'TBA';
            const fee = card.dataset.fee || 'FREE';
            const konf = card.dataset.konfhubLink || '#';
            
            // Add a native populate module
            let dumpData = encodeURIComponent(JSON.stringify({
                title: card.dataset.title,
                type: card.dataset.type || 'Solo',
                date: card.dataset.date,
                time: card.dataset.time,
                venue: card.dataset.venue,
                fee: card.dataset.fee,
                desc: card.dataset.description,
                link: card.dataset.konfhubLink,
                rules: card.dataset.rules
            }));
            
            // Protect against apostrophe injection breaking the onclick attribute
            dumpData = dumpData.replace(/'/g, "%27");

            outHTML += `
                <div style="background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: #fff; font-size: 1.1rem; letter-spacing: 1px;">${title} <span style="font-size: 0.7rem; background:#444; padding:2px 5px; border-radius:4px; margin-left: 5px;">${card.dataset.type || 'Solo'}</span></strong><br>
                        <span style="font-size: 0.85rem; color: #888;"><i class="fas fa-clock"></i> ${date} &nbsp; | &nbsp; <i class="fas fa-ticket-alt"></i> ₹${fee}</span>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="button button-secondary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="populateEditForm('${dumpData}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="button button-outline" style="padding: 6px 12px; font-size: 0.75rem; border: 1px solid #ff4d4d; color: #ff4d4d;" onclick="deleteEventLocal('${title}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
        
        listDiv.innerHTML = outHTML;
    } catch (e) {
        listDiv.innerHTML = `<div style="color: #ff4d4d; font-style: italic;">Error fetching events: ${e.message}</div>`;
    }
}

// Global Populate Function for the HTML Buttons
window.populateEditForm = function(encodedData) {
    try {
        const data = JSON.parse(decodeURIComponent(encodedData));
        document.getElementById('event-name').value = data.title || '';
        document.getElementById('event-type').value = data.type || 'Solo';
        document.getElementById('event-date').value = data.date || '';
        document.getElementById('event-time').value = data.time || '';
        document.getElementById('event-venue').value = data.venue || '';
        document.getElementById('event-fee').value = data.fee || '';
        document.getElementById('event-desc').value = data.desc || '';
        document.getElementById('event-link').value = data.link || '';
        document.getElementById('event-rules-link').value = data.rules || '';
        
        alert("Editing: " + data.title + ". Modify values then click 'Build & Overwrite'.");
        document.getElementById('event-tab').scrollIntoView();
    } catch(e) {
        console.error("Format failure", e);
    }
}


// --- Main local OVERWRITE Logic ---
window.saveEventToHTML = async function() {
    const title = document.getElementById('event-name').value;
    const type = document.getElementById('event-type').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const venue = document.getElementById('event-venue').value;
    const fee = document.getElementById('event-fee').value;
    const desc = document.getElementById('event-desc').value;
    const link = document.getElementById('event-link').value;
    const rulesLink = document.getElementById('event-rules-link').value;
    
    if(!title) return alert("You must provide an event title!");

    try {
        // 1. Fetch current events.html
        let response = await fetch('events.html');
        let htmlText = await response.text();
        
        // CRITICAL: Extract the raw <head>...</head> block BEFORE DOMParser mangles it.
        // DOMParser strips head content when it re-serializes via outerHTML.
        const headMatch = htmlText.match(/<head[\s\S]*?<\/head>/i);
        const rawHead = headMatch ? headMatch[0] : '<head></head>';
        
        // 2. Parse it natively in the browser
        let parser = new DOMParser();
        let doc = parser.parseFromString(htmlText, 'text/html');
        
        // 3. Find the card by checking data-title match!
        let cards = doc.querySelectorAll('.event-card');
        let targetCard = null;
        for(let card of cards) {
            if(card.dataset.title === title) {
                targetCard = card;
                break;
            }
        }
        // Generate new image name based securely on the Event Title!
        let newImageNameLocal = null;
        if (window.uploadedPosterBase64) {
            newImageNameLocal = title.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') + '.webp';
        }

        if(targetCard) {
            // Update datasets
            targetCard.dataset.title = title;
            targetCard.dataset.type = type;
            targetCard.dataset.date = date;
            targetCard.dataset.time = time;
            targetCard.dataset.venue = venue;
            targetCard.dataset.fee = fee;
            targetCard.dataset.description = desc;
            targetCard.dataset.konfhubLink = link;
            targetCard.dataset.rules = rulesLink;

            // Update specific visual UI elements inside the Bento grid explicitly
            let visualTitle = targetCard.querySelector('.bento-title');
            if(visualTitle) visualTitle.innerText = title;
            
            let visualDate = targetCard.querySelector('.bento-date');
            if(visualDate) visualDate.innerHTML = `<i class="fas fa-calendar-alt"></i> ${date}`;
            
            let visualFee = targetCard.querySelector('.bento-fee');
            if(visualFee) visualFee.innerHTML = `<i class="fas fa-ticket-alt"></i> ₹${fee}`;

            let visualType = targetCard.querySelector('.bento-type');
            if(visualType) {
                visualType.innerHTML = type === 'Group' ? '<i class="fas fa-users"></i> Group' : '<i class="fas fa-user"></i> Solo';
            } else {
                let metaBox = targetCard.querySelector('.bento-meta');
                if(metaBox) {
                    metaBox.insertAdjacentHTML('beforeend', `<span class="bento-type">${type === 'Group' ? '<i class="fas fa-users"></i> Group' : '<i class="fas fa-user"></i> Solo'}</span>`);
                }
            }

            let visualImg = targetCard.querySelector('.event-poster-image');
            if(visualImg && newImageNameLocal) {
                visualImg.src = "images/events/" + newImageNameLocal;
            }
            
        } else {
            console.log(`Event '${title}' not found. Constructing new Event module entirely from scratch!`);
            let defaultName = newImageNameLocal || 'Comming Soon.webp';
            
            let newCardHTML = `
                <div class="event-card reveal tilt-card" 
                data-title="${title}" 
                data-type="${type}"
                data-date="${date}" 
                data-time="${time}"
                data-venue="${venue}" 
                data-fee="${fee}"
                data-description="${desc}"
                data-rules="${rulesLink}"
                data-konfhub-link="${link}">
                    <img src="images/events/${defaultName}" alt="${title}" class="event-poster-image">
                    <div class="card-glow"></div>
                    <div class="card-content">
                        <h3 class="bento-title">${title}</h3>
                        <div class="bento-meta">
                            <span class="bento-date"><i class="fas fa-calendar-alt"></i> ${date}</span>
                            <span class="bento-fee"><i class="fas fa-ticket-alt"></i> ₹${fee}</span>
                            <span class="bento-type">${type === 'Group' ? '<i class="fas fa-users"></i> Group' : '<i class="fas fa-user"></i> Solo'}</span>
                        </div>
                        <div class="bento-cta">View Details &rarr;</div>
                    </div>
                </div>
            `;
            
            // Where to inject it natively?
            let gridId = type === 'Group' ? '#group-events-grid' : '#solo-events-grid';
            let eventsGrid = doc.querySelector(gridId);
            if (!eventsGrid) eventsGrid = doc.querySelector('.events-grid'); // Fallback purely for safety
            
            if(eventsGrid) {
                eventsGrid.insertAdjacentHTML('beforeend', newCardHTML);
            } else {
                 return alert("CRITICAL ERROR: .events-grid wrapper not found inside your events.html! Cannot append a new dynamically created node.");
            }
        }

        // 4. Build the final HTML manually using the preserved head + just the body innerHTML.
        // This is the ONLY correct approach - DOMParser.outerHTML loses head content and injects garbage.
        const newHtml = `<!DOCTYPE html>\n<html lang="en">\n${rawHead}\n<body>\n${doc.body.innerHTML}\n</body>\n</html>`;

        let saveRes = await fetch('/api/save_html', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: 'events.html',
                html: newHtml,
                base64Image: window.uploadedPosterBase64,
                newImageName: newImageNameLocal
            })
        });

        let saveResult = await saveRes.json();
        if(saveResult.success) {
            alert("SUCCESS! events.html and your Media assets have been permanently overwritten on your computer!");
            
            // Clean up visual cache
            window.uploadedPosterBase64 = null;
            document.getElementById('poster-preview-box').innerHTML = '<span><i class="fas fa-image"></i> Click to Upload Image</span>';
            
            loadExistingEvents(); // refresh list
        } else {
            alert("Failed to overwrite: " + saveResult.message);
        }

    } catch(err) {
        alert("ERROR! Is the local Node.js server (cms_server.js) running instead of npx serve? Details: " + err);
    }
}

// Global Image Base64 Encode Mechanism
window.uploadedPosterBase64 = null;

// Handle Image Uploads with inline Canvas WebP Conversion
const fileInput = document.getElementById('event-poster-upload');
if (fileInput) {
    fileInput.addEventListener('change', function(e) {
        if(e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            const reader = new FileReader();
            reader.onload = function(evt) {
                const img = new Image();
                img.onload = function() {
                    // Create an invisible canvas to do math
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    // Natively transcode the pixel data to a highly efficient WebP string
                    window.uploadedPosterBase64 = canvas.toDataURL('image/webp', 0.85); // 85% Quality
                    
                    // Render exactly as normal
                    document.getElementById('poster-preview-box').innerHTML = `<img src="${window.uploadedPosterBase64}" style="width:100%; height:100%; object-fit:contain;"/>`;
                };
                img.src = evt.target.result;
            }
            reader.readAsDataURL(file);
        }
    });
}

// Clean Delete Tool Function
window.deleteEventLocal = async function(title) {
    if(!confirm("DANGER: Are you entirely sure you want to permanently delete '" + title + "' from the source code locally?")) return;
    
    try {
        let response = await fetch('events.html');
        let htmlText = await response.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(htmlText, 'text/html');
        
        let targetCard = Array.from(doc.querySelectorAll('.event-card'))
                              .find(c => c.dataset.title === title);
        
        if(targetCard) {
            targetCard.remove();
            const newHtml = "<!DOCTYPE html>\\n" + doc.documentElement.outerHTML;
            let saveRes = await fetch('/api/save_html', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: 'events.html', html: newHtml })
            });
            let saveResult = await saveRes.json();
            if(saveResult.success) {
                alert(title + " successfully removed. Live updates synced.");
                loadExistingEvents();
            } else {
                alert("Failed to delete structurally.");
            }
        }
    } catch(err) { alert("Delete Exception: " + err); }
}
