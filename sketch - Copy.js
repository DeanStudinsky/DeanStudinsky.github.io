// Data for the projects
const projects = [
    { name: "Orbital Sim", url: "https://github.com/user/orbital-sim", icon: "🛰️", description: "A gravitational ecosystem simulation built with Three.js." },
    { name: "Grey Wolf Ecosystem Simulation", url: "https://github.com/user/wolf-ecosystem", icon: "🐺", description: "A multi-agent simulation modeling predator-prey dynamics and trophic cascades." },
    { name: "Tower Defense JS", url: "https://github.com/user/td-js", icon: "🏰", description: "Classic grid-based tower defense game logic implementation." },
    { name: "Cellular Automata", url: "https://github.com/user/automata", icon: "🧬", description: "Exploring Conway's Game of Life and other cellular patterns." },
    { name: "2D Platformer Engine", url: "https://github.com/user/platformer", icon: "🏃", description: "A reusable 2D collision and physics engine for platformers." },
    { name: "JS Inventory Manager", url: "https://github.com/user/inventory", icon: "💼", description: "Frontend inventory system for RPGs using local storage." },
    { name: "Pathfinding Viz", url: "https://github.com/user/pathfinder", icon: "🗺️", description: "Visualization of A* and Dijkstra's pathfinding algorithms." },
    { name: "Simple Pong Clone", url: "https://github.com/user/pong", icon: "🏓", description: "A retro classic implemented purely with canvas API." },
    { name: "Weather Dashboard", url: "https://github.com/user/weather-api", icon: "☁️", description: "Utility project fetching real-time weather data using APIs." },
    { name: "Dangerous Dungeonions", url: "https://dangerous-dungeonions.web.app/", icon: "🛡️⚔️", description: "A multi-user dungeon crawler web application built using Firebase/Firestore for real-time data." },
];

const menuContainer = document.getElementById('radial-menu-container');
const toggleButton = document.getElementById('menu-toggle-btn');
const mainContentCard = document.getElementById('main-content-card'); 
const projectDescription = document.getElementById('project-description'); 
const selectedTitle = document.getElementById('selected-project-title');
const selectedLink = document.getElementById('selected-project-link');

// Global array to store menu item data for lookup (angle and color)
let itemsData = [];

// Configuration for the radial layout - BIGGER CIRCLE
const RADIUS_PX = 280; 
const MOBILE_RADIUS_PX = 160; 

/**
 * Converts HSL string (hsl(H, S%, L%)) to an object {h, s, l}.
 */
function parseHSL(hsl) {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
        return {
            h: parseFloat(match[1]),
            s: parseFloat(match[2]),
            l: parseFloat(match[3]),
        };
    }
    return { h: 0, s: 0, l: 0 };
}

/**
 * Linearly interpolates between two HSL hues, handling the circular nature of the hue wheel.
 */
function interpolateHue(hue1, hue2, weight) {
    const diff = Math.abs(hue2 - hue1);
    
    // Go the shortest path around the circle
    if (diff > 180) {
        if (hue1 < hue2) {
            hue1 += 360;
        } else {
            hue2 += 360;
        }
    }
    
    // Linearly interpolate the hue
    let interpolatedHue = hue1 + (hue2 - hue1) * weight;

    // Normalize back to 0-360 range
    return interpolatedHue % 360;
}

/**
 * Calculates the radius based on screen size for responsiveness.
 * @returns {number} The appropriate radius in pixels.
 */
function getRadius() {
    return window.innerWidth < 768 ? MOBILE_RADIUS_PX : RADIUS_PX;
}

/**
 * Generates an HSL color based on the item's position index, cycling through 360 degrees.
 * @param {number} index - The index of the menu item.
 * @returns {string} The HSL color string.
 */
function getInterpolatedColor(index, numItems) {
    const angleStep = 360 / numItems;
    // Start the cycle at an Orange hue (30) for the first item (0 degrees)
    const hue = (index * angleStep + 30) % 360; 
    // Use high saturation and medium lightness for a neon look
    return `hsl(${hue}, 90%, 70%)`; 
}

