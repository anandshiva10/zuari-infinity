function loadHTML(id, file) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;

      // If navbar was loaded, bind its JS
      if (file.includes('navbar.html')) {
        const mobileToggle = document.getElementById('mobile-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navbar = document.getElementById('navbar');

        if (mobileToggle && navMenu && navbar) {
          mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            document.body.classList.toggle('lock-scroll');
            navbar.classList.toggle('dark');
          });

          document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
              navMenu.classList.remove('active');
              document.body.classList.remove('lock-scroll');
              navbar.classList.remove('dark');
            });
          });
        }
      }
    })
    .catch(err => console.error(`Error loading ${file}:`, err));
}


// Usage
window.addEventListener('DOMContentLoaded', () => {
  loadHTML('navbar-placeholder', '/components/navbar.html');
  loadHTML('footer-placeholder', '/components/footer.html');
});
