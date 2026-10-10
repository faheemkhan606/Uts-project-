<?php

namespace App\Http\Requests\Customer;

use App\Enums\CustomerStatus;
use App\Enums\CustomerType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->isActive() && $this->user()->can('customers.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'customer_type' => ['required', Rule::enum(CustomerType::class)],
            'legal_name' => ['required', 'string', 'max:191'],
            'trade_name' => ['nullable', 'string', 'max:191'],
            'display_name' => ['nullable', 'string', 'max:191'],
            'status' => ['nullable', Rule::enum(CustomerStatus::class)],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:191'],
            'cnic' => ['nullable', 'string', 'max:50'],
            'ntn' => ['nullable', 'string', 'max:50'],
            'strn' => ['nullable', 'string', 'max:50'],
            'website' => ['nullable', 'url', 'max:191'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'payment_terms' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Custom attribute names for validation errors.
     */
    public function attributes(): array
    {
        return [
            'company_id' => 'enterprise company',
            'branch_id' => 'servicing branch',
            'customer_type' => 'customer type',
            'legal_name' => 'legal entity name',
            'trade_name' => 'trade name (DBA)',
            'cnic' => 'CNIC / National Identity Number',
            'ntn' => 'National Tax Number (NTN)',
            'strn' => 'Sales Tax Registration (STRN)',
        ];
    }
}
