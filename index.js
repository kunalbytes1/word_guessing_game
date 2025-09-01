// ==================================================
// HYPERLINK NAVIGATION MODIFIER
// Modifies existing frontend applications to open all links in new pages
// ==================================================

// METHOD 1: Pure JavaScript - Add to existing HTML page
// Add this script before closing </body> tag or in a separate JS file

(function() {
    'use strict';
    
    // Configuration options
    const CONFIG = {
        // Target all links or specific selectors
        targetSelector: 'a[href]', // Can be 'a', 'a[href^="http"]', etc.
        
        // Exclude certain links from modification
        excludeSelectors: [
            'a[href^="#"]',           // Anchor links
            'a[href^="mailto:"]',     // Email links
            'a[href^="tel:"]',        // Phone links
            'a[download]',            // Download links
            'a.no-new-tab'           // Custom class to exclude
        ],
        
        // Add security attributes
        addSecurity: true,
        
        // Log modifications (for debugging)
        enableLogging: false
    };

    // Function to modify existing links
    function modifyExistingLinks() {
        const links = document.querySelectorAll(CONFIG.targetSelector);
        let modifiedCount = 0;
        
        links.forEach(link => {
            // Skip if link matches exclude criteria
            if (shouldExcludeLink(link)) {
                return;
            }
            
            // Skip if already modified
            if (link.hasAttribute('data-modified')) {
                return;
            }
            
            // Modify the link
            link.setAttribute('target', '_blank');
            
            // Add security attributes for external links
            if (CONFIG.addSecurity && isExternalLink(link)) {
                link.setAttribute('rel', 'noopener noreferrer');
            }
            
            // Mark as modified
            link.setAttribute('data-modified', 'true');
            
            modifiedCount++;
            
            if (CONFIG.enableLogging) {
                console.log(`Modified link: ${link.href}`);
            }
        });
        
        if (CONFIG.enableLogging) {
            console.log(`Total links modified: ${modifiedCount}`);
        }
        
        return modifiedCount;
    }
    
    // Function to check if link should be excluded
    function shouldExcludeLink(link) {
        return CONFIG.excludeSelectors.some(selector => {
            try {
                return link.matches(selector);
            } catch (e) {
                return false;
            }
        });
    }
    
    // Function to check if link is external
    function isExternalLink(link) {
        const currentDomain = window.location.hostname;
        const linkDomain = new URL(link.href, window.location.origin).hostname;
        return currentDomain !== linkDomain;
    }
    
    // Observe for dynamically added links
    function observeDynamicLinks() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the added node is a link
                            if (node.tagName === 'A' && node.href) {
                                if (!shouldExcludeLink(node) && !node.hasAttribute('data-modified')) {
                                    node.setAttribute('target', '_blank');
                                    if (CONFIG.addSecurity && isExternalLink(node)) {
                                        node.setAttribute('rel', 'noopener noreferrer');
                                    }
                                    node.setAttribute('data-modified', 'true');
                                }
                            }
                            
                            // Check for links within the added node
                            const nestedLinks = node.querySelectorAll ? node.querySelectorAll('a[href]') : [];
                            nestedLinks.forEach(link => {
                                if (!shouldExcludeLink(link) && !link.hasAttribute('data-modified')) {
                                    link.setAttribute('target', '_blank');
                                    if (CONFIG.addSecurity && isExternalLink(link)) {
                                        link.setAttribute('rel', 'noopener noreferrer');
                                    }
                                    link.setAttribute('data-modified', 'true');
                                }
                            });
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        return observer;
    }
    
    // Initialize when DOM is ready
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                modifyExistingLinks();
                observeDynamicLinks();
            });
        } else {
            modifyExistingLinks();
            observeDynamicLinks();
        }
    }
    
    // Public API
    window.HyperlinkModifier = {
        init: initialize,
        modifyExisting: modifyExistingLinks,
        config: CONFIG
    };
    
    // Auto-initialize
    initialize();
})();

// ==================================================
// METHOD 2: React Hook for React Applications
// ==================================================

