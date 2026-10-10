<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('branches.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('branches', 'code')->where(fn ($query) => $query->where('company_id', $this->input('company_id'))),
            ],
            'name' => ['required', 'string', 'max:191'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'max:100'],
            'address' => ['required', 'string'],
            'phone' => ['required', 'string', 'max:50'],
            'manager_name' => ['required', 'string', 'max:191'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
