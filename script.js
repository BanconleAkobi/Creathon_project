// Enhanced cursor tracking
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

function animateFollower() {
    followerX += (mouseX - followerX) * 0.5;
    followerY += (mouseY - followerY) * 0.5;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
}
animateFollower();

// Enhanced Three.js Scene
let scene, camera, renderer, particles, morphingMesh, time = 0;
let mousePosition = { x: 0, y: 0 };

function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const canvas = document.getElementById('webgl-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create morphing geometry
    createMorphingMesh();
    
    // Create particle system
    createAdvancedParticles();
    
    // Create floating orbs
    createFloatingOrbs();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ff88, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff0066, 0.8, 100);
    pointLight2.position.set(-10, -10, 5);
    scene.add(pointLight2);

    // Start animation
    animate();
}

function createMorphingMesh() {
    const geometry = new THREE.IcosahedronGeometry(2, 4);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    
    morphingMesh = new THREE.Mesh(geometry, material);
    morphingMesh.position.set(3, 0, -2);
    scene.add(morphingMesh);
}

function createAdvancedParticles() {
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Create spiral pattern
        const radius = Math.random() * 10;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 20;
        
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = height;
        positions[i3 + 2] = Math.sin(angle) * radius;
        
        // Dynamic colors
        colors[i3] = Math.random() * 0.5 + 0.5;     // R
        colors[i3 + 1] = Math.random() * 0.5 + 0.5; // G
        colors[i3 + 2] = 1;                         // B
        
        sizes[i] = Math.random() * 3 + 1;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

function createFloatingOrbs() {
    for (let i = 0; i < 5; i++) {
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: i % 2 === 0 ? 0x00ff88 : 0xff0066,
            transparent: true,
            opacity: 0.7,
            emissive: i % 2 === 0 ? 0x004422 : 0x440022
        });
        
        const orb = new THREE.Mesh(geometry, material);
        orb.position.set(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        orb.userData = {
            originalPosition: orb.position.clone(),
            speed: Math.random() * 0.02 + 0.01
        };
        scene.add(orb);
    }
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Update mouse position for interactions
    document.addEventListener('mousemove', (event) => {
        mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animate morphing mesh
    if (morphingMesh) {
        morphingMesh.rotation.x = time * 0.5;
        morphingMesh.rotation.y = time * 0.3;
        morphingMesh.position.x = 3 + Math.sin(time) * 0.5;
        morphingMesh.position.y = Math.cos(time * 0.7) * 0.3;
        
        // React to mouse
        morphingMesh.rotation.z = mousePosition.x * 0.1;
    }

    // Animate particles
    if (particles) {
        particles.rotation.y = time * 0.1;
        particles.rotation.x = Math.sin(time * 0.5) * 0.1;
        
        // Update particle positions based on mouse
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + i) * 0.002;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }

    // Animate floating orbs
    scene.children.forEach(child => {
        if (child.userData && child.userData.originalPosition) {
            child.position.x = child.userData.originalPosition.x + Math.sin(time * child.userData.speed) * 2;
            child.position.y = child.userData.originalPosition.y + Math.cos(time * child.userData.speed * 0.7) * 1.5;
            child.rotation.x = time * child.userData.speed;
            child.rotation.y = time * child.userData.speed * 0.8;
        }
    });

    // Camera movement based on scroll
    const scrollY = window.pageYOffset;
    camera.position.y = scrollY * 0.001;
    camera.rotation.z = scrollY * 0.0001;

    renderer.render(scene, camera);
}

// Mouse interaction effects
document.addEventListener('mousemove', (event) => {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    
    // Check if hovering over interactive elements
    const target = event.target;
    if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.classList.contains('feature-item')) {
        cursor.style.transform = 'scale(1.5)';
        follower.style.transform = 'scale(1.5)';
        cursor.style.backgroundColor = '#ff0066';
    } else {
        cursor.style.transform = 'scale(1)';
        follower.style.transform = 'scale(1)';
        cursor.style.backgroundColor = '#00ff88';
    }
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.transform = 'translateY(0)';
            entry.target.style.opacity = '1';
        }
    });
}, observerOptions);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Loading animation
window.addEventListener('load', () => {
    const loading = document.getElementById('loading');
    setTimeout(() => {
        loading.classList.add('hidden');
        setTimeout(() => {
            loading.style.display = 'none';
        }, 1000);
    }, 2000);
});

// Resize handler
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Initialize everything
initThreeJS();

// Demo canvas interaction
const demoCanvas = document.getElementById('demo-canvas');
if (demoCanvas) {
    let demoScene, demoCamera, demoRenderer;
    
    function initDemoCanvas() {
        demoScene = new THREE.Scene();
        demoCamera = new THREE.PerspectiveCamera(75, demoCanvas.offsetWidth / demoCanvas.offsetHeight, 0.1, 1000);
        demoCamera.position.z = 3;

        demoRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        demoRenderer.setSize(demoCanvas.offsetWidth, demoCanvas.offsetHeight);
        demoRenderer.setClearColor(0x000000, 0);
        demoCanvas.appendChild(demoRenderer.domElement);

        // Create a simple venue layout
        const venueGeometry = new THREE.BoxGeometry(2, 0.1, 2);
        const venueMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const venue = new THREE.Mesh(venueGeometry, venueMaterial);
        demoScene.add(venue);

        // Add accessibility features
        const rampGeometry = new THREE.BoxGeometry(0.5, 0.05, 1);
        const rampMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff88 });
        const ramp = new THREE.Mesh(rampGeometry, rampMaterial);
        ramp.position.set(-0.7, 0.075, 0);
        demoScene.add(ramp);

        // Add lighting
        const demoLight = new THREE.PointLight(0xffffff, 1, 100);
        demoLight.position.set(0, 2, 2);
        demoScene.add(demoLight);

        const demoAmbient = new THREE.AmbientLight(0x404040, 0.4);
        demoScene.add(demoAmbient);

        function animateDemo() {
            requestAnimationFrame(animateDemo);
            venue.rotation.y += 0.005;
            ramp.rotation.y += 0.005;
            demoRenderer.render(demoScene, demoCamera);
        }
        animateDemo();
    }

    // Initialize demo canvas when visible
    const demoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !demoRenderer) {
                initDemoCanvas();
            }
        });
    });
    demoObserver.observe(demoCanvas);
}

// Add some performance monitoring
console.log('🚀 EventsForAll - Revolutionary Event Accessibility Platform Loaded');
console.log('✨ Experience the future of inclusive events');