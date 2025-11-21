import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CalendarIcon, ClockIcon, ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import { newsArticles } from '../data/news';

export const NewsDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const article = newsArticles.find(a => a.slug === slug);

    if (!article) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Articolo non trovato
                    </h1>
                    <p className="text-gray-600 mb-8">
                        L'articolo che stai cercando non esiste o è stato rimosso.
                    </p>
                    <Link
                        to="/news"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Torna alle News
                    </Link>
                </div>
            </div>
        );
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Annuncio': return 'bg-blue-100 text-blue-700';
            case 'Tutorial': return 'bg-green-100 text-green-700';
            case 'Aggiornamento': return 'bg-purple-100 text-purple-700';
            case 'Storia': return 'bg-primary-100 text-primary-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Process inline markdown (bold, italic)
    const processInlineMarkdown = (text: string) => {
        const parts: (string | JSX.Element)[] = [];
        let currentIndex = 0;
        let key = 0;

        // Process bold **text**
        const boldRegex = /\*\*(.+?)\*\*/g;
        // Process italic *text* (but not **)
        const italicRegex = /(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g;

        // Combine both patterns
        const combinedRegex = /(\*\*(.+?)\*\*)|(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g;
        let match;

        while ((match = combinedRegex.exec(text)) !== null) {
            // Add text before match
            if (match.index > currentIndex) {
                parts.push(text.substring(currentIndex, match.index));
            }

            // Check if it's bold or italic
            if (match[1]) {
                // Bold match
                parts.push(<strong key={key++} className="font-bold text-gray-900">{match[2]}</strong>);
            } else if (match[3]) {
                // Italic match
                parts.push(<em key={key++} className="italic text-gray-600">{match[3]}</em>);
            }

            currentIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (currentIndex < text.length) {
            parts.push(text.substring(currentIndex));
        }

        return parts.length > 0 ? parts : text;
    };

    // Preprocess content to group text blocks with their images
    const preprocessContent = (content: string) => {
        const lines = content.trim().split('\n');
        const sections: Array<{ content: string[], image?: { url: string, alt: string } }> = [];
        let currentSection: string[] = [];

        lines.forEach((line, index) => {
            // Skip title repetition and date/category lines
            if (line.startsWith('# ') && index === 0) return;
            if (line.match(/^\*\*\d{1,2}\s+\w+\s+\d{4}\*\*/)) return;

            // Check if it's an image
            const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
            if (imageMatch) {
                // Save current section with this image
                sections.push({
                    content: currentSection,
                    image: { alt: imageMatch[1], url: imageMatch[2] }
                });
                currentSection = [];
            } else {
                currentSection.push(line);
            }
        });

        // Add remaining content without image
        if (currentSection.length > 0) {
            sections.push({ content: currentSection });
        }

        return sections;
    };

    // Simple markdown-like rendering
    const renderContent = (content: string) => {
        const sections = preprocessContent(content);
        const elements: JSX.Element[] = [];
        let imageIndex = 0; // Track sections with images for alternating layout

        sections.forEach((section, idx) => {
            const sectionElements: JSX.Element[] = [];
            const lines = section.content;

            lines.forEach((line, lineIndex) => {
                const key = `${idx}-${lineIndex}`;

                // Headers
                if (line.startsWith('# ')) {
                    sectionElements.push(<h1 key={key} className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-6 mt-12 first:mt-0">{processInlineMarkdown(line.substring(2))}</h1>);
                } else if (line.startsWith('## ')) {
                    sectionElements.push(<h2 key={key} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-12 pb-3 border-b-2 border-primary-100">{processInlineMarkdown(line.substring(3))}</h2>);
                } else if (line.startsWith('### ')) {
                    sectionElements.push(<h3 key={key} className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 mt-10">{processInlineMarkdown(line.substring(4))}</h3>);
                }
                // Horizontal rule
                else if (line === '---') {
                    sectionElements.push(<hr key={key} className="my-10 border-gray-200" />);
                }
                // Bold text (paragraph starting with **)
                else if (line.startsWith('**') && line.endsWith('**')) {
                    const text = line.substring(2, line.length - 2);
                    sectionElements.push(<p key={key} className="text-xl md:text-2xl font-bold text-gray-900 mb-6 mt-8 px-6 py-4 bg-primary-50 rounded-lg border-l-4 border-primary-500">{processInlineMarkdown(text)}</p>);
                }
                // Italic text
                else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                    const text = line.substring(1, line.length - 1);
                    sectionElements.push(<p key={key} className="text-lg text-gray-600 italic mb-5 pl-6 border-l-2 border-gray-300">{processInlineMarkdown(text)}</p>);
                }
                // List items
                else if (line.match(/^\d+\.\s+\*\*/)) {
                    // Numbered list with bold title
                    const match = line.match(/^\d+\.\s+\*\*(.+?)\*\*/);
                    if (match) {
                        sectionElements.push(
                            <div key={key} className="mb-5 flex items-start gap-4">
                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-500 text-white text-base font-bold flex-shrink-0 mt-1">{line.match(/^(\d+)\./)?.[1]}</span>
                                <span className="font-bold text-gray-900 flex-1 text-lg md:text-xl">{processInlineMarkdown(line.substring(line.indexOf('**') + 2, line.lastIndexOf('**')))}</span>
                            </div>
                        );
                    }
                }
                else if (line.trim().startsWith('- ')) {
                    sectionElements.push(
                        <li key={key} className="flex items-start gap-4 text-gray-700 text-lg mb-4 ml-2">
                            <span className="inline-block w-2.5 h-2.5 bg-primary-500 rounded-full mt-2.5 flex-shrink-0"></span>
                            <span className="flex-1">{processInlineMarkdown(line.substring(2))}</span>
                        </li>
                    );
                }
                // Links [text](url)
                else if (line.includes('[') && line.includes('](')) {
                    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                    const parts: (string | JSX.Element)[] = [];
                    let lastIndex = 0;
                    let match;

                    while ((match = linkRegex.exec(line)) !== null) {
                        if (match.index > lastIndex) {
                            const textBefore = line.substring(lastIndex, match.index);
                            parts.push(...(Array.isArray(processInlineMarkdown(textBefore)) ? processInlineMarkdown(textBefore) : [textBefore]));
                        }
                        parts.push(
                            <Link
                                key={`link-${idx}-${lineIndex}-${match.index}`}
                                to={match[2]}
                                className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-bold underline decoration-2 underline-offset-2 hover:decoration-primary-700 transition-colors"
                            >
                                {match[1]}
                            </Link>
                        );
                        lastIndex = match.index + match[0].length;
                    }

                    if (lastIndex < line.length) {
                        const textAfter = line.substring(lastIndex);
                        parts.push(...(Array.isArray(processInlineMarkdown(textAfter)) ? processInlineMarkdown(textAfter) : [textAfter]));
                    }

                    sectionElements.push(<p key={key} className="text-gray-700 text-lg md:text-xl leading-relaxed mb-6">{parts}</p>);
                }
                // Regular paragraphs
                else if (line.trim() !== '') {
                    sectionElements.push(<p key={key} className="text-gray-700 text-lg md:text-xl leading-relaxed mb-6">{processInlineMarkdown(line)}</p>);
                }
                // Empty lines (spacing)
                else {
                    sectionElements.push(<div key={key} className="h-2" />);
                }
            });

            // If section has an image, create two-column layout (alternating sides)
            if (section.image) {
                const isEven = imageIndex % 2 === 0;
                imageIndex++;

                elements.push(
                    <div key={`section-${idx}`} className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center my-16">
                        {/* Alternate order: even = text left, odd = text right */}
                        {isEven ? (
                            <>
                                {/* Text Column */}
                                <div>
                                    {sectionElements}
                                </div>
                                {/* Image Column */}
                                <div>
                                    <div className="rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                                        <img
                                            src={section.image.url}
                                            alt={section.image.alt}
                                            className="w-full h-auto object-cover"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Image Column */}
                                <div className="md:order-1">
                                    <div className="rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                                        <img
                                            src={section.image.url}
                                            alt={section.image.alt}
                                            className="w-full h-auto object-cover"
                                        />
                                    </div>
                                </div>
                                {/* Text Column */}
                                <div className="md:order-2">
                                    {sectionElements}
                                </div>
                            </>
                        )}
                    </div>
                );
            } else {
                // Section without image - full width
                elements.push(
                    <div key={`section-${idx}`} className="my-8">
                        {sectionElements}
                    </div>
                );
            }
        });

        return elements;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header with Gradient */}
            <div className="relative bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 overflow-hidden">
                {/* Decorative shapes */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="relative container mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <button
                        onClick={() => navigate('/news')}
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Torna alle News
                    </button>

                    {/* Article Header */}
                    <div className="max-w-4xl mx-auto py-8">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6 bg-white/20 backdrop-blur-sm text-white`}>
                            {article.category}
                        </span>

                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            {article.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-6 text-white/90">
                            <div className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5" />
                                <span>{article.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5" />
                                <span>
                                    {new Date(article.date).toLocaleDateString('it-IT', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="h-5 w-5" />
                                <span>{article.readTime} di lettura</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <article className="bg-white -mt-16 pb-16">
                <div className="container mx-auto px-4 max-w-7xl pt-16">
                    {renderContent(article.content)}
                </div>
            </article>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary-500 to-purple-600 py-16 mt-12">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Pronto a Provare CheckInly?
                    </h2>
                    <p className="text-xl text-white/90 mb-8">
                        5 scansioni gratuite. Nessuna carta richiesta.
                    </p>
                    <Link
                        to="/signup"
                        className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                    >
                        Inizia Gratis
                    </Link>
                </div>
            </div>
        </div>
    );
};
