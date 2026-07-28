create or replace function public.submit_one11atl_public_form(
  p_table text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_ip text;
  v_metadata jsonb := coalesce(p_payload->'metadata', '{}'::jsonb);
begin
  if jsonb_typeof(p_payload) is distinct from 'object' then
    raise exception 'Invalid submission payload';
  end if;

  v_ip := nullif(left(trim(v_metadata->>'ip_address'), 100), '');

  if nullif(trim(p_payload->>'full_name'), '') is null then
    raise exception 'Full name is required';
  end if;

  if v_ip is not null then
    if p_table = 'leads' and (
      select count(*) from public.one11atl_leads
      where created_at > now() - interval '1 minute'
        and metadata->>'ip_address' = v_ip
    ) >= 5 then
      raise exception 'Too many submissions. Please wait and try again.';
    elsif p_table = 'bookings' and (
      select count(*) from public.one11atl_bookings
      where created_at > now() - interval '1 minute'
        and metadata->>'ip_address' = v_ip
    ) >= 5 then
      raise exception 'Too many submissions. Please wait and try again.';
    elsif p_table = 'host_applications' and (
      select count(*) from public.one11atl_host_applications
      where created_at > now() - interval '1 minute'
        and metadata->>'ip_address' = v_ip
    ) >= 5 then
      raise exception 'Too many submissions. Please wait and try again.';
    elsif p_table = 'ndas' and (
      select count(*) from public.one11atl_ndas
      where created_at > now() - interval '1 minute'
        and ip_address = v_ip
    ) >= 5 then
      raise exception 'Too many submissions. Please wait and try again.';
    end if;
  end if;

  case p_table
    when 'leads' then
      insert into public.one11atl_leads (
        full_name, phone, email, instagram, lead_type, event_interest,
        party_size, preferred_date, message, source, metadata
      ) values (
        left(p_payload->>'full_name', 200),
        nullif(left(p_payload->>'phone', 100), ''),
        nullif(left(p_payload->>'email', 320), ''),
        nullif(left(p_payload->>'instagram', 200), ''),
        coalesce(nullif(left(p_payload->>'lead_type', 100), ''), 'general'),
        nullif(left(p_payload->>'event_interest', 500), ''),
        nullif(p_payload->>'party_size', '')::integer,
        nullif(p_payload->>'preferred_date', '')::date,
        nullif(left(p_payload->>'message', 4000), ''),
        '111atl.com',
        v_metadata
      ) returning id into v_id;

    when 'bookings' then
      if nullif(trim(p_payload->>'phone'), '') is null then
        raise exception 'Phone is required';
      end if;
      insert into public.one11atl_bookings (
        booking_type, full_name, phone, email, instagram, preferred_date,
        party_size, budget, notes, source, metadata
      ) values (
        coalesce(nullif(left(p_payload->>'booking_type', 100), ''), 'event_rsvp'),
        left(p_payload->>'full_name', 200),
        left(p_payload->>'phone', 100),
        nullif(left(p_payload->>'email', 320), ''),
        nullif(left(p_payload->>'instagram', 200), ''),
        nullif(p_payload->>'preferred_date', '')::date,
        nullif(p_payload->>'party_size', '')::integer,
        nullif(left(p_payload->>'budget', 200), ''),
        nullif(left(p_payload->>'notes', 4000), ''),
        '111atl.com',
        v_metadata
      ) returning id into v_id;

    when 'host_applications' then
      if nullif(trim(p_payload->>'phone'), '') is null then
        raise exception 'Phone is required';
      end if;
      insert into public.one11atl_host_applications (
        full_name, phone, email, instagram, city, audience_size,
        role_interest, experience, source, metadata
      ) values (
        left(p_payload->>'full_name', 200),
        left(p_payload->>'phone', 100),
        nullif(left(p_payload->>'email', 320), ''),
        nullif(left(p_payload->>'instagram', 200), ''),
        coalesce(nullif(left(p_payload->>'city', 200), ''), 'Atlanta'),
        nullif(left(p_payload->>'audience_size', 100), ''),
        nullif(left(p_payload->>'role_interest', 500), ''),
        nullif(left(p_payload->>'experience', 4000), ''),
        '111atl.com',
        v_metadata
      ) returning id into v_id;

    when 'ndas' then
      if nullif(trim(p_payload->>'email'), '') is null
        or nullif(trim(p_payload->>'phone'), '') is null
        or nullif(trim(p_payload->>'signature_name'), '') is null
        or coalesce((p_payload->>'accepted_confidentiality')::boolean, false) is not true
        or coalesce((p_payload->>'accepted_non_compete_non_circumvention')::boolean, false) is not true
        or coalesce((p_payload->>'accepted_ip_terms')::boolean, false) is not true
        or coalesce((p_payload->>'accepted_full_agreement')::boolean, false) is not true then
        raise exception 'Complete all required agreement fields';
      end if;
      insert into public.one11atl_ndas (
        agreement_title, agreement_version, disclosing_party, full_name,
        title_entity, email, phone, instagram, role_interest, signature_name,
        accepted_confidentiality, accepted_non_compete_non_circumvention,
        accepted_ip_terms, accepted_full_agreement, signed_at, source,
        ip_address, user_agent, metadata
      ) values (
        'Non-Disclosure and Non-Compete Agreement',
        '111atl_nda_non_compete_2026_07',
        'Dr. Dolo Dorsey / The Kollective Hospitality Group',
        left(p_payload->>'full_name', 200),
        nullif(left(p_payload->>'title_entity', 300), ''),
        left(p_payload->>'email', 320),
        left(p_payload->>'phone', 100),
        nullif(left(p_payload->>'instagram', 200), ''),
        nullif(left(p_payload->>'role_interest', 500), ''),
        left(p_payload->>'signature_name', 200),
        true, true, true, true,
        now(),
        '111atl.com',
        v_ip,
        nullif(left(p_payload->>'user_agent', 1000), ''),
        v_metadata
      ) returning id into v_id;

    else
      raise exception 'Unsupported submission type';
  end case;

  return jsonb_build_object('id', v_id);
end;
$$;

revoke all on function public.submit_one11atl_public_form(text, jsonb) from public;
grant execute on function public.submit_one11atl_public_form(text, jsonb) to anon, service_role;
revoke execute on function public.submit_one11atl_public_form(text, jsonb) from authenticated;

revoke all on public.one11atl_leads from anon, authenticated;
revoke all on public.one11atl_bookings from anon, authenticated;
revoke all on public.one11atl_host_applications from anon, authenticated;
revoke all on public.one11atl_ndas from anon, authenticated;
