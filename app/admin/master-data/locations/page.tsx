'use client'

import { MasterDataManager } from '@/components/ui/master-data-manager'
import { api } from '@/lib/api-client'

export default function LocationsPage() {
  return (
    <MasterDataManager
      title="Locations"
      description="Manage locations for candidate preferences."
      fetchItems={(s) => api.masterData.getLocations(s)}
      createItem={(name) => api.masterData.createLocation(name)}
      updateItem={(id, name) => api.masterData.updateLocation(id, name)}
      deleteItem={(id) => api.masterData.deleteLocation(id)}
    />
  )
}
