import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { newsArticles } from '../data/news';

export const NewsListPage: React.FC = () => {
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Annuncio': return 'bg-blue-100 text-blue-700';
            case 'Tutorial': return 'bg-green-100 text-green-700';
            case 'Aggiornamento': return 'bg-purple-100 text-purple-700';
            case 'Storia': return 'bg-primary-100 text-primary-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-purple-600 py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        News & Aggiornamenti
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl">
                        Novità, guide e storie dietro CheckInly. Direttamente dal founder.
                    </p>
                </div>
            </div>

            {/* News Grid */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {newsArticles.map((article) => (
                        <article
                            key={article.id}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        >
                            {/* Category Badge */}
                            <div className="p-6 pb-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(article.category)}`}>
                                    {article.category}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="px-6 pb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                                    {article.title}
                                </h2>

                                <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                                    {article.excerpt}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        {new Date(article.date).toLocaleDateString('it-IT', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ClockIcon className="h-4 w-4" />
                                        {article.readTime}
                                    </div>
                                </div>

                                {/* Read More Link */}
                                <Link
                                    to={`/news/${article.slug}`}
                                    className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors group/link"
                                >
                                    Leggi la storia
                                    <ArrowRightIcon className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Empty State (if no articles) */}
                {newsArticles.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">
                            Nessun articolo disponibile al momento.
                        </p>
                    </div>
                )}
            </div>

            {/* CTA Section */}
            <div className="bg-white border-t border-gray-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Pronto a Provare CheckInly?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        5 scansioni gratuite. Nessuna carta richiesta.
                    </p>
                    <Link
                        to="/signup"
                        className="inline-block px-8 py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl"
                    >
                        Inizia Gratis
                    </Link>
                </div>
            </div>
        </div>
    );
};
