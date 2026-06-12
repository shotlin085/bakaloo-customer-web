'use client'

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleMap, MarkerF, useLoadScript } from '@react-google-maps/api'
import { CheckCircle2, ChevronDown, Loader2, MapPin, XCircle } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { GOOGLE_STATE_MAP, INDIAN_STATES } from '@/lib/indianStates'
import { addressSchema } from '@/lib/validations'
import { addressesService } from '@/services/addresses.service'
import type { CreateAddressPayload } from '@/types/address.types'
import { cn } from '@/lib/utils'

interface AddressFormProps {
  defaultValues?: Partial<CreateAddressPayload>
  onSubmit: (data: CreateAddressPayload) => Promise<void>
  isSubmitting: boolean
  submitLabel?: string
}

const LABELS = ['Home', 'Work', 'Other'] as const

type AddressFormInput = z.input<typeof addressSchema>
type AddressFormData = z.output<typeof addressSchema>
type PincodeStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'unavailable'
type Coordinates = { lat?: number; lng?: number }
type ReverseGeocodeResult = {
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  pincode?: string
}
type IndiaPostLookupResult =
  | { status: 'resolved'; city: string; state: string }
  | { status: 'invalid' }
  | { status: 'error' }

const GOOGLE_MAP_LIBRARIES: ('places')[] = ['places']
const DEFAULT_MAP_CENTER = { lat: 22.5726, lng: 88.3639 }

