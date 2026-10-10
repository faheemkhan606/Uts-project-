<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('warehouses.update') ?? false;
    }

    public function rules(): array
    {
        $warehouse = $this->route('warehouse');
        $whId = is_object($warehouse) ? $warehouse->id : $warehouse;

        return [
            'branch_id' => ['sometimes', 'required', 'integer', 'exists:branches,id'],
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('warehouses', 'code')->ignore($whId)],
            'name' => ['sometimes', 'required', 'string', 'max:191'],
            'location' => ['sometimes', 'required', 'string'],
            'capacity' => ['nullable', 'string', 'max:100'],
            'manager_name' => ['sometimes', 'required', 'string', 'max:191'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
