<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class StoreWarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('warehouses.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'code' => ['required', 'string', 'max:50', 'unique:warehouses,code'],
            'name' => ['required', 'string', 'max:191'],
            'location' => ['required', 'string'],
            'capacity' => ['nullable', 'string', 'max:100'],
            'manager_name' => ['required', 'string', 'max:191'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
