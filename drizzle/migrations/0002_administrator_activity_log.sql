CREATE TABLE public.admin_activity_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid, actor_name text NOT NULL, actor_email text NOT NULL DEFAULT '', action text NOT NULL, resource_type text NOT NULL, resource_id uuid NOT NULL, details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_activity_log TO authenticated;
GRANT SELECT,INSERT ON public.admin_activity_log TO service_role;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_activity_read ON public.admin_activity_log FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE INDEX admin_activity_time ON public.admin_activity_log(created_at DESC,id DESC);
CREATE FUNCTION public.capture_admin_activity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE actor uuid; label text; email_address text; resource uuid; verb text; payload jsonb;
BEGIN
 actor:=auth.uid();
 IF TG_TABLE_NAME='booking_events' THEN
  IF NEW.status NOT IN ('Approved','Rejected') THEN RETURN NEW; END IF;
  actor:=NEW.actor_id; resource:=NEW.booking_id; verb:='booking.'||lower(NEW.status); payload:=jsonb_build_object('previous_status',NEW.previous_status,'status',NEW.status,'reference',(SELECT reference FROM public.bookings WHERE id=NEW.booking_id));
 ELSE
  resource:=coalesce(NEW.id,OLD.id); verb:=TG_TABLE_NAME||'.'||lower(TG_OP);
  IF TG_TABLE_NAME='user_roles' THEN payload:=jsonb_build_object('user_id',coalesce(NEW.user_id,OLD.user_id),'role',coalesce(NEW.role,OLD.role));
  ELSE payload:=jsonb_build_object('before',CASE WHEN TG_OP='INSERT' THEN NULL ELSE to_jsonb(OLD) END,'after',CASE WHEN TG_OP='DELETE' THEN NULL ELSE to_jsonb(NEW) END); END IF;
 END IF;
 SELECT coalesce(nullif(p.display_name,''),u.email,'Administrator'),coalesce(u.email,'') INTO label,email_address FROM auth.users u LEFT JOIN public.profiles p ON p.id=u.id WHERE u.id=actor;
 INSERT INTO public.admin_activity_log(actor_id,actor_name,actor_email,action,resource_type,resource_id,details) VALUES(actor,coalesce(label,'System / managed operation'),coalesce(email_address,''),verb,CASE WHEN TG_TABLE_NAME='booking_events' THEN 'bookings' ELSE TG_TABLE_NAME END,resource,payload);
 RETURN coalesce(NEW,OLD);
END; $$;
REVOKE ALL ON FUNCTION public.capture_admin_activity() FROM PUBLIC;
CREATE TRIGGER log_admin_booking AFTER INSERT ON public.booking_events FOR EACH ROW EXECUTE FUNCTION public.capture_admin_activity();
CREATE TRIGGER log_admin_prices AFTER INSERT OR UPDATE OR DELETE ON public.destination_prices FOR EACH ROW EXECUTE FUNCTION public.capture_admin_activity();
CREATE TRIGGER log_admin_roles AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.capture_admin_activity();
INSERT INTO public.admin_activity_log(actor_id,actor_name,actor_email,action,resource_type,resource_id,details,created_at) SELECT e.actor_id,coalesce(nullif(p.display_name,''),u.email,'Administrator'),coalesce(u.email,''),'booking.'||lower(e.status),'bookings',e.booking_id,jsonb_build_object('previous_status',e.previous_status,'status',e.status,'reference',b.reference),e.created_at FROM public.booking_events e JOIN public.bookings b ON b.id=e.booking_id LEFT JOIN auth.users u ON u.id=e.actor_id LEFT JOIN public.profiles p ON p.id=e.actor_id WHERE e.status IN ('Approved','Rejected');
CREATE FUNCTION public.admin_log_immutable() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN RAISE EXCEPTION 'Administrator activity records cannot be changed or deleted'; END; $$;
CREATE TRIGGER admin_log_immutable BEFORE UPDATE OR DELETE ON public.admin_activity_log FOR EACH ROW EXECUTE FUNCTION public.admin_log_immutable();