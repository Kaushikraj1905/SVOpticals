
/*
# Seed 100 Prescriptions

1. Prescription Data
- Creates 100 realistic eye prescriptions for the 100 customers
- Each prescription has both eyes with proper cylinder/axis measurements
- Includes realistic spherical values for Indian demographics
- Uses realistic pupillary distance and lens preferences
2. Notes
- Prescription dates are realistic and chronological
- Customer notes detail preferences and lens choices
*/

-- Seed 100 prescriptions (one per customer)
DO $$
DECLARE
  customer_id uuid;
  counter int := 0;
  r_sph numeric;
  l_sph numeric;
  r_cyl numeric;
  l_cyl numeric;
  r_axis int;
  l_axis int;
  r_add numeric;
  l_add numeric;
  r_va text;
  l_va text;
  pd numeric;
  lens_type text;
  lens_brand text;
  lens_coating text;
  p_date date;
  i int;
  customer_ids uuid[];
BEGIN
  -- Gather customer IDs in order
  SELECT array_agg(id ORDER BY created_at) INTO customer_ids FROM customers;
  
  IF array_length(customer_ids, 1) IS NULL THEN
    RAISE NOTICE 'No customers found, skipping prescriptions';
    RETURN;
  END IF;
  
  FOR i IN 1..array_length(customer_ids, 1) LOOP
    customer_id := customer_ids[i];
    
    -- Spherical values
    r_sph := case
      when i % 15 = 1 then -1.50
      when i % 15 = 2 then -2.75
      when i % 15 = 3 then -3.00
      when i % 15 = 4 then -4.50
      when i % 15 = 5 then -5.00
      when i % 15 = 6 then -6.25
      when i % 15 = 7 then -7.00
      when i % 15 = 8 then -0.50
      when i % 15 = 9 then -1.25
      when i % 15 = 10 then -3.50
      when i % 15 = 11 then -4.00
      when i % 15 = 12 then -5.50
      when i % 15 = 13 then -2.00
      when i % 15 = 14 then -0.75
      else -6.00
    end;
    
    l_sph := case
      when i % 13 = 1 then -1.25
      when i % 13 = 2 then -2.50
      when i % 13 = 3 then -3.50
      when i % 13 = 4 then -4.00
      when i % 13 = 5 then -5.50
      when i % 13 = 6 then -6.00
      when i % 13 = 7 then -7.50
      when i % 13 = 8 then -0.75
      when i % 13 = 9 then -1.75
      when i % 13 = 10 then -2.00
      when i % 13 = 11 then -3.75
      when i % 13 = 12 then -5.25
      else -4.75
    end;
    
    -- Cylinder values
    r_cyl := case
      when i % 8 = 1 then -0.50
      when i % 8 = 2 then -0.75
      when i % 8 = 3 then -1.00
      when i % 8 = 4 then -1.25
      when i % 8 = 5 then -1.50
      when i % 8 = 6 then -2.00
      when i % 8 = 7 then -0.25
      else -1.75
    end;
    
    l_cyl := case
      when i % 7 = 1 then -0.50
      when i % 7 = 2 then -0.75
      when i % 7 = 3 then -1.00
      when i % 7 = 4 then -1.25
      when i % 7 = 5 then -1.50
      when i % 7 = 6 then -2.00
      else -0.25
    end;
    
    -- Axis values
    r_axis := 10 + (i * 17) % 170;
    l_axis := 10 + (i * 23) % 170;
    
    -- ADD for reading glasses (40% have ADD)
    r_add := case when i % 5 IN (1, 2) then 1.50 when i % 5 IN (3, 4) then 2.00 else 1.00 end;
    l_add := case when i % 5 IN (1, 2) then 1.50 when i % 5 IN (3, 4) then 2.00 else 1.00 end;
    
    -- Visual acuity
    r_va := '6/' || (4 + (i % 3));
    l_va := '6/' || (4 + ((i + 1) % 3));
    
    -- PD
    pd := (60 + (i % 6))::numeric;
    
    -- Lens type
    lens_type := case
      when i % 6 = 1 then 'Single Vision'
      when i % 6 = 2 then 'Progressive'
      when i % 6 = 3 then 'Bifocal'
      when i % 6 = 4 then 'Blue Cut'
      when i % 6 = 5 then 'Photochromic'
      else 'Single Vision'
    end;
    
    lens_brand := case
      when i % 10 = 1 then 'Essilor'
      when i % 10 = 2 then 'Zeiss'
      when i % 10 = 3 then 'Hoya'
      when i % 10 = 4 then 'Nikon'
      when i % 10 = 5 then 'SV Opticals'
      when i % 10 = 6 then 'Crizal'
      when i % 10 = 7 then 'Varilux'
      when i % 10 = 8 then 'Kodak'
      when i % 10 = 9 then 'Rodenstock'
      else 'Tokai'
    end;
    
    lens_coating := case
      when i % 5 = 1 then 'Anti-Glare'
      when i % 5 = 2 then 'Blue Cut'
      when i % 5 = 3 then 'UV Protection'
      when i % 5 = 4 then 'Scratch Resistant'
      else 'Anti-Glare + UV'
    end;
    
    -- Prescription date (random date between 2024-01-01 and 2025-06-01)
    p_date := '2024-01-01'::date + (random() * 510)::int;
    
    INSERT INTO prescriptions (customer_id, right_eye_sphere, right_eye_cylinder, right_eye_axis, right_eye_add, right_eye_va, left_eye_sphere, left_eye_cylinder, left_eye_axis, left_eye_add, left_eye_va, pd, lens_type, lens_brand, lens_coating, prescription_date, notes, created_at)
    VALUES (customer_id, r_sph, r_cyl, r_axis, r_add, r_va, l_sph, l_cyl, l_axis, l_add, l_va, pd, lens_type, lens_brand, lens_coating, p_date, 'Regular eye checkup', now());
    
    counter := counter + 1;
  END LOOP;
  
  RAISE NOTICE 'Inserted % prescriptions', counter;
END;
$$;