export function AddressForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = 'Save Address',
}: AddressFormProps) {
  const [pincodeStatus, setPincodeStatus] = useState<PincodeStatus>('idle')
  const [pincodeMsg, setPincodeMsg] = useState('')
  const [locating, setLocating] = useState(false)
  const [stateOpen, setStateOpen] = useState(false)
  const [stateSearch, setStateSearch] = useState('')
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: defaultValues?.lat,
    lng: defaultValues?.lng,
  })
  const stateMenuRef = useRef<HTMLDivElement | null>(null)
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  const hasGoogleMapsKey = Boolean(googleMapsKey?.trim())
  const { isLoaded: mapLoaded, loadError: mapLoadError } = useLoadScript({
    googleMapsApiKey: googleMapsKey ?? '',
    libraries: GOOGLE_MAP_LIBRARIES,
  })

  const initialValues = useMemo<AddressFormInput>(
    () => ({
      label: defaultValues?.label ?? 'Home',
      addressLine1: defaultValues?.addressLine1 ?? '',
      addressLine2: defaultValues?.addressLine2 ?? '',
      landmark: defaultValues?.landmark ?? '',
      city: defaultValues?.city ?? '',
      state: defaultValues?.state ?? '',
      pincode: defaultValues?.pincode ?? '',
      isDefault: defaultValues?.isDefault ?? false,
    }),
    [defaultValues],
  )

  const {
    control,
    register,
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormInput, unknown, AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialValues,
  })

  const pincode = watch('pincode')
  const selectedState = watch('state')
  const hasPinnedCoordinates =
    Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lng)
  const mapCenter = useMemo(
    () => ({
      lat: coordinates.lat ?? defaultValues?.lat ?? DEFAULT_MAP_CENTER.lat,
      lng: coordinates.lng ?? defaultValues?.lng ?? DEFAULT_MAP_CENTER.lng,
    }),
    [coordinates.lat, coordinates.lng, defaultValues?.lat, defaultValues?.lng],
  )

  useEffect(() => {
    reset(initialValues)
    setCoordinates({
      lat: defaultValues?.lat,
      lng: defaultValues?.lng,
    })
  }, [defaultValues, initialValues, reset])

  useEffect(() => {
    if (!stateOpen) return undefined

    const handleClickOutside = (event: MouseEvent) => {
      if (stateMenuRef.current && !stateMenuRef.current.contains(event.target as Node)) {
        setStateOpen(false)
        setStateSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [stateOpen])

  useEffect(() => {
    const normalized = (pincode ?? '').trim()

    if (!/^[1-9]\d{5}$/.test(normalized)) {
      setPincodeStatus('idle')
      setPincodeMsg('')
      return
    }

    let alive = true
    setPincodeStatus('checking')
    setPincodeMsg('')

    const timer = window.setTimeout(async () => {
      const [availabilityResult, indiaPostResult] = await Promise.allSettled([
        addressesService.validatePincode(normalized),
        lookupIndiaPost(normalized),
      ])

      if (!alive) return

      const availability =
        availabilityResult.status === 'fulfilled' ? availabilityResult.value : null
      const indiaPost =
        indiaPostResult.status === 'fulfilled' ? indiaPostResult.value : { status: 'error' as const }

      if (indiaPost.status === 'resolved') {
        const normalizedState = normalizeStateName(indiaPost.state)
        setValue('city', indiaPost.city, { shouldValidate: true, shouldDirty: true })
        if (normalizedState) {
          setValue('state', normalizedState, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      }

      if (availability) {
        if (availability.available) {
          setPincodeStatus('valid')
          setPincodeMsg(
            availability.estimatedMin
              ? `Delivery available in ~${availability.estimatedMin} min`
              : 'Delivery available',
          )
        } else {
          setPincodeStatus('unavailable')
          setPincodeMsg('Delivery not available in this area')
        }
        return
      }

      if (indiaPost.status === 'invalid') {
        setPincodeStatus('invalid')
        setPincodeMsg('Invalid pincode')
        return
      }

      if (indiaPost.status === 'resolved') {
        setPincodeStatus('idle')
        setPincodeMsg('Pincode found. Delivery availability could not be verified.')
        return
      }

      setPincodeStatus('idle')
      setPincodeMsg('Could not validate pincode')
    }, 400)

    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [pincode, setValue])

  const applyReverseGeocode = async (
    nextCoordinates: { lat: number; lng: number },
    successMessage: string,
  ) => {
    setCoordinates(nextCoordinates)

    if (!googleMapsKey) {
      toast.info('Location saved. Complete the address manually if needed.')
      return
    }

    try {
      const geocoded = await reverseGeocodeCoordinates(
        nextCoordinates.lat,
        nextCoordinates.lng,
        googleMapsKey,
      )

      if (!geocoded) {
        toast.info('Location pinned. Complete the address manually if needed.')
        return
      }

      setValue('addressLine1', geocoded.addressLine1, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue('addressLine2', geocoded.addressLine2 ?? '', {
        shouldValidate: false,
        shouldDirty: true,
      })
      setValue('city', geocoded.city, { shouldValidate: true, shouldDirty: true })

      const normalizedState = normalizeStateName(geocoded.state ?? '')
      if (normalizedState) {
        setValue('state', normalizedState, { shouldValidate: true, shouldDirty: true })
      }

      if (geocoded.pincode) {
        setValue('pincode', geocoded.pincode, { shouldValidate: true, shouldDirty: true })
      }

      toast.success(successMessage)
    } catch {
      toast.info('Location pinned. Complete the address manually if needed.')
    }
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device.')
      return
    }

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        try {
          await applyReverseGeocode(
            nextCoordinates,
            'Location detected. Review the address before saving.',
          )
        } finally {
          setLocating(false)
        }
      },
      (error) => {
        setLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied.')
          return
        }

        toast.error('Could not get your current location.')
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      },
    )
  }

  const handleMapPinSelect = async (lat: number, lng: number) => {
    await applyReverseGeocode(
      { lat, lng },
      'Location pinned on map. Review address and save.',
    )
  }

  const filteredStates = stateSearch
    ? INDIAN_STATES.filter((state) =>
      state.toLowerCase().includes(stateSearch.toLowerCase()),
    )
    : [...INDIAN_STATES]

  const onValidSubmit = async (data: AddressFormData) => {
    if (pincodeStatus === 'unavailable') {
      toast.error("We don't deliver to this pincode yet.")
      return
    }

    if (!hasPinnedCoordinates) {
      toast.error('Please pin your exact location on the map before saving.')
      return
    }

    await onSubmit({
      label: data.label,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || undefined,
      landmark: data.landmark || undefined,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      isDefault: data.isDefault ?? false,
      lat: coordinates.lat,
      lng: coordinates.lng,
    })
  }

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
      <Controller
        name="label"
        control={control}
        render={({ field }) => (
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Label</label>
            <div className="flex flex-wrap gap-2">
              {LABELS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => field.onChange(label)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    field.value === label
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <FieldError message={errors.label?.message} className="mt-1" />
          </div>
        )}
      />

      <button
        type="button"
        onClick={handleUseLocation}
        disabled={locating}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-green-400 bg-green-50 py-3 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-60"
      >
        {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
        {locating ? 'Detecting location...' : 'Use my current location'}
      </button>

      {hasGoogleMapsKey && (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-xs font-semibold text-gray-700">
              Pinpoint delivery location on map
            </p>
            {coordinates.lat != null && coordinates.lng != null && (
              <span className="text-[11px] text-gray-500">
                {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
              </span>
            )}
          </div>
          {mapLoadError ? (
            <div className="px-3 py-4 text-xs text-red-500">
              Google Maps failed to load. Please check your Maps API key restrictions.
            </div>
          ) : !mapLoaded ? (
            <div className="flex h-[220px] items-center justify-center bg-gray-50 text-xs text-gray-500">
              Loading map...
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '220px' }}
              center={mapCenter}
              zoom={15}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                gestureHandling: 'greedy',
              }}
              onClick={(event: google.maps.MapMouseEvent) => {
                const clickedLat = event.latLng?.lat()
                const clickedLng = event.latLng?.lng()
                if (clickedLat == null || clickedLng == null) {
                  return
                }
                void handleMapPinSelect(clickedLat, clickedLng)
              }}
            >
              {coordinates.lat != null && coordinates.lng != null && (
                <MarkerF
                  position={{ lat: coordinates.lat, lng: coordinates.lng }}
                  draggable
                  onDragEnd={(event: google.maps.MapMouseEvent) => {
                    const nextLat = event.latLng?.lat()
                    const nextLng = event.latLng?.lng()
                    if (nextLat == null || nextLng == null) {
                      return
                    }
                    void handleMapPinSelect(nextLat, nextLng)
                  }}
                />
              )}
            </GoogleMap>
          )}
        </div>
      )}
      {!hasGoogleMapsKey && (
        <p className="text-xs text-red-500">
          Google Maps is required to pin your location before saving address.
        </p>
      )}
      {hasGoogleMapsKey && !hasPinnedCoordinates && (
        <p className="text-xs text-amber-600">
          Pin your location on the map. Accurate pin is required for rider navigation.
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          House / Flat / Building <span className="text-red-400">*</span>
        </label>
        <InputRow
          placeholder="e.g. B-12 Sunrise Apartments"
          {...register('addressLine1')}
          error={Boolean(errors.addressLine1)}
        />
        <FieldError message={errors.addressLine1?.message} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Area / Street <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <InputRow
          placeholder="e.g. Sector 15, Near Park"
          {...register('addressLine2')}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Landmark <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <InputRow
          placeholder="e.g. Opposite City Mall"
          {...register('landmark')}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Pincode <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <InputRow
            placeholder="6-digit pincode"
            inputMode="numeric"
            maxLength={6}
            {...register('pincode')}
            className="pr-10"
            error={Boolean(errors.pincode) || pincodeStatus === 'invalid' || pincodeStatus === 'unavailable'}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {pincodeStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            {pincodeStatus === 'valid' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            {(pincodeStatus === 'invalid' || pincodeStatus === 'unavailable') && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
        {pincodeMsg ? (
          <p
            className={cn(
              'mt-1 flex items-center gap-1 text-xs',
              pincodeStatus === 'valid'
                ? 'text-green-600'
                : pincodeStatus === 'invalid' || pincodeStatus === 'unavailable'
                  ? 'text-red-500'
                  : 'text-gray-500',
            )}
          >
            {pincodeStatus === 'valid' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : pincodeStatus === 'invalid' || pincodeStatus === 'unavailable' ? (
              <XCircle className="h-3 w-3" />
            ) : (
              <MapPin className="h-3 w-3" />
            )}
            {pincodeMsg}
          </p>
        ) : (
          <FieldError message={errors.pincode?.message} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            City <span className="text-red-400">*</span>
          </label>
          <InputRow
            placeholder="e.g. Kolkata"
            {...register('city')}
            error={Boolean(errors.city)}
          />
          <FieldError message={errors.city?.message} />
        </div>

        <Controller
          name="state"
          control={control}
          render={({ field }) => (
            <div ref={stateMenuRef}>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                State <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setStateOpen((open) => !open)
                    setStateSearch('')
                  }}
                  className={cn(
                    'flex h-12 w-full items-center justify-between rounded-xl border px-4 text-sm transition-all',
                    errors.state
                      ? 'border-red-400'
                      : stateOpen
                        ? 'border-green-500 ring-2 ring-green-500/20'
                        : 'border-gray-200',
                    field.value ? 'text-gray-900' : 'text-gray-400',
                  )}
                >
                  <span className="truncate">{field.value || 'Select state'}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-gray-400 transition-transform',
                      stateOpen && 'rotate-180',
                    )}
                  />
                </button>

                {stateOpen && (
                  <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 p-2">
                      <input
                        autoFocus
                        value={stateSearch}
                        onChange={(event) => setStateSearch(event.target.value)}
                        placeholder="Search state..."
                        className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-green-500"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredStates.length === 0 ? (
                        <p className="py-3 text-center text-xs text-gray-400">No state found</p>
                      ) : (
                        filteredStates.map((state) => (
                          <button
                            key={state}
                            type="button"
                            onClick={() => {
                              field.onChange(state)
                              setStateOpen(false)
                              setStateSearch('')
                            }}
                            className={cn(
                              'flex w-full items-center px-3 py-2.5 text-left text-sm transition-colors hover:bg-green-50',
                              selectedState === state
                                ? 'bg-green-50 font-medium text-green-700'
                                : 'text-gray-700',
                            )}
                          >
                            {state}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <FieldError message={errors.state?.message} />
            </div>
          )}
        />
      </div>

      <Controller
        name="isDefault"
        control={control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={field.value ?? false}
              onChange={(event) => field.onChange(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Set as default address
          </label>
        )}
      />

      <button
        type="submit"
        disabled={
          isSubmitting ||
          pincodeStatus === 'checking' ||
          pincodeStatus === 'unavailable' ||
          !hasPinnedCoordinates
        }
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-green-500 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
      </button>
    </form>
  )
}

const InputRow = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(({ className, error = false, ...props }, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      className={cn(
        'h-12 w-full rounded-xl border px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
        error ? 'border-red-400' : 'border-gray-200',
        className,
      )}
    />
  )
})
InputRow.displayName = 'InputRow'

function FieldError({
  message,
  className,
}: {
  message?: string
  className?: string
}) {
  if (!message) return null

  return (
    <p className={cn('mt-1 flex items-center gap-1 text-xs text-red-500', className)}>
      <XCircle className="h-3 w-3" strokeWidth={1.5} />
      {message}
    </p>
  )
}

async function lookupIndiaPost(pincode: string): Promise<IndiaPostLookupResult> {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    const data = (await response.json()) as Array<{
      Status?: string
      PostOffice?: Array<{ District?: string; State?: string }>
    }>

    if (data[0]?.Status !== 'Success' || !data[0]?.PostOffice?.length) {
      return { status: 'invalid' }
    }

    const office = data[0]?.PostOffice?.[0]
    if (!office) {
      return { status: 'invalid' }
    }

    return {
      status: 'resolved',
      city: office.District ?? '',
      state: office.State ?? '',
    }
  } catch {
    return { status: 'error' }
  }
}

function normalizeStateName(state: string) {
  const mapped = GOOGLE_STATE_MAP[state] ?? state
  return INDIAN_STATES.includes(mapped as (typeof INDIAN_STATES)[number]) ? mapped : ''
}

async function reverseGeocodeCoordinates(
  lat: number,
  lng: number,
  key: string,
): Promise<ReverseGeocodeResult | null> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`,
  )
  const data = (await response.json()) as {
    status?: string
    results?: Array<{
      formatted_address?: string
      address_components?: Array<{ long_name: string; types: string[] }>
    }>
  }

  if (data.status !== 'OK' || !data.results?.length) {
    return null
  }

  const primaryResult = data.results[0]
  if (!primaryResult) {
    return null
  }

  const components = primaryResult.address_components ?? []
  const getComponent = (type: string) =>
    components.find((component) => component.types.includes(type))?.long_name ?? ''

  const streetNumber = getComponent('street_number')
  const route = getComponent('route')
  const sublocality = getComponent('sublocality_level_1') || getComponent('sublocality')
  const locality = getComponent('locality')
  const district = getComponent('administrative_area_level_2')
  const adminState = getComponent('administrative_area_level_1')
  const postalCode = getComponent('postal_code')
  const firstLine =
    [streetNumber, route].filter(Boolean).join(' ') ||
    sublocality ||
    primaryResult.formatted_address?.split(',')[0] ||
    ''

  return {
    addressLine1: firstLine,
    addressLine2: sublocality || undefined,
    city: district || locality,
    state: adminState || undefined,
    pincode: postalCode || undefined,
  }
}
