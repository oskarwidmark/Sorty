import { Drawer } from '@mui/material';

interface SideDrawerProps {
  isOpen: boolean;
  children?: React.ReactNode;
}

export function SideDrawer({ isOpen, children }: SideDrawerProps) {
  return (
    <Drawer
      variant="persistent"
      anchor="right"
      className="drawer"
      open={isOpen}
      PaperProps={{
        sx: { width: '250px' },
      }}
    >
      {children}
    </Drawer>
  );
}
