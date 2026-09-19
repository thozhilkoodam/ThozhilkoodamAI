'use client'

import { MasterDataManager } from '@/components/ui/master-data-manager'
import { api } from '@/lib/api-client'

export default function IndustriesPage() {
  return (
    <MasterDataManager
      title="Industries"
      description="Manage industries for candidate preferences."
      fetchItems={(s) => api.masterData.getIndustries(s)}
      createItem={(name) => api.masterData.createIndustry(name)}
      updateItem={(id, name) => api.masterData.updateIndustry(id, name)}
      deleteItem={(id) => api.masterData.deleteIndustry(id)}
    />
  )
}
