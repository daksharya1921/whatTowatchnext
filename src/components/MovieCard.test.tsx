import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MovieCard from './MovieCard';
import type { MovieData } from './MovieCard';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AnimatePresence: ({ children }: any) => children,
}));

const mockMovie: MovieData = {
  title: 'Inception',
  year: '2010',
  rated: 'PG-13',
  runtime: '148 min',
  genre: 'Action, Adventure, Sci-Fi',
  director: 'Christopher Nolan',
  actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page',
  plot: 'A thief who steals corporate secrets through the use of dream-sharing technology...',
  poster: 'https://example.com/inception.jpg',
  imdbRating: '8.8',
  imdbVotes: '2,000,000',
  country: 'USA',
  awards: 'Won 4 Oscars',
  language: 'English',
  boxOffice: '$292,576,195',
  trailerUrl: 'https://youtube.com/watch?v=inception',
  mediaType: 'movie',
};

describe('MovieCard', () => {
  it('renders movie details correctly', () => {
    render(<MovieCard data={mockMovie} />);
    
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('PG-13')).toBeInTheDocument();
    expect(screen.getByText('148 min')).toBeInTheDocument();
    expect(screen.getByText('Christopher Nolan')).toBeInTheDocument();
    expect(screen.getByText(mockMovie.plot)).toBeInTheDocument();
    expect(screen.getByText(mockMovie.actors)).toBeInTheDocument();
  });

  it('renders poster when provided', () => {
    render(<MovieCard data={mockMovie} />);
    const img = screen.getByAltText('Inception');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockMovie.poster);
  });

  it('renders fallback when poster is missing', () => {
    const movieWithoutPoster = { ...mockMovie, poster: null };
    render(<MovieCard data={movieWithoutPoster} />);
    expect(screen.getByText('Missing Archive')).toBeInTheDocument();
  });

  it('renders "Series" badge for TV media type', () => {
    const tvShow = { ...mockMovie, mediaType: 'tv' as const };
    render(<MovieCard data={tvShow} />);
    expect(screen.getByText('Series')).toBeInTheDocument();
  });

  it('renders "Anime" badge when isAnime is true', () => {
    const anime = { ...mockMovie, isAnime: true };
    render(<MovieCard data={anime} />);
    expect(screen.getByText('Anime')).toBeInTheDocument();
  });

  it('has correct trailer link', () => {
    render(<MovieCard data={mockMovie} />);
    const link = screen.getByRole('link', { name: /watch trailer/i });
    expect(link).toHaveAttribute('href', mockMovie.trailerUrl);
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('calls onToggleWatchlist when bookmark button is clicked', () => {
    const onToggleWatchlist = vi.fn();
    render(<MovieCard data={mockMovie} onToggleWatchlist={onToggleWatchlist} />);
    
    const button = screen.getByRole('button', { name: /add to watchlist/i });
    fireEvent.click(button);
    
    expect(onToggleWatchlist).toHaveBeenCalledTimes(1);
  });

  it('shows "In Watchlist" when isInWatchlist is true', () => {
    render(<MovieCard data={mockMovie} isInWatchlist={true} onToggleWatchlist={() => {}} />);
    expect(screen.getByText('In Watchlist')).toBeInTheDocument();
  });
});
