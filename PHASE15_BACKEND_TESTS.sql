-- Phase 15 backend tests
select smart_workflow_engine('X15 water pump', null, 'Cummins X15');
select extract_vin_from_text('VIN 1XPBD49X1JD123456 UNIT 54');
select extract_part_numbers_from_text('Fleetguard LF14000NN Baldwin BF46129 PACCAR 2129791PE Qty 1', null, 'parts_photo');
select find_part_suppliers('LF14000NN');
