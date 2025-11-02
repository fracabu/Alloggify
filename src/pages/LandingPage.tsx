import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Shield, BarChart, Globe, DollarSign, Menu, X } from 'lucide-react';
import { Pricing } from '../components/landing/Pricing';
import { Testimonials } from '../components/landing/Testimonials';
import { FAQ } from '../components/landing/FAQ';
import { Footer } from '../components/landing/Footer';
import { SEOHead } from '../components/SEOHead';

export const LandingPage: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '#features', label: 'Funzionalità' },
        { href: '#pricing', label: 'Prezzi' },
        { href: '#testimonials', label: 'Testimonianze' },
        { href: '#faq', label: 'FAQ' }
    ];

    const handleNavClick = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen">
            <SEOHead />

            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                Alloggify
                            </h1>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* Desktop CTA Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                            >
                                Accedi
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                            >
                                Inizia Gratis
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-gray-200 py-4">
                            <div className="flex flex-col space-y-4">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={handleNavClick}
                                        className="text-gray-600 hover:text-gray-900 transition-colors px-2 py-2"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                                    <Link
                                        to="/login"
                                        onClick={handleNavClick}
                                        className="px-4 py-2 text-center text-gray-700 hover:text-gray-900 font-medium transition-colors border border-gray-300 rounded-lg"
                                    >
                                        Accedi
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={handleNavClick}
                                        className="px-4 py-2 text-center bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        Inizia Gratis
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="min-h-screen flex items-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="mb-6 flex justify-center">
                            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                                🚀 Automatizza Alloggiati Web
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Compila Alloggiati Web in{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                30 Secondi
                            </span>
                            ,<br className="hidden md:block" /> Non 30 Minuti
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                            OCR AI-powered + compilazione automatica. Risparmia 100+ ore al mese per la tua struttura ricettiva.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link
                                to="/signup"
                                className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Inizia Gratis
                            </Link>
                            <a
                                href="#pricing"
                                className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition-all"
                            >
                                Vedi Prezzi
                            </a>
                        </div>

                        {/* Social Proof */}
                        <p className="text-sm text-gray-500">
                            ✅ Nessuna carta di credito richiesta • ⚡ Attivo in 2 minuti • 🔒 100% GDPR compliant
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
                        Perché Scegliere Alloggify?
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
                        La soluzione più completa per automatizzare il processo Alloggiati Web
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                icon: Sparkles,
                                title: 'OCR Intelligente',
                                desc: 'Scansiona documenti in 1 secondo con AI Gemini 2.5 Flash. Accuratezza 99.2%'
                            },
                            {
                                icon: Zap,
                                title: 'Compilazione Automatica',
                                desc: 'Extension Chrome riempie il form istantaneamente. Da 20 minuti a 30 secondi.'
                            },
                            {
                                icon: Shield,
                                title: 'GDPR Compliant',
                                desc: 'Dati criptati, no salvataggio permanente. Server italiani, privacy garantita.'
                            },
                            {
                                icon: BarChart,
                                title: 'Dashboard Avanzato',
                                desc: 'Statistiche dettagliate, cronologia completa, esportazione dati Excel/CSV.'
                            },
                            {
                                icon: Globe,
                                title: 'Supporto Internazionale',
                                desc: 'Documenti EU ed extra-EU supportati. Carte d\'identità, passaporti, patenti.'
                            },
                            {
                                icon: DollarSign,
                                title: 'Risparmio Garantito',
                                desc: 'ROI 500%+ rispetto a processo manuale. Recupera l\'investimento in 1 mese.'
                            }
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="group p-8 bg-gray-50 rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-100"
                            >
                                <div className="mb-4 inline-block p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 transition-colors">
                                    <feature.icon className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
                        Come Funziona
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
                        3 semplici passi per risparmiare ore di lavoro
                    </p>

                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    step: '1',
                                    title: 'Scansiona il Documento',
                                    desc: 'Carica la foto del documento d\'identità. Il nostro OCR AI estrae tutti i dati in 1 secondo.',
                                    emoji: '📄'
                                },
                                {
                                    step: '2',
                                    title: 'Verifica i Dati',
                                    desc: 'Controlla rapidamente che i dati estratti siano corretti. Puoi modificare qualsiasi campo.',
                                    emoji: '✅'
                                },
                                {
                                    step: '3',
                                    title: 'Invia ad Alloggiati Web',
                                    desc: 'Con un click, l\'estensione Chrome compila automaticamente il form del portale Polizia.',
                                    emoji: '🚀'
                                }
                            ].map((step, idx) => (
                                <div key={idx} className="relative">
                                    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
                                        <div className="text-6xl mb-4 text-center">{step.emoji}</div>
                                        <div className="absolute top-4 right-4 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                                            {step.step}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{step.title}</h3>
                                        <p className="text-gray-600 text-center leading-relaxed">{step.desc}</p>
                                    </div>
                                    {idx < 2 && (
                                        <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-3xl text-indigo-300">
                                            →
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <div id="pricing">
                <Pricing />
            </div>

            {/* Testimonials Section */}
            <div id="testimonials">
                <Testimonials />
            </div>

            {/* FAQ Section */}
            <FAQ />

            {/* Final CTA Section */}
            <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto text-white">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Pronto a Risparmiare Tempo?
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Inizia con 5 scansioni gratuite. Nessuna carta di credito richiesta.
                        </p>
                        <Link
                            to="/signup"
                            className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                        >
                            Crea Account Gratuito
                        </Link>
                        <p className="mt-6 text-sm opacity-75">
                            Unisciti a 500+ strutture ricettive che hanno già scelto Alloggify
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};