/**
 * Renders the menu items dynamically and positions them.
 */
function renderMenuItems() {
    itemsData = []; 
    const R = getRadius();
    const N = projects.length;
    const angleStep = 360 / N; // Angle between each item

    projects.forEach((project, index) => {
        const angleDeg = angleStep * index;
        // Convert degrees to radians for JS Math functions
        const angleRad = angleDeg * (Math.PI / 180);

        // Calculate x and y translation from center (Y is inverted in standard screen coordinates)
        const x = R * Math.cos(angleRad - (Math.PI / 2)); // Offset by -90 deg to start top-center
        const y = R * Math.sin(angleRad - (Math.PI / 2));

        const itemColor = getInterpolatedColor(index, N);
        
        // Store data for color lookup
        const hslData = parseHSL(itemColor);
        itemsData.push({
            angle: angleDeg, // Store angle in degrees
            color: itemColor, 
            hsl: hslData,
            name: project.name
        });

        const item = document.createElement('a');
        item.href = project.url;
        item.target = '_blank';
        // Use dynamic inline styles for item color
        item.style.borderColor = itemColor;
        item.style.color = itemColor;
        item.style.boxShadow = `0 0 5px ${itemColor}`; // Subtle shadow on the item

        item.classList.add('radial-menu-item', 'w-16', 'h-16', 'md:w-20', 'md:h-20', 'rounded-full', 'border', 'flex', 'flex-col', 'items-center', 'justify-center', 'text-sm', 'text-center', 'font-semibold', 'shadow-sm');
        
        item.setAttribute('data-index', index);
        item.setAttribute('data-name', project.name);
        item.setAttribute('data-description', project.description);
        item.innerHTML = `<span class="text-xl md:text-2xl">${project.icon}</span><span class="text-xs mt-0.5 leading-none">${project.name}</span>`;

        // Set initial position (at the center)
        item.style.transform = `translate(-50%, -50%)`;

        // Store target position as data attribute
        item.setAttribute('data-target-x', x);
        item.setAttribute('data-target-y', y);

        // Add click listener for selection logic
        item.addEventListener('click', handleProjectSelection);

        menuContainer.appendChild(item);
    });
}

/**
 * Toggles the open state of the circular menu.
 */
function toggleMenu() {
    const isOpen = menuContainer.classList.toggle('is-open');
    const flaresParent = document.getElementById('menu-toggle-btn');
    
    // Start/Stop the pulsing animation
    if (isOpen) {
        flaresParent.classList.add('is-pulsing'); 
    } else {
        flaresParent.classList.remove('is-pulsing'); 
        // When menu is closed, reset the flare color to the default accent color
        flaresParent.style.setProperty('--flare-color', 'rgba(255, 140, 0, 0.8)');
    }

    // Apply or reset transforms based on state
    const items = menuContainer.querySelectorAll('.radial-menu-item');
    items.forEach(item => {
        const targetX = item.getAttribute('data-target-x');
        const targetY = item.getAttribute('data-target-y');

        if (isOpen) {
            // Move item to its calculated radial position
            item.style.transform = `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px))`;
        } else {
            // Move item back to the center
            item.style.transform = `translate(-50%, -50%)`;
        }
    });

    // If menu closes, hide the card
    if (!isOpen) {
        mainContentCard.classList.add('opacity-0', 'pointer-events-none', 'translate-y-20');
    }
}

/**
 * Handles the selection of a project from the radial menu.
 * @param {Event} event 
 */
function handleProjectSelection(event) {
    event.preventDefault(); // Stop the default link navigation
    
    const item = event.currentTarget;
    const name = item.getAttribute('data-name');
    const description = item.getAttribute('data-description');
    const url = item.getAttribute('href');
    const itemColor = item.style.borderColor;

    // 1. Update the main display card
    mainContentCard.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-20'); // Make it visible and interactive

    projectDescription.textContent = description;
    selectedTitle.textContent = name;
    selectedLink.href = url;
    selectedLink.textContent = `Visit ${name} →`; 
    selectedLink.classList.remove('hidden');

    // Optionally change link color to match the selected item's glow
    selectedLink.style.color = itemColor;
    
    // 2. Close the menu
    toggleMenu(); 
}

