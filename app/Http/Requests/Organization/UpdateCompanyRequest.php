<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('companies.update') ?? false;
    }

    public function rules(): array
    {
        $companyId = $this->route('company')?->id ?? $this->route('company');

        return [
            'legal_name' => ['sometimes', 'required', 'string', 'max:191'],
            'trade_name' => ['nullable', 'string', 'max:191'],
            'ntn' => ['nullable', 'string', 'max:50', Rule::unique('companies', 'ntn')->ignore($companyId)],
            'strn' => ['nullable', 'string', 'max:50'],
            'incorporation_no' => ['nullable', 'string', 'max:50'],
            'head_office_address' => ['sometimes', 'required', 'string'],
            'city' => ['sometimes', 'required', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'primary_phone' => ['sometimes', 'required', 'string', 'max:50'],
            'emergency_noc_phone' => ['nullable', 'string', 'max:50'],
            'email' => ['sometimes', 'required', 'email', 'max:191'],
            'website' => ['nullable', 'string', 'max:191'],
            'currency' => ['nullable', 'string', 'max:10'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
