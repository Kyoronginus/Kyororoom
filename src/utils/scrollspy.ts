// src/utils/scrollspy.ts

/**
 * Automatically sets up an active section indicator for navbar links.
 * Observes sections that correspond to an anchor link in `.nav-links`.
 */
export function setupScrollspy() {
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-links a'));
  if (!navLinks.length) return;

  // Only track sections that correspond to a link in the navbar
  const trackedSections = navLinks
    .map((link) => {
      const href = link.getAttribute('href') || '';
      const id = href.startsWith('#') ? href.slice(1) : '';
      const element = id ? document.getElementById(id) : null;
      return { id, element, link };
    })
    .filter((item): item is { id: string; element: HTMLElement; link: HTMLAnchorElement } =>
      Boolean(item.element)
    );

  if (!trackedSections.length) return;

  function onScroll() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    let activeId = '';

    // If scrolled near the bottom, activate contact only if the contact header has entered the upper/middle viewport
    const contactSection = trackedSections.find((s) => s.id === 'contact');
    const contactRect = contactSection ? contactSection.element.getBoundingClientRect() : null;

    if (scrollY + windowHeight >= documentHeight - 60 && contactRect && contactRect.top <= windowHeight * 0.5) {
      activeId = 'contact';
    } else {
      // Trigger point at 200px beneath the sticky navbar
      const triggerY = 200;
      trackedSections.forEach(({ id, element }) => {
        const rect = element.getBoundingClientRect();
        if (rect.top <= triggerY && rect.bottom > triggerY) {
          activeId = id;
        }
      });
    }

    trackedSections.forEach(({ id, link }) => {
      if (id === activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
