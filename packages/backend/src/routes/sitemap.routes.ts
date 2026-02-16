import express, { Router } from 'express';
import { sitemapService } from '../services/sitemap.service';

const router: Router = express.Router();

/**
 * GET /sitemap.xml
 * Devuelve el sitemap en formato XML
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await sitemapService.generateSitemap();

    res.type('application/xml');
    res.set('Cache-Control', 'public, max-age=86400'); // Cache de 24 horas
    res.send(sitemap);
  } catch (error) {
    console.error('❌ Error al generar sitemap:', error);
    res.status(500).json({ error: 'Error generando sitemap' });
  }
});

export default router;
