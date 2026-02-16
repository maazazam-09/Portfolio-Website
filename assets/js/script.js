const menuToggle = document.getElementById("menu-toggle");
const siteNav = document.getElementById("site-nav");
const scrollTopBtn = document.getElementById("scroll-top");
const sections = [...document.querySelectorAll("main section[id]")];
const themeToggle = document.getElementById("theme-toggle");
const projectGrid = document.getElementById("projectGrid");
const searchInput = document.getElementById("projectSearch");
const filterRoot = document.getElementById("projectFilters");
const caseModal = document.getElementById("caseModal");
const caseDialog = document.getElementById("caseDialog");
const caseTitle = document.getElementById("caseTitle");
const caseBody = document.getElementById("caseBody");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const contactSubmit = document.getElementById("contactSubmit");
const toast = document.getElementById("toast");
const ambientLayer = document.querySelector(".ambient");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const isLocalPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const CONTACT_ENDPOINT = isLocalPreview
  ? "https://formsubmit.co/ajax/maazalamgir02@gmail.com"
  : "/.netlify/functions/contact";

let allProjects = [];
let activeFilter = "all";
let activeSearch = "";
let lastFocusedElement = null;

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => siteNav.classList.remove("open"));
  });
}

function initTheme() {
  const saved = localStorage.getItem("portfolio-theme");
  if (saved === "light") document.documentElement.dataset.theme = "light";
  syncThemeIcon();
}

function syncThemeIcon() {
  if (!themeToggle) return;
  const isLight = document.documentElement.dataset.theme === "light";
  themeToggle.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isLight = document.documentElement.dataset.theme === "light";
    if (isLight) {
      delete document.documentElement.dataset.theme;
      localStorage.setItem("portfolio-theme", "dark");
      showToast("Dark theme enabled");
    } else {
      document.documentElement.dataset.theme = "light";
      localStorage.setItem("portfolio-theme", "light");
      showToast("Light theme enabled");
    }
    syncThemeIcon();
  });
}

function updateActiveNav() {
  const y = window.scrollY + 160;
  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute("id");
    const navLink = document.querySelector(`.nav a[href="#${id}"]`);
    if (!navLink) return;

    if (y >= top && y < bottom) {
      document.querySelectorAll(".nav a").forEach((a) => a.classList.remove("active"));
      navLink.classList.add("active");
    }
  });
}

function updateScrollTop() {
  if (!scrollTopBtn) return;
  if (window.scrollY > 300) scrollTopBtn.classList.add("active");
  else scrollTopBtn.classList.remove("active");
}

