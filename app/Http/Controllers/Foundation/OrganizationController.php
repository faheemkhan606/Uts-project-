<?php

namespace App\Http\Controllers\Foundation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\AssignUserOrganizationRequest;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Foundation\OrganizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    /**
     * Display organizational structure overview.
     */
    public function index(Request $request): Response
    {
        abort_unless(
            $request->user()?->can('companies.view') || $request->user()?->can('branches.view'),
            403,
            'Unauthorized access to Organization Foundation.'
        );

        $companies = Company::with(['branches.warehouses', 'departments'])->get();
        $user = $request->user()?->load(['company', 'branch', 'department']);

        return Inertia::render('Organization/Index', [
            'companies' => $companies,
            'userOrganization' => [
                'scope' => $user?->getOrganizationScope(),
                'company' => $user?->company,
                'branch' => $user?->branch,
                'department' => $user?->department,
            ],
        ]);
    }

    /**
     * Assign organization for a user with integrity verification.
     */
    public function assignUser(
        AssignUserOrganizationRequest $request,
        User $user,
        OrganizationService $service
    ): JsonResponse {
        $updatedUser = $service->assignUserOrganization(
            user: $user,
            companyId: $request->input('company_id'),
            branchId: $request->input('branch_id'),
            departmentId: $request->input('department_id'),
            actor: $request->user()
        );

        return response()->json([
            'message' => 'User organization assignment updated successfully.',
            'user' => [
                'id' => $updatedUser->id,
                'name' => $updatedUser->name,
                'scope' => $updatedUser->getOrganizationScope(),
                'company' => $updatedUser->company?->only('id', 'legal_name'),
                'branch' => $updatedUser->branch?->only('id', 'code', 'name'),
                'department' => $updatedUser->department?->only('id', 'code', 'name'),
            ],
        ]);
    }
}
