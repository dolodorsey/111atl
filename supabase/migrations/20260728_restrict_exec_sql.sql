revoke execute on function public.exec_sql(text) from public, anon, authenticated;
grant execute on function public.exec_sql(text) to service_role;
