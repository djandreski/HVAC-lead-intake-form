import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EstimateForm } from './estimate-form';

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Full name/i), 'Jordan Lee');
  await user.type(screen.getByLabelText(/^Email/i), 'jordan@example.com');
  await user.type(screen.getByLabelText(/Phone number/i), '555-010-1234');
  await user.type(screen.getByLabelText(/ZIP code/i), '12345');

  await user.click(screen.getByRole('combobox', { name: /Service needed/i }));
  await user.click(await screen.findByRole('option', { name: 'HVAC repair' }));
  await user.click(
    screen.getByRole('combobox', { name: /Desired timeframe/i }),
  );
  await user.click(
    await screen.findByRole('option', { name: 'Within one week' }),
  );
}

describe('EstimateForm', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL = 'https://hook.example.com/lead';
  });

  it('shows validation errors and focuses the first invalid field', async () => {
    const user = userEvent.setup();
    render(<EstimateForm />);

    await user.click(
      screen.getByRole('button', { name: /Request my estimate/i }),
    );

    expect(await screen.findByText('Enter your full name.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/Full name/i));
  });

  it('posts once, disables while sending, and renders the personalized success state', async () => {
    const user = userEvent.setup();
    let resolveRequest: (response: Response) => void = () => undefined;
    const request = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    const fetcher = vi.fn<typeof fetch>().mockReturnValue(request);
    vi.stubGlobal('fetch', fetcher);
    render(<EstimateForm />);
    await fillRequiredFields(user);

    const button = screen.getByRole('button', { name: /Request my estimate/i });
    await user.click(button);
    expect(
      screen.getByRole('button', { name: /Sending request/i }),
    ).toHaveProperty('disabled', true);
    await user.click(screen.getByRole('button', { name: /Sending request/i }));
    expect(fetcher).toHaveBeenCalledTimes(1);

    resolveRequest(new Response('', { status: 200 }));
    expect(await screen.findByText('Thanks, Jordan.')).toBeTruthy();

    const [, options] = fetcher.mock.calls[0];
    expect(typeof options?.body).toBe('string');
    const body = typeof options?.body === 'string' ? options.body : '{}';
    expect(JSON.parse(body)).toEqual({
      full_name: 'Jordan Lee',
      email: 'jordan@example.com',
      phone: '555-010-1234',
      zip_code: '12345',
      service_needed: 'HVAC repair',
      desired_timeframe: 'Within one week',
      estimated_budget: '',
      project_details: '',
      source: 'website_estimate_form',
      company_website: '',
    });
  });

  it('retains values and restores the button after a failed request', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response('', { status: 500 })),
    );
    render(<EstimateForm />);
    await fillRequiredFields(user);
    await user.click(
      screen.getByRole('button', { name: /Request my estimate/i }),
    );

    expect((await screen.findByRole('alert')).textContent).toContain(
      'We couldn’t send your request.',
    );
    expect(screen.getByLabelText(/Full name/i)).toHaveProperty(
      'value',
      'Jordan Lee',
    );
    expect(
      screen.getByRole('button', { name: /Request my estimate/i }),
    ).toHaveProperty('disabled', false);
  });

  it('suppresses the webhook when the honeypot is populated', async () => {
    const user = userEvent.setup();
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetcher);
    const { container } = render(<EstimateForm />);
    await fillRequiredFields(user);

    const honeypot =
      container.querySelector<HTMLInputElement>('#company_website');
    fireEvent.change(honeypot!, { target: { value: 'https://spam.example' } });
    await user.click(
      screen.getByRole('button', { name: /Request my estimate/i }),
    );

    expect(await screen.findByText('Thanks, Jordan.')).toBeTruthy();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
