<?php

namespace App\Http\Requests\Organization;

use App\Models\Branch;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('departments.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('departments', 'code')->where(fn ($query) => $query->where('company_id', $this->input('company_id'))),
            ],
            'name' => ['required', 'string', 'max:191'],
            'head_of_department' => ['required', 'string', 'max:191'],
            'employee_count' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $companyId = $this->input('company_id');
            $branchId = $this->input('branch_id');

            if ($branchId && $companyId) {
                $branch = Branch::find($branchId);
                if ($branch && $branch->company_id !== (int) $companyId) {
                    $validator->errors()->add('branch_id', 'The selected branch does not belong to the selected company.');
                }
            }
        });
    }
}
