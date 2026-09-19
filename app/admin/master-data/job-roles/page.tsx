'use client'

import { MasterDataManager } from '@/components/ui/master-data-manager'
import { api } from '@/lib/api-client'

export default function JobRolesPage() {
  return (
    <MasterDataManager
      title="Job Roles"
      description="Manage job roles for candidate preferences."
      fetchItems={(s) => api.masterData.getJobRoles(s)}
      createItem={(name) => api.masterData.createJobRole(name)}
      updateItem={(id, name) => api.masterData.updateJobRole(id, name)}
      deleteItem={(id) => api.masterData.deleteJobRole(id)}
    />
  )
}
