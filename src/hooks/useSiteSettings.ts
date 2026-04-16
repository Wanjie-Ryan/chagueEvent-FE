import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = Record<string, any>;

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings" as any)
        .select("setting_key, setting_value");
      if (error) throw error;
      const settings: SiteSettings = {};
      (data as any[])?.forEach((row: any) => {
        settings[row.setting_key] = row.setting_value;
      });
      return settings;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateSiteSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("site_settings" as any)
        .update({ setting_value: value, updated_at: new Date().toISOString() } as any)
        .eq("setting_key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
};
