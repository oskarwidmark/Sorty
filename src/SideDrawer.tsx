import { Drawer, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface SideDrawerProps {
  areSettingsOpen: boolean;
  toggleDisplaySettings: () => void;
  children?: React.ReactNode;
}

export function SideDrawer({
  toggleDisplaySettings,
  areSettingsOpen,
  children,
}: SideDrawerProps) {
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
      <div className="chevron-wrapper">
        <IconButton onClick={toggleDisplaySettings}>
          <ChevronRightIcon />
        </IconButton>
      </div>
      {children}
    </Drawer>
  );
}
