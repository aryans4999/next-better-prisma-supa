import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ThemeSwitcher from "@/components/themeSwitcher";

const SiteHeader = () => {
  return (
    <div className="w-full border-b flex items-center justify-between p-4">
      <div className="flex gap-4">
        <SidebarTrigger />
        <Separator orientation="vertical" />
      </div>
      <ThemeSwitcher />
    </div>
  );
};

export default SiteHeader;