window.addEventListener("scroll", () => {
  updateActiveNav();
  updateScrollTop();
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.15 },
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const skillsContainer = document.getElementById("skillsContainer");
const certificationsContainer = document.getElementById("certificationsContainer");

function renderSkillGroup(title, items) {
  const cards = (items || [])
    .map(
      (skill) => `
        <article class="skill-card">
          <img src="${skill.icon}" alt="${skill.name}" loading="lazy" />
          <span>${skill.name}</span>
        </article>
      `,
    )
    .join("");

  return `
    <section class="skill-group crystal">
      <h4>${title}</h4>
      <div class="skills-grid">${cards}</div>
    </section>
  `;
}

async function loadSkills() {
  if (!skillsContainer) return;

  try {
    const res = await fetch("./skills.json");
    const data = await res.json();

    if (Array.isArray(data)) {
      skillsContainer.innerHTML = renderSkillGroup("Skills", data);
      if (certificationsContainer) certificationsContainer.innerHTML = "";
      return;
    }

    const groups = [
      ["Programming Languages", data.programming_languages || []],
      ["Data Science", data.data_science || []],
      ["Full Stack Development", data.full_stack_development || []],
    ];

    skillsContainer.innerHTML = groups.map(([title, items]) => renderSkillGroup(title, items)).join("");

    if (certificationsContainer) {
      const certs = data.certifications || [];
      certificationsContainer.innerHTML = certs
        .map(
          (cert) => `
          <article class="cert-card crystal">
            <h4>${cert.title}</h4>
            <p>${cert.issuer}</p>
            <small>${cert.year}</small>
            <a href="${cert.link || "#"}" target="_blank" rel="noopener noreferrer">View Certificate</a>
          </article>
        `,
        )
        .join("");
    }
  } catch {
    skillsContainer.innerHTML = "<p>Unable to load skills right now.</p>";
    if (certificationsContainer) {
      certificationsContainer.innerHTML = "<p>Unable to load certifications right now.</p>";
    }
  }
}

function classifyProject(project) {
  const category = String(project.category || "").toLowerCase();
  if (category.includes("full") || category.includes("mern") || category.includes("stack")) return "full-stack";
  if (category.includes("data") || category.includes("ai") || category.includes("ml") || category.includes("nlp")) {
    return "data-ai";
  }
  if (category.includes("web") || category.includes("frontend") || category.includes("backend")) return "web";
  return "web";
}

function projectImage(project) {
  if (project.image && project.image !== "#") return `./assets/images/projects/${project.image}.png`;
  return "./assets/images/hero1.png";
}

function filteredProjects() {
  return allProjects.filter((project) => {
    const matchesFilter = activeFilter === "all" || classifyProject(project) === activeFilter;
    const text = `${project.name || ""} ${project.desc || ""} ${project.category || ""}`.toLowerCase();
    const matchesSearch = !activeSearch || text.includes(activeSearch);
    return matchesFilter && matchesSearch;
  });
}

function renderProjects() {
  if (!projectGrid) return;

  const items = filteredProjects();
  if (items.length === 0) {
    projectGrid.innerHTML = `<p class="project-empty">No projects found. Try changing filter or search text.</p>`;
    return;
  }

  projectGrid.innerHTML = items
    .map((project) => {
      const idx = allProjects.findIndex((p) => p.name === project.name);
      const type = classifyProject(project);
      const tagLabel = type === "data-ai" ? "Data & AI" : type === "full-stack" ? "Full Stack" : "Web";

      return `
        <article class="project-card crystal">
          <img src="${projectImage(project)}" alt="${project.name}" loading="lazy" />
          <div class="project-content">
            <span class="project-tag">${tagLabel}</span>
            <h4>${project.name}</h4>
            <p>${project.desc || "Project details available on request."}</p>
            <div class="project-links">
              <a href="${project.links?.view || "#"}" target="_blank" rel="noopener noreferrer">Live</a>
              <a href="${project.links?.code || "#"}" target="_blank" rel="noopener noreferrer">Code</a>
              <button class="case-btn" type="button" data-case-index="${idx}">Case Study</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  projectGrid.querySelectorAll(".case-btn").forEach((btn) => {
    btn.addEventListener("click", () => openCaseStudy(Number(btn.dataset.caseIndex)));
  });
}

async function loadProjects() {
  if (!projectGrid) return;

  try {
    const res = await fetch("./projects/projects.json");
    const projects = await res.json();
    allProjects = projects;
    renderProjects();
  } catch {
    projectGrid.innerHTML = "<p class=\"project-empty\">Unable to load projects right now.</p>";
  }
}

if (filterRoot) {
  filterRoot.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter || "all";
      filterRoot.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderProjects();
    });
  });
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    activeSearch = searchInput.value.trim().toLowerCase();
    renderProjects();
  });
}

function modalFocusableElements() {
  if (!caseModal) return [];
  return [...caseModal.querySelectorAll('button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])')].filter(
    (el) => !el.hasAttribute("disabled"),
  );
}

function openCaseStudy(index) {
  const project = allProjects[index];
  if (!project || !caseModal || !caseTitle || !caseBody) return;

  caseTitle.textContent = `${project.name} Case Study`;
  caseBody.innerHTML = `
    <h5>Problem</h5>
    <p>${project.desc || "Needed a robust implementation with user-focused output and reliable performance."}</p>
    <h5>Approach</h5>
    <p>Built with a ${project.category || "modern"} approach, focusing on clean architecture, reusable components, and practical deployment.</p>
    <h5>Impact</h5>
    <p>Delivered a maintainable solution with better usability, clearer structure, and stronger technical foundation for future iteration.</p>
    <div class="case-links">
      <a href="${project.links?.view || "#"}" target="_blank" rel="noopener noreferrer">Open Live</a>
      <a href="${project.links?.code || "#"}" target="_blank" rel="noopener noreferrer">Open Code</a>
    </div>
  `;

  lastFocusedElement = document.activeElement;
  caseModal.classList.add("open");
  caseModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const focusables = modalFocusableElements();
  if (focusables.length > 0) focusables[0].focus();
  else if (caseDialog) caseDialog.focus();
}

function closeCaseStudy() {
  if (!caseModal) return;
  caseModal.classList.remove("open");
  caseModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

if (caseModal) {
  caseModal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeCaseStudy);
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && caseModal?.classList.contains("open")) {
    closeCaseStudy();
    return;
  }

  if (event.key !== "Tab" || !caseModal?.classList.contains("open")) return;

  const focusables = modalFocusableElements();
  if (focusables.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
});

function setFormStatus(message, type = "") {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`.trim();
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function setFieldState(input, hint, message, isError) {
  if (!input || !hint) return;
  hint.textContent = message;
  hint.classList.toggle("error", isError);
  input.classList.toggle("invalid", isError);
}

function validateName() {
  const input = contactForm?.elements.namedItem("name");
  const hint = document.getElementById("nameHint");
  const value = String(input?.value || "").trim();
  const ok = value.length >= 3;
  setFieldState(input, hint, ok ? "Looks good." : "Enter at least 3 characters.", !ok);
  return ok;
}

function validateEmail() {
  const input = contactForm?.elements.namedItem("email");
  const hint = document.getElementById("emailHint");
  const value = String(input?.value || "").trim();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  setFieldState(input, hint, ok ? "Valid email format." : "Please enter a valid email.", !ok);
  return ok;
}

function validateMessage() {
  const input = contactForm?.elements.namedItem("message");
  const hint = document.getElementById("messageHint");
  const value = String(input?.value || "").trim();
  const ok = value.length >= 10;
  setFieldState(input, hint, ok ? "Looks good." : "Message should be at least 10 characters.", !ok);
  return ok;
}

if (contactForm) {
  const nameInput = contactForm.elements.namedItem("name");
  const emailInput = contactForm.elements.namedItem("email");
  const messageInput = contactForm.elements.namedItem("message");

  nameInput?.addEventListener("input", validateName);
  nameInput?.addEventListener("blur", validateName);
  emailInput?.addEventListener("input", validateEmail);
  emailInput?.addEventListener("blur", validateEmail);
  messageInput?.addEventListener("input", validateMessage);
  messageInput?.addEventListener("blur", validateMessage);

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameOk = validateName();
    const emailOk = validateEmail();
    const messageOk = validateMessage();
    if (!nameOk || !emailOk || !messageOk) {
      setFormStatus("Please fix highlighted fields before sending.", "error");
      return;
    }

    const formData = new FormData(contactForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    try {
      contactSubmit.disabled = true;
      setFormStatus("Sending message...", "");

      let response;
      let result;
      let ok = false;

      if (isLocalPreview) {
        const localPayload = new FormData();
        localPayload.append("name", payload.name);
        localPayload.append("email", payload.email);
        localPayload.append("message", payload.message);
        localPayload.append("_subject", "New Portfolio Contact Message (Local Test)");
        localPayload.append("_template", "table");
        localPayload.append("_captcha", "false");

        response = await fetch(CONTACT_ENDPOINT, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: localPayload,
        });

        result = await response.json().catch(() => ({}));
        ok = response.ok && (result.success === true || result.success === "true");
      } else {
        response = await fetch(CONTACT_ENDPOINT, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        result = await response.json().catch(() => ({}));
        ok = response.ok && result.success === true;
      }
      if (!ok) throw new Error("Delivery failed");

      contactForm.reset();
      document.querySelectorAll(".field-hint").forEach((hint) => hint.classList.remove("error"));
      document.querySelectorAll(".contact-form input, .contact-form textarea").forEach((el) => el.classList.remove("invalid"));
      setFormStatus(isLocalPreview
        ? "Message sent in local test mode. Please verify inbox."
        : "Message sent successfully. I will respond within 24 hours.", "success");
      showToast("Message sent successfully");
    } catch {
      setFormStatus("Unable to send right now. Please try again in a moment.", "error");
      showToast("Message could not be sent");
    } finally {
      contactSubmit.disabled = false;
    }
  });
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

initTheme();
loadSkills();
loadProjects();
updateActiveNav();
updateScrollTop();
