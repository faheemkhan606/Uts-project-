<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('branches.update') ?? false;
    }

    public function rules(): array
    {
        $branch = $this->route('branch');
        $branchId = is_object($branch) ? $branch->id : $branch;
        $companyId = $this->input('company_id', is_object($branch) ? $branch->company_id : null);

        return [
            'company_id' => ['sometimes', 'required', 'integer', 'exists:companies,id'],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('branches', 'code')
                    ->where(fn ($query) => $query->where('company_id', $companyId))
                    ->ignore($branchId),
            ],
            'name' => ['sometimes', 'required', 'string', 'max:191'],
            'city' => ['sometimes', 'required', 'string', 'max:100'],
            'province' => ['sometimes', 'required', 'string', 'max:100'],
            'address' => ['sometimes', 'required', 'string'],
            'phone' => ['sometimes', 'required', 'string', 'max:50'],
            'manager_name' => ['sometimes', 'required', 'string', 'max:191'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
