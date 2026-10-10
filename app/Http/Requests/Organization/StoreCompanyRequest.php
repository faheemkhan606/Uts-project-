<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('companies.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'legal_name' => ['required', 'string', 'max:191'],
            'trade_name' => ['nullable', 'string', 'max:191'],
            'ntn' => ['nullable', 'string', 'max:50', 'unique:companies,ntn'],
            'strn' => ['nullable', 'string', 'max:50'],
            'incorporation_no' => ['nullable', 'string', 'max:50'],
            'head_office_address' => ['required', 'string'],
            'city' => ['required', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'primary_phone' => ['required', 'string', 'max:50'],
            'emergency_noc_phone' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:191'],
            'website' => ['nullable', 'string', 'max:191'],
            'currency' => ['nullable', 'string', 'max:10'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
