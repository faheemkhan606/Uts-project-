<?php

namespace App\Http\Requests\Customer;

use App\Enums\CustomerStatus;
use App\Enums\CustomerType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $customer = $this->route('customer');
        return $this->user() !== null
            && $this->user()->isActive()
            && ($customer ? $this->user()->can('update', $customer) : $this->user()->can('customers.update'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'branch_id' => ['sometimes', 'integer', 'exists:branches,id'],
            'customer_type' => ['sometimes', Rule::enum(CustomerType::class)],
            'legal_name' => ['sometimes', 'string', 'max:191'],
            'trade_name' => ['nullable', 'string', 'max:191'],
            'display_name' => ['nullable', 'string', 'max:191'],
            'status' => ['sometimes', Rule::enum(CustomerStatus::class)],
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
}