/**
 * Calculates the angle of the mouse relative to the center button.
 * @returns {number} Angle in degrees (0 = up, 90 = right, 360 clockwise).
 */
function getMouseAngle(mouseX, mouseY, centerX, centerY) {
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    
    // atan2 returns radians from -PI to PI, with 0 pointing right (+x axis).
    let angleRad = Math.atan2(deltaY, deltaX);

    // Convert to degrees
    let angleDeg = angleRad * (180 / Math.PI);

    // Normalize the angle to our radial menu's standard: 0 degrees UP, 360 clockwise.
    // Adjust so 0 is UP (-90 degrees in standard math)
    angleDeg += 90; 

    // Ensure it's 0-360 range
    if (angleDeg < 0) {
        angleDeg += 360;
    }
    
    return angleDeg % 360; 
}

/**
 * Finds the closest radial menu item based on the current mouse angle and updates the flare color.
 * This version interpolates the color between the two nearest items.
 */
function updateFlareColor(event) {
    const flaresParent = document.getElementById('menu-toggle-btn');
    
    // The color tracking logic only runs when the menu is open, 
    // otherwise the color defaults back to ambient white/grey in the toggleMenu function.
    if (!menuContainer.classList.contains('is-open')) {
        return; 
    }

    const rect = toggleButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseAngle = getMouseAngle(event.clientX, event.clientY, centerX, centerY);
    
    // Find the two closest items
    let closestItems = itemsData
        .map(item => {
            let diff = Math.abs(item.angle - mouseAngle);
            // Calculate shortest angular distance (wrap-around)
            if (diff > 180) {
                diff = 360 - diff;
            }
            return { ...item, diff };
        })
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 2); // Get the top 2 closest items

    
    if (closestItems.length >= 2) {
        const itemA = closestItems[0]; // Closest item
        const itemB = closestItems[1]; // Second closest item

        // Calculate interpolation weight (Based on proximity)
        const totalDiff = itemA.diff + itemB.diff; 

        let weightB = 0;
        if (totalDiff > 0) {
            weightB = itemA.diff / totalDiff; 
        }
        
        // Interpolate the hue
        const hslA = itemA.hsl;
        const hslB = itemB.hsl;

        const interpolatedHue = interpolateHue(hslA.h, hslB.h, weightB);

        // Create the new HSL color string (using saturation/lightness from the closest item)
        const newColor = `hsl(${interpolatedHue.toFixed(0)}, ${hslA.s}%, ${hslA.l}%)`;

        // Apply the interpolated color
        flaresParent.style.setProperty('--flare-color', newColor);
    } else if (closestItems.length === 1) {
        // If only one item, just use its color
        flaresParent.style.setProperty('--flare-color', closestItems[0].color);
    } 
    // If the mouse moves far away while the menu is open, it retains the last color, which is fine.
}


// --- Initialization ---
// 1. Render items on load
// 2. Add listener to the central button/name display
// 3. Add global mousemove listener for directional color feedback
// 4. Re-calculate positions and re-render on resize

window.onload = function() {
    renderMenuItems();

    toggleButton.addEventListener('click', () => {
         // Always ensure pulsing is on/off correctly
        toggleMenu();
    });

    document.addEventListener('mousemove', updateFlareColor);

    window.addEventListener('resize', () => {
        const wasOpen = menuContainer.classList.contains('is-open');
        
        // Clear existing and re-render
        menuContainer.querySelectorAll('.radial-menu-item').forEach(el => el.remove());
        renderMenuItems();
        
        // Re-apply positioning and pulsing state if it was open
        if (wasOpen) {
             // Must re-run the toggle logic to reposition the newly created elements
            menuContainer.classList.remove('is-open'); // Toggle will add it back
            toggleMenu();
        }
    });

    // Start the p5 sketch after all DOM elements are ready
    new p5(perlinSketch);
}


// =========================================================================
// P5.JS SKETCH LOGIC - PERLIN NOISE RINGS
// =========================================================================

