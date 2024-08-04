export interface Temple {
  name: string;
  description: string;
  image: string;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
