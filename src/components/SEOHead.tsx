import React, { useEffect } from 'react';

export interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
    canonicalUrl?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
    title = 'Alloggify - Automatizza Alloggiati Web in 30 Secondi',
    description = 'OCR AI-powered + compilazione automatica per Alloggiati Web. Risparmia 100+ ore al mese per la tua struttura ricettiva. Accuratezza 99%, GDPR compliant.',
    keywords = 'alloggiati web, ocr, automazione, hotel, b&b, polizia, schedina, compilazione automatica',
    ogImage = 'https://alloggify.com/og-image.jpg',
    ogType = 'website',
    canonicalUrl
}) => {
    const fullTitle = title.includes('Alloggify') ? title : `${title} | Alloggify`;

    useEffect(() => {
        // Set document title
        document.title = fullTitle;

        // Update or create meta tags
        const updateMeta = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attr, name);
                document.head.appendChild(meta);
            }
            meta.content = content;
        };

        // Primary Meta Tags
        updateMeta('description', description);
        updateMeta('keywords', keywords);

        // Open Graph / Facebook
        updateMeta('og:type', ogType, true);
        updateMeta('og:url', canonicalUrl || 'https://alloggify.com', true);
        updateMeta('og:title', fullTitle, true);
        updateMeta('og:description', description, true);
        updateMeta('og:image', ogImage, true);
        updateMeta('og:locale', 'it_IT', true);

        // Twitter
        updateMeta('twitter:card', 'summary_large_image', true);
        updateMeta('twitter:url', canonicalUrl || 'https://alloggify.com', true);
        updateMeta('twitter:title', fullTitle, true);
        updateMeta('twitter:description', description, true);
        updateMeta('twitter:image', ogImage, true);

        // Additional
        updateMeta('robots', 'index, follow');
        updateMeta('language', 'Italian');
        updateMeta('author', 'Alloggify SRL');

        // Canonical link
        if (canonicalUrl) {
            let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.rel = 'canonical';
                document.head.appendChild(canonical);
            }
            canonical.href = canonicalUrl;
        }

        // Structured Data (JSON-LD)
        let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Alloggify",
            "applicationCategory": "BusinessApplication",
            "description": description,
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "127"
            }
        });
    }, [fullTitle, description, keywords, ogImage, ogType, canonicalUrl]);

    return null;
};
