import React from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, MapPinIcon, PhoneIcon, HomeModernIcon } from '@heroicons/react/24/outline';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <HomeModernIcon className="h-8 w-8 text-primary-500" />
                            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-600">
                                CheckInly
                            </h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                            La soluzione più veloce per automatizzare Alloggiati Web.
                            Risparmia tempo, riduci errori, concentrati sull'accoglienza.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <span className="text-lg">🇮🇹</span>
                            <span>Made in Italy</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="text-lg">🔒</span>
                            <span>100% GDPR Compliant</span>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Prodotto</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="#features" className="text-sm hover:text-white transition-colors">
                                    Funzionalità
                                </a>
                            </li>
                            <li>
                                <a href="#pricing" className="text-sm hover:text-white transition-colors">
                                    Prezzi
                                </a>
                            </li>
                            <li>
                                <a href="#faq" className="text-sm hover:text-white transition-colors">
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <Link to="/signup" className="text-sm hover:text-white transition-colors">
                                    Prova Gratuita
                                </Link>
                            </li>
                            <li>
                                <a href="#testimonials" className="text-sm hover:text-white transition-colors">
                                    Testimonianze
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Azienda</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="/about" className="text-sm hover:text-white transition-colors">
                                    Chi Siamo
                                </a>
                            </li>
                            <li>
                                <a href="/blog" className="text-sm hover:text-white transition-colors">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="/careers" className="text-sm hover:text-white transition-colors">
                                    Lavora con Noi
                                </a>
                            </li>
                            <li>
                                <a href="/partners" className="text-sm hover:text-white transition-colors">
                                    Partnership
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="text-sm hover:text-white transition-colors">
                                    Contatti
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Support */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Legale & Supporto</h4>
                        <ul className="space-y-2 mb-6">
                            <li>
                                <Link to="/privacy" className="text-sm hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-sm hover:text-white transition-colors">
                                    Termini di Servizio
                                </Link>
                            </li>
                            <li>
                                <a href="/cookies" className="text-sm hover:text-white transition-colors">
                                    Cookie Policy
                                </a>
                            </li>
                            <li>
                                <a href="/security" className="text-sm hover:text-white transition-colors">
                                    Sicurezza
                                </a>
                            </li>
                            <li>
                                <a href="/gdpr" className="text-sm hover:text-white transition-colors">
                                    GDPR
                                </a>
                            </li>
                        </ul>

                        {/* Contact Info */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <EnvelopeIcon className="h-4 w-4" />
                                <a href="mailto:support@checkinly.com" className="hover:text-white">
                                    support@checkinly.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Copyright */}
                        <p className="text-sm text-gray-400">
                            © {currentYear} CheckInly. Tutti i diritti riservati.
                        </p>

                        {/* CodeCraft Studio Signature */}
                        <a
                            href="https://www.codecraft.it"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            title="Developed with love by hosts for hosts"
                        >
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                Developed with <span className="text-primary-500">❤️</span> by hosts for hosts
                            </span>
                            <img
                                src="/logo-code2.png"
                                alt="CodeCraft Studio"
                                className="h-9"
                            />
                        </a>

                        {/* Social Links - Under Construction */}
                        <div className="flex items-center gap-4">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); alert('Coming soon! 🚧'); }}
                                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                                aria-label="Twitter"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); alert('Coming soon! 🚧'); }}
                                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                                aria-label="LinkedIn"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </a>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); alert('Coming soon! 🚧'); }}
                                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                                aria-label="Facebook"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); alert('Coming soon! 🚧'); }}
                                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                                aria-label="Instagram"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
