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
    window.history.replaceState({}, '', '/');
    delete document.documentElement.dataset.platform;
    Element.prototype.scrollIntoView = vi.fn();
    window.scrollTo = vi.fn();

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

  it('renders the editorial workspace and the URL form', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
      /download the video/i,
    );
    expect(screen.getByLabelText(/tiktok link or share text/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /get video/i })).toBeTruthy();
    expect(document.documentElement.dataset.platform).toBe('desktop');
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

    fireEvent.click(screen.getByRole('button', { name: /get video/i }));

    expect(await screen.findByText(/ready to download/i)).toBeTruthy();
    expect(screen.getByText('HD video')).toBeTruthy();
    expect(screen.getByText('Audio only')).toBeTruthy();
    expect(screen.getAllByText(/@ladygaga/).length).toBeGreaterThan(0);
    expect(screen.getByText(/last fetched/i)).toBeTruthy();

    const calledUrl = String((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(calledUrl).toContain('https%3A%2F%2Fvm.tiktok.com%2FZMabc123%2F');
  });

  it('shows a helpful error for a non-TikTok link', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/tiktok link or share text/i), {
      target: { value: 'hello world' },
    });
    fireEvent.click(screen.getByRole('button', { name: /get video/i }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/does not look like a tiktok link/i);
  });

  it('switches between the workspace tabs', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /recent history/i }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Recent');
    expect(screen.getByText(/nothing here yet/i)).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: /^guide$/i })[0]);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('A short field guide.');

    fireEvent.click(screen.getAllByRole('button', { name: /^download$/i })[0]);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/download the video/i);
  });

  it('renders an iOS result without losing the native grouped layout', async () => {
    window.history.replaceState({}, '', '/?ui=ios');
    const { container } = render(<App />);

    fireEvent.change(screen.getByLabelText(/tiktok link or share text/i), {
      target: { value: 'https://www.tiktok.com/@ladygaga/video/7376784960625085742' },
    });
    fireEvent.click(screen.getByRole('button', { name: /get video/i }));

    expect(await screen.findByText('HD video')).toBeTruthy();
    expect(container.querySelector('.ios-result')).toBeTruthy();
    expect(container.querySelector('.ios-list')).toBeTruthy();
  });

  it('renders the Material 3 shell on Android', () => {
    window.history.replaceState({}, '', '/?ui=android');
    const { container } = render(<App />);

    expect(document.documentElement.dataset.platform).toBe('android');
    expect(container.querySelector('.m3-shell')).toBeTruthy();
    expect(container.querySelector('.m3-nav')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Download');
  });

  it('renders the native iOS shell on iPhone and iPad', () => {
    window.history.replaceState({}, '', '/?ui=ios');
    const { container } = render(<App />);

    expect(document.documentElement.dataset.platform).toBe('ios');
    expect(container.querySelector('.ios-shell')).toBeTruthy();
    expect(container.querySelector('.ios-tabbar')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Download');
  });
});
