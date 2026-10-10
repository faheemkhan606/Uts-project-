<?php

namespace App\Http\Requests\Settings;

use App\Models\SystemSetting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateSystemSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('settings.update') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'settings' => ['required', 'array'],
            'settings.*' => ['nullable'],
        ];
    }

    /**
     * Configure the validator instance with custom domain constraint logic.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $submitted = $this->input('settings', []);

            foreach ($submitted as $key => $value) {
                $setting = SystemSetting::where('key', $key)->first();
                if (! $setting) {
                    $v->errors()->add("settings.{$key}", "Unknown configuration setting key: {$key}");
                    continue;
                }

                // Type-specific domain validation
                if ($setting->type === 'integer') {
                    if (! is_numeric($value) || intval($value) != $value) {
                        $v->errors()->add("settings.{$key}", "The setting {$key} must be an integer.");
                    } else {
                        $intVal = (int) $value;
                        if ($key === 'security.session_lifetime_minutes' && ($intVal < 5 || $intVal > 1440)) {
                            $v->errors()->add("settings.{$key}", "Session lifetime must be between 5 and 1440 minutes.");
                        }
                        if ($key === 'security.max_login_attempts' && ($intVal < 1 || $intVal > 20)) {
                            $v->errors()->add("settings.{$key}", "Max login attempts must be between 1 and 20.");
                        }
                        if ($key === 'telematics.high_speed_threshold_kph' && ($intVal < 30 || $intVal > 200)) {
                            $v->errors()->add("settings.{$key}", "Speed alert threshold must be between 30 and 200 km/h.");
                        }
                        if ($key === 'telematics.gps_heartbeat_interval_sec' && ($intVal < 5 || $intVal > 600)) {
                            $v->errors()->add("settings.{$key}", "Heartbeat interval must be between 5 and 600 seconds.");
                        }
                        if ($key === 'audit.log_retention_days' && ($intVal < 30 || $intVal > 3650)) {
                            $v->errors()->add("settings.{$key}", "Audit log retention must be between 30 and 3650 days.");
                        }
                    }
                } elseif ($setting->type === 'boolean') {
                    if (! in_array($value, [true, false, 0, 1, '0', '1', 'true', 'false'], true)) {
                        $v->errors()->add("settings.{$key}", "The setting {$key} must be a boolean flag.");
                    }
                } elseif ($key === 'general.support_email' && ! filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $v->errors()->add("settings.{$key}", "The support email address must be a valid email format.");
                }
            }
        });
    }
}
