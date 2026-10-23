// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

const fixture = {
  id: '7376784960625085742',
  title: 'A test video caption',
  duration: 42,
  create_time: 1717541595,
  cover: 'https://cdn.example.com/cover.jpg',
  hdplay: 'https://cdn.example.com/hd.mp4',
  play: 'https://cdn.example.com/sd.mp4',
  wmplay: 'https://cdn.example.com/wm.mp4',
  size: 1_000_000,
  hd_size: 2_500_000,
  music_info: {
    title: 'Test sound',
    author: 'Test artist',
    play: 'https://cdn.example.com/music.mp3',
  },
  play_count: 1500,
  digg_count: 2_000_000,
  comment_count: 30,
  share_count: 4,
  author: {
    unique_id: 'ladygaga',
    nickname: 'Lady Gaga',
    avatar: 'https://cdn.example.com/avatar.jpg',
    verified: true,
  },
};

function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('App', () => {
  beforeEach(() => {
    mockMatchMedia();
    window.localStorage.clear();
    window.sessionStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ code: 0, msg: 'success', data: fixture }),
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the hero and the URL form', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
      /save tiktok videos/i,
    );
    expect(screen.getByLabelText(/tiktok link or share text/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /fetch video/i })).toBeTruthy();
  });

  it('detects an encoded app share link and loads the video', async () => {
    render(<App />);

    const shareText = encodeURIComponent(
      'Check out @ladygaga! https://vm.tiktok.com/ZMabc123/ 😍',
    );

    fireEvent.change(screen.getByLabelText(/tiktok link or share text/i), {
      target: { value: shareText },
    });

    expect(await screen.findByText(/app share link detected/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /fetch video/i }));

    expect(await screen.findByText(/ready to download/i)).toBeTruthy();
    expect(screen.getByText('HD video')).toBeTruthy();
    expect(screen.getByText('Audio only')).toBeTruthy();
    expect(screen.getAllByText(/@ladygaga/).length).toBeGreaterThan(0);
    expect(screen.getByText(/recent downloads/i)).toBeTruthy();

    const calledUrl = String((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(calledUrl).toContain('https%3A%2F%2Fvm.tiktok.com%2FZMabc123%2F');
  });

  it('shows a helpful error for a non-TikTok link', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/tiktok link or share text/i), {
      target: { value: 'hello world' },
    });
    fireEvent.click(screen.getByRole('button', { name: /fetch video/i }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/does not look like a tiktok link/i);
  });
});
