import { ReactElement } from 'react';

export interface CardInfo {
  title: string;
  description: string;
  icon?: ReactElement;
  color: string;
  route?: string;
  animation?: any;
  key: string;
}
