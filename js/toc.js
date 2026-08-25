document.addEventListener('DOMContentLoaded', function() {
  // Get the TOC container
  const tocContainer = document.querySelector('.toc-container');
  if (!tocContainer) return;
  
  // Get the spacing values from CSS
  const computedStyle = window.getComputedStyle(tocContainer);
  const topSpacing = parseInt(computedStyle.top) || 100;
  const rightSpacing = parseInt(computedStyle.right) || 20;
  
  // Device detection functions to match our CSS breakpoints
  function isTablet() {
    return window.innerWidth <= 1024 && window.innerWidth > 768;
  }
  
  function isMobile() {
    return window.innerWidth <= 768;
  }
  
  function isDesktop() {
    return window.innerWidth > 1024;
  }
  
  // Adjust TOC height based on window height with equal top and bottom spacing
  // Only apply on desktop
  function adjustTocHeight() {
    if (isMobile() || isTablet()) {
      // On mobile/tablet, don't restrict height or add bottom spacing
      tocContainer.style.maxHeight = 'none';
      
      // Remove padding element if it exists on mobile/tablet
      const paddingElement = document.querySelector('.toc-bottom-padding');
      if (paddingElement) {
        paddingElement.style.display = 'none';
      }
    } else {
      // On desktop, maintain equal spacing top and bottom
      const windowHeight = window.innerHeight;
      tocContainer.style.maxHeight = `${windowHeight - (topSpacing * 2)}px`;
      
      // Show padding element if it exists
      const paddingElement = document.querySelector('.toc-bottom-padding');
      if (paddingElement) {
        paddingElement.style.display = 'block';
      }
    }
  }
  
  // Run on load
  adjustTocHeight();
  
  // Run on window resize
  window.addEventListener('resize', adjustTocHeight);
  
  // Prepare TOC container to have a proper padding element at bottom for equal spacing
  // This will only be visible on desktop
  function prepareTocContainer() {
    // Check if we already have a padding element
    if (!document.querySelector('.toc-bottom-padding')) {
      const paddingElement = document.createElement('div');
      paddingElement.className = 'toc-bottom-padding';
      paddingElement.style.height = `${topSpacing}px`; // Use the same spacing as top
      paddingElement.style.width = '100%';
      paddingElement.style.display = (isMobile() || isTablet()) ? 'none' : 'block'; // Hide on mobile/tablet
      
      // Append to TableOfContents if it exists
      const tableOfContents = tocContainer.querySelector('#TableOfContents');
      if (tableOfContents) {
        tableOfContents.appendChild(paddingElement);
      } else {
        tocContainer.appendChild(paddingElement);
      }
    }
  }
  
  // Run once
  prepareTocContainer();
  
  // Add active class to current section
  const headings = document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3, .post-content h4');
  const tocLinks = document.querySelectorAll('#TableOfContents a');
  
  if (headings.length === 0 || tocLinks.length === 0) return;
  
  function highlightTocSection() {
    let currentHeadingId = null;
    
    // Find the current heading (the one at the top of the viewport or just above it)
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const rect = heading.getBoundingClientRect();
      
      // If the heading is in the viewport or just above it
      if (rect.top <= 50) {
        currentHeadingId = heading.id;
      } else {
        break;
      }
    }
    
    // Remove active class from all links
    tocLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to the current section link and scroll it into view in the TOC (desktop only)
    if (currentHeadingId) {
      const activeLink = document.querySelector(`#TableOfContents a[href="#${currentHeadingId}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
        
        // Only scroll the TOC on desktop devices
        if (isDesktop()) {
          // Calculate spacing buffer based on side spacing
          const bufferSpace = Math.max(rightSpacing, topSpacing * 0.2);
          
          // Scroll active link into view, with padding to ensure it's not right at the edge
          const tocRect = tocContainer.getBoundingClientRect();
          const linkRect = activeLink.getBoundingClientRect();
          
          const isInView = (
            linkRect.top >= tocRect.top + bufferSpace && 
            linkRect.bottom <= tocRect.bottom - bufferSpace
          );
          
          if (!isInView) {
            // Calculate scroll position with proper spacing
            const scrollPos = linkRect.top + tocContainer.scrollTop - tocRect.top - (tocRect.height / 2) + (linkRect.height / 2);
            tocContainer.scrollTo({
              top: scrollPos,
              behavior: 'smooth'
            });
          }
        }
      }
    }
  }
  
  // Run on scroll
  window.addEventListener('scroll', highlightTocSection);
  
  // Initial highlight
  highlightTocSection();
});
