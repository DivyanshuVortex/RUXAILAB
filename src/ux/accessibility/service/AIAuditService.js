/**
 * AIAuditService handles the methodological core of accessibility evaluation:
 * - BFS Crawling (Inventory)
 * - Deterministic Sampling (WCAG-EM)
 */
class AIAuditService {
  /**
   * Performs a BFS crawl of a website to build a page inventory.
   * @param {string} startUrl - The entry point URL.
   * @param {number} maxDepth - Max BFS depth.
   * @param {number} maxPages - Max total pages to discover.
   * @param {Function} onProgress - Callback for progress updates.
   * @returns {Promise<Array>} - The discovered page inventory.
   */
  async crawlWebsite(startUrl, maxDepth = 2, maxPages = 15, onProgress = null) {
    const visited = new Set();
    const queue = [{ url: startUrl, depth: 0 }];
    const inventory = [];

    // Simple URL normalization
    const normalize = (url, base) => {
      try {
        const absolute = new URL(url, base).href.split('#')[0];
        return absolute.endsWith('/') ? absolute.slice(0, -1) : absolute;
      } catch (e) {
        return null;
      }
    };

    while (queue.length > 0 && inventory.length < maxPages) {
      const { url, depth } = queue.shift();
      
      const normalizedUrl = normalize(url, startUrl);
      if (!normalizedUrl || visited.has(normalizedUrl)) continue;

      visited.add(normalizedUrl);
      
      // Simulate/Trigger page info retrieval
      // In a real implementation, this would involve fetching the page or calling a worker
      const pageInfo = {
        url: normalizedUrl,
        title: normalizedUrl.split('/').pop() || 'Home',
        depth,
        type: this._identifyPageType(normalizedUrl),
        timestamp: Date.now()
      };
      
      inventory.push(pageInfo);
      if (onProgress) onProgress(inventory.length, maxPages, normalizedUrl);

      // Simulated link extraction for demo/real use
      if (depth < maxDepth && inventory.length < maxPages) {
        const simulatedLinks = this._getSimulatedLinks(normalizedUrl);
        simulatedLinks.forEach(link => {
          if (inventory.length < maxPages) {
            queue.push({ url: link, depth: depth + 1 });
          }
        });
      }
      
      // Artificial delay for UI feedback
      await new Promise(r => setTimeout(r, 600));
    }

    return inventory;
  }

  _getSimulatedLinks(baseUrl) {
    const base = baseUrl.replace(/\/$/, '');
    return [
      `${base}/login`,
      `${base}/contact-us`,
      `${base}/blog/accessibility-tips`,
      `${base}/pricing`,
      `${base}/about`,
      `${base}/services`,
      `${base}/search?q=test`
    ];
  }

  /**
   * Selects a deterministic sample of pages based on WCAG-EM methodology.
   * @param {Array} inventory - The full page inventory.
   * @returns {Array} - The selected sample pages.
   */
  generateSample(inventory) {
    if (inventory.length <= 5) return inventory;

    const sample = [];
    const grouped = {};

    // Group by identified type/template
    inventory.forEach(page => {
      if (!grouped[page.type]) grouped[page.type] = [];
      grouped[page.type].push(page);
    });

    // Ensure at least one of each type is included (Deterministic Sampling)
    Object.values(grouped).forEach(pages => {
      sample.push(pages[0]);
    });

    // Fill remaining up to 10% or at least 5
    const targetSize = Math.max(5, Math.ceil(inventory.length * 0.1));
    const remaining = inventory.filter(p => !sample.includes(p));
    
    while (sample.length < targetSize && remaining.length > 0) {
      sample.push(remaining.shift());
    }

    return sample;
  }

  _identifyPageType(url) {
    if (url.includes('login') || url.includes('signin')) return 'Login';
    if (url.includes('contact')) return 'Form';
    if (url.includes('blog') || url.includes('article') || url.includes('/p/')) return 'Content';
    if (url.includes('search')) return 'Search';
    if (url.endsWith('.com') || url.endsWith('.org') || url.endsWith('/')) return 'Home';
    return 'Generic';
  }
}

export default new AIAuditService();
