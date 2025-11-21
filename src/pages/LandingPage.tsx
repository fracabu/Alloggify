import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SparklesIcon, BoltIcon, ShieldCheckIcon, ChartBarIcon, GlobeAltIcon, CurrencyDollarIcon, ChatBubbleLeftRightIcon, Bars3Icon, XMarkIcon, UserIcon, ArrowRightOnRectangleIcon, Squares2X2Icon, DocumentTextIcon, PaperAirplaneIcon, ArrowDownTrayIcon, CloudIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesIconSolid, CheckCircleIcon, BoltIcon as BoltIconSolid, LockClosedIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { Pricing } from '../components/landing/Pricing';
import { Testimonials } from '../components/landing/Testimonials';
import { FAQ } from '../components/landing/FAQ';
import { Footer } from '../components/landing/Footer';
import { SEOHead } from '../components/SEOHead';
import { useAuth } from '../hooks/useAuth';

export const LandingPage: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

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
                            <HomeModernIcon className="h-8 w-8 text-primary-500" />
                            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600">
                                CheckInly
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

                        {/* Desktop CTA Buttons / User Menu */}
                        <div className="hidden md:flex items-center gap-3">
                            {isAuthenticated && user ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user.subscriptionPlan}</p>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                            <UserIcon className="h-5 w-5 text-primary-500" />
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                <Squares2X2Icon className="h-4 w-4" />
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setUserMenuOpen(false);
                                                    navigate('/');
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                                Esci
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                                    >
                                        Accedi
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md"
                                    >
                                        Inizia Gratis
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
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
                                    {isAuthenticated && user ? (
                                        <>
                                            <div className="px-4 py-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                                        <UserIcon className="h-6 w-6 text-primary-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{user.subscriptionPlan}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link
                                                to="/dashboard"
                                                onClick={handleNavClick}
                                                className="flex items-center justify-center gap-2 px-4 py-2 text-center bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow-sm"
                                            >
                                                <Squares2X2Icon className="h-4 w-4" />
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setMobileMenuOpen(false);
                                                    navigate('/');
                                                }}
                                                className="flex items-center justify-center gap-2 px-4 py-2 text-center text-red-600 hover:text-red-700 font-medium transition-colors border border-red-300 rounded-lg"
                                            >
                                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                                Esci
                                            </button>
                                        </>
                                    ) : (
                                        <>
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
                                                className="px-4 py-2 text-center bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow-sm"
                                            >
                                                Inizia Gratis
                                            </Link>
                                        </>
                                    )}
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
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold">
                                <SparklesIconSolid className="h-4 w-4" />
                                Powered by Google Gemini AI
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Da Documento a Schedina{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-600">
                                Inviata
                            </span>{' '}
                            in<br className="hidden md:block" /> 30 Secondi
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                            L'OCR più veloce ed economico d'Italia per Alloggiati Web. Scansione istantanea con AI, invio automatico, gestione illimitata proprietà. Tutto al prezzo di un caffè al giorno.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link
                                to="/signup"
                                className="px-8 py-4 bg-primary-500 text-white rounded-lg font-semibold text-lg hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                5 Scansioni Gratis, Sempre
                            </Link>
                            <a
                                href="#pricing"
                                className="px-8 py-4 border-2 border-primary-500 text-primary-500 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-all"
                            >
                                Vedi Come Funziona
                            </a>
                        </div>

                        {/* Social Proof */}
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1.5">
                                <CheckBadgeIcon className="h-4 w-4 text-blue-600" />
                                Google Gemini AI - Precisione superiore al 99%
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <BoltIconSolid className="h-4 w-4 text-amber-500" />
                                Multi-proprietà incluso - Nessun costo extra
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <LockClosedIcon className="h-4 w-4 text-primary-600" />
                                Piano Free permanente - Nessuna carta richiesta
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
                        Perché Scegliere CheckInly?
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
                        La soluzione più completa per automatizzare il processo Alloggiati Web
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                icon: SparklesIcon,
                                title: 'OCR AI Google Vision',
                                desc: 'Estrazione dati da documenti in 1 secondo. 99.2% di accuratezza. Supporta carte d\'identità, passaporti, patenti EU ed extra-EU.'
                            },
                            {
                                icon: CloudIcon,
                                title: 'API SOAP Diretta',
                                desc: 'Integrazione nativa con Alloggiati Web tramite WSKEY. Invio automatico e ricevuta ufficiale dalla Questura.'
                            },
                            {
                                icon: ChatBubbleLeftRightIcon,
                                title: 'AI Assistant 24/7',
                                desc: 'Supporto intelligente su normativa D.Lgs 286/98, casi complessi, e risoluzione problemi. Sempre disponibile.'
                            },
                            {
                                icon: ShieldCheckIcon,
                                title: 'GDPR & Sicurezza',
                                desc: 'Dati criptati end-to-end. Nessun salvataggio permanente. Server italiani certificati, privacy garantita al 100%.'
                            },
                            {
                                icon: BoltIcon,
                                title: 'Velocità Estrema',
                                desc: 'Da 20 minuti per ospite a 30 secondi. Risparmia oltre 100 ore al mese per la tua struttura ricettiva.'
                            }
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="group p-8 bg-gray-50 rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-100"
                            >
                                <div className="mb-4 inline-block p-3 bg-primary-100 rounded-lg group-hover:bg-primary-500 transition-colors">
                                    <feature.icon className="h-8 w-8 text-primary-500 group-hover:text-white transition-colors" />
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
                        4 semplici passi per risparmiare ore di lavoro
                    </p>

                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    step: '1',
                                    title: 'Scansiona il Documento',
                                    desc: 'Carica la foto del documento d\'identità. Il nostro OCR AI estrae tutti i dati in 1 secondo.',
                                    icon: DocumentTextIcon,
                                    iconColor: 'text-blue-600'
                                },
                                {
                                    step: '2',
                                    title: 'Verifica i Dati',
                                    desc: 'Controlla rapidamente che i dati estratti siano corretti. Puoi modificare qualsiasi campo.',
                                    icon: CheckCircleIcon,
                                    iconColor: 'text-green-600'
                                },
                                {
                                    step: '3',
                                    title: 'Invia ad Alloggiati Web',
                                    desc: 'Invio diretto tramite API SOAP con autenticazione WSKEY. Ricevuta immediata dalla Questura.',
                                    icon: PaperAirplaneIcon,
                                    iconColor: 'text-primary-600'
                                },
                                {
                                    step: '4',
                                    title: 'Scarica la Ricevuta',
                                    desc: 'Il giorno dopo, scarica automaticamente la ricevuta ufficiale della Questura in formato PDF.',
                                    icon: ArrowDownTrayIcon,
                                    iconColor: 'text-purple-600'
                                }
                            ].map((step, idx) => (
                                <div key={idx} className="relative">
                                    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
                                        <div className="mb-4 flex justify-center">
                                            <step.icon className={`h-16 w-16 ${step.iconColor}`} />
                                        </div>
                                        <div className="absolute top-4 right-4 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                                            {step.step}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{step.title}</h3>
                                        <p className="text-gray-600 text-center leading-relaxed">{step.desc}</p>
                                    </div>
                                    {idx < 3 && (
                                        <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-5xl font-bold text-primary-500">
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
            <section className="py-20 bg-gradient-to-r from-primary-500 to-purple-600">
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
                            className="inline-block px-8 py-4 bg-white text-primary-500 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                        >
                            Crea Account Gratuito
                        </Link>
                        <p className="mt-6 text-sm opacity-75">
                            Unisciti a 500+ strutture ricettive che hanno già scelto CheckInly
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};
