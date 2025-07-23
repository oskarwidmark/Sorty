import { Drawer } from '@mui/material';

interface SideDrawerProps {
  areSettingsOpen: boolean;
  toggleDisplaySettings: () => void;
  children?: React.ReactNode;
}

export function SideDrawer({ areSettingsOpen, children }: SideDrawerProps) {
  return (
    <Drawer
      variant="persistent"
      anchor="right"
      className="drawer"
      open={areSettingsOpen}
      PaperProps={{
        sx: { width: '250px' },
      }}
    >
      {children}
    </Drawer>
  );
}
