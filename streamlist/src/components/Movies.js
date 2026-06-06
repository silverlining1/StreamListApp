import React, { useState, useEffect, useRef } from 'react';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

const QUERY_KEY = 'streamlist.movies.lastQuery.v1';
const RESULTS_KEY = 'streamlist.movies.lastResults.v1';

// Pure helpers — defined outside the component so they are not recreated on each render
const formatYear = (dateString) => {
    if (!dateString) return '';
    return dateString.split('-')[0];
};

const formatRating = (vote) => {
    if (typeof vote !== 'number' || vote === 0) return null;
    return vote.toFixed(1);
};

function Movies() {
    const [query, setQuery] = useState(() => {
        try {
            return localStorage.getItem(QUERY_KEY) || '';
        } catch {
            return '';
        }
    });

    const [results, setResults] = useState(() => {
        try {
            const raw = localStorage.getItem(RESULTS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Derive initial hasSearched from the already-evaluated query — no extra localStorage read
    const [hasSearched, setHasSearched] = useState(() => Boolean(query));

    const abortControllerRef = useRef(null);

    // Cancel any in-flight request when the component unmounts
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(QUERY_KEY, query);
        } catch (err) {
            console.warn('[Movies] Failed to write query to localStorage:', err);
        }
    }, [query]);

    useEffect(() => {
        try {
            localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
        } catch (err) {
            console.warn('[Movies] Failed to write results to localStorage:', err);
        }
    }, [results]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) {
            setError('Please enter a movie title to search.');
            return;
        }
        if (!TMDB_API_KEY) {
            setError('TMDB API key is not configured. Add REACT_APP_TMDB_API_KEY to your .env file and restart the dev server.');
            return;
        }

        // Abort any previous in-flight request before starting a new one
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setError('');
        setIsLoading(true);
        setHasSearched(true);

        try {
            const url = `${TMDB_BASE}/search/movie?api_key=${encodeURIComponent(TMDB_API_KEY)}&query=${encodeURIComponent(trimmed)}&include_adult=false&language=en-US&page=1`;
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
                throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            const list = Array.isArray(data.results) ? data.results.slice(0, 12) : [];
            setResults(list);
            if (list.length === 0) {
                setError(`No results found for "${trimmed}".`);
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error('[Movies] TMDB error:', err);
            setError('Could not reach TMDB. Check your network and API key.');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setError('');
        setHasSearched(false);
        try {
            localStorage.removeItem(QUERY_KEY);
            localStorage.removeItem(RESULTS_KEY);
        } catch {
            /* noop */
        }
    };

    return (
        <div className="page-container">
            <h1 className="page-title">Movies</h1>
            <p className="page-subtitle">Search The Movie Database (TMDB) and browse results.</p>

            <form className="input-row" onSubmit={handleSearch}>
                <input
                    type="text"
                    className="text-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search a movie title..."
                    aria-label="Search a movie title"
                />
                <button type="submit" className="add-btn" disabled={isLoading}>
                    <span className="material-icons add-btn-icon">search</span>
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
                {(query || results.length > 0) && (
                    <button
                        type="button"
                        className="icon-btn icon-btn-cancel movies-clear-btn"
                        onClick={handleClear}
                        aria-label="Clear search"
                        title="Clear"
                    >
                        <span className="material-icons">close</span>
                    </button>
                )}
            </form>

            {error && <p className="movies-error" role="alert">{error}</p>}

            {isLoading && <p className="empty-state">Loading results from TMDB...</p>}

            {!isLoading && results.length > 0 && (
                <div className="movie-grid">
                    {results.map((movie) => (
                        <article key={movie.id} className="movie-card">
                            <div className="movie-poster-wrap">
                                {movie.poster_path ? (
                                    <img
                                        className="movie-poster"
                                        src={`${POSTER_BASE}${movie.poster_path}`}
                                        alt={`Poster for ${movie.title}`}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="movie-poster movie-poster-placeholder" aria-hidden="true">
                                        <span className="material-icons">movie</span>
                                    </div>
                                )}
                                {formatRating(movie.vote_average) && (
                                    <span className="movie-rating" aria-label={`TMDB rating ${formatRating(movie.vote_average)} out of 10`}>
                                        <span className="material-icons movie-rating-icon">star</span>
                                        {formatRating(movie.vote_average)}
                                    </span>
                                )}
                            </div>
                            <div className="movie-card-body">
                                <h3 className="movie-title">{movie.title}</h3>
                                <p className="movie-meta">
                                    {formatYear(movie.release_date) || 'Year N/A'}
                                </p>
                                {movie.overview && (
                                    <p className="movie-overview">
                                        {movie.overview.length > 140
                                            ? movie.overview.slice(0, 140) + '...'
                                            : movie.overview}
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {!isLoading && hasSearched && results.length === 0 && !error && (
                <p className="empty-state">No results. Try a different title.</p>
            )}

            {!hasSearched && results.length === 0 && (
                <p className="empty-state">Search for a movie above to see results from TMDB.</p>
            )}

            <p className="tmdb-attribution">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
        </div>
    );
}

export default Movies;
