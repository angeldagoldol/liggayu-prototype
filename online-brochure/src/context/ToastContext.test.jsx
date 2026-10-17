import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MotionGlobalConfig } from 'framer-motion';
import { ToastProvider, useToast } from './ToastContext.jsx';

// Exit animations would keep dismissed toasts in the DOM for a moment.
beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function Trigger({ options }) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast(options)}>
      Notify
    </button>
  );
}

function renderWith(options) {
  return render(
    <ToastProvider>
      <Trigger options={options} />
    </ToastProvider>,
  );
}

describe('ToastContext', () => {
  it('announces a toast in a labelled live region', async () => {
    const user = userEvent.setup();
    renderWith({ title: 'Saved', description: 'Your brochure is live.', tone: 'success' });
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region).toHaveTextContent('Saved');
    expect(region).toHaveTextContent('Your brochure is live.');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses role="alert" for errors', async () => {
    const user = userEvent.setup();
    renderWith({ title: 'Could not save', tone: 'error' });
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save');
  });

  it('runs the action and dismisses the toast', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWith({ title: 'Page deleted', action: { label: 'Undo', onClick }, duration: 0 });
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument());
  });

  it('dismisses on its own after the duration', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      renderWith({ title: 'Copied', duration: 1000 });
      act(() => screen.getByRole('button', { name: 'Notify' }).click());
      expect(screen.getByText('Copied')).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(1100));
    } finally {
      vi.useRealTimers();
    }
    await waitFor(() => expect(screen.queryByText('Copied')).not.toBeInTheDocument());
  });

  it('keeps at most four toasts on screen', async () => {
    const user = userEvent.setup();
    renderWith({ title: 'Ping', duration: 0 });
    const button = screen.getByRole('button', { name: 'Notify' });
    for (let i = 0; i < 6; i += 1) await user.click(button);
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Dismiss' })).toHaveLength(4));
  });
});
