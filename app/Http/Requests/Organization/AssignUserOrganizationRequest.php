<?php

namespace App\Http\Requests\Organization;

use App\Services\Foundation\OrganizationService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class AssignUserOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('users.organization.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $companyId = $this->input('company_id');
            $branchId = $this->input('branch_id');
            $departmentId = $this->input('department_id');

            try {
                /** @var OrganizationService $orgService */
                $orgService = app(OrganizationService::class);
                $orgService->validateHierarchy(
                    $companyId ? (int) $companyId : null,
                    $branchId ? (int) $branchId : null,
                    $departmentId ? (int) $departmentId : null
                );
            } catch (\Illuminate\Validation\ValidationException $e) {
                foreach ($e->errors() as $field => $messages) {
                    foreach ($messages as $msg) {
                        $validator->errors()->add($field, $msg);
                    }
                }
            }
        });
    }
}
