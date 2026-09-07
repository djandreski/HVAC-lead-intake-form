export type FormValues = {
  full_name: string;
  email: string;
  phone: string;
  zip_code: string;
  service_needed: string;
  desired_timeframe: string;
  estimated_budget: string;
  project_details: string;
  company_website: string;
};

export type FormErrors = Partial<Record<keyof FormValues, string>>;

export type EstimatePayload = FormValues & {
  source: 'website_estimate_form';
};

export const INITIAL_VALUES: FormValues = {
  full_name: '',
  email: '',
  phone: '',
  zip_code: '',
  service_needed: '',
  desired_timeframe: '',
  estimated_budget: '',
  project_details: '',
  company_website: '',
};

export function validateEstimateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const digits = values.phone.replace(/\D/g, '');

  if (!values.full_name.trim()) errors.full_name = 'Enter your full name.';
  if (!values.email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!values.phone.trim()) {
    errors.phone = 'Enter your phone number.';
  } else if (digits.length < 7 || digits.length > 15) {
    errors.phone = 'Enter a phone number with 7 to 15 digits.';
  }
  if (!values.zip_code.trim()) {
    errors.zip_code = 'Enter your ZIP code.';
  } else if (!/^\d{5}(?:-\d{4})?$/.test(values.zip_code.trim())) {
    errors.zip_code = 'Use a 5-digit ZIP or ZIP+4.';
  }
  if (!values.service_needed) {
    errors.service_needed = 'Choose the service you need.';
  }
  if (!values.desired_timeframe) {
    errors.desired_timeframe = 'Choose your preferred timeframe.';
  }

  return errors;
}

export function createEstimatePayload(values: FormValues): EstimatePayload {
  return {
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    zip_code: values.zip_code.trim(),
    service_needed: values.service_needed,
    desired_timeframe: values.desired_timeframe,
    estimated_budget: values.estimated_budget,
    project_details: values.project_details.trim(),
    source: 'website_estimate_form',
    company_website: values.company_website,
  };
}

export async function postEstimate(
  webhookUrl: string,
  values: FormValues,
  options: { fetcher?: typeof fetch; timeoutMs?: number } = {},
) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 12000,
  );

  try {
    const response = await (options.fetcher ?? fetch)(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal,
      body: JSON.stringify(createEstimatePayload(values)),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

export function normalizeToolInput(input: unknown): FormValues {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Estimate input must be an object.');
  }

  const source = input as Record<string, unknown>;
  const required = [
    'full_name',
    'email',
    'phone',
    'zip_code',
    'service_needed',
    'desired_timeframe',
  ] as const;

  for (const field of required) {
    if (typeof source[field] !== 'string') {
      throw new Error(`${field} must be a string.`);
    }
  }

  for (const field of ['estimated_budget', 'project_details'] as const) {
    if (source[field] !== undefined && typeof source[field] !== 'string') {
      throw new Error(`${field} must be a string when provided.`);
    }
  }

  return {
    full_name: source.full_name as string,
    email: source.email as string,
    phone: source.phone as string,
    zip_code: source.zip_code as string,
    service_needed: source.service_needed as string,
    desired_timeframe: source.desired_timeframe as string,
    estimated_budget: (source.estimated_budget as string | undefined) ?? '',
    project_details: (source.project_details as string | undefined) ?? '',
    company_website: '',
  };
}
