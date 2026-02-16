import { Product } from '../models/Product.model';
import { Category } from '../models/Category.model';

export class SitemapService {
  private baseUrl = 'https://www.sexysecret.com.ar';

  /**
   * Genera sitemap.xml con todas las URLs canónicas
   */
  async generateSitemap(): Promise<string> {
    try {
      const urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: number }> = [];

      // URLs estáticas
      urls.push({
        loc: `${this.baseUrl}/`,
        changefreq: 'weekly',
        priority: 1.0,
      });

      urls.push({
        loc: `${this.baseUrl}/products`,
        changefreq: 'daily',
        priority: 0.9,
      });

      urls.push({
        loc: `${this.baseUrl}/login`,
        changefreq: 'monthly',
        priority: 0.7,
      });

      urls.push({
        loc: `${this.baseUrl}/register`,
        changefreq: 'monthly',
        priority: 0.7,
      });

      urls.push({
        loc: `${this.baseUrl}/privacy`,
        changefreq: 'yearly',
        priority: 0.5,
      });

      urls.push({
        loc: `${this.baseUrl}/terms`,
        changefreq: 'yearly',
        priority: 0.5,
      });

      // URLs dinámicas de categorías
      const categories = await Category.find({ isActive: true }).select('slug');
      categories.forEach((cat) => {
        urls.push({
          loc: `${this.baseUrl}/categories/${cat.slug}`,
          changefreq: 'weekly',
          priority: 0.8,
        });
      });

      // URLs dinámicas de productos
      const products = await Product.find({ isActive: true }).select('_id name').limit(50000);
      products.forEach((prod) => {
        // Usar el ID como identificador único en la URL
        urls.push({
          loc: `${this.baseUrl}/product/${prod._id}`,
          changefreq: 'weekly',
          priority: 0.8,
        });
      });

      // Generar XML
      return this.generateXML(urls);
    } catch (error) {
      console.error('❌ Error generando sitemap:', error);
      throw error;
    }
  }

  /**
   * Genera el XML del sitemap
   */
  private generateXML(urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: number }>): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach(({ loc, lastmod, changefreq, priority }) => {
      xml += '  <url>\n';
      xml += `    <loc>${this.escapeXml(loc)}</loc>\n`;

      if (lastmod) {
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
      }

      if (changefreq) {
        xml += `    <changefreq>${changefreq}</changefreq>\n`;
      }

      if (priority !== undefined) {
        xml += `    <priority>${priority}</priority>\n`;
      }

      xml += '  </url>\n';
    });

    xml += '</urlset>';

    return xml;
  }

  /**
   * Escapa caracteres especiales para XML
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export const sitemapService = new SitemapService();
