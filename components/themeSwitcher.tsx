"use client";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
const ThemeSwitcher = () => {
  const { systemTheme, theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentTheme = theme === "system" ? systemTheme : theme;
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? (
    <Button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      type="button"
      variant={"outline"}
    >
      {currentTheme === "dark" ? <MoonIcon /> : <SunIcon />}
    </Button>
  ) : null;
};
export default ThemeSwitcher;
