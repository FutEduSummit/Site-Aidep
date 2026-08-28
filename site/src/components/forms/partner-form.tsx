'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { submitPartnership } from '@/app/actions'
import {
  CheckboxControl,
  Field,
  SelectControl,
  describedBy,
  inputClasses,
} from '@/components/forms/fields'
import { FormStatus } from '@/components/forms/form-status'
import { Button } from '@/components/ui/button'
import {
  buildPartnerSchema,
  partnerTypeValues,
  type PartnerValues,
  type SubmitStatus,
} from '@/lib/forms'

export function PartnerForm() {
  const t = useTranslations('forms.fields')
  const tLabels = useTranslations('forms.labels')
  const tErrors = useTranslations('forms.errors')
  const tTypes = useTranslations('forms.partnerTypes')
  const tSubmit = useTranslations('forms.submit')

  const uid = useId()
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [pending, startTransition] = useTransition()
  const [lastPayload, setLastPayload] = useState<PartnerValues | null>(null)

  const schema = buildPartnerSchema({
    name: tErrors('name'),
    email: tErrors('email'),
    phone: tErrors('phone'),
    subject: tErrors('subject'),
    message: tErrors('message'),
    interest: tErrors('interest'),
    organization: tErrors('organization'),
    partnerType: tErrors('partnerType'),
    consent: tErrors('consent'),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PartnerValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      organization: '',
      role: '',
      partnerType: 'company',
      message: '',
    },
  })

  const busy = pending || isSubmitting

  function onSubmit(values: PartnerValues) {
    if (busy) return
    setLastPayload(values)
    setStatus('idle')

    startTransition(async () => {
      const result = await submitPartnership(values)
      setStatus(result.status)
      if (result.status === 'success') reset()
    })
  }

  const id = (field: string) => `${uid}-${field}`

  return (
    <div className="flex flex-col gap-8">
      <FormStatus
        status={status}
        onReset={() => setStatus('idle')}
        mailto={
          lastPayload
            ? {
                subject: `[${tTypes(lastPayload.partnerType)}] ${lastPayload.organization}`,
                body: `${lastPayload.name}${lastPayload.role ? ` — ${lastPayload.role}` : ''}\n${
                  lastPayload.organization
                }\n${lastPayload.email}${lastPayload.phone ? `\n${lastPayload.phone}` : ''}\n\n${
                  lastPayload.message
                }`,
              }
            : undefined
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field id={id('name')} label={t('name')} error={errors.name?.message}>
            <input
              id={id('name')}
              type="text"
              autoComplete="name"
              placeholder={t('namePlaceholder')}
              className={inputClasses}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy(id('name'), errors.name?.message)}
              {...register('name')}
            />
          </Field>

          <Field id={id('email')} label={t('email')} error={errors.email?.message}>
            <input
              id={id('email')}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t('emailPlaceholder')}
              className={inputClasses}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy(id('email'), errors.email?.message)}
              {...register('email')}
            />
          </Field>

          <Field
            id={id('organization')}
            label={t('organization')}
            error={errors.organization?.message}
          >
            <input
              id={id('organization')}
              type="text"
              autoComplete="organization"
              placeholder={t('organizationPlaceholder')}
              className={inputClasses}
              aria-invalid={errors.organization ? true : undefined}
              aria-describedby={describedBy(
                id('organization'),
                errors.organization?.message,
              )}
              {...register('organization')}
            />
          </Field>

          <Field
            id={id('role')}
            label={t('role')}
            required={false}
            optionalLabel={t('optional')}
            error={errors.role?.message}
          >
            <input
              id={id('role')}
              type="text"
              autoComplete="organization-title"
              placeholder={t('rolePlaceholder')}
              className={inputClasses}
              aria-invalid={errors.role ? true : undefined}
              aria-describedby={describedBy(id('role'), errors.role?.message)}
              {...register('role')}
            />
          </Field>

          <Field
            id={id('phone')}
            label={t('phone')}
            required={false}
            optionalLabel={t('optional')}
            error={errors.phone?.message}
          >
            <input
              id={id('phone')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t('phonePlaceholder')}
              className={inputClasses}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={describedBy(id('phone'), errors.phone?.message)}
              {...register('phone')}
            />
          </Field>

          <Field
            id={id('partnerType')}
            label={tLabels('partnerType')}
            error={errors.partnerType?.message}
          >
            <SelectControl
              id={id('partnerType')}
              aria-invalid={errors.partnerType ? true : undefined}
              aria-describedby={describedBy(
                id('partnerType'),
                errors.partnerType?.message,
              )}
              {...register('partnerType')}
            >
              {partnerTypeValues.map((value) => (
                <option key={value} value={value}>
                  {tTypes(value)}
                </option>
              ))}
            </SelectControl>
          </Field>
        </div>

        <Field
          id={id('message')}
          label={tLabels('proposal')}
          error={errors.message?.message}
        >
          <textarea
            id={id('message')}
            rows={6}
            placeholder={t('messagePlaceholder')}
            className={`${inputClasses} resize-y`}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy(id('message'), errors.message?.message)}
            {...register('message')}
          />
        </Field>

        <CheckboxControl
          id={id('consent')}
          label={t('consent')}
          error={errors.consent?.message}
          {...register('consent')}
        />

        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={busy}
          aria-busy={busy}
          className="self-start"
        >
          {busy ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-4 motion-safe:animate-spin"
            />
          ) : null}
          {busy ? tSubmit('sending') : tSubmit('sendPartnership')}
        </Button>
      </form>
    </div>
  )
}