const perlinSketch = (p) => {
    // Perlin Noise Variables (adapted from user's input)
    let xOffset = 0.03;
    let yOffset = 0.01;
    const offsetInc = 1.01; // Perlin offset increment for spatial diversity
    const inc = 0.001;      // Perlin increment for shape detail
    
    // NEW CONSTANTS
    // Define minimum radius in pixels (Button radius is max ~80px, so 100px is safe)
    const MIN_START_RADIUS_PX = 100; 
    // How much the Perlin noise will modulate the shape (wiggle factor)
    const NOISE_MODULATION_PX = 50; 

    // UPDATED: startS now defines the base radius in pixels.
    const startS = MIN_START_RADIUS_PX;    
    
    // Decreased size multiplier to make the ring expansion smoother.
    const m = 3.5;          
    
    let currentS;           // Size variable used in the loop (now tracking base radius in pixels)
    let loopCounter = 0;    // Tracks the current set of rings
    const maxLoops = 10;    // Number of rings to draw in a set

    // Element reference for color reading
    const flareElement = document.getElementById('menu-toggle-btn');

    p.setup = function() {
        // Create a canvas that covers the entire viewport
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.background(0); 
        p.noFill();
        p.frameRate(30); 

        // Initialize the size for the first draw
        currentS = startS;
        
        // Set the central button to always be pulsing for ambient effect
        if (flareElement) {
            flareElement.classList.add('is-pulsing');
        }
    };

    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.background(0); 
    };

    p.draw = function() {
        // 1. CLEAR BACKGROUND (Semi-transparent black for subtle trail effect)
        // We keep this running always for the ambient effect
        p.background(0, 10); 
        p.blendMode(p.NORMAL); 

        // 2. READ DYNAMIC COLOR
        // NOTE: We now default to the accent color for better contrast when reading the CSS variable fails
        let flareColor = 'rgba(255, 140, 0, 0.8)';
        if (flareElement) {
            const style = window.getComputedStyle(flareElement);
            // Read the dynamic CSS variable
            flareColor = style.getPropertyValue('--flare-color') || flareColor;
        }
        
        p.stroke(flareColor); 
        p.strokeWeight(2); 

        // 3. CENTER THE SKETCH
        p.push(); 
        p.translate(p.width * 0.5, p.height * 0.5);

        // 4. DRAW LOGIC

        // Check if the current set of rings has finished drawing (s gets large)
        if (currentS > 20000) { 
            currentS = startS; // Reset size for a new burst
        }

        if (loopCounter < maxLoops) { 
            
            // --- Drawing one ring in the set ---
            
            // Adjust point count relative to currentS (now pixel based) to cap at max 50 points
            let nPoints = p.int(currentS * 0.5); 
            nPoints = p.min(nPoints, 50);

            // Create ring
            p.beginShape();
            for (var i = 0; i < nPoints; i++) {
                // Angle (TAU is p5's 2*PI)
                let a = i / nPoints * p.TAU;
                let v = p5.Vector.fromAngle(a);
                
                // Perlin noise lookup (0 to 1 value)
                let noiseVal = p.noise(xOffset + v.x * inc, yOffset + v.y * inc);
                
                // Calculate final radius (n)
                // Radius = Base Expanding Radius (currentS) + (Noise Modulation * Wiggle Factor)
                let n = currentS + (noiseVal * NOISE_MODULATION_PX);
                
                // Scale the vector by the calculated radius
                v.mult(n);
                
                p.vertex(v.x, v.y);
            }
            p.endShape(p.CLOSE);

            // Increment perlin offset for next, inner ring (spatial offset)
            xOffset += offsetInc;
            yOffset += offsetInc;

            // Increase size for next ring (multiplied by m)
            currentS *= m;
            loopCounter++;
        } else {
            // All 10 rings in the set have been drawn.
            // Now, only slightly advance time until the next burst (reset)
            xOffset += 0.005; 
            yOffset += 0.005;

            // Trigger the reset to start drawing the next burst of 10 rings
            if (p.frameCount % 20 === 0) {
                loopCounter = 0; 
                currentS = startS;
            }
        }
        
        p.pop(); // Restore translation state
    };
};