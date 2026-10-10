import React from 'react';
import { useAuthorization } from '../../lib/authorization';
import { Building2, GitBranch, Briefcase, Warehouse as WhIcon, ShieldCheck, ArrowLeft } from 'lucide-react';

interface WarehouseData {
  id: number;
  code: string;
  name: string;
  location: string;
  capacity?: string;
  is_active: boolean;
}

interface BranchData {
  id: number;
  code: string;
  name: string;
  city: string;
  manager_name: string;
  is_active: boolean;
  warehouses: WarehouseData[];
}

interface DepartmentData {
  id: number;
  code: string;
  name: string;
  head_of_department: string;
  is_active: boolean;
}

interface CompanyData {
  id: number;
  legal_name: string;
  trade_name?: string;
  ntn?: string;
  strn?: string;
  city: string;
  currency: string;
  is_active: boolean;
  branches: BranchData[];
  departments: DepartmentData[];
}

interface UserOrgData {
  scope: string;
  company?: { id: number; legal_name: string } | null;
  branch?: { id: number; code: string; name: string } | null;
  department?: { id: number; code: string; name: string } | null;
}

interface Props {
  companies: CompanyData[];
  userOrganization: UserOrgData;
}

export default function OrganizationIndex({ companies, userOrganization }: Props) {
  const { user, isSuperAdmin } = useAuthorization();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                PHASE 01 · STEP 05
              </span>
              <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                Normalized Hierarchy
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              Organization Foundation
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Multi-tiered enterprise structure: Company → Branch → Department / Warehouse
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Operations Dashboard
            </a>
          </div>
        </div>

        {/* Current User Scope Banner */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                  Authenticated User Scope Context
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff: <span className="font-semibold text-slate-800">{user?.name}</span> ({user?.email})
              </p>
            </div>
            <div className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 font-bold">
              SCOPE: {userOrganization.scope.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-400 uppercase tracking-wider block font-mono text-[10px]">
                Assigned Company
              </span>
              <span className="font-medium text-slate-800 mt-1 block">
                {userOrganization.company?.legal_name ?? (isSuperAdmin() ? 'Global / All Companies' : 'Unassigned')}
              </span>
            </div>
            <div className="p-3 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-400 uppercase tracking-wider block font-mono text-[10px]">
                Assigned Branch
              </span>
              <span className="font-medium text-slate-800 mt-1 block">
                {userOrganization.branch ? `${userOrganization.branch.code} — ${userOrganization.branch.name}` : (isSuperAdmin() ? 'Global / All Branches' : 'Unassigned')}
              </span>
            </div>
            <div className="p-3 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-400 uppercase tracking-wider block font-mono text-[10px]">
                Assigned Department
              </span>
              <span className="font-medium text-slate-800 mt-1 block">
                {userOrganization.department ? `${userOrganization.department.code} — ${userOrganization.department.name}` : (isSuperAdmin() ? 'Global / All Departments' : 'Unassigned')}
              </span>
            </div>
          </div>
        </div>

        {/* Company Hierarchy Cards */}
        <div className="space-y-6">
          {companies.map((company) => (
            <div key={company.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
              {/* Company Level */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{company.legal_name}</h2>
                    <div className="flex items-center gap-3 font-mono text-xs text-slate-500 mt-0.5">
                      <span>NTN: {company.ntn ?? 'N/A'}</span>
                      <span>·</span>
                      <span>City: {company.city}</span>
                      <span>·</span>
                      <span>Currency: {company.currency}</span>
                    </div>
                  </div>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {company.is_active ? 'ACTIVE ENTITY' : 'INACTIVE'}
                </span>
              </div>

              {/* Branches Grid */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Regional Branches ({company.branches?.length ?? 0})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {company.branches?.map((branch) => (
                    <div key={branch.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {branch.code}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {branch.city}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{branch.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Manager: {branch.manager_name}</p>
                      </div>

                      {/* Warehouses under this branch */}
                      {branch.warehouses && branch.warehouses.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                            Warehouses ({branch.warehouses.length})
                          </span>
                          <div className="space-y-1">
                            {branch.warehouses.map((wh) => (
                              <div key={wh.id} className="flex items-center justify-between text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200">
                                <span className="flex items-center gap-1.5 text-slate-700">
                                  <WhIcon className="w-3 h-3 text-amber-600" />
                                  {wh.code}
                                </span>
                                <span className="text-slate-400 text-[10px] truncate max-w-[120px]">{wh.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Departments Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Operating Departments ({company.departments?.length ?? 0})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {company.departments?.map((dept) => (
                    <div key={dept.id} className="p-3 rounded bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-slate-800">{dept.code}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                          DEPT
                        </span>
                      </div>
                      <p className="font-medium text-slate-800">{dept.name}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Lead: {dept.head_of_department}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