// Custom React hook to modify links
function useNewTabLinks(options = {}) {
    const {
        excludeSelectors = ['a[href^="#"]', 'a[href^="mailto:"]', 'a[href^="tel:"]'],
        addSecurity = true,
        enableLogging = false
    } = options;
    
    React.useEffect(() => {
        const modifyLinks = () => {
            const links = document.querySelectorAll('a[href]');
            let modifiedCount = 0;
            
            links.forEach(link => {
                // Skip excluded links
                const shouldExclude = excludeSelectors.some(selector => {
                    try {
                        return link.matches(selector);
                    } catch (e) {
                        return false;
                    }
                });
                
                if (shouldExclude || link.hasAttribute('data-modified')) {
                    return;
                }
                
                link.setAttribute('target', '_blank');
                
                if (addSecurity) {
                    const currentDomain = window.location.hostname;
                    const linkDomain = new URL(link.href, window.location.origin).hostname;
                    
                    if (currentDomain !== linkDomain) {
                        link.setAttribute('rel', 'noopener noreferrer');
                    }
                }
                
                link.setAttribute('data-modified', 'true');
                modifiedCount++;
            });
            
            if (enableLogging) {
                console.log(`React: Modified ${modifiedCount} links`);
            }
        };
        
        // Initial modification
        modifyLinks();
        
        // Observer for dynamic content
        const observer = new MutationObserver(modifyLinks);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        return () => observer.disconnect();
    }, []);
}

// Usage in React component:
// function MyComponent() {
//     useNewTabLinks({ enableLogging: true });
//     return <div>Your component content</div>;
// }

// ==================================================
// METHOD 3: jQuery Version (if jQuery is available)
// ==================================================

function modifyLinksWithJQuery() {
    $(document).ready(function() {
        // Modify existing links
        function updateLinks() {
            $('a[href]').not('[href^="#"], [href^="mailto:"], [href^="tel:"], [data-modified]').each(function() {
                $(this).attr('target', '_blank');
                
                // Add security for external links
                const currentDomain = window.location.hostname;
                const linkDomain = new URL(this.href, window.location.origin).hostname;
                
                if (currentDomain !== linkDomain) {
                    $(this).attr('rel', 'noopener noreferrer');
                }
                
                $(this).attr('data-modified', 'true');
            });
        }
        
        // Initial update
        updateLinks();
        
        // Update on dynamic content
        $(document).on('DOMNodeInserted', updateLinks);
    });
}

// ==================================================
// METHOD 4: CSS-only Solution (Limited functionality)
// ==================================================

/*
Add this CSS to your stylesheet:
This only works for links you can target with CSS selectors

a[href]:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"]) {
    // CSS can't set target="_blank", but you can style differently
    position: relative;
}

a[href]:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])::after {
    content: " ↗";
    font-size: 0.8em;
    opacity: 0.7;
}
*/

// ==================================================
// METHOD 5: Event Delegation Approach
// ==================================================

function setupEventDelegation() {
    document.addEventListener('click', function(event) {
        // Check if clicked element is a link
        const link = event.target.closest('a[href]');
        
        if (!link) return;
        
        // Skip certain types of links
        const href = link.getAttribute('href');
        if (href.startsWith('#') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') ||
            link.hasAttribute('download') ||
            link.classList.contains('no-new-tab')) {
            return;
        }
        
        // Prevent default behavior
        event.preventDefault();
        
        // Open in new tab/window
        window.open(link.href, '_blank', 'noopener,noreferrer');
    });
}

// ==================================================
// METHOD 6: Framework-Agnostic Solution with Advanced Options
// ==================================================

