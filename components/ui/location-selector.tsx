'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { api } from '@/lib/api-client'

export interface LocationOption {
  id: number
  name: string
}

interface LocationSelectorProps {
  countryId?: number | null
  stateId?: number | null
  districtId?: number | null
  cityId?: number | null
  onChange: (values: { countryId?: number | null; stateId?: number | null; districtId?: number | null; cityId?: number | null }) => void
  required?: boolean
  hideCountry?: boolean
  className?: string
}

export function LocationSelector({
  countryId,
  stateId,
  districtId,
  cityId,
  onChange,
  required,
  hideCountry,
  className = '',
}: LocationSelectorProps) {
  const [countries, setCountries] = useState<LocationOption[]>([])
  const [states, setStates] = useState<LocationOption[]>([])
  const [districts, setDistricts] = useState<LocationOption[]>([])
  const [cities, setCities] = useState<LocationOption[]>([])

  const [loadingCountries, setLoadingCountries] = useState(false)
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)

  useEffect(() => {
    setLoadingCountries(true)
    api.locations.getCountries().then(res => {
      if (res) setCountries(res)
      setLoadingCountries(false)
    })
  }, [])

  useEffect(() => {
    console.log('[LocationSelector] countryId changed:', countryId)
    if (!countryId) {
      setStates([])
      setDistricts([])
      setCities([])
      return
    }
    setLoadingStates(true)
    setStates([])
    setDistricts([])
    setCities([])
    api.locations.getStates(countryId).then(res => {
      if (res) setStates(res)
      setLoadingStates(false)
    })
  }, [countryId])

  useEffect(() => {
    console.log('[LocationSelector] stateId changed:', stateId)
    if (!stateId) {
      setDistricts([])
      setCities([])
      return
    }
    setLoadingDistricts(true)
    setDistricts([])
    setCities([])
    api.locations.getDistricts(stateId).then(res => {
      console.log('[LocationSelector] Districts loaded:', res?.length ?? 0)
      if (res) setDistricts(res)
      setLoadingDistricts(false)
    }).catch(e => {
      console.error('[LocationSelector] Districts fetch error:', e)
      setLoadingDistricts(false)
    })
  }, [stateId])

  useEffect(() => {
    console.log('[LocationSelector] districtId changed:', districtId)
    if (!districtId) {
      setCities([])
      return
    }
    setLoadingCities(true)
    setCities([])
    console.log('[LocationSelector] Fetching cities for district:', districtId)
    api.locations.getCities(districtId).then(res => {
      console.log('[LocationSelector] Cities API Response:', res)
      console.log('[LocationSelector] Cities Count:', res?.length ?? 0)
      if (res) setCities(res)
      setLoadingCities(false)
    }).catch(e => {
      console.error('[LocationSelector] Cities fetch error:', e)
      setLoadingCities(false)
    })
  }, [districtId])

  function onCountryChange(v: string) {
    const id = Number(v)
    console.log('[LocationSelector] Country selected:', id)
    onChange({ countryId: id, stateId: null, districtId: null, cityId: null })
  }

  function onStateChange(v: string) {
    const id = Number(v)
    console.log('[LocationSelector] State selected:', id, 'countryId:', countryId)
    onChange({ countryId, stateId: id, districtId: null, cityId: null })
  }

  function onDistrictChange(v: string) {
    const id = Number(v)
    console.log('[LocationSelector] District selected:', id, 'stateId:', stateId)
    onChange({ countryId, stateId, districtId: id, cityId: null })
  }

  function onCityChange(v: string) {
    const id = Number(v)
    console.log('[LocationSelector] City selected:', id, 'districtId:', districtId)
    onChange({ countryId, stateId, districtId, cityId: id })
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Location {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {!hideCountry && (
          <Select
            value={countryId ? String(countryId) : ''}
            onValueChange={onCountryChange}
          >
            <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder={loadingCountries ? 'Loading...' : 'Country'} />
            </SelectTrigger>
            <SelectContent>
              {countries.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={stateId ? String(stateId) : ''}
          onValueChange={onStateChange}
          disabled={!countryId}
        >
          <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder={loadingStates ? 'Loading...' : 'State'} />
          </SelectTrigger>
          <SelectContent>
            {states.length === 0 && !loadingStates && (
              <div className="px-3 py-2 text-sm text-gray-500">No states found</div>
            )}
            {states.map(s => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={districtId ? String(districtId) : ''}
          onValueChange={onDistrictChange}
          disabled={!stateId}
        >
          <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder={loadingDistricts ? 'Loading...' : 'District'} />
          </SelectTrigger>
          <SelectContent>
            {districts.length === 0 && !loadingDistricts && (
              <div className="px-3 py-2 text-sm text-gray-500">No districts found</div>
            )}
            {districts.map(d => (
              <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={cityId ? String(cityId) : ''}
          onValueChange={onCityChange}
          disabled={!districtId}
        >
          <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder={loadingCities ? 'Loading...' : 'Select City'} />
          </SelectTrigger>
          <SelectContent>
            {cities.length === 0 && !loadingCities && (
              <div className="px-3 py-2 text-sm text-gray-500">No cities available</div>
            )}
            {cities.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
