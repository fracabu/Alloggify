import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface Testimonial {
    name: string;
    role: string;
    company: string;
    location: string;
    image: string;
    rating: number;
    text: string;
    stats?: string;
}

export const Testimonials: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const testimonials: Testimonial[] = [
        {
            name: 'Maria Rossi',
            role: 'Proprietaria',
            company: 'B&B La Terrazza',
            location: 'Roma',
            image: '👩', // Placeholder emoji
            rating: 5,
            text: 'Prima impiegavo 20 minuti per ospite per compilare manualmente Alloggiati Web. Ora con Alloggify bastano 30 secondi! Un vero game changer per la mia struttura.',
            stats: 'Risparmia 15 ore/mese'
        },
        {
            name: 'Luca Torelli',
            role: 'Manager',
            company: 'Hotel Panorama',
            location: 'Firenze',
            image: '👨',
            rating: 5,
            text: 'In alta stagione gestisco 50 check-in al giorno. Senza Alloggify sarebbe impossibile. L\'OCR è preciso e la compilazione automatica funziona perfettamente.',
            stats: '50+ check-in al giorno automatizzati'
        },
        {
            name: 'Giulia Bianchi',
            role: 'Responsabile Reception',
            company: 'Resort Mediterraneo',
            location: 'Sardegna',
            image: '👩',
            rating: 5,
            text: 'La facilità d\'uso è incredibile. Ho formato il mio team in 10 minuti. L\'investimento si è ripagato nel primo mese con il tempo risparmiato.',
            stats: 'ROI recuperato in 1 mese'
        },
        {
            name: 'Marco Gentile',
            role: 'Proprietario',
            company: 'Affittacamere Centro Storico',
            location: 'Venezia',
            image: '👨',
            rating: 5,
            text: 'Gestisco 3 proprietà diverse. Con Alloggify posso centralizzare tutto e risparmiare ore di lavoro amministrativo ogni settimana. Consigliatissimo!',
            stats: '3 proprietà gestite'
        }
    ];

    const nextTestimonial = () => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const currentTestimonial = testimonials[activeIndex];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Cosa Dicono i Nostri Clienti
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Oltre 500 strutture ricettive risparmiano tempo ogni giorno con Alloggify
                    </p>
                </div>

                {/* Main Testimonial Card */}
                <div className="max-w-4xl mx-auto">
                    <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 shadow-xl">
                        {/* Quote Icon */}
                        <div className="absolute top-8 left-8 opacity-20">
                            <ChatBubbleLeftIcon className="h-16 w-16 text-indigo-600" />
                        </div>

                        {/* Content */}
                        <div className="relative">
                            {/* Stars */}
                            <div className="flex gap-1 mb-6 justify-center">
                                {[...Array(currentTestimonial.rating)].map((_, i) => (
                                    <StarIcon key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Testimonial Text */}
                            <blockquote className="text-xl md:text-2xl text-gray-800 font-medium text-center mb-8 leading-relaxed">
                                "{currentTestimonial.text}"
                            </blockquote>

                            {/* Author Info */}
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                <div className="text-6xl">{currentTestimonial.image}</div>
                                <div className="text-center md:text-left">
                                    <p className="font-bold text-gray-900 text-lg">{currentTestimonial.name}</p>
                                    <p className="text-gray-600">
                                        {currentTestimonial.role} • {currentTestimonial.company}
                                    </p>
                                    <p className="text-sm text-gray-500">{currentTestimonial.location}</p>
                                    {currentTestimonial.stats && (
                                        <p className="text-sm text-indigo-600 font-semibold mt-2">
                                            📊 {currentTestimonial.stats}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                onClick={prevTestimonial}
                                className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:bg-gray-50"
                                aria-label="Testimonianza precedente"
                            >
                                <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
                            </button>

                            {/* Dots Indicator */}
                            <div className="flex gap-2">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveIndex(index)}
                                        className={`h-2 rounded-full transition-all ${
                                            index === activeIndex
                                                ? 'w-8 bg-indigo-600'
                                                : 'w-2 bg-gray-300 hover:bg-gray-400'
                                        }`}
                                        aria-label={`Vai alla testimonianza ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextTestimonial}
                                className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:bg-gray-50"
                                aria-label="Testimonianza successiva"
                            >
                                <ChevronRightIcon className="h-6 w-6 text-gray-700" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-600 mb-2">500+</div>
                        <div className="text-sm text-gray-600">Strutture Attive</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-600 mb-2">50K+</div>
                        <div className="text-sm text-gray-600">Scansioni/Mese</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-600 mb-2">99.2%</div>
                        <div className="text-sm text-gray-600">Accuratezza OCR</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-600 mb-2">4.9/5</div>
                        <div className="text-sm text-gray-600">Rating Medio</div>
                    </div>
                </div>
            </div>
        </section>
    );
};
