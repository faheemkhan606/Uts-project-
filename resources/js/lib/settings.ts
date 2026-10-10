export interface PublicSettings {
    'general.app_name'?: string;
    'general.company_trade_name'?: string;
    'general.support_email'?: string;
    'general.emergency_noc_hotline'?: string;
    'general.maintenance_mode'?: boolean;
    'localization.default_country'?: string;
    'localization.default_currency'?: string;
    'localization.currency_symbol'?: string;
    'localization.default_timezone'?: string;
    'localization.date_format'?: string;
    'localization.time_format'?: string;
    'notifications.enable_in_app_alerts'?: boolean;
    [key: string]: string | number | boolean | null | undefined;
}

export interface SystemSettingItem {
    id: number;
    group: string;
    key: string;
    value: string | number | boolean | null;
    type: 'string' | 'integer' | 'float' | 'boolean' | 'json' | 'encrypted';
    description: string | null;
    is_public: boolean;
    is_system: boolean;
    is_encrypted: boolean;
}

/**
 * Access public setting with fallback default
 */
export function getSetting<T = any>(
    settings: Record<string, any> | undefined,
    key: string,
    defaultValue: T
): T {
    if (!settings || settings[key] === undefined || settings[key] === null) {
        return defaultValue;
    }
    return settings[key] as T;
}