class LinkModifier {
    constructor(options = {}) {
        this.config = {
            autoInit: true,
            targetSelector: 'a[href]',
            excludePatterns: [
                /^#/,           // Anchor links
                /^mailto:/,     // Email links
                /^tel:/,        // Phone links
                /^javascript:/, // JavaScript links
            ],
            excludeClasses: ['no-new-tab', 'internal-link'],
            addSecurityAttributes: true,
            enableLogging: false,
            onLinkModified: null, // Callback function
            ...options
        };
        
        this.observer = null;
        this.modifiedCount = 0;
        
        if (this.config.autoInit) {
            this.init();
        }
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.modifyAllLinks());
        } else {
            this.modifyAllLinks();
        }
        
        this.startObserving();
    }
    
    modifyAllLinks() {
        const links = document.querySelectorAll(this.config.targetSelector);
        
        links.forEach(link => this.modifyLink(link));
        
        if (this.config.enableLogging) {
            console.log(`LinkModifier: Modified ${this.modifiedCount} links`);
        }
    }
    
    modifyLink(link) {
        if (this.shouldExcludeLink(link) || link.hasAttribute('data-link-modified')) {
            return false;
        }
        
        // Set target to blank
        link.setAttribute('target', '_blank');
        
        // Add security attributes for external links
        if (this.config.addSecurityAttributes && this.isExternalLink(link)) {
            const existingRel = link.getAttribute('rel') || '';
            const newRel = existingRel ? `${existingRel} noopener noreferrer` : 'noopener noreferrer';
            link.setAttribute('rel', newRel);
        }
        
        // Mark as modified
        link.setAttribute('data-link-modified', 'true');
        
        this.modifiedCount++;
        
        // Call callback if provided
        if (this.config.onLinkModified) {
            this.config.onLinkModified(link);
        }
        
        return true;
    }
    
    shouldExcludeLink(link) {
        const href = link.getAttribute('href');
        
        // Check href patterns
        if (this.config.excludePatterns.some(pattern => pattern.test(href))) {
            return true;
        }
        
        // Check classes
        if (this.config.excludeClasses.some(className => link.classList.contains(className))) {
            return true;
        }
        
        return false;
    }
    
    isExternalLink(link) {
        try {
            const linkUrl = new URL(link.href, window.location.origin);
            return linkUrl.hostname !== window.location.hostname;
        } catch (e) {
            return false;
        }
    }
    
    startObserving() {
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the node itself is a link
                            if (node.tagName === 'A' && node.href) {
                                this.modifyLink(node);
                            }
                            
                            // Check for links within the node
                            const nestedLinks = node.querySelectorAll ? node.querySelectorAll(this.config.targetSelector) : [];
                            nestedLinks.forEach(link => this.modifyLink(link));
                        }
                    });
                }
            });
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
    
    // Static method for quick implementation
    static quickSetup(options = {}) {
        return new LinkModifier(options);
    }
}

// ==================================================
// USAGE EXAMPLES
// ==================================================

// Example 1: Basic usage
// LinkModifier.quickSetup();

// Example 2: Advanced configuration
// const linkModifier = new LinkModifier({
//     excludeClasses: ['internal-link', 'no-new-tab'],
//     enableLogging: true,
//     onLinkModified: (link) => {
//         console.log('Modified:', link.href);
//         link.style.borderBottom = '1px dotted #ccc';
//     }
// });

// Example 3: For React applications (useEffect)
// useEffect(() => {
//     const linkModifier = LinkModifier.quickSetup({
//         enableLogging: true
//     });
//     
//     return () => linkModifier.destroy();
// }, []);

// ==================================================
// METHOD 7: Bookmarklet Version
// ==================================================

// Create a bookmarklet by wrapping this code in javascript: protocol
// Users can save this as a bookmark and click it on any page

const bookmarkletCode = `
javascript:(function(){
    document.querySelectorAll('a[href]').forEach(link => {
        if (!link.href.startsWith('#') && 
            !link.href.startsWith('mailto:') && 
            !link.href.startsWith('tel:') &&
            !link.hasAttribute('data-modified')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            link.setAttribute('data-modified', 'true');
            link.style.borderBottom = '2px solid #ff6b6b';
        }
    });
    alert('All links modified to open in new tabs!');
})();
`;

// ==================================================
// METHOD 8: WordPress/CMS Integration
// ==================================================

function setupWordPressIntegration() {
    // For WordPress themes - add to functions.php or custom plugin
    
    // PHP code to add to WordPress (as comment for reference):
    /*
    function modify_content_links($content) {
        // Use regex to add target="_blank" to all external links
        $content = preg_replace_callback(
            '/<a\s+([^>]*?)href=["\']([^"\']*)["\']([^>]*?)>/i',
            function($matches) {
                $full_match = $matches[0];
                $before_href = $matches[1];
                $href = $matches[2];
                $after_href = $matches[3];
                
                // Skip internal links, anchors, etc.
                if (strpos($href, '#') === 0 || 
                    strpos($href, 'mailto:') === 0 || 
                    strpos($href, 'tel:') === 0) {
                    return $full_match;
                }
                
                // Add target="_blank" if not already present
                if (strpos($full_match, 'target=') === false) {
                    $after_href .= ' target="_blank"';
                }
                
                // Add rel="noopener noreferrer" for external links
                if (!preg_match('/^https?:\/\/' . $_SERVER['HTTP_HOST'] . '/', $href) && 
                    strpos($full_match, 'rel=') === false) {
                    $after_href .= ' rel="noopener noreferrer"';
                }
                
                return '<a ' . $before_href . 'href="' . $href . '"' . $after_href . '>';
            },
            $content
        );
        
        return $content;
    }
    
    add_filter('the_content', 'modify_content_links');
    add_filter('widget_text', 'modify_content_links');
    */
}

