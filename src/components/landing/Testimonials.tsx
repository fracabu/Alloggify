import React from 'react';
import { RocketLaunchIcon, SparklesIcon, UserGroupIcon, BoltIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

export const Testimonials: React.FC = () => {

    return (
        <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-6">
                        <RocketLaunchIcon className="h-5 w-5" />
                        Early Access
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Unisciti ai Primi Host che Automatizzano Alloggiati Web
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        CheckInly è sviluppato da un host come te, stufo di perdere 20 minuti per ogni check-in. Sei tra i primi a scoprirlo.
                    </p>
                </div>

                {/* Main Card */}
                <div className="max-w-4xl mx-auto">
                    <div className="relative bg-white rounded-2xl p-8 md:p-12 shadow-xl border-2 border-primary-100">
                        {/* Icon */}
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-primary-500 to-purple-600 p-6 rounded-full">
                                    <SparklesIcon className="h-12 w-12 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Story */}
                        <div className="text-center mb-8">
                            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                                "Gestisco un appartamento su Booking. Ogni check-in mi portava via 20 minuti solo per compilare Alloggiati Web.
                                Ho costruito CheckInly per automatizzare tutto in 30 secondi. Ora è disponibile per te."
                            </p>
                            <p className="text-gray-600 font-medium">
                                — Un host come te, non una software house
                            </p>
                        </div>

                        {/* Benefits Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mt-12">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Piano Free per Sempre</h3>
                                    <p className="text-gray-600 text-sm">5 scansioni/mese gratis. No carta richiesta, no trial limitati.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Feedback Diretto con il Founder</h3>
                                    <p className="text-gray-600 text-sm">Sei tra i primi. La tua opinione conta davvero.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Feature Implementate Rapidamente</h3>
                                    <p className="text-gray-600 text-sm">Piccolo team = decisioni veloci. Chiedi, implementiamo.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Prezzo Bloccato Early Adopters</h3>
                                    <p className="text-gray-600 text-sm">Ti iscrivi oggi? Il tuo prezzo non aumenta mai.</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-10 text-center">
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                            >
                                <BoltIcon className="h-5 w-5" />
                                Inizia Gratis - 5 Scansioni/Mese
                            </Link>
                            <p className="text-sm text-gray-500 mt-4">
                                Nessuna carta richiesta • Attivo in 30 secondi
                            </p>
                        </div>
                    </div>
                </div>

                {/* Real Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary-600 mb-2">99%</div>
                        <div className="text-sm text-gray-600">Accuratezza OCR</div>
                        <div className="text-xs text-gray-500 mt-1">Gemini 2.5 Flash</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary-600 mb-2">30s</div>
                        <div className="text-sm text-gray-600">Da Foto a Schedina</div>
                        <div className="text-xs text-gray-500 mt-1">vs 20 min manuale</div>
                    </div>
                    <div className="text-center col-span-2 md:col-span-1">
                        <div className="text-4xl font-bold text-primary-600 mb-2">€15</div>
                        <div className="text-sm text-gray-600">Prezzo Base/Mese</div>
                        <div className="text-xs text-gray-500 mt-1">Multi-proprietà incluso</div>
                    </div>
                </div>
            </div>
        </section>
    );
};
