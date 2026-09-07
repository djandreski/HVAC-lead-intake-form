import { describe, expect, it, vi } from 'vitest';

import {
  createEstimatePayload,
  INITIAL_VALUES,
  postEstimate,
  validateEstimateForm,
  type FormValues,
} from './estimate';

const validValues: FormValues = {
  ...INITIAL_VALUES,
  full_name: '  Jordan Lee  ',
  email: ' jordan@example.com ',
  phone: ' (555) 010-1234 ',
  zip_code: ' 12345 ',
  service_needed: 'HVAC repair',
  desired_timeframe: 'Within one week',
};

describe('estimate validation', () => {
  it('requires the six lead qualification fields', () => {
    expect(validateEstimateForm(INITIAL_VALUES)).toEqual({
      full_name: 'Enter your full name.',
      email: 'Enter your email address.',
      phone: 'Enter your phone number.',
      zip_code: 'Enter your ZIP code.',
      service_needed: 'Choose the service you need.',
      desired_timeframe: 'Choose your preferred timeframe.',
    });
  });

  it('accepts blank optional fields and common phone and ZIP formatting', () => {
    expect(
      validateEstimateForm({ ...validValues, zip_code: '12345-6789' }),
    ).toEqual({});
  });

  it('rejects malformed email, phone, and ZIP values', () => {
    const errors = validateEstimateForm({
      ...validValues,
      email: 'not-an-email',
      phone: '123',
      zip_code: 'ABC12',
    });

    expect(errors.email).toBe('Enter a valid email address.');
    expect(errors.phone).toBe('Enter a phone number with 7 to 15 digits.');
    expect(errors.zip_code).toBe('Use a 5-digit ZIP or ZIP+4.');
  });
});

describe('estimate webhook', () => {
  it('creates the stable, trimmed JSON payload', () => {
    expect(createEstimatePayload(validValues)).toEqual({
      full_name: 'Jordan Lee',
      email: 'jordan@example.com',
      phone: '(555) 010-1234',
      zip_code: '12345',
      service_needed: 'HVAC repair',
      desired_timeframe: 'Within one week',
      estimated_budget: '',
      project_details: '',
      source: 'website_estimate_form',
      company_website: '',
    });
  });

  it('posts JSON without credentials and accepts an empty response body', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('', { status: 200 }));

    await postEstimate('https://hook.example.com/lead', validValues, {
      fetcher,
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(
      'https://hook.example.com/lead',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEstimatePayload(validValues)),
      }),
    );
  });

  it('rejects non-2xx responses', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('', { status: 503 }));

    await expect(
      postEstimate('https://hook.example.com/lead', validValues, { fetcher }),
    ).rejects.toThrow('Webhook returned 503');
  });

  it('aborts a request that exceeds the timeout', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );

    const request = postEstimate('https://hook.example.com/lead', validValues, {
      fetcher,
      timeoutMs: 25,
    });
    const rejection = expect(request).rejects.toMatchObject({
      name: 'AbortError',
    });
    await vi.advanceTimersByTimeAsync(25);

    await rejection;
    vi.useRealTimers();
  });
});
