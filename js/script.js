// Load HTML fragments safely and return a promise that resolves after insertion
async function loadFragment(placeholderSelector, url) {
  const host = document.querySelector(placeholderSelector);
  if (!host) return null;
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    const html = await res.text();
    host.innerHTML = html;
    return host;
  } catch (err) {
    console.warn(err.message);
    host.innerHTML = ""; // graceful fallback, no null refs
    return host;
  }
}

// Event delegation for smooth scrolling (works for injected links too)
function setupSmoothScroll() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    // If a nav link on mobile, close the menu
    const navMenu = document.getElementById("nav-menu");
    const mobileToggle = document.getElementById("mobile-toggle");
    const navbar = document.getElementById("navbar");
    if (navMenu && mobileToggle && navbar && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
      document.body.classList.remove("lock-scroll");
      navbar.classList.remove("dark");
      mobileToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function setupNavbarBehavior() {
  const navbar = document.getElementById("navbar");
  const navMenu = document.getElementById("nav-menu");
  const mobileToggle = document.getElementById("mobile-toggle");

  if (mobileToggle && navMenu && navbar) {
    mobileToggle.addEventListener("click", () => {
      const willOpen = !navMenu.classList.contains("active");
      navMenu.classList.toggle("active");
      document.body.classList.toggle("lock-scroll");
      navbar.classList.toggle("dark");
      mobileToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  }

  // Scroll state
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 50) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set initial
  }
}

function animateValue(element, start, end, duration, decimals = 0, suffix = "") {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = start + (end - start) * progress;
    element.textContent = currentValue.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + suffix;
    if (progress < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

function setupObservers() {
  const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");

      // Counters
      if (entry.target.classList.contains("about-stats")) {
        const stats = entry.target.querySelectorAll(".about-stat-number");
        stats.forEach((stat, idx) => {
          const raw = stat.getAttribute("data-target");
          if (!raw) return;
          const target = Number(raw);
          const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
          const suffix = idx === 1 ? "+" : ""; // add + to second stat to match "Global Clients"
          setTimeout(() => {
            animateValue(stat, 0, target, 800, decimals, suffix);
          }, idx * 200);
        });
      }
    });
  }, observerOptions);

  document.querySelectorAll(".fade-in, .about-stats").forEach((el) => observer.observe(el));
}

// Lazy loading images (progressive upgrade)
function setupImageObserver() {
  if (!("IntersectionObserver" in window)) return;
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src || img.src;
      img.classList.remove("lazy");
      imageObserver.unobserve(img);
    });
  });
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => imageObserver.observe(img));
}

// Contact form (demo)
function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    console.log("Form submitted:", payload);
    alert("Thank you for your message! We will get back to you soon.");
    form.reset();
  });
}

// Preload critical images
function preloadCriticalImages() {
  const critical = [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&crop=buildings',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop&crop=energy'
  ];
  critical.forEach((src) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // Load reusable parts first, then wire events
  await Promise.all([
    loadFragment("#navbar-placeholder", "/components/navbar.html"),
    loadFragment("#footer-placeholder", "/components/footer.html")
  ]);

  setupNavbarBehavior();   // depends on injected navbar
  setupSmoothScroll();     // delegated; works for injected links too
  setupObservers();
  setupImageObserver();
  setupContactForm();
  preloadCriticalImages();

  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
  });
});
