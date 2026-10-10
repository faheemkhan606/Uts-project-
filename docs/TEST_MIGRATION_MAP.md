# VALS Tracking Enterprise Platform — Test Migration Map

This document establishes the 1:1 mapping between the 28 passing prototype tests in `tests/run-tests.ts` and their corresponding Laravel PHPUnit/Pest test classes.

---

## Mapping Table

| Prototype Test (tests/run-tests.ts) | Target Laravel Test Class | Method Name | Status in Laravel |
|---|---|---|---|
| 01. CUS sequence format | `Tests\Unit\SequenceServiceTest` | `test_generates_valid_customer_sequence` | Prepared |
| 02. VEH sequence format | `Tests\Unit\SequenceServiceTest` | `test_generates_valid_vehicle_sequence` | Prepared |
| 03. DEV sequence format | `Tests\Unit\SequenceServiceTest` | `test_generates_valid_device_sequence` | Prepared |
| 04. SIM sequence format | `Tests\Unit\SequenceServiceTest` | `test_generates_valid_sim_sequence` | Prepared |
| 05. Foundation branches | `Tests\Feature\FoundationTest` | `test_branches_seeded_with_khi_lhe_isb_rwp` | Scheduled Step 04 |
| 06. Central/regional warehouses | `Tests\Feature\FoundationTest` | `test_warehouses_initialized` | Scheduled Step 04 |
| 07. Corporate customer schema | `Tests\Feature\CustomerTest` | `test_corporate_customer_schema` | Scheduled Step 04 |
| 08. Customer Active status | `Tests\Feature\CustomerTest` | `test_customer_status_active` | Scheduled Step 04 |
| 09. Credit limit validation | `Tests\Feature\CustomerTest` | `test_credit_limit_enforced` | Scheduled Step 04 |
| 10. Vehicle registration | `Tests\Feature\VehicleTest` | `test_vehicle_registration` | Scheduled Step 05 |
| 11. Concox GT06 assigned | `Tests\Feature\VehicleTest` | `test_device_assigned_to_vehicle` | Scheduled Step 05 |
| 12. SIM assigned | `Tests\Feature\VehicleTest` | `test_sim_assigned_to_vehicle` | Scheduled Step 05 |
| 13. Historical assignment exists | `Tests\Feature\AssignmentHistoryTest`| `test_historical_assignment_recorded` | Scheduled Step 06 |
| 14. Assignment traceability | `Tests\Feature\AssignmentHistoryTest`| `test_assignment_retains_technician_reason` | Scheduled Step 06 |
| 15. GT06 packet decodes | `Tests\Unit\Gt06DecoderTest` | `test_decodes_standard_gt06_gps_packet` | **Created** |
| 16. GT06 protocol verified | `Tests\Unit\Gt06DecoderTest` | `test_decodes_standard_gt06_gps_packet` | **Created** |
| 17. GT06 coordinates math | `Tests\Unit\Gt06DecoderTest` | `test_decodes_standard_gt06_gps_packet` | **Created** |
| 18. Teltonika packet decodes | `Tests\Unit\TeltonikaDecoderTest` | `test_decodes_teltonika_codec_8_packet` | **Created** |
| 19. Teltonika protocol verified | `Tests\Unit\TeltonikaDecoderTest` | `test_decodes_teltonika_codec_8_packet` | **Created** |
| 20. Vehicle speed updated | `Tests\Feature\TelemetryProcessorTest`| `test_vehicle_speed_state_updated` | Scheduled Step 07 |
| 21. Overspeed alert triggered | `Tests\Feature\TelemetryProcessorTest`| `test_overspeed_alert_triggered` | Scheduled Step 07 |
| 22. Valid stock deduction | `Tests\Unit\StockTransactionTest` | `test_valid_stock_issue_decrements_balance` | **Created** |
| 23. Stock balance decrements | `Tests\Unit\StockTransactionTest` | `test_valid_stock_issue_decrements_balance` | **Created** |
| 24. Negative balance rejected | `Tests\Unit\StockTransactionTest` | `test_negative_stock_balance_is_rejected` | **Created** |
| 25. Installation order exists | `Tests\Feature\InstallationTest` | `test_installation_order_lifecycle` | Scheduled Step 08 |
| 26. Installation OTP verified | `Tests\Feature\InstallationTest` | `test_installation_otp_verification` | Scheduled Step 08 |
| 27. Audit trail records | `Tests\Feature\AuditLogTest` | `test_audit_entry_recorded` | Scheduled Step 09 |
| 28. Audit metadata integrity | `Tests\Feature\AuditLogTest` | `test_audit_metadata_integrity` | Scheduled Step 09 |

---

## Testing Protocol

Prototype tests are executed via:
```bash
npm test
```
Laravel tests will be executed on the target host via:
```bash
php artisan test
```
Both suites must report 100% PASS before the prototype is deprecated.
