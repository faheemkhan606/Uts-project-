<?php

namespace App\Http\Requests\Organization;

use App\Models\Branch;
use App\Models\Department;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('departments.update') ?? false;
    }

    public function rules(): array
    {
        $dept = $this->route('department');
        $deptId = is_object($dept) ? $dept->id : $dept;
        $companyId = $this->input('company_id', is_object($dept) ? $dept->company_id : null);

        return [
            'company_id' => ['sometimes', 'required', 'integer', 'exists:companies,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('departments', 'code')
                    ->where(fn ($query) => $query->where('company_id', $companyId))
                    ->ignore($deptId),
            ],
            'name' => ['sometimes', 'required', 'string', 'max:191'],
            'head_of_department' => ['sometimes', 'required', 'string', 'max:191'],
            'employee_count' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $dept = $this->route('department');
            $deptModel = is_object($dept) ? $dept : Department::find($dept);

            $companyId = $this->input('company_id', $deptModel?->company_id);
            $branchId = $this->has('branch_id') ? $this->input('branch_id') : $deptModel?->branch_id;

            if ($branchId && $companyId) {
                $branch = Branch::find($branchId);
                if ($branch && $branch->company_id !== (int) $companyId) {
                    $validator->errors()->add('branch_id', 'The selected branch does not belong to the selected company.');
                }
            }
        });
    }
}
