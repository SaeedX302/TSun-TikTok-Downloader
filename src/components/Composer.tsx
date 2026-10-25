import type { ChangeEvent, KeyboardEvent, RefObject } from 'react';
import { AlertCircle, ArrowRight, ClipboardPaste, X } from 'lucide-react';
import type { AppController, Platform } from '../ui/types';
import { describeLink } from '../lib/tiktokUrl';

interface ComposerProps {
  platform: Platform;
  controller: AppController;
  inputRef: RefObject<HTMLTextAreaElement>;
}

const PLACEHOLDER = 'https://www.tiktok.com/@creator/video/…';
const SHARE_PLACEHOLDER = 'Paste the whole share message from TikTok';

function fieldProps(controller: AppController, inputRef: RefObject<HTMLTextAreaElement>) {
  return {
    id: 'tiktok-url',
    ref: inputRef,
    value: controller.input,
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => controller.onInput(event.target.value),
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        controller.onSubmit();
      }
    },
    rows: 2,
    spellCheck: false,
    autoCapitalize: 'off' as const,
    autoCorrect: 'off' as const,
    placeholder: `${PLACEHOLDER}\n${SHARE_PLACEHOLDER}`,
    'aria-label': 'TikTok link or share text',
    'aria-invalid': Boolean(controller.error),
    'aria-describedby': controller.error ? 'url-error' : undefined,
  };
}

function DismissibleError({ controller, className }: { controller: AppController; className: string }) {
  if (!controller.error) return null;
  return (
    <div id="url-error" role="alert" className={className}>
      <AlertCircle aria-hidden="true" />
      <div>
        <p>{controller.error.message}</p>
        {controller.error.hint && <p className="error-hint">{controller.error.hint}</p>}
      </div>
      <button type="button" onClick={controller.onDismissError} aria-label="Dismiss error">
        <X aria-hidden="true" />
      </button>
    </div>
  );
}

function DesktopComposer({ controller, inputRef }: Omit<ComposerProps, 'platform'>) {
  const detected = controller.parsed?.ok ? controller.parsed.link : null;

  return (
    <form
      className="desk-composer"
      onSubmit={(event) => {
        event.preventDefault();
        controller.onSubmit();
      }}
    >
      <div className="desk-composer-head">
        <label htmlFor="tiktok-url">TikTok link or share text</label>
        <div className="desk-composer-tools">
          <button type="button" onClick={controller.onPaste}>
            <ClipboardPaste aria-hidden="true" /> Paste
          </button>
          {controller.input && (
            <button type="button" onClick={() => controller.onInput('')} aria-label="Clear input">
              <X aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="desk-field">
        <textarea {...fieldProps(controller, inputRef)} />
        <button type="submit" className="desk-primary" disabled={controller.isLoading}>
          {controller.isLoading ? 'Reading link…' : 'Get video'}
          {!controller.isLoading && <ArrowRight aria-hidden="true" />}
        </button>
      </div>

      <div className="desk-composer-foot">
        <span className={detected ? 'is-detected' : ''}>
          {detected ? `${describeLink(detected)} detected` : 'Direct link, short link or share message'}
        </span>
        <button type="button" onClick={controller.onUseSample}>Use an example</button>
      </div>

      <DismissibleError controller={controller} className="desk-error" />
    </form>
  );
}


function AndroidComposer({ controller, inputRef }: Omit<ComposerProps, 'platform'>) {
  const detected = controller.parsed?.ok ? controller.parsed.link : null;

  return (
    <form
      className="m3-composer"
      onSubmit={(event) => {
        event.preventDefault();
        controller.onSubmit();
      }}
    >
      <div className="m3-field">
        <label htmlFor="tiktok-url">TikTok link or share text</label>
        <textarea {...fieldProps(controller, inputRef)} />
        <div className="m3-field-actions">
          <button type="button" onClick={controller.onPaste}>
            <ClipboardPaste aria-hidden="true" />
            Paste
          </button>
          {controller.input && (
            <button type="button" onClick={() => controller.onInput('')} aria-label="Clear input">
              <X aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {detected && (
        <p className="m3-assist is-detected">
          <span aria-hidden="true" /> {describeLink(detected)} detected
        </p>
      )}

      <button type="submit" className="m3-button-filled" disabled={controller.isLoading}>
        {controller.isLoading ? 'Reading link…' : 'Get video'}
      </button>

      <button type="button" className="m3-text-button m3-sample" onClick={controller.onUseSample}>
        Use an example link
      </button>

      <DismissibleError controller={controller} className="m3-error" />
    </form>
  );
}

function IOSComposer({ controller, inputRef }: Omit<ComposerProps, 'platform'>) {
  const detected = controller.parsed?.ok ? controller.parsed.link : null;

  return (
    <form
      className="ios-composer"
      onSubmit={(event) => {
        event.preventDefault();
        controller.onSubmit();
      }}
    >
      <div className="ios-group">
        <div className="ios-field-row">
          <textarea {...fieldProps(controller, inputRef)} />
          <button type="button" className="ios-text-button" onClick={controller.onPaste}>
            Paste
          </button>
        </div>
      </div>

      <p className={`ios-assist ${detected ? 'is-detected' : ''}`}>
        {detected
          ? `${describeLink(detected)} detected`
          : 'Direct links, short links and share messages all work.'}
      </p>

      <button type="submit" className="ios-button-primary" disabled={controller.isLoading}>
        {controller.isLoading ? 'Reading link…' : 'Get video'}
      </button>

      <button type="button" className="ios-button-plain" onClick={controller.onUseSample}>
        Use an example
      </button>

      <DismissibleError controller={controller} className="ios-error" />
    </form>
  );
}

export function Composer({ platform, ...rest }: ComposerProps) {
  if (platform === 'android') return <AndroidComposer {...rest} />;
  if (platform === 'ios') return <IOSComposer {...rest} />;
  return <DesktopComposer {...rest} />;
}
