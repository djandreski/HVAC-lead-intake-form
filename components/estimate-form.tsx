'use client';

import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Check, LoaderCircle, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  type FormErrors,
  type FormValues,
  INITIAL_VALUES,
  normalizeToolInput,
  postEstimate,
  validateEstimateForm,
} from '@/lib/estimate';

const SERVICE_OPTIONS = [
  'HVAC repair',
  'HVAC replacement',
  'Preventive maintenance',
  'Indoor air-quality assessment',
];

const TIMEFRAME_OPTIONS = [
  'As soon as possible',
  'Within one week',
  'Within one month',
  'Just researching',
];

const BUDGET_OPTIONS = [
  'Under $2,500',
  '$2,500–$5,000',
  '$5,000–$10,000',
  'More than $10,000',
  'Not sure',
];

export function EstimateForm() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSending, setIsSending] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [submitError, setSubmitError] = useState('');
  const successRef = useRef<HTMLOutputElement>(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    if (submittedName) successRef.current?.focus();
  }, [submittedName]);

  const submitValues = useCallback(async (nextValues: FormValues) => {
    if (isSendingRef.current) {
      throw new Error('An estimate request is already being sent.');
    }

    const firstName = nextValues.full_name.trim().split(/\s+/)[0] || 'there';
    if (nextValues.company_website.trim()) {
      setSubmittedName(firstName);
      return firstName;
    }

    const webhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL?.trim();
    if (!webhookUrl) {
      const message =
        'Online requests are temporarily unavailable. Please try again later.';
      setSubmitError(message);
      throw new Error(message);
    }

    isSendingRef.current = true;
    setIsSending(true);

    try {
      await postEstimate(webhookUrl, nextValues);
      setSubmittedName(firstName);
      return firstName;
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'AbortError'
          ? 'The request took too long. Please try again.'
          : 'We couldn’t send your request. Check your connection and try again.';
      setSubmitError(message);
      throw new Error(message, { cause: error });
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  }, []);

  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: Record<string, unknown>,
            options?: { signal?: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;

    if (!context?.registerTool) return;
    const lifecycle = new AbortController();

    const tool = {
      name: 'submit_estimate_request',
      title: 'Submit estimate request',
      description:
        'Submit a residential HVAC estimate request and show the same confirmation as the visible form.',
      inputSchema: {
        type: 'object',
        properties: {
          full_name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          zip_code: { type: 'string' },
          service_needed: { type: 'string', enum: SERVICE_OPTIONS },
          desired_timeframe: { type: 'string', enum: TIMEFRAME_OPTIONS },
          estimated_budget: { type: 'string', enum: BUDGET_OPTIONS },
          project_details: { type: 'string', maxLength: 1200 },
        },
        required: [
          'full_name',
          'email',
          'phone',
          'zip_code',
          'service_needed',
          'desired_timeframe',
        ],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input: unknown) {
        const nextValues = normalizeToolInput(input);
        const nextErrors = validateEstimateForm(nextValues);
        if (Object.keys(nextErrors).length > 0) {
          throw new Error(Object.values(nextErrors)[0]);
        }

        setValues(nextValues);
        setErrors({});
        setSubmitError('');
        const firstName = await submitValues(nextValues);
        return { status: 'received', first_name: firstName };
      },
    };

    try {
      void Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => undefined);
    } catch {
      // The visible form remains fully functional in browsers without WebMCP.
    }

    return () => lifecycle.abort();
  }, [submitValues]);

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handleSubmit = (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    event.preventDefault();
    if (isSendingRef.current) return;

    setSubmitError('');
    const nextErrors = validateEstimateForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstField = Object.keys(nextErrors)[0];
      requestAnimationFrame(() => document.getElementById(firstField)?.focus());
      return;
    }

    void submitValues(values).catch(() => undefined);
  };

  if (submittedName) {
    return (
      <output
        ref={successRef}
        tabIndex={-1}
        aria-live="polite"
        className="flex min-h-[32rem] flex-col justify-center rounded-[2rem] border border-[#bee0d2] bg-[#f5fffa] p-8 text-center text-[#082b3d] shadow-[0_30px_90px_rgba(2,23,34,0.3)] outline-none sm:p-12"
      >
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#d8f5e7] text-[#12704c]">
          <Check aria-hidden="true" className="size-8" strokeWidth={2.5} />
        </span>
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.17em] text-[#12704c]">
          Request received
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
          Thanks, {submittedName}.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg leading-8 text-[#496572]">
          We’ve received your request. A member of the Summit Home Services team
          will contact you shortly.
        </p>
      </output>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/20 bg-white p-6 text-[#082b3d] shadow-[0_30px_90px_rgba(2,23,34,0.34)] sm:p-8 lg:p-9">
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-[0.17em] text-[#c95d24]">
          Request an estimate
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
          Tell us about your home.
        </h2>
        <p className="mt-3 leading-7 text-[#58717c]">
          Share a few details and our team will follow up with the right next
          step.
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div aria-hidden="true" className="honeypot-field">
          <Label htmlFor="company_website">Company website</Label>
          <Input
            id="company_website"
            name="company_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.company_website}
            onChange={(event) =>
              updateValue('company_website', event.target.value)
            }
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="full_name"
            label="Full name"
            error={errors.full_name}
            required
          >
            <Input
              id="full_name"
              name="full_name"
              autoComplete="name"
              value={values.full_name}
              aria-invalid={Boolean(errors.full_name)}
              aria-describedby={
                errors.full_name ? 'full_name-error' : undefined
              }
              onChange={(event) => updateValue('full_name', event.target.value)}
              className="form-control"
              placeholder="Jordan Lee"
            />
          </FormField>
          <FormField id="email" label="Email" error={errors.email} required>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              onChange={(event) => updateValue('email', event.target.value)}
              className="form-control"
              placeholder="jordan@example.com"
            />
          </FormField>
          <FormField
            id="phone"
            label="Phone number"
            error={errors.phone}
            required
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={values.phone}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              onChange={(event) => updateValue('phone', event.target.value)}
              className="form-control"
              placeholder="(555) 010-1234"
            />
          </FormField>
          <FormField
            id="zip_code"
            label="ZIP code"
            error={errors.zip_code}
            required
          >
            <Input
              id="zip_code"
              name="zip_code"
              inputMode="numeric"
              autoComplete="postal-code"
              value={values.zip_code}
              aria-invalid={Boolean(errors.zip_code)}
              aria-describedby={errors.zip_code ? 'zip_code-error' : undefined}
              onChange={(event) => updateValue('zip_code', event.target.value)}
              className="form-control"
              placeholder="12345"
            />
          </FormField>
        </div>

        <FormField
          id="service_needed"
          label="Service needed"
          error={errors.service_needed}
          required
        >
          <Select
            value={values.service_needed || null}
            onValueChange={(value) =>
              updateValue('service_needed', value || '')
            }
          >
            <SelectTrigger
              id="service_needed"
              className="form-control w-full"
              aria-invalid={Boolean(errors.service_needed)}
              aria-describedby={
                errors.service_needed ? 'service_needed-error' : undefined
              }
            >
              <SelectValue>
                {values.service_needed || 'Choose a service'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SERVICE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="desired_timeframe"
            label="Desired timeframe"
            error={errors.desired_timeframe}
            required
          >
            <Select
              value={values.desired_timeframe || null}
              onValueChange={(value) =>
                updateValue('desired_timeframe', value || '')
              }
            >
              <SelectTrigger
                id="desired_timeframe"
                className="form-control w-full"
                aria-invalid={Boolean(errors.desired_timeframe)}
                aria-describedby={
                  errors.desired_timeframe
                    ? 'desired_timeframe-error'
                    : undefined
                }
              >
                <SelectValue>
                  {values.desired_timeframe || 'Choose timing'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TIMEFRAME_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="estimated_budget" label="Estimated budget" optional>
            <Select
              value={values.estimated_budget || null}
              onValueChange={(value) =>
                updateValue('estimated_budget', value || '')
              }
            >
              <SelectTrigger
                id="estimated_budget"
                className="form-control w-full"
              >
                <SelectValue>
                  {values.estimated_budget || 'Choose a range'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BUDGET_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField id="project_details" label="Project details" optional>
          <Textarea
            id="project_details"
            name="project_details"
            maxLength={1200}
            value={values.project_details}
            onChange={(event) =>
              updateValue('project_details', event.target.value)
            }
            className="min-h-24 resize-y border-[#b9cdd2] bg-white px-3 py-3 text-base focus-visible:border-[#16809a] focus-visible:ring-[#16809a]/20"
            placeholder="What have you noticed? Include any equipment or comfort details that may help."
          />
        </FormField>

        {submitError && (
          <p
            role="alert"
            className="rounded-xl border border-[#f1c1aa] bg-[#fff3ed] px-4 py-3 text-sm font-medium leading-6 text-[#9f431a]"
          >
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSending}
          className="h-13 w-full rounded-xl bg-[#e86f2f] px-6 text-base font-bold text-white shadow-[0_10px_24px_rgba(232,111,47,0.28)] hover:bg-[#cb5721] focus-visible:border-[#082b3d] focus-visible:ring-[#f98b45]/50"
        >
          {isSending ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin"
              />
              Sending request…
            </>
          ) : (
            <>
              <Send aria-hidden="true" className="size-5" />
              Request my estimate
            </>
          )}
        </Button>
        <p className="text-center text-xs leading-5 text-[#6b8189]">
          By submitting, you agree that Summit Home Services may contact you
          about this request.
        </p>
      </form>
    </div>
  );
}

function FormField({
  id,
  label,
  error,
  required = false,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-bold text-[#173f4d]">
          {label}
          {required && (
            <>
              <span className="text-[#c95d24]" aria-hidden="true">
                {' '}
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </Label>
        {optional && (
          <span className="text-xs font-medium text-[#71858c]">Optional</span>
        )}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-[#b64022]">
          {error}
        </p>
      )}
    </div>
  );
}