// ==================================================
// METHOD 9: Browser Extension Content Script
// ==================================================

function createContentScript() {
    // For browser extension manifest.json:
    /*
    {
        "manifest_version": 3,
        "name": "New Tab Links",
        "version": "1.0",
        "content_scripts": [
            {
                "matches": ["<all_urls>"],
                "js": ["content.js"],
                "run_at": "document_end"
            }
        ]
    }
    */
    
    // content.js file content:
    const contentScriptCode = `
        (function() {
            function modifyLinks() {
                document.querySelectorAll('a[href]:not([data-modified])').forEach(link => {
                    const href = link.getAttribute('href');
                    
                    if (!href.startsWith('#') && 
                        !href.startsWith('mailto:') && 
                        !href.startsWith('tel:')) {
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                        link.setAttribute('data-modified', 'true');
                    }
                });
            }
            
            // Initial modification
            modifyLinks();
            
            // Observe for new links
            const observer = new MutationObserver(modifyLinks);
            observer.observe(document.body, { childList: true, subtree: true });
        })();
    `;
    
    return contentScriptCode;
}

// ==================================================
// METHOD 10: Testing and Debugging Functions
// ==================================================

const LinkModifierDebug = {
    // Count all links on page
    countLinks() {
        const total = document.querySelectorAll('a[href]').length;
        const modified = document.querySelectorAll('a[data-modified]').length;
        const external = document.querySelectorAll('a[target="_blank"]').length;
        
        console.table({
            'Total Links': total,
            'Modified Links': modified,
            'External Links': external,
            'Unmodified': total - modified
        });
    },
    
    // Highlight modified links
    highlightModified() {
        document.querySelectorAll('a[data-modified]').forEach(link => {
            link.style.outline = '2px solid #ff6b6b';
            link.style.outlineOffset = '2px';
        });
    },
    
    // Remove all modifications
    resetAllLinks() {
        document.querySelectorAll('a[data-modified]').forEach(link => {
            link.removeAttribute('target');
            link.removeAttribute('data-modified');
            
            // Clean up rel attribute
            const rel = link.getAttribute('rel');
            if (rel) {
                const cleanRel = rel.replace(/noopener|noreferrer/g, '').trim();
                if (cleanRel) {
                    link.setAttribute('rel', cleanRel);
                } else {
                    link.removeAttribute('rel');
                }
            }
        });
        console.log('All link modifications removed');
    },
    
    // Test specific selectors
    testSelector(selector) {
        const links = document.querySelectorAll(selector);
        console.log(`Selector "${selector}" matches ${links.length} elements:`);
        links.forEach((link, index) => {
            console.log(`${index + 1}. ${link.href} - ${link.textContent.trim()}`);
        });
    }
};

// ==================================================
// QUICK START IMPLEMENTATIONS
// ==================================================

// For immediate use - just copy and paste one of these:

// 1. Simple one-liner (add to console or script tag):
// document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])').forEach(link => { link.target = '_blank'; link.rel = 'noopener noreferrer'; });

// 2. With safety checks:
// document.addEventListener('DOMContentLoaded', () => {
//     document.querySelectorAll('a[href]').forEach(link => {
//         if (!link.href.match(/^(#|mailto:|tel:)/)) {
//             link.target = '_blank';
//             link.rel = 'noopener noreferrer';
//         }
//     });
// });

// 3. For dynamic content:
// new MutationObserver(() => {
//     document.querySelectorAll('a[href]:not([data-processed])').forEach(link => {
//         if (!link.href.match(/^(#|mailto:|tel:)/)) {
//             link.target = '_blank';
//             link.rel = 'noopener noreferrer';
//             link.dataset.processed = 'true';
//         }
//     });
// }).observe(document.body, { childList: true, subtree: true });

// ==================================================
// EXPORT FOR MODULE USAGE
// ==================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LinkModifier,
        LinkModifierDebug,
        setupEventDelegation,
        createContentScript
    };
}
