interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  if (value !== index) {
    return;
  }

  return children;
}
